export type NavigationTab = 
  | 'dashboard'
  | 'actors'       // Influencer Personas
  | 'projects'     // Campaigns & Brand Deals
  | 'casting'      // Campaign Matching / Roster
  | 'generator'    // AI Visuals & Lookbook Studio
  | 'generations'  // Lookbook Library
  | 'collections'  // Campaign Lookbooks & Sets
  | 'settings';

export type UserRole = 'owner' | 'admin' | 'editor' | 'reviewer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  tier: 'Starter' | 'Studio' | 'Enterprise';
  quotaRemaining: number;
  quotaTotal: number;
  createdAt: string;
}

// Influencer Niches & Themes
export type InfluencerNiche = 
  | 'Sensual & Glamour'
  | 'Fitness & Gym'
  | 'Luxury & High Life'
  | 'Cyberpunk & Sci-Fi'
  | 'High Fashion & Editorial'
  | 'Streetwear & Urban'
  | 'Tech & AI Futurism'
  | 'Travel & Adventure'
  | 'Bikini & Beachwear'
  | 'Experimental & Avant-Garde';

export type CampaignGoal = 
  | 'Viral Reel'
  | 'Brand Sponsorship'
  | 'Product Drop'
  | 'Sensual Teaser'
  | 'Daily Vlog'
  | 'Fitness Challenge'
  | 'Aesthetic Photoshoot';

export type PlatformTarget = 
  | 'Instagram Reels'
  | 'TikTok'
  | 'YouTube Shorts'
  | 'X / Twitter'
  | 'Fan Platform';

// Consent and Identity Types
export type IdentityType = 'synthetic' | 'self' | 'authorized_real_person' | 'brand_character';
export type IdentityLifecycleStatus = 'draft' | 'collecting_references' | 'calibrating' | 'ready' | 'archived' | 'deletion_pending';
export type ConsentStatus = 'not_required' | 'pending' | 'verified' | 'expired' | 'withdrawn';
export type AuthorityType = 'self' | 'legal_guardian' | 'agent' | 'employer' | 'other';

export interface IdentityConsent {
  id: string;
  identityId: string;
  authorityType: AuthorityType;
  attestationVersion: string;
  acceptedByUserId: string;
  acceptedByUserName: string;
  acceptedAt: string;
  verificationStatus: 'verified' | 'pending_review' | 'withdrawn';
  evidenceNotes?: string;
  scopeOfUse: string[];
  expiresAt?: string;
}

// Multi-Angle Reference Roles
export type ReferenceRole = 
  | 'front_face'
  | 'three_quarter_left'
  | 'three_quarter_right'
  | 'profile_left'
  | 'profile_right'
  | 'upper_body'
  | 'full_body_front'
  | 'full_body_side'
  | 'full_body_back'
  | 'expression_reference'
  | 'other';

export type ReferenceQuality = 'Excellent' | 'Good' | 'Fair' | 'Needs better reference';
export type ReferenceDesignation = ReferenceRole;

export interface ReferenceMetadata {
  estimatedYaw?: number;
  estimatedPitch?: number;
  estimatedLighting?: 'Even Daylight' | 'Studio Soft' | 'Harsh Direct' | 'Low Light' | 'Backlit';
  estimatedFraming?: 'Close-Up' | 'Medium Portrait' | 'Full Body';
  estimatedExpression?: 'Neutral' | 'Subtle Smile' | 'Intense / Dramatic' | 'Open Mouth';
  detectedFaceCount: number;
  isOccluded: boolean;
  sharpnessScore: number;
  fileSizeBytes: number;
  checksum?: string;
}

export interface ActorReference {
  id: string;
  url: string;
  label: string;
  role: ReferenceRole;
  designation?: string;
  quality: ReferenceQuality;
  isPrimary: boolean;
  angle?: string;
  lighting?: string;
  expression?: string;
  visibleFeatures?: string[];
  uploadedAt: string;
  metadata?: ReferenceMetadata;
  validationIssues?: string[];
  isAccepted: boolean;
  isAiDetected?: boolean;
  aiConfidence?: number;
}

