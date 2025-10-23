# LX Studio - Content Automation

Automatisation de création et publication de contenu TikTok & Instagram pour l'agence LX Studio (lxstudio.ch).

**Objectif business :** 3–5 posts/semaine/plateforme, ≥5 RDV qualifiés/semaine, tracking UTM.

**Stack :** TypeScript strict, Fastify API, Next.js 15, Supabase, n8n, BullMQ, OpenAI.

---

## Table des matières

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
   - [Supabase](#supabase-setup)
   - [Meta / Instagram](#meta--instagram-setup)
   - [TikTok](#tiktok-setup)
   - [n8n](#n8n-setup)
5. [Utilisation](#utilisation)
6. [Déploiement](#déploiement)
7. [Modes de publication](#modes-de-publication)
8. [Workflow n8n](#workflow-n8n)
9. [Tests](#tests)
10. [Checklist Go Live](#checklist-go-live)
11. [Support](#support)

---

## Architecture

**Monorepo pnpm** avec :

```
.
├── apps/
│   ├── api/          # Fastify API (TypeScript)
│   └── web/          # Next.js 15 Dashboard (App Router)
├── packages/
│   ├── schemas/      # Modèles Zod partagés
│   ├── sdk/          # Client API TypeScript
│   ├── ai/           # Prompts FR + adaptateurs LLM
│   ├── integrations/ # Instagram, TikTok, Buffer, UTM
│   └── n8n-nodes/    # Custom nodes n8n
├── n8n-workflows/    # Workflow n8n exportable
├── .env.example
├── Makefile
└── README.md
```

**Base de données (Supabase/Postgres) :**
- `ideas`, `scripts`, `captions`, `assets`
- `jobs`, `publishes`, `analytics`, `leads`, `logs`

**Intégrations :**
- Instagram Graph API (Business)
- TikTok Content Posting API (Business)
- Buffer/Hootsuite (fallback via webhook)
- OpenAI GPT-4o (génération de contenu)

---

## Prérequis

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 8.0.0
- **Docker** (optionnel, pour Redis local)
- **Compte Supabase** (ou Postgres local)
- **Compte OpenAI** (API Key)
- **Compte Meta Developer** (pour Instagram)
- **Compte TikTok Developer** (pour TikTok)
- **n8n** (local ou cloud)

---

## Installation

### 1. Cloner le repo

```bash
git clone https://github.com/lxstudio/content-automation.git
cd content-automation
```

### 2. Installer les dépendances

```bash
make install
# ou
pnpm install
```

### 3. Copier .env.example → .env

```bash
cp .env.example .env
```

### 4. Remplir les variables d'environnement (voir section [Configuration](#configuration))

---

## Configuration

### Supabase Setup

#### 1. Créer un projet Supabase

- Aller sur [supabase.com](https://supabase.com)
- Créer un nouveau projet
- Récupérer :
  - `SUPABASE_URL` (ex: `https://xxx.supabase.co`)
  - `SUPABASE_ANON_KEY` (clé publique)
  - `SUPABASE_SERVICE_KEY` (clé service_role, gardez-la secrète !)

#### 2. Exécuter les migrations SQL

**Option A : Via Supabase SQL Editor**

1. Ouvrir le SQL Editor dans Supabase Dashboard
2. Copier-coller le contenu de `apps/api/src/db/migrations/001_init.sql`
3. Exécuter
4. Répéter avec `002_rls.sql`

**Option B : Via CLI Supabase**

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref <your-project-ref>

# Pousser les migrations
supabase db push
```

#### 3. Seed les données de démo

```bash
# Remplir .env avec SUPABASE_URL et SUPABASE_SERVICE_KEY
make seed
```

Cela créera 2 idées de démo avec script, caption et asset.

---

### Meta / Instagram Setup

#### 1. Créer une app Meta

1. Aller sur [developers.facebook.com](https://developers.facebook.com)
2. Créer une nouvelle app → Type : **Business**
3. Ajouter le produit **Instagram Basic Display** ou **Instagram Graph API**

#### 2. Configurer les permissions

Permissions requises :
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`
- `pages_manage_posts`

#### 3. Obtenir un Access Token longue durée

```bash
# 1. Obtenir un token court (via Graph API Explorer)
# 2. L'échanger contre un token longue durée (60 jours) :

curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

#### 4. Récupérer l'IG_USER_ID

```bash
# Avec votre Page ID et Access Token :
curl -X GET "https://graph.facebook.com/v18.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_ACCESS_TOKEN"

# Réponse : { "instagram_business_account": { "id": "17841..." } }
```

#### 5. Ajouter dans .env

```env
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_PAGE_ID=your-page-id
IG_USER_ID=your-instagram-business-account-id
META_ACCESS_TOKEN=your-long-lived-token
```

**Limites Instagram :**
- Max 25 Reels/jour (Business account)
- Vidéo : 3s–90s, format 9:16, MP4, ≤100MB
- Vérifier que le compte est bien un **Business** ou **Creator** account

---

### TikTok Setup

#### 1. Créer une app TikTok for Developers

1. Aller sur [developers.tiktok.com](https://developers.tiktok.com)
2. Créer une app → Type : **Content Posting**

#### 2. Configurer les scopes

Scopes requis :
- `video.upload`
- `video.publish`

#### 3. Obtenir Client Key & Client Secret

Disponibles dans le dashboard de l'app TikTok.

#### 4. Obtenir un Access Token (OAuth2)

TikTok utilise OAuth2. Vous devez :
1. Rediriger l'utilisateur vers l'URL d'autorisation TikTok
2. Récupérer le `code` de callback
3. Échanger le `code` contre un `access_token`

**Exemple simplifié (à adapter) :**

```bash
# Step 1: Autorisation
https://www.tiktok.com/v2/auth/authorize?client_key=YOUR_CLIENT_KEY&scope=video.upload,video.publish&response_type=code&redirect_uri=YOUR_REDIRECT_URI

# Step 2: Échanger le code contre un access_token
curl -X POST "https://open.tiktokapis.com/v2/oauth/token/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_key=YOUR_CLIENT_KEY" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

#### 5. Ajouter dans .env

```env
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret
TIKTOK_ACCESS_TOKEN=your-access-token
```

**Limites TikTok :**
- Vidéo : 3s–60s (recommandé 15s pour Reels), MP4, ≤50MB
- Vérifier que le compte a bien accepté les TOS de TikTok for Developers

**Fallback :** Si l'API TikTok n'est pas disponible, le système basculera automatiquement sur Buffer (webhook).

---

### n8n Setup

#### 1. Installer n8n

**Option A : Cloud**
- [n8n.cloud](https://n8n.cloud) (gratuit jusqu'à 20k exécutions/mois)

**Option B : Self-hosted**

```bash
npm install -g n8n
n8n start
# Accessible sur http://localhost:5678
```

#### 2. Importer le workflow

1. Copier le contenu de `n8n-workflows/n8n-workflow-lxstudio.json`
2. Dans n8n : **Settings** → **Import from File** ou **Paste JSON**
3. Coller le JSON
4. Cliquer sur **Import**

#### 3. Configurer les variables d'environnement n8n

Dans n8n, créer les variables suivantes (Settings → Variables) :

```
API_BASE_URL=https://your-api.lxstudio.ch
PUBLISH_MODE=direct
BUFFER_WEBHOOK_URL=https://hooks.buffer.com/...
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
```

#### 4. Installer les custom nodes (optionnel)

```bash
cd packages/n8n-nodes
pnpm build

# Copier dans ~/.n8n/custom/
mkdir -p ~/.n8n/custom
cp -r dist/* ~/.n8n/custom/

# Redémarrer n8n
n8n restart
```

Les nodes **LX Studio - Generate Content**, **Schedule Posts**, **Publish Posts** apparaîtront dans la palette.

---

## Utilisation

### Mode développement

```bash
# Démarrer Redis (BullMQ)
make docker-up

# Démarrer tous les services en parallèle (API + Web + Worker)
make dev
```

**Ou services séparés :**

```bash
# API uniquement
make api

# Dashboard web uniquement
make web

# Worker BullMQ uniquement
make queue-worker
```

### Tester l'API

```bash
# Health check
curl http://localhost:3001/api/health

# Générer des idées
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'

# Générer un script
curl -X POST http://localhost:3001/api/script \
  -H "Content-Type: application/json" \
  -d '{"idea_id": "uuid-here", "duration_target_s": 15}'
```

### Mode production

```bash
# Build tous les packages
make build

# Démarrer l'API
make start-api

# Démarrer le dashboard web
make start-web

# Démarrer le worker
make queue-worker
```

---

## Déploiement

### Railway (recommandé)

#### 1. Créer un compte [Railway](https://railway.app)

#### 2. Déployer l'API

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Créer un nouveau projet
railway init

# Ajouter un service Redis
railway add

# Déployer l'API
cd apps/api
railway up

# Configurer les variables d'env via Dashboard Railway
```

Variables à configurer (Railway Dashboard) :
- Toutes les variables de `.env.example`
- `PORT=3001`
- `HOST=0.0.0.0`
- `REDIS_URL=${{Redis.REDIS_URL}}`

#### 3. Déployer le Worker BullMQ

Créer un second service dans Railway :
- Source : même repo
- Build command : `pnpm install && pnpm -r build`
- Start command : `pnpm --filter @lxstudio/api queue:worker`

#### 4. Déployer le Dashboard Web

Créer un troisième service :
- Source : même repo
- Build command : `pnpm install && pnpm --filter @lxstudio/web build`
- Start command : `pnpm --filter @lxstudio/web start`

Variables :
- `NEXT_PUBLIC_API_URL=https://your-api.railway.app`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

---

### Docker (alternatif)

```bash
# Build les images
docker build -f apps/api/Dockerfile -t lxstudio-api .
docker build -f apps/web/Dockerfile -t lxstudio-web .

# Run
docker run -p 3001:3001 --env-file .env lxstudio-api
docker run -p 3000:3000 --env-file .env lxstudio-web
```

---

## Modes de publication

### Mode `direct` (recommandé)

Publication directe via Instagram Graph API & TikTok Content Posting API.

**Prérequis :**
- Access tokens valides (Instagram + TikTok)
- Comptes Business configurés

**Configuration :**

```env
PUBLISH_MODE=direct
ENABLE_DIRECT_PUBLISH=true
```

**Avantages :**
- Contrôle total
- Pas de coût tiers
- Métriques natives

**Inconvénients :**
- Gestion des tokens (renouvellement)
- Limites API (25 Reels/jour Instagram)

---

### Mode `webhook` (fallback)

Délégation à Buffer, Hootsuite ou Zapier via webhook.

**Configuration :**

```env
PUBLISH_MODE=webhook
BUFFER_WEBHOOK_URL=https://hooks.buffer.com/...
```

**Avantages :**
- Pas de gestion de tokens
- Support multi-plateformes
- Interface visuelle

**Inconvénients :**
- Coût (Buffer Pro ≈ $15/mois)
- Moins de contrôle

---

### Mode Sandbox (test)

Pour tester sans publier réellement :

```env
DRY_RUN_MODE=true
```

Les requêtes de publication retourneront des réponses simulées.

---

## Workflow n8n

Le workflow `n8n-workflows/n8n-workflow-lxstudio.json` inclut :

### 1. Trigger hebdomadaire (Lundi 9h)

→ Génération de 20 idées
→ Génération du calendrier éditorial (3-5 posts/semaine)

### 2. Trigger quotidien (10h)

→ Génération script (15s)
→ Génération caption (3 variantes + hashtags)
→ Composition assets (vidéo + SRT + watermark)
→ Planification des jobs (BullMQ)

### 3. Publication planifiée

**Si `PUBLISH_MODE=direct` :**
- Appel `/api/publish/instagram`
- Appel `/api/publish/tiktok`

**Si `PUBLISH_MODE=webhook` :**
- Appel webhook Buffer

**Gestion d'erreurs :**
- Si erreur → envoi vers `ALERT_WEBHOOK_URL` (Slack/Discord)

### 4. Pull analytics (8pm quotidien)

→ Récupération métriques Instagram
→ Récupération métriques TikTok
→ Sauvegarde en DB

### 5. Webhook leads

Endpoint public : `/api/leads/webhook`

Capture les leads depuis le site lxstudio.ch et envoie une alerte.

---

## Tests

### Tests unitaires (Vitest)

```bash
make test
```

### Test manuel API

```bash
# Ideas
curl -X POST http://localhost:3001/api/ideas -H "Content-Type: application/json" -d '{"count": 5}'

# Script
curl -X POST http://localhost:3001/api/script -H "Content-Type: application/json" -d '{"idea_id": "uuid", "duration_target_s": 15}'

# Caption
curl -X POST http://localhost:3001/api/caption -H "Content-Type: application/json" -d '{"idea_id": "uuid"}'

# Publish (sandbox)
curl -X POST http://localhost:3001/api/publish/instagram -H "Content-Type: application/json" -d '{
  "asset_id": "uuid",
  "caption_id": "uuid",
  "video_url": "https://example.com/video.mp4",
  "caption_text": "Test caption",
  "hashtags": ["#Suisse"]
}'
```

---

## Checklist Go Live

### Phase 1 : Setup infrastructure

- [ ] Supabase projet créé + migrations exécutées
- [ ] Variables d'env configurées (.env rempli)
- [ ] Redis déployé (Railway ou Docker)
- [ ] API déployée et accessible
- [ ] Worker BullMQ démarré
- [ ] Dashboard web déployé (optionnel)

### Phase 2 : Intégrations

- [ ] App Meta créée + permissions accordées
- [ ] Access Token Instagram longue durée généré
- [ ] IG_USER_ID récupéré
- [ ] App TikTok créée (si besoin)
- [ ] Access Token TikTok généré (ou webhook Buffer configuré)
- [ ] OpenAI API Key valide

### Phase 3 : n8n

- [ ] Workflow importé dans n8n
- [ ] Variables d'env n8n configurées
- [ ] Custom nodes installés (optionnel)
- [ ] Triggers activés

### Phase 4 : Tests

- [ ] `POST /api/health` → `{status: "ok"}`
- [ ] `POST /api/ideas` → 20 idées générées
- [ ] `POST /api/script` → script structuré
- [ ] `POST /api/caption` → 3 variantes + hashtags
- [ ] `POST /api/publish/instagram` (mode sandbox) → succès
- [ ] Workflow n8n exécuté manuellement → succès

### Phase 5 : Monitoring

- [ ] Webhook Slack/Discord configuré (`ALERT_WEBHOOK_URL`)
- [ ] Logs centralisés (Railway Dashboard ou autres)
- [ ] Suivi analytics activé (`ENABLE_ANALYTICS_PULL=true`)

### Phase 6 : Production

- [ ] `DRY_RUN_MODE=false`
- [ ] `PUBLISH_MODE=direct` (ou `webhook`)
- [ ] Publier 1 post test sur Instagram
- [ ] Publier 1 post test sur TikTok
- [ ] Vérifier métriques dans `/api/analytics`
- [ ] Automatisation n8n activée (triggers cron)

---

## Support

### Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [TikTok for Developers](https://developers.tiktok.com)
- [n8n Docs](https://docs.n8n.io)
- [BullMQ Docs](https://docs.bullmq.io)

### Contact

Pour toute question : **contact@lxstudio.ch**

---

## Licence

UNLICENSED - Propriété de LX Studio

---

**Prêt à automatiser votre contenu TikTok & Instagram ? Let's go !** 🚀
