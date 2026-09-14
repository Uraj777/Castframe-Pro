export type NavigationTab = 
  | 'dashboard'
  | 'actors'
  | 'projects'
  | 'casting'
  | 'generator'
  | 'generations'
  | 'collections'
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

// Consent and Identity Types
export type IdentityType = 'synthetic' | 'self' | 'authorized_real_person' | 'brand_character';
export type IdentityLifecycleStatus = 'draft' | 'collecting_references' | 'calibrating' | 'ready' | 'archived' | 'deletion_pending';
export type ConsentStatus = 'not_required' | 'pending' | 'verified' | 'expired' | 'withdrawn';
export type AuthorityType = 'self' | 'legal_guardian' | 'agent' | 'employer' | 'other';

export interface IdentityConsent {
  id: string;
  identityId: string;
  authorityType: AuthorityType;
  attestationVersion: string; // e.g. "castframe-consent-v1"
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
  estimatedYaw?: number; // degrees approx -90 to +90
  estimatedPitch?: number;
  estimatedLighting?: 'Even Daylight' | 'Studio Soft' | 'Harsh Direct' | 'Low Light' | 'Backlit';
  estimatedFraming?: 'Close-Up' | 'Medium Portrait' | 'Full Body';
  estimatedExpression?: 'Neutral' | 'Subtle Smile' | 'Intense / Dramatic' | 'Open Mouth';
  detectedFaceCount: number;
  isOccluded: boolean;
  sharpnessScore: number; // 0 - 100
  fileSizeBytes: number;
  checksum?: string;
}

export interface ActorReference {
  id: string;
  url: string;
  label: string; // e.g. "Front Close-up Neutral", "3/4 Profile Right", "Full Body Standing"
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
}

export interface CoverageBreakdown {
  poseCoverage: number; // 0.0 - 1.0 (weight 0.30)
  framingCoverage: number; // 0.0 - 1.0 (weight 0.20)
  lightingCoverage: number; // 0.0 - 1.0 (weight 0.15)
  expressionCoverage: number; // 0.0 - 1.0 (weight 0.10)
  qualityCoverage: number; // 0.0 - 1.0 (weight 0.15)
  diversityCoverage: number; // 0.0 - 1.0 (weight 0.10)
  overallScore: number; // 0.0 - 1.0
  thresholdStatus: 'ready' | 'moderate' | 'insufficient';
  recommendations: string[];
}

export type EstablishmentStatus = 'established' | 'partially_established' | 'not_established';

export interface IdentityFeatureDetail {
  name: string;
  value: string;
  status: EstablishmentStatus;
  confidence: number; // 0 - 100
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
  provider: string; // e.g. "Google Gemini 3 Multimodal"
  modelVersion: string; // e.g. "gemini-3.1-flash-image"
  status: 'queued' | 'calibrating' | 'ready' | 'failed' | 'revoked';
  coverageScore: number;
  validationScore: number;
  createdAt: string;
  completedAt?: string;
}

export interface Actor {
  id: string;
  organizationId: string;
  name: string;
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
  portraitUrl: string;
  references: ActorReference[];
  identityCalibrated: boolean;
  calibrationScore: number; // e.g. 92
  identityProfile?: IdentityProfile;
  activeCalibration?: IdentityCalibration;
  generatedLooksCount: number;
  lastUpdated: string;
  notes?: string;
}

export type Person = Actor;

// Future 3D Representation Boundary (non-mocked, architectural placeholder)
export interface IdentityRepresentation {
  id: string;
  identityId: string;
  type: 'reference_set' | 'image_adapter' | 'mesh' | 'rig' | 'texture_set' | 'motion_profile';
  version: string;
  compatibleProvider: string;
  status: 'experimental' | 'ready' | 'deprecated';
  notes: string;
}

// Generation & Studio Types
export type PhysiqueOption = 'Lean' | 'Athletic' | 'Muscular' | 'Heavy' | 'Custom';
export type PoseOption = 'Standing' | 'Sitting' | 'Walking' | 'Fighting' | 'Riding' | 'Portrait' | 'Custom';
export type LightingOption = 'Natural' | 'Studio' | 'Golden Hour' | 'Dramatic' | 'Night' | 'Custom';
export type CameraOption = 'Full Body' | 'Medium Shot' | 'Close-Up' | 'Wide Cinematic' | 'Character Poster';
export type VisualStyleOption = 'Photorealistic' | 'Historical Epic' | 'Contemporary Cinema' | 'Period Drama' | 'Character Poster' | 'Custom';

export interface LookConfig {
  character: string;
  characterId?: string;
  age: number;
  costume: string;
  hairstyle: string;
  facialHair: string;
  physique: PhysiqueOption;
  customPhysique?: string;
  pose: PoseOption;
  customPose?: string;
  environment: string;
  lighting: LightingOption;
  customLighting?: string;
  camera: CameraOption;
  visualStyle: VisualStyleOption;
  customStyle?: string;
  aspectRatio?: '16:9' | '2.39:1' | '4:5' | '1:1';
  prompt?: string;
  preserveFace?: boolean;
  preserveBody?: boolean;
  preserveAllIdentity?: boolean;
  outfitColor?: string;
  outfitMaterial?: string;
  outfitEra?: string;
  outfitAccessories?: string;
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
  parentLookId?: string; // Links micro-variations to parent look
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
  candidateNumber: string; // e.g. "Candidate 01"
  status: 'under_consideration' | 'auditioning' | 'shortlisted' | 'final_callback' | 'cast_confirmed';
  rating: number; // 1-5
  notes: string;
  pinnedLookUrl?: string;
  lookName?: string;
  coverageScore?: number;
}

export interface CharacterRole {
  id: string;
  projectId?: string;
  name: string;
  tagline: string;
  description: string;
  importance: 'Lead' | 'Supporting' | 'Key Ensemble';
  ageTarget: string;
  selectedLookId?: string;
}

export interface Project {
  id: string;
  organizationId?: string;
  title: string;
  subtitle: string;
  description: string;
  genre: string;
  thumbnail: string;
  director: string;
  castingDirector: string;
  targetProductionYear: string;
  actorsCount: number;
  charactersCount: number;
  looksCount: number;
  lastActive: string;
}

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