export interface CoverageBreakdown {
  poseCoverage: number;
  framingCoverage: number;
  lightingCoverage: number;
  expressionCoverage: number;
  qualityCoverage: number;
  diversityCoverage: number;
  overallScore: number;
  thresholdStatus: 'ready' | 'moderate' | 'insufficient';
  recommendations: string[];
}

export type EstablishmentStatus = 'established' | 'partially_established' | 'not_established';

export interface IdentityFeatureDetail {
  name: string;
  value: string;
  status: EstablishmentStatus;
  confidence: number;
  evidenceCount?: number;
  notes?: string;
}

export interface IdentityProfile {
  overallConfidence: number;
  faceMatchConfidence: number;
  bodyProportionConfidence: number;
  referenceCoverage: number;
  coverageReport: CoverageBreakdown;
  facialStructure: {
    faceShape: IdentityFeatureDetail;
    eyeShapeAndSpacing: IdentityFeatureDetail;
    eyebrows: IdentityFeatureDetail;
    noseStructure: IdentityFeatureDetail;
    lipsAndMouth: IdentityFeatureDetail;
    jawlineAndChin: IdentityFeatureDetail;
    ears: IdentityFeatureDetail;
    hairline: IdentityFeatureDetail;
  };
  hairAndGrooming: {
    style: IdentityFeatureDetail;
    texture: IdentityFeatureDetail;
    naturalColor: IdentityFeatureDetail;
    facialHair: IdentityFeatureDetail;
  };
  skinAndTone: {
    undertone: IdentityFeatureDetail;
    complexion: IdentityFeatureDetail;
    frecklesAndPores: IdentityFeatureDetail;
  };
  distinctiveFeatures: {
    marksScarsTattoos: IdentityFeatureDetail;
    molesOrBirthmarks: IdentityFeatureDetail;
  };
  bodyAndProportions: {
    shoulderWidth: IdentityFeatureDetail;
    neckTorso: IdentityFeatureDetail;
    musculature: IdentityFeatureDetail;
    limbProportions: IdentityFeatureDetail;
    estimatedBuild: IdentityFeatureDetail;
  };
  analysisTimestamp: string;
  aiSummary: string;
}

export interface IdentityCalibration {
  id: string;
  identityId: string;
  provider: string;
  modelVersion: string;
  status: 'queued' | 'calibrating' | 'ready' | 'failed' | 'revoked';
  coverageScore: number;
  validationScore: number;
  createdAt: string;
  completedAt?: string;
}

// Voice and Audio Settings for AI Influencer
export interface VoiceSettings {
  tone: string;
  speed: number;
  pitch: number;
  accent: string;
  elevenlabs_voice_id?: string;
  personality_vibe?: string;
}

// Influencer Persona (extends Actor for unified backend compatibility)
export interface Actor {
  id: string;
  organizationId: string;
  name: string;
  handle?: string; // e.g. "@valkyrie.fit"
  niche?: InfluencerNiche;
  persona_traits?: string[];
  visual_style?: string;
  target_audience?: string;
  identityType: IdentityType;
  lifecycleStatus: IdentityLifecycleStatus;
  consentStatus: ConsentStatus;
  consentRecord?: IdentityConsent;
  ageRange: string;
  actualAge: number;
  height: string;
  build: 'Lean' | 'Athletic' | 'Muscular' | 'Heavy' | 'Custom';
  eyeColor?: string;
  hairColor?: string;
  nationality?: string;
  reps?: string;
  bio?: string;
  monetization_focus?: string[];
  portraitUrl: string;
  references: ActorReference[];
  identityCalibrated: boolean;
  calibrationScore: number;
  identityProfile?: IdentityProfile;
  activeCalibration?: IdentityCalibration;
  voice_settings?: VoiceSettings;
  generatedLooksCount: number;
  lastUpdated: string;
  notes?: string;
  stats?: {
    estimated_followers?: string;
    engagement_rate?: string;
    viral_potential_score?: number;
  };
}

export type Person = Actor;
export type InfluencerPersona = Actor;

