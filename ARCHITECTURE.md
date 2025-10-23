# Architecture - LX Studio Content Automation

## Vue d'ensemble

Ce monorepo TypeScript contient l'ensemble du système d'automatisation de contenu TikTok & Instagram pour LX Studio.

## Structure du projet

```
.
├── apps/
│   ├── api/              # API Fastify (TypeScript strict)
│   │   ├── src/
│   │   │   ├── routes/   # 10 routes REST (ideas, calendar, script, etc.)
│   │   │   ├── queue/    # BullMQ workers
│   │   │   ├── db/       # Supabase client + migrations
│   │   │   └── utils/    # Logger, errors, validate
│   │   └── Dockerfile
│   │
│   └── web/              # Dashboard Next.js 15 (App Router)
│       ├── src/app/      # Pages: /, /ideas, /calendar, /analytics, etc.
│       └── Dockerfile
│
├── packages/
│   ├── schemas/          # Modèles Zod (ideas, scripts, captions, etc.)
│   ├── sdk/              # Client API TypeScript (fetch + retries)
│   ├── ai/               # Prompts FR + adaptateurs LLM (OpenAI)
│   ├── integrations/     # Instagram, TikTok, Buffer, UTM
│   └── n8n-nodes/        # 3 custom nodes n8n
│
├── n8n-workflows/        # Workflow n8n exportable (JSON)
├── .github/workflows/    # CI GitHub Actions
├── Makefile              # Commandes utiles
├── docker-compose.yml    # Services locaux (Redis)
└── README.md             # Documentation complète
```

## Stack technique

### Backend (apps/api)
- **Runtime**: Node.js 20+
- **Framework**: Fastify 4
- **Langage**: TypeScript strict
- **Base de données**: Supabase (Postgres)
- **Queue**: BullMQ + Redis
- **IA**: OpenAI GPT-4o
- **Validation**: Zod

### Frontend (apps/web)
- **Framework**: Next.js 15 (App Router)
- **Langage**: TypeScript + React 18
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth

### Intégrations
- **Instagram**: Graph API (Business accounts)
- **TikTok**: Content Posting API (Business)
- **Fallback**: Buffer/Hootsuite via webhook
- **Analytics**: Instagram Insights + TikTok Metrics

### Automation
- **n8n**: Workflow automation (triggers, custom nodes)
- **Cron**: Hebdomadaire (idées), quotidien (posts, analytics)

## Flow de données

### 1. Génération de contenu (hebdomadaire)

```
n8n Trigger (Lundi 9h)
  → POST /api/ideas (count=20)
  → POST /api/calendar (week_start)
  → Sauvegarde DB (ideas table)
```

### 2. Production de contenu (quotidien)

```
n8n Trigger (10h)
  → POST /api/script (idea_id)
  → POST /api/caption (idea_id)
  → POST /api/assets/compose (script_id)
  → Sauvegarde DB (scripts, captions, assets)
```

### 3. Planification

```
POST /api/schedule/create
  → Création jobs BullMQ
  → Sauvegarde DB (jobs table)
  → Worker traite jobs aux horaires programmés
```

### 4. Publication

**Mode direct:**
```
Worker BullMQ
  → POST /api/publish/instagram
  → Instagram Graph API (publishReel)
  → Sauvegarde DB (publishes table)
```

**Mode webhook:**
```
Worker BullMQ
  → POST BUFFER_WEBHOOK_URL
  → Buffer gère la publication
  → Sauvegarde DB (publishes table)
```

### 5. Analytics (quotidien)

```
n8n Trigger (20h)
  → POST /api/analytics/pull
  → Instagram/TikTok Insights API
  → Sauvegarde DB (analytics table)
```

### 6. Leads (webhook public)

```
Site lxstudio.ch
  → POST /api/leads/webhook
  → Sauvegarde DB (leads table)
  → Notification Slack/Discord
```

## Base de données (Supabase)

### Tables principales

- **ideas**: Idées de contenu (title, hooks, angle, cta)
- **scripts**: Scripts vidéo (script_text, duration_s)
- **captions**: Légendes (caption_a/b/c, hashtags)
- **assets**: Assets média (video, srt, status)
- **jobs**: Jobs planifiés (BullMQ, run_at_tz)
- **publishes**: Publications (platform, post_id_ext, status)
- **analytics**: Métriques (views, likes, engagement)
- **leads**: Leads capturés (name, email, source)
- **logs**: Audit logs

