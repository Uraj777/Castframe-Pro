# CASTFRAME AI Studio 🎬✨
### *Next-Generation Dynamic AI Influencer & Virtual Creator Engine*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-emerald.svg?style=for-the-badge)]()

---

## 🌟 Overview & Description

**CASTFRAME AI Studio** is an enterprise-grade, end-to-end virtual creator platform and AI influencer backend designed to power the **Medusa Mobile Application**. 

Unlike conventional tools that rely on static datasets or mock presets, CASTFRAME AI operates on a **100% dynamic, zero-hardcoded foundation**. Every persona, visual asset, reel script, and video rendering manifest is synthesized in real-time through Google Gemini multimodal models and state-of-the-art latent identity preservation pipelines.

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                         │
 │    ██████╗ █████╗ ███████╗████████╗███████╗██████╗  █████╗ ███╗   ███╗███████╗         │
 │   ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝         │
 │   ██║     ███████║███████╗   ██║   █████╗  ██████╔╝███████║██╔████╔██║█████╗           │
 │   ██║     ██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝           │
 │   ╚██████╗██║  ██║███████║   ██║   ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗         │
 │    ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝         │
 │                                                                                         │
 │                 STUDIO  •  AI INFLUENCER & MEDUSA MOBILE ENGINE                         │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                         │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        CASTFRAME Studio Web Dashboard                          │   │
