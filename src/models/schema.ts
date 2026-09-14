/**
 * CASTFRAME AI / Medusa Mobile App Backend Schemas
 * Pure dynamic data model definitions for MongoDB (Mongoose) and PostgreSQL (Drizzle/SQL)
 * Zero hardcoded content - purely template-driven and AI-generated.
 */

// ==========================================
// 1. MONGOOSE SCHEMA DEFINITIONS (Node.js)
// ==========================================

export const MongooseSchemaCode = `
import mongoose, { Schema, Document } from 'mongoose';

// --- INFLUENCER PERSONA SCHEMA ---
export interface IInfluencerPersona extends Document {
  organizationId: string;
  name: string;
  handle: string;
  niche: 'Sensual & Glamour' | 'Fitness & Gym' | 'Luxury & High Life' | 'Cyberpunk & Sci-Fi' | 'High Fashion & Editorial' | 'Streetwear & Urban' | 'Tech & AI Futurism' | 'Travel & Adventure' | 'Bikini & Beachwear' | 'Experimental & Avant-Garde';
  persona_traits: string[];
  visual_style: string;
  target_audience: string;
  bio: string;
  monetization_focus: string[];
  portraitUrl: string;
  voice_settings: {
    tone: string;
    speed: number;
    pitch: number;
    accent: string;
    elevenlabs_voice_id?: string;
  };
  prompt_recipes: {
    outfit_style: string;
    setting: string;
    lighting_mood: string;
    camera_framing: string;
    aesthetic: string;
  };
  references: Array<{
    id: string;
    url: string;
    role: string;
    angle: string;
    isPrimary: boolean;
  }>;
  stats: {
    estimated_followers: string;
    engagement_rate: string;
    viral_potential_score: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InfluencerPersonaSchema = new Schema<IInfluencerPersona>({
  organizationId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  niche: { 
    type: String, 
    required: true,
    enum: [
      'Sensual & Glamour', 'Fitness & Gym', 'Luxury & High Life',
      'Cyberpunk & Sci-Fi', 'High Fashion & Editorial', 'Streetwear & Urban',
      'Tech & AI Futurism', 'Travel & Adventure', 'Bikini & Beachwear', 'Experimental & Avant-Garde'
    ]
  },
  persona_traits: [{ type: String }],
  visual_style: { type: String, required: true },
  target_audience: { type: String, required: true },
  bio: { type: String, required: true },
  monetization_focus: [{ type: String }],
  portraitUrl: { type: String, required: true },
  voice_settings: {
    tone: { type: String, default: 'Confident, Sultry & Engaging' },
    speed: { type: Number, default: 1.0 },
    pitch: { type: Number, default: 1.0 },
    accent: { type: String, default: 'American Natural' },
    elevenlabs_voice_id: { type: String }
  },
  prompt_recipes: {
    outfit_style: { type: String, default: 'High fashion streetwear with neon accents' },
    setting: { type: String, default: 'Golden hour luxury penthouse rooftop' },
    lighting_mood: { type: String, default: 'Warm cinematic rim lighting' },
    camera_framing: { type: String, default: 'Medium portrait 50mm' },
    aesthetic: { type: String, default: 'Ultra photorealistic 8k' }
  },
  references: [{
    id: String,
    url: String,
    role: String,
    angle: String,
    isPrimary: Boolean
  }],
  stats: {
    estimated_followers: { type: String, default: '145K' },
    engagement_rate: { type: String, default: '5.8%' },
    viral_potential_score: { type: Number, default: 92 }
  }
}, { timestamps: true });

// --- CAMPAIGN SCHEMA ---
export interface ICampaign extends Document {
  organizationId: string;
  personaId: string;
  title: string;
  niche: string;
  target_audience: string;
  visual_style: string;
  campaign_goal: 'Viral Reel' | 'Brand Sponsorship' | 'Product Drop' | 'Sensual Teaser' | 'Daily Vlog' | 'Fitness Challenge';
  platform: 'Instagram Reels' | 'TikTok' | 'YouTube Shorts' | 'X / Twitter' | 'Fan Platform';
  description: string;
  reelsCount: number;
  visualsCount: number;
  status: 'active' | 'draft' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  organizationId: { type: String, required: true, index: true },
  personaId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  niche: { type: String, required: true },
  target_audience: { type: String, required: true },
  visual_style: { type: String, required: true },
  campaign_goal: { 
    type: String, 
    required: true,
    enum: ['Viral Reel', 'Brand Sponsorship', 'Product Drop', 'Sensual Teaser', 'Daily Vlog', 'Fitness Challenge'] 
  },
  platform: { 
    type: String, 
    required: true,
    enum: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'X / Twitter', 'Fan Platform'] 
  },
  description: { type: String },
  reelsCount: { type: Number, default: 0 },
  visualsCount: { type: Number, default: 0 },
  status: { type: String, default: 'active', enum: ['active', 'draft', 'completed'] }
}, { timestamps: true });

// --- REEL SCRIPT SCHEMA ---
export interface IReelScript extends Document {
  campaignId: string;
  personaId: string;
  title: string;
  niche: string;
  hook: string;
  scenes: Array<{
    sceneNumber: number;
    durationSeconds: number;
    visualDescription: string;
    cameraMovement: string;
    voiceover: string;
    onScreenText: string;
    transition: string;
  }>;
  captions: string;
  hashtags: string[];
  call_to_action: string;
  audio_mood: {
    genre: string;
    bpm: number;
    energy: 'Chill' | 'High Energy' | 'Seductive' | 'Dark Cyber' | 'Euphoric';
  };
  total_duration_seconds: number;
  createdAt: Date;
}

const ReelScriptSchema = new Schema<IReelScript>({
  campaignId: { type: String, required: true, index: true },
  personaId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  niche: { type: String, required: true },
  hook: { type: String, required: true },
  scenes: [{
    sceneNumber: Number,
    durationSeconds: Number,
    visualDescription: String,
    cameraMovement: String,
    voiceover: String,
    onScreenText: String,
    transition: String
  }],
  captions: { type: String, required: true },
  hashtags: [{ type: String }],
  call_to_action: { type: String, required: true },
  audio_mood: {
    genre: String,
    bpm: Number,
    energy: String
  },
  total_duration_seconds: { type: Number, default: 15 }
}, { timestamps: true });

export const InfluencerPersonaModel = mongoose.models.InfluencerPersona || mongoose.model<IInfluencerPersona>('InfluencerPersona', InfluencerPersonaSchema);
export const CampaignModel = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
export const ReelScriptModel = mongoose.models.ReelScript || mongoose.model<IReelScript>('ReelScript', ReelScriptSchema);
`;

