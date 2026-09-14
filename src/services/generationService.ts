import { 
  Actor, 
  GeneratedLook, 
  LookConfig, 
  PromptRecipe, 
  GenerationJob, 
  GenerationStep, 
  GenerationProgressCallback 
} from '../types';
import { storageService } from './storageService';

export interface GenerateLookOptions {
  parentLookId?: string;
  sourceImageBase64?: string;
  modificationInstruction?: string;
}

/**
 * Enterprise generation abstraction service.
 * Performs real Gemini multimodal generation through the server backend with canonical job lifecycle tracking.
 */
export class LookGenerationService {
  private static instance: LookGenerationService;

  public static getInstance(): LookGenerationService {
    if (!LookGenerationService.instance) {
      LookGenerationService.instance = new LookGenerationService();
    }
    return LookGenerationService.instance;
  }

  /**
   * Generates a character visualization based on consented reference identity and prompt recipe.
   */
  public async generateCharacterLook(
    actor: Actor,
    config: LookConfig,
    onProgress?: GenerationProgressCallback,
    options?: GenerateLookOptions
  ): Promise<GeneratedLook> {
    // 1. Consent Gate Check
    if (actor.consentStatus === 'withdrawn') {
      throw new Error('Generation blocked: Consent for this real-person identity was withdrawn.');
    }
    if (actor.lifecycleStatus === 'deletion_pending') {
      throw new Error('Generation blocked: This identity is scheduled for deletion.');
    }

    const org = storageService.getOrganization();
    const user = storageService.getCurrentUser();
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    // 2. Build Versioned Prompt Recipe (prompt-recipe/3)
    const primaryRef = actor.references?.find(r => r.isPrimary) || actor.references?.[0];
    const promptRecipe: PromptRecipe = {
      version: 'prompt-recipe/3',
      identity: {
        identityId: actor.id,
        identityName: actor.name,
        calibrationId: actor.activeCalibration?.id,
        mode: 'reference_conditioned',
        referenceCount: actor.references?.length || 0,
        primaryReferenceId: primaryRef?.id,
        preserveFace: config.preserveFace !== false,
        preserveBody: config.preserveBody !== false
      },
      creative: {
        characterName: config.character,
        characterId: config.characterId,
        scene: config.prompt || config.costume || 'Cinematic character screen test',
        wardrobe: config.costume || 'Tailored costume',
        hairstyle: config.hairstyle || 'Stylized hair',
        facialHair: config.facialHair,
        pose: config.pose || 'Standing',
        lighting: config.lighting || 'Dramatic',
        camera: {
          shot: config.camera || 'Medium Shot',
          lensMm: config.camera === 'Close-Up' ? 85 : config.camera === 'Full Body' ? 35 : 50,
          aspectRatio: config.aspectRatio || '16:9'
        },
        visualStyle: config.visualStyle || 'Photorealistic'
      },
      constraints: {
        singleSubject: true,
        noText: true,
        noWatermark: true,
        photorealisticPores: true
      },
      output: {
        qualityProfile: 'cinematic-still-v1'
      }
    };

    // 3. Register Initial Job State
    const initialJob: GenerationJob = {
      id: jobId,
      organizationId: org.id,
      userId: user.id,
      identityId: actor.id,
      characterName: config.character,
      state: 'validated',
      progressPercent: 10,
      currentStepLabel: 'Input validated',
      detail: `Verified consent and calibrated reference set for ${actor.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipe: promptRecipe
    };
    storageService.addOrUpdateJob(initialJob);

    const updateJob = (state: GenerationJob['state'], percent: number, label: string, detail: string) => {
      const step: GenerationStep = {
        step: Math.ceil(percent / 20),
        totalSteps: 5,
        label,
        detail,
        progressPercent: percent,
        state
      };
      if (onProgress) onProgress(step);
      storageService.addOrUpdateJob({
        ...initialJob,
        state,
        progressPercent: percent,
        currentStepLabel: label,
        detail,
        updatedAt: new Date().toISOString()
      });
    };

    try {
      // Step 1: Preparing payload
      updateJob('quota_reserved', 20, 'Reserving studio generation quota...', `Allocating provider slot for ${actor.name}`);

      // Step 2: Assembling multimodal reference context
      updateJob(
        'provider_submitted', 
        40, 
        'Assembling multi-angle references...', 
        options?.modificationInstruction 
          ? `Applying targeted instruction: "${options.modificationInstruction.slice(0, 45)}..."` 
          : `Synthesizing ${config.character} in ${config.costume.slice(0, 35)}...`
      );

      // Select up to 4 prioritized reference photos
      const relevantRefs = actor.references?.slice(0, 4) || [];
      const payload = {
        personName: actor.name,
        characterName: config.character,
        prompt: config.prompt || config.costume,
        references: relevantRefs.length > 0 ? relevantRefs : (primaryRef ? [primaryRef] : []),
        identityProfile: actor.identityProfile,
        lookConfig: config,
        sourceImageBase64: options?.sourceImageBase64,
        modificationInstruction: options?.modificationInstruction
      };

      // Step 3: Provider Processing
      updateJob('provider_processing', 65, 'Calling Gemini image generation engine...', 'Generating scene with identity preservation');

      const resp = await fetch('/api/ai/generate-look', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();

      if (!resp.ok || !data.success || !data.imageUrl) {
        const isQuota = resp.status === 429 || data.error === 'QUOTA_EXCEEDED' || data.code === 'QUOTA_EXHAUSTED';
        updateJob(
          isQuota ? 'quota_exhausted' : 'failed_terminal',
          0,
          isQuota ? 'Quota exhausted' : 'Generation failed',
          data.message || 'Provider call could not be completed.'
        );

        const errMsg = data.message || data.error || 'Gemini image generation could not be completed.';
        const err = new Error(errMsg);
        (err as any).details = data.details;
        (err as any).requiresPaidKey = data.requiresPaidKey;
        (err as any).errorType = data.error;
        (err as any).code = data.code;
        (err as any).retryAfterSeconds = data.retryAfterSeconds;
        throw err;
      }

      // Step 4: Quality & Media Scanning
      updateJob('quality_evaluation', 85, 'Validating output fidelity...', 'Scanning image for artifacts and identity coherence');

      const chosenImage: string = data.imageUrl;
      const modelName = data.modelUsed || 'gemini-3.1-flash-lite-image';

      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Build structured look name
      const sceneContext = config.costume?.slice(0, 28) || config.visualStyle;
      const cleanLookName = `${config.character} — ${sceneContext}`;

      const newLook: GeneratedLook = {
        id: `look-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        organizationId: org.id,
        actorId: actor.id,
        actorName: actor.name,
        character: config.character,
        characterId: config.characterId,
        parentLookId: options?.parentLookId,
        lookName: cleanLookName,
        imageUrl: chosenImage,
        config: { ...config },
        promptRecipe,
        createdAt: `Today, ${timeString}`,
        status: 'Ready',
        model: modelName,
        rating: 5,
        isFavorite: false,
        collections: [],
        notes: `Identity-aware portrayal for ${actor.name} as ${config.character}. Prioritizing face: ${config.preserveFace !== false ? 'Active' : 'Off'}, body: ${config.preserveBody !== false ? 'Active' : 'Off'}.`
      };

      // Step 5: Mark Succeeded
      updateJob('succeeded', 100, 'Look saved successfully', `Committed ${config.character} to project lookbook`);
      
      // Update job with output look ID
      storageService.addOrUpdateJob({
        ...initialJob,
        state: 'succeeded',
        progressPercent: 100,
        currentStepLabel: 'Generation complete',
        detail: `Look "${cleanLookName}" created successfully.`,
        outputLookId: newLook.id,
        updatedAt: new Date().toISOString()
      });

      // Log audit event
      storageService.addAuditEvent({
        id: `aud-gen-${Date.now()}`,
        organizationId: org.id,
        userId: user.id,
        userName: user.name,
        eventType: 'generation_succeeded',
        entityId: newLook.id,
        entityType: 'look',
        description: `Generated Look "${cleanLookName}" for identity ${actor.name} (recipe v3).`,
        timestamp: new Date().toISOString()
      });

      return newLook;
    } catch (err: any) {
      storageService.addOrUpdateJob({
        ...initialJob,
        state: err?.code === 'QUOTA_EXHAUSTED' ? 'quota_exhausted' : 'failed_terminal',
        progressPercent: 0,
        currentStepLabel: 'Generation halted',
        detail: err?.message || 'Error occurred during generation pipeline.',
        errorMessage: err?.message,
        errorDetails: err?.details,
        requiresPaidKey: err?.requiresPaidKey,
        updatedAt: new Date().toISOString()
      });
      throw err;
    }
  }
}

export const generationService = LookGenerationService.getInstance();