// Generation & Studio Types
export type PhysiqueOption = 'Lean' | 'Athletic' | 'Muscular' | 'Heavy' | 'Custom';
export type PoseOption = 'Standing' | 'Sitting' | 'Walking' | 'Fighting' | 'Riding' | 'Portrait' | 'Custom';
export type LightingOption = 'Natural' | 'Studio' | 'Golden Hour' | 'Dramatic' | 'Night' | 'Custom';
export type CameraOption = 'Full Body' | 'Medium Shot' | 'Close-Up' | 'Wide Cinematic' | 'Character Poster';
export type VisualStyleOption = 'Photorealistic' | 'Historical Epic' | 'Contemporary Cinema' | 'Period Drama' | 'Character Poster' | 'Custom';

export interface LookConfig {
  character: string; // Persona / Scene Name
  characterId?: string;
  age: number;
  costume: string; // Dynamic {outfit_style}
  hairstyle: string;
  facialHair: string;
  physique: PhysiqueOption;
  customPhysique?: string;
  pose: PoseOption;
  customPose?: string;
  environment: string; // Dynamic {setting}
  lighting: LightingOption; // Dynamic {lighting_mood}
  customLighting?: string;
  camera: CameraOption; // Dynamic {shot_type}
  visualStyle: VisualStyleOption; // Dynamic {aesthetic}
  customStyle?: string;
  aspectRatio?: '16:9' | '2.39:1' | '4:5' | '1:1' | '9:16';
  prompt?: string;
  preserveFace?: boolean;
  preserveBody?: boolean;
  preserveAllIdentity?: boolean;
  outfitColor?: string;
  outfitMaterial?: string;
  outfitEra?: string;
  outfitAccessories?: string;
  // Medusa Dynamic Variables
  outfit_style?: string;
  setting?: string;
  lighting_mood?: string;
  aesthetic?: string;
  shot_type?: string;
}

// Versioned Prompt Recipe Schema (prompt-recipe/3)
export interface PromptRecipe {
  version: 'prompt-recipe/3';
  identity: {
    identityId: string;
    identityName: string;
    calibrationId?: string;
    mode: 'reference_conditioned';
    referenceCount: number;
    primaryReferenceId?: string;
    preserveFace: boolean;
    preserveBody: boolean;
  };
  creative: {
    characterName: string;
    characterId?: string;
    scene: string;
    wardrobe: string;
    hairstyle: string;
    facialHair?: string;
    pose: string;
    lighting: string;
    camera: {
      shot: string;
      lensMm: number;
      aspectRatio: string;
    };
    visualStyle: string;
    dynamicVars?: {
      outfit_style?: string;
      setting?: string;
      lighting_mood?: string;
      aesthetic?: string;
    };
  };
  constraints: {
    singleSubject: boolean;
    noText: boolean;
    noWatermark: boolean;
    photorealisticPores: boolean;
  };
  output: {
    qualityProfile: 'cinematic-still-v1';
  };
}

export interface GeneratedLook {
  id: string;
  organizationId?: string;
  projectId?: string;
  actorId: string;
  actorName: string;
  character: string;
  characterId?: string;
  parentLookId?: string;
  lookName: string;
  imageUrl: string;
  config: LookConfig;
  promptRecipe?: PromptRecipe;
  createdAt: string;
  status: 'Ready' | 'In Review' | 'Approved' | 'Archived';
  model: string;
  rating?: number;
  isFavorite?: boolean;
  collections?: string[];
  notes?: string;
  prompt?: string;
  likenessScore?: number;
  isPrimaryForCharacter?: boolean;
}

export interface CastingCandidate {
  id: string;
  boardId?: string;
  actorId: string;
  actorName: string;
  actorPortrait: string;
  character: string;
  characterId?: string;
  candidateNumber: string;
  status: 'under_consideration' | 'auditioning' | 'shortlisted' | 'final_callback' | 'cast_confirmed';
  rating: number;
  notes: string;
  pinnedLookUrl?: string;
  lookName?: string;
  coverageScore?: number;
}

// Campaign Role / Scene Template
export interface CharacterRole {
  id: string;
  projectId?: string;
  name: string;
  tagline: string;
  description: string;
  importance: 'Lead' | 'Supporting' | 'Key Ensemble';
  ageTarget: string;
  selectedLookId?: string;
  niche?: InfluencerNiche;
}

