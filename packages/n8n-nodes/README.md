# @lxstudio/n8n-nodes

Custom nodes n8n pour automatiser la création et publication de contenu TikTok & Instagram pour LX Studio.

## Nodes disponibles

### 1. GenerateContent
Génère des idées, scripts et captions via l'API LX Studio.

**Opérations :**
- `Generate Ideas` : génère 20 idées/semaine
- `Generate Script` : génère un script vidéo 12-18s
- `Generate Caption` : génère 3 variantes de légende + hashtags

**Paramètres :**
- `API Base URL` : URL de l'API (ex: `https://api.lxstudio.ch`)
- `API Key` : clé d'authentification (optionnel)
- `Operation` : type de génération
- `Idea Count` : nombre d'idées (pour operation=ideas)
- `Idea ID` : UUID de l'idée (pour script/caption)
- `Duration` : durée cible du script en secondes

**Sortie :**
JSON structuré avec les données générées.

---

### 2. SchedulePosts
Planifie des publications dans le calendrier éditorial.

**Paramètres :**
- `API Base URL`
- `API Key`
- `Jobs (JSON Array)` : tableau de jobs à planifier

**Exemple de payload :**
```json
{
  "jobs": [
    {
      "platform": "instagram",
      "type": "publish_post",
      "payload_json": { "asset_id": "...", "caption_id": "..." },
      "run_at_tz": "2025-01-15T14:00:00+01:00"
    }
  ]
}
```

**Sortie :**
```json
{
  "job_ids": ["uuid-1", "uuid-2"]
}
```

---

### 3. PublishPosts
Publie directement sur Instagram ou TikTok (avec fallback Buffer).

**Paramètres :**
- `API Base URL`
- `API Key`
- `Platform` : instagram | tiktok
- `Asset ID` : UUID de l'asset vidéo
- `Caption ID` : UUID de la caption
- `Video URL` : URL publique de la vidéo
- `Caption Text` : texte de la légende
- `Hashtags` : hashtags séparés par des virgules

**Sortie :**
```json
{
  "publish_id": "uuid",
  "platform": "instagram",
  "post_id_ext": "123456",
  "status": "completed",
  "permalink": "https://instagram.com/p/..."
}
```

---

## Installation

### Option 1 : Installation manuelle (développement)

1. Cloner le repo et builder les nodes :
```bash
cd packages/n8n-nodes
pnpm install
pnpm build
```

2. Copier le dossier `dist/` dans `~/.n8n/custom/` :
```bash
mkdir -p ~/.n8n/custom
cp -r dist/* ~/.n8n/custom/
```

3. Redémarrer n8n :
```bash
n8n restart
```

Les nodes apparaîtront dans la catégorie "LX Studio".

---

### Option 2 : Publication npm (production)

1. Publier le package :
```bash
npm publish
```

2. Installer via n8n :
```bash
n8n install @lxstudio/n8n-nodes
```

---

## Utilisation dans un workflow

Voir le fichier `n8n-workflows/n8n-workflow-lxstudio.json` pour un workflow complet incluant :
- Trigger hebdomadaire → génération d'idées
- Trigger quotidien → script + caption + assets
- Publication planifiée → Instagram + TikTok
- Fallback Buffer si API indisponible
- Pull analytics quotidien
- Capture de leads via webhook

---

## Développement

```bash
# Watch mode
pnpm dev

# Build
pnpm build

# Clean
pnpm clean
```

---

## Support

Pour toute question : contact@lxstudio.ch