// ==========================================
// 2. SQL DDL SCHEMA DEFINITIONS (PostgreSQL)
// ==========================================

export const PostgresSchemaCode = `
-- PostgreSQL DDL for AI Influencer Studio & Medusa Backend

CREATE TABLE IF NOT EXISTS influencer_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(255) UNIQUE NOT NULL,
  niche VARCHAR(100) NOT NULL,
  persona_traits TEXT[] NOT NULL DEFAULT '{}',
  visual_style TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  bio TEXT NOT NULL,
  monetization_focus TEXT[] NOT NULL DEFAULT '{}',
  portrait_url TEXT NOT NULL,
  voice_tone VARCHAR(255) DEFAULT 'Confident, Sultry & Engaging',
  voice_speed NUMERIC(3, 2) DEFAULT 1.0,
  voice_pitch NUMERIC(3, 2) DEFAULT 1.0,
  voice_accent VARCHAR(100) DEFAULT 'American Natural',
  elevenlabs_voice_id VARCHAR(255),
  prompt_outfit_style TEXT DEFAULT 'High fashion streetwear',
  prompt_setting TEXT DEFAULT 'Luxury penthouse rooftop',
  prompt_lighting_mood TEXT DEFAULT 'Warm cinematic sunset',
  prompt_camera_framing TEXT DEFAULT 'Medium Portrait 50mm',
  prompt_aesthetic TEXT DEFAULT 'Photorealistic 8K',
  references_json JSONB DEFAULT '[]'::jsonb,
  estimated_followers VARCHAR(50) DEFAULT '100K',
  engagement_rate VARCHAR(50) DEFAULT '6.2%',
  viral_potential_score INT DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  persona_id UUID REFERENCES influencer_personas(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  niche VARCHAR(100) NOT NULL,
  target_audience TEXT NOT NULL,
  visual_style TEXT NOT NULL,
  campaign_goal VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  description TEXT,
  reels_count INT DEFAULT 0,
  visuals_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reel_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES influencer_personas(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  niche VARCHAR(100) NOT NULL,
  hook TEXT NOT NULL,
  scenes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  captions TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  call_to_action TEXT NOT NULL,
  audio_genre VARCHAR(100) DEFAULT 'Future Bass / Trap Pop',
  audio_bpm INT DEFAULT 128,
  audio_energy VARCHAR(50) DEFAULT 'High Energy',
  total_duration_seconds INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visual_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  persona_id UUID REFERENCES influencer_personas(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  outfit_style VARCHAR(255),
  setting VARCHAR(255),
  lighting_mood VARCHAR(255),
  aspect_ratio VARCHAR(20) DEFAULT '9:16',
  model_used VARCHAR(100) DEFAULT 'gemini-3.1-flash-lite-image',
  status VARCHAR(50) DEFAULT 'Ready',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES reel_scripts(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES influencer_personas(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'queued',
  progress_percent INT DEFAULT 0,
  video_stream_url TEXT,
  download_url TEXT,
  render_manifest_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;