// Campaign / Project Schema
export interface Project {
  id: string;
  organizationId?: string;
  title: string;
  subtitle: string;
  description: string;
  genre: string; // Niche or Campaign Style
  niche?: InfluencerNiche;
  target_audience?: string;
  visual_style?: string;
  campaign_goal?: CampaignGoal;
  platform?: PlatformTarget;
  thumbnail: string;
  director: string; // Creator Lead
  castingDirector: string;
  targetProductionYear: string;
  actorsCount: number;
  charactersCount: number;
  looksCount: number;
  lastActive: string;
}

export type Campaign = Project;

export interface LookCollection {
  id: string;
  organizationId?: string;
  title: string;
  description: string;
  coverImage: string;
  itemCount: number;
  lookIds: string[];
  updatedAt: string;
  tags: string[];
}

// =====================================
// MEDUSA MOBILE BACKEND CONTRACT TYPES
// =====================================

export interface ScriptScene {
  sceneNumber: number;
  durationSeconds: number;
  visualDescription: string;
  cameraMovement: string;
  voiceover: string;
  onScreenText: string;
  transition: string;
}

export interface ReelScript {
  id: string;
  campaignId?: string;
  personaId?: string;
  title: string;
  niche: InfluencerNiche;
  hook: string;
  scenes: ScriptScene[];
  captions: string;
  hashtags: string[];
  call_to_action: string;
  audio_mood: {
    genre: string;
    bpm: number;
    energy: 'Chill' | 'High Energy' | 'Seductive' | 'Dark Cyber' | 'Euphoric';
  };
  total_duration_seconds: number;
  createdAt: string;
}

export interface VideoRenderManifest {
  scriptId: string;
  personaId: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  scenes: Array<{
    sceneNumber: number;
    duration: number;
    imageUrl: string;
    motionPreset: 'slow_zoom_in' | 'pan_left' | 'orbit_right' | 'glitch_pulse' | 'subtle_drift';
    voiceoverAudioUrl?: string;
    subtitleText: string;
    transition: 'cut' | 'flash_white' | 'whip_pan' | 'glitch' | 'crossfade';
  }>;
  backgroundMusic: {
    trackTitle: string;
    genre: string;
    volume: number;
  };
  outputFormat: 'mp4' | 'webm';
}

export interface VideoRenderJob {
  id: string;
  scriptId: string;
  personaId: string;
  status: 'queued' | 'rendering_visuals' | 'synthesizing_audio' | 'compositing_video' | 'ready' | 'failed';
  progressPercent: number;
  videoStreamUrl?: string;
  downloadUrl?: string;
  manifest: VideoRenderManifest;
  createdAt: string;
  completedAt?: string;
}

// Canonical Durable Job States
export type GenerationJobState = 
  | 'draft'
  | 'validated'
  | 'quota_reserved'
  | 'queued'
  | 'running'
  | 'provider_submitted'
  | 'provider_processing'
  | 'provider_completed'
  | 'media_scanning'
  | 'safety_review'
  | 'identity_evaluation'
  | 'quality_evaluation'
  | 'succeeded'
  | 'cancelled'
  | 'failed_retryable'
  | 'failed_terminal'
  | 'quota_exhausted'
  | 'blocked';

export interface GenerationJob {
  id: string;
  organizationId: string;
  userId: string;
  identityId: string;
  characterName: string;
  state: GenerationJobState;
  progressPercent: number;
  currentStepLabel: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
  recipe?: PromptRecipe;
  outputLookId?: string;
  errorMessage?: string;
  errorDetails?: string;
  requiresPaidKey?: boolean;
}

export interface AuditEvent {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  eventType: 'consent_attested' | 'consent_withdrawn' | 'identity_calibrated' | 'generation_requested' | 'generation_succeeded' | 'look_archived' | 'identity_deleted' | 'quota_consumed';
  entityId: string;
  entityType: 'identity' | 'look' | 'consent' | 'project' | 'organization';
  description: string;
  timestamp: string;
  ipAddress?: string;
}

export interface GenerationStep {
  step: number;
  totalSteps: number;
  label: string;
  detail: string;
  progressPercent: number;
  state: GenerationJobState;
}

export type GenerationProgressCallback = (status: GenerationStep) => void;