### RLS (Row Level Security)

- Activé sur `leads`, `jobs`, `publishes`
- Policies admin/service_role
- Protection des données sensibles

## API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/health` | GET | Health check |
| `/api/ideas` | POST | Génération d'idées (LLM) |
| `/api/calendar` | POST | Calendrier éditorial |
| `/api/script` | POST | Génération de script vidéo |
| `/api/caption` | POST | Génération de légendes |
| `/api/assets/compose` | POST | Composition assets (vidéo + SRT) |
| `/api/schedule/create` | POST | Planification de jobs |
| `/api/publish/instagram` | POST | Publication Instagram |
| `/api/publish/tiktok` | POST | Publication TikTok |
| `/api/analytics/pull` | POST | Récupération analytics |
| `/api/leads/webhook` | POST | Capture de leads |

## Workflow n8n

### Triggers
1. **Hebdomadaire** (Lundi 9h): Génération idées + calendrier
2. **Quotidien** (10h): Production de contenu
3. **Quotidien** (20h): Pull analytics
4. **Webhook**: Capture leads

### Nodes personnalisés
- **GenerateContent**: Agrège /ideas + /script + /caption
- **SchedulePosts**: Planification via /schedule/create
- **PublishPosts**: Publication + fallback Buffer

### Gestion d'erreurs
- IF node → détection erreurs
- Webhook vers `ALERT_WEBHOOK_URL` (Slack/Discord)

## Modes de publication

### Direct (recommandé)
- API native Instagram + TikTok
- Contrôle total, métriques natives
- Nécessite access tokens valides

### Webhook (fallback)
- Délégation à Buffer/Hootsuite
- Pas de gestion de tokens
- Coût additionnel (~$15/mois)

### Sandbox (test)
- `DRY_RUN_MODE=true`
- Simule les publications sans poster réellement

## Déploiement

### Railway (recommandé)
- **Service 1**: API (apps/api)
- **Service 2**: Worker BullMQ
- **Service 3**: Dashboard Web (apps/web)
- **Service 4**: Redis

### Docker
- Build: `docker build -f apps/api/Dockerfile -t lxstudio-api .`
- Run: `docker run -p 3001:3001 --env-file .env lxstudio-api`

## Variables d'environnement critiques

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# OpenAI
OPENAI_API_KEY=

# Instagram
META_ACCESS_TOKEN=
IG_USER_ID=

# TikTok (ou fallback Buffer)
TIKTOK_ACCESS_TOKEN=
BUFFER_WEBHOOK_URL=

# Alertes
ALERT_WEBHOOK_URL=

# Modes
PUBLISH_MODE=direct|webhook
DRY_RUN_MODE=false
```

## Commandes Make

```bash
make install      # Installer dépendances
make dev          # Démarrer en développement
make build        # Builder tous les packages
make migrate      # Exécuter migrations SQL
make seed         # Seed données de démo
make test         # Lancer tests Vitest
make docker-up    # Démarrer Redis local
```

## Tests

### Unitaires (Vitest)
- `packages/schemas/src/*.test.ts`
- `packages/integrations/src/*.test.ts`
- `apps/api/src/utils/*.test.ts`

### Manuels
- Voir README.md section "Tests"

## Monitoring

- **Logs**: Railway Dashboard ou stdout
- **Alerts**: Webhook Slack/Discord (`ALERT_WEBHOOK_URL`)
- **Analytics**: Dashboard web `/analytics`
- **Jobs**: Dashboard web `/queue` (à venir)

## Sécurité

- RLS Supabase activé
- Rate limiting Fastify (100 req/min)
- Secrets en variables d'env uniquement
- Validation Zod sur toutes les entrées
- Retries exponentiels avec backoff

## Évolutions futures

- [ ] Dashboard Queue (monitoring BullMQ)
- [ ] Assets rendering (Runway, ElevenLabs)
- [ ] A/B testing captions
- [ ] Scheduled posts calendar (drag & drop)
- [ ] Multi-comptes (plusieurs IG/TikTok)
- [ ] Analytics avancées (ROI, attribution)

---

**Prêt pour la production !** 🚀