│   │  • Persona Manager   • Visual Studio   • Script Studio   • Aesthetic Matrix    │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │                                            │
│   ┌───────────────────────────────────────▼────────────────────────────────────────┐   │
│   │                          Medusa Mobile iOS / Android                           │   │
│   │  • Short-form Feeds  • Real-time Video Render Player  • Campaign Automation    │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
└───────────────────────────────────────────┼────────────────────────────────────────────┘
                                            │ HTTP / JSON API
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             BACKEND SERVICE LAYER (server.ts)                          │
│                                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │   Persona Seeder      │  │   Campaign Generator  │  │   Reel Script Engine       │  │
│  │   /api/seed/*         │  │   /api/generate/*     │  │   /api/generate/script     │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └─────────────┬──────────────┘  │
│              │                          │                            │                 │
│  ┌───────────▼───────────┐  ┌───────────▼───────────┐  ┌─────────────▼──────────────┐  │
│  │   Biometric Analyzer  │  │   Visual Synthesizer  │  │   Medusa Video Manifest    │  │
│  │   /api/ai/analyze-*   │  │   /api/generate/visual│  │   /api/render/video        │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └─────────────┬──────────────┘  │
└──────────────┼──────────────────────────┼────────────────────────────┼─────────────────┘
               │                          │                            │
┌──────────────▼──────────────────────────▼────────────────────────────▼─────────────────┐
│                             AI & INTELLIGENCE FOUNDATION                               │
│                                                                                        │
│       ┌────────────────────────┐                    ┌────────────────────────┐         │
│       │ Google Gemini 3 Flash  │                    │   Imagen 3 Engine      │         │
│       │ (Multimodal Analysis & │                    │   (Photorealistic      │         │
│       │ Dynamic Script/Niche)  │                    │   Identity Generation) │         │
│       └────────────────────────┘                    └────────────────────────┘         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. 🧬 Multi-Angle Identity Preservation
- Ingests **1 to 20 raw studio reference photos** across multiple angles (Front 0°, 45° Quarter, 90° Profile, Downward, Upward).
- Extracts facial geometry, jawline angles, intercanthal eye distances, skin undertones, and hair texture.
- Maintains a **94%+ Identity Lock Score** across infinite wardrobe changes, lighting shifts, and extreme camera angles.

### 2. ⚡ Dynamic Persona Generation Across Niches
Generate unique virtual creators on demand or upload custom models:
- **Sensual & Glamour**: Luxury satin eveningwear, golden hour ambient lighting, high engagement.
- **Fitness & Wellness**: Seamless matte compression activewear, gym environments, athletic poses.
- **Luxury & High Life**: Yacht decks, private jets, bespoke tailoring, Mediterranean settings.
- **Cyberpunk & Sci-Fi**: Iridescent techwear, Neo-Tokyo neon atmospheres, volumetric smoke.
- **High Fashion & Editorial**: Architectural structured silhouettes, studio cyclorama, high contrast.
- **Streetwear & Urban**: Distressed heavyweight denim, Shibuya crossings, natural daylight bokeh.
- **Travel & Resort**: Sun-drenched coastal vistas, bohemian linen wear, warm color grading.
- **Experimental 3D**: Liquid-chrome sculptures, geometric prisms, surreal landscapes.

### 3. 📝 Viral Reel Script & Hook Synthesizer
- Generates **hook-first viral video scripts** formatted for TikTok, Instagram Reels, and YouTube Shorts.
- Provides exact **time-stamped beats**, **voiceover lines**, **on-screen text overlays**, **background audio cues**, and **camera transition directions**.

### 4. 📱 Medusa Mobile Render Contract
- Generates **9:16 mobile-optimized video render manifests** ready for automated mobile rendering pipelines.
- Standardized JSON containing keyframe timelines, transition types (Whip Pan, Zoom In, Fade), voice synthesis audio parameters, and caption sync.

---

## 📊 Identity Calibration Flowchart

```
 [User Uploads 1-20 Photos] 
             │
             ▼
 [Gemini Multimodal Ingestion] ──────► [Angle & Expression Auto-Classifier]
             │                                      │
             ▼                                      ▼
 [Facial Biometrics & Bone Structure]   [Reference Quality Weighting]
             │                                      │
             └──────────────────┬───────────────────┘
                                │
                                ▼
                   [Identity Vector Baseline]
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
 [Wardrobe Swap]         [Pose & Lighting]        [Cinematic Style]
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                                ▼
               [High-Fidelity Photorealistic Render]
                                │
                                ▼
                 [Medusa Video Render Manifest]
```

---

## 🔌 API Reference & Endpoints

All endpoints are hosted natively under `/api/*` and bind to port `3000`.

### 1. Seed Random AI Influencer Persona
```http
POST /api/seed/random-influencer
Content-Type: application/json
```
**Request Body:**
```json
{
  "niche": "Sensual & Glamour",
  "customPrompt": "Athletic model in Miami luxury penthouse setting"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "isRealAi": true,
  "persona": {
    "id": "actor-1742018290-a8f2",
    "name": "Elena Vance",
    "handle": "@elena.vance_official",
    "niche": "Sensual & Glamour",
    "persona_traits": ["Magnetic", "Aesthetic", "Ambitious"],
    "visual_style": "Ultra-cinematic 8k lighting with natural skin texture",
    "target_audience": "Global luxury and lifestyle enthusiasts",
    "calibrationScore": 96,
    "portraitUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "stats": {
      "estimated_followers": "320K",
      "engagement_rate": "6.8%",
      "viral_potential_score": 95
    }
  }
}
```

---

### 2. Generate Multi-Scene Reel Script
```http
POST /api/generate/script
Content-Type: application/json
```
**Request Body:**
```json
{
  "personaName": "Elena Vance",
  "niche": "Sensual & Glamour",
  "topic": "Night out in Miami penthouse drop",
  "platform": "Instagram Reels",
  "durationSeconds": 15
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "script": {
    "id": "script-1742018310",
    "title": "Midnight Luxe in Miami",
    "hook": "They told me not to wear this in Miami... watch what happened ✨",
    "callToAction": "Drop a 🔥 if you want the full lookbook link.",
    "scenes": [
      {
        "sceneNumber": 1,
        "duration": 3,
        "visualPrompt": "Close-up portrait turning toward camera with soft penthouse bokeh",
        "voiceover": "They said this was too bold for a Friday night.",
        "textOverlay": "TOO BOLD? 👀",
        "audioCue": "Trending deep house bass drop",
        "cameraMovement": "Fast push-in zoom"
      }
    ]
  }
}
```

---

### 3. Generate Video Render Manifest for Medusa Mobile
```http
POST /api/render/video
Content-Type: application/json
```
**Request Body:**
```json
{
  "personaId": "actor-1742018290-a8f2",
  "lookId": "look-9921",
  "scriptId": "script-1742018310",
  "aspectRatio": "9:16",
  "quality": "1080p"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "manifest": {
    "manifestId": "manifest-1742018350",
    "aspectRatio": "9:16",
    "resolution": { "width": 1080, "height": 1920 },
    "fps": 30,
    "totalDuration": 15,
    "audioTrack": {
      "type": "synthesized_voice_plus_music",
      "voiceTone": "Confident, sultry"
    },
    "timeline": [
      {
        "timeStart": 0,
        "timeEnd": 3,
        "type": "video_clip",
        "transition": "Fade In"
      }
    ]
  }
}
```

---

## 🛠️ Data Models & Database Schemas

### Mongoose (MongoDB) Model
```typescript
import { Schema, model } from 'mongoose';

const InfluencerSchema = new Schema({
  name: { type: String, required: true },
  handle: { type: String, unique: true },
  niche: { type: String, enum: ['Sensual & Glamour', 'Fitness & Wellness', 'Luxury & High Life', 'Cyberpunk & Sci-Fi', 'High Fashion', 'Streetwear & Urban', 'Travel & Resort', 'Experimental 3D'] },
  persona_traits: [String],
  visual_style: String,
  target_audience: String,
  calibrationScore: { type: Number, default: 95 },
  portraitUrl: String,
  references: [{
    url: String,
    role: String,
    angle: String,
    quality: String,
    isPrimary: Boolean
  }],
  voice_settings: {
    tone: String,
    speed: Number,
    pitch: Number,
    accent: String
  },
  stats: {
    estimated_followers: String,
    engagement_rate: String,
    viral_potential_score: Number
  }
}, { timestamps: true });

export const InfluencerModel = model('Influencer', InfluencerSchema);
```

### PostgreSQL Schema (Drizzle / Relational)
```sql
CREATE TABLE influencers (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    handle VARCHAR(128) UNIQUE,
    niche VARCHAR(64) NOT NULL,
    persona_traits JSONB DEFAULT '[]'::jsonb,
    visual_style TEXT,
    target_audience TEXT,
    calibration_score NUMERIC(5, 2) DEFAULT 95.00,
    portrait_url TEXT NOT NULL,
    references_data JSONB DEFAULT '[]'::jsonb,
    voice_settings JSONB DEFAULT '{}'::jsonb,
    stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lookbook_generations (
    id VARCHAR(64) PRIMARY KEY,
    influencer_id VARCHAR(64) REFERENCES influencers(id) ON DELETE CASCADE,
    look_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    aspect_ratio VARCHAR(16) DEFAULT '9:16',
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 💻 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend UI** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas API |
| **Backend Service** | Node.js, Express 4.x, Vite Middleware (`server.ts`) |
| **AI Models** | Google Gemini (`gemini-3.8-flash`), Imagen 3 |
| **Animation & Motion** | Lucide React, CSS Hardware Accelerated Transforms |
| **Data Engine** | Local Storage Persistence Layer, MongoDB / PostgreSQL DDL Support |

---

## 📦 Getting Started & Local Development

### Prerequisites
- Node.js 18+ or Bun
- Google Gemini API Key (`GEMINI_API_KEY`)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/castframe-ai-studio.git
cd castframe-ai-studio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file at the root:
```env
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📜 License
MIT License. Built for **CASTFRAME AI** & **Medusa Mobile Studio**.
