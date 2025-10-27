# LX Studio AI Agent - Automated TikTok & Instagram Reels

> **Production-ready AI agent for automated video content generation and publishing via Make.com**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![n8n](https://img.shields.io/badge/n8n-EA4B71?logo=n8n&logoColor=white)](https://n8n.io/)
[![Make](https://img.shields.io/badge/Make.com-6D00CC?logo=integromat&logoColor=white)](https://www.make.com/)

## 🎯 Overview

This system automates the entire content production pipeline for LX Studio:
- **2 posts per day** (10:00 & 18:00 Europe/Zurich)
- **Instagram Reels + TikTok** published simultaneously via Make.com
- **AI-powered** script generation (Claude 3.5 Sonnet)
- **Professional** voiceover (ElevenLabs)
- **Cinematic** video (Runway Gen-3)
- **Branded** composition (logo, subtitles, FFmpeg/Shotstack)
- **A/B testing** with weekly optimization
- **Logging** (Google Sheets or Supabase)

---

## 📁 Project Structure

```
agent.lxstudio.marketing/
├── agent/
│   ├── src/
│   │   ├── prompts/
│   │   │   ├── system.md              # Claude system prompt
│   │   │   └── post_template.md       # User prompt template
│   │   ├── services/
│   │   │   ├── trends.ts              # Fetch trending topics
│   │   │   ├── llm_claude.ts          # Claude API (script generation)
│   │   │   ├── tts_elevenlabs.ts      # ElevenLabs TTS
│   │   │   ├── video_runway.ts        # Runway Gen-3
│   │   │   ├── video_sora.ts          # Sora (fallback)
│   │   │   ├── compose_ffmpeg.ts      # FFmpeg composition (default)
│   │   │   ├── compose_shotstack.ts   # Shotstack composition
│   │   │   ├── make_publisher.ts      # Make.com webhook publisher
│   │   │   ├── logger_sheets.ts       # Google Sheets logging
│   │   │   ├── logger_supabase.ts     # Supabase logging
│   │   │   └── ab_select.ts           # A/B testing logic
│   │   └── index.ts                   # Main orchestrator
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── workflows/
│   └── lxstudio_autoreels_make.json   # n8n workflow (ready to import)
├── scripts/
│   └── smoke.ts                       # Smoke test (npm run smoke)
└── README.md                          # This file
```

---

## ⚡ Quick Start (< 1 Hour)

### Prerequisites

- **Node.js 18+** & **npm**
- **FFmpeg** installed (`brew install ffmpeg` / `apt install ffmpeg`)
- **n8n** instance (cloud or self-hosted)
- **Make.com** account (free tier OK for testing)
- API keys:
  - [Anthropic Claude](https://console.anthropic.com/)
  - [ElevenLabs](https://elevenlabs.io/)
  - [Runway ML](https://runwayml.com/)
  - [Google Sheets API](https://console.cloud.google.com/) (or Supabase)

### Step 1: Install Dependencies

```bash
cd agent
npm install
npm run build
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
ANTHROPIC_API_KEY=sk-ant-xxx
ELEVENLABS_API_KEY=xxx
ELEVEN_VOICE_ID=21m00Tcm4TlvDq8ikWAM
RUNWAY_API_KEY=xxx

# Leave these empty for now (we'll fill after Make.com setup)
MAKE_WEBHOOK_IG=
MAKE_WEBHOOK_TT=

# Logging (choose one)
LOG_BACKEND=sheets
SHEETS_DOC_ID=your-google-sheet-id
SHEETS_CREDS_PATH=./credentials.json

# Assets (optional - for logo overlay)
ASSETS_BASE_URL=https://yourdomain.com/assets

# Publishing control
PUBLISH_MAKE=false  # Set to 'true' for production
```

### Step 3: Set Up Make.com Webhooks

> **This is the critical step for Instagram & TikTok publishing**

#### 3.1 Create Instagram Scenario

1. **Login to Make.com** → Click "Create a new scenario"
2. **Add Webhook Trigger**:
   - Module: **Webhooks > Custom webhook**
   - Click "Add" → Name it "LX Studio IG" → Copy webhook URL
   - Data structure: Leave as "Auto-determine"
3. **Add Instagram Module**:
   - Search "Instagram for Business"
   - Choose **Instagram for Business: Create a Media Object (Reel)**
   - Connect your Instagram Business account (requires Facebook Page + IG Pro account)
   - Map fields:
     ```
     Media Type: VIDEO
     Video URL: {{video_url}}
     Caption: {{caption}} {{hashtags}}
     Access Token: (auto-filled)
     ```
4. **Add Response Module** (optional but recommended):
   - Module: **Webhooks > Webhook response**
   - Body:
     ```json
     {
       "success": true,
       "post_url": "{{instagram.permalink}}",
       "post_id": "{{instagram.id}}"
     }
     ```
5. **Save scenario** → **Activate** (toggle ON)
6. **Copy webhook URL** → Paste into `.env` as `MAKE_WEBHOOK_IG`

#### 3.2 Create TikTok Scenario

1. **Create new scenario** in Make.com
2. **Add Webhook Trigger**:
   - Module: **Webhooks > Custom webhook**
   - Click "Add" → Name it "LX Studio TT" → Copy webhook URL
3. **Add TikTok Module**:
   - Search "TikTok"
   - Choose **TikTok: Upload a Video**
   - Connect your TikTok Business account
   - Map fields:
     ```
     Video URL: {{video_url}}
     Caption: {{caption}} {{hashtags}}
     Privacy: PUBLIC
     ```
4. **Add Response Module**:
   - Module: **Webhooks > Webhook response**
   - Body:
     ```json
     {
       "success": true,
       "post_url": "https://tiktok.com/@yourusername/video/{{tiktok.video_id}}",
       "post_id": "{{tiktok.video_id}}"
     }
     ```
5. **Save scenario** → **Activate**
6. **Copy webhook URL** → Paste into `.env` as `MAKE_WEBHOOK_TT`

#### 3.3 Test Webhooks

```bash
# Test Instagram webhook
curl -X POST "https://hook.eu1.make.com/YOUR_IG_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "video_url": "https://example.com/test.mp4",
    "caption": "Test post from LX Studio",
    "hashtags": ["#test"],
    "alt_text": "Test video",
    "metadata": {"hook": "Test", "variant": "A", "cta": "DM us"}
  }'
```

### Step 4: Run Smoke Test

```bash
npm run smoke
```

Expected output:
```
╔═══════════════════════════════════════════════════════════╗
║  ✅ SMOKE TEST PASSED                                     ║
╚═══════════════════════════════════════════════════════════╝

📦 Generated Assets:
   - Video: /path/to/output/final_video.mp4
   - URL: https://...

📤 Publish Results:
   - Instagram: ⏭️  Skipped (PUBLISH_MAKE=false)
   - TikTok: ⏭️  Skipped
```

### Step 5: Enable Publishing

```bash
# In .env, change:
PUBLISH_MAKE=true

# Run again to publish
npm run smoke
```

### Step 6: Import n8n Workflow

1. **Open n8n** → Workflows → Import from File
2. **Select** `workflows/lxstudio_autoreels_make.json`
3. **Configure environment variables** in n8n Settings
4. **Activate workflow** (toggle ON)
5. **Verify cron schedule**: 10:00 & 18:00 Europe/Zurich

---

## 🔧 Configuration Guide

### Video Providers

**Runway Gen-3** (default):
```env
VIDEO_PROVIDER=runway
RUNWAY_API_KEY=xxx
```

**Sora** (fallback):
```env
VIDEO_PROVIDER=sora
SORA_API_KEY=xxx
```

### Composition Backends

**FFmpeg** (default):
```env
COMPOSE_BACKEND=ffmpeg
```

**Shotstack** (cloud):
```env
COMPOSE_BACKEND=shotstack
SHOTSTACK_API_KEY=xxx
```

### Logging

**Google Sheets**:
```env
LOG_BACKEND=sheets
SHEETS_DOC_ID=1AbC123...
SHEETS_CREDS_PATH=./credentials.json
```

**Supabase**:
```env
LOG_BACKEND=supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

---

## 📊 A/B Testing

1. **Claude generates 2 hook variants** (A and B)
2. **Random selection** (50/50) per post
3. **Weekly cron** analyzes logs and updates prompt with top performers

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"ELEVENLABS_API_KEY not set"** | Add key to `.env` |
| **"Runway timeout"** | Check Runway status, increase timeout |
| **"FFmpeg not found"** | Install: `brew install ffmpeg` |
| **"Make.com webhook 403"** | Verify URL, check scenario is active |
| **"Instagram API error"** | Ensure IG is Business account |

---

## 🚀 Production Deployment

### Option A: n8n Cloud (recommended)
- Import workflow → Configure env → Activate

### Option B: Node.js Process
```bash
pm2 start npm --name "lxstudio-agent" -- start
```

---

## 📄 License

Private & Proprietary - LX Studio © 2025

---

**Built with ❤️ by Claude Code for LX Studio**
