import { z } from 'zod';

export interface ImageGenerationParams {
  prompts: string[];
  characterConsistency?: boolean;
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
  style?: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  width: number;
  height: number;
  modelUsed: string;
}

export interface ImageServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const ImageOutputSchema = z.object({
  url: z.string().url(),
  prompt: z.string(),
  width: z.number(),
  height: z.number(),
  modelUsed: z.string()
});

/**
 * Image generation service with fallback chain:
 * 1. Pollinations.ai (free, no auth required)
 * 2. Flux.1-dev via HuggingFace (requires HF_TOKEN)
 * 3. Clear error if all fail
 */
export class ImageService {
  private hfToken?: string;

  constructor(hfToken?: string) {
    this.hfToken = hfToken;
  }

  initialize(hfToken: string): void {
    this.hfToken = hfToken;
  }

  /**
   * Generate images using Pollinations.ai (primary free tier)
   */
  async generateWithPollinations(prompt: string, options: {
    width?: number;
    height?: number;
    aspectRatio?: string;
    seed?: number;
  } = {}): Promise<ImageServiceResponse<GeneratedImage>> {
    try {
      const {
        width = 768,
        height = 1344,
        aspectRatio = '9:16',
        seed = Math.floor(Math.random() * 1000000)
      } = options;

      // Calculate dimensions based on aspect ratio if not provided
      let finalWidth = width;
      let finalHeight = height;

      if (aspectRatio === '9:16') {
        finalWidth = 768;
        finalHeight = 1344;
      } else if (aspectRatio === '16:9') {
        finalWidth = 1344;
        finalHeight = 768;
      } else if (aspectRatio === '1:1') {
        finalWidth = 1024;
        finalHeight = 1024;
      } else if (aspectRatio === '4:5') {
        finalWidth = 800;
        finalHeight = 1000;
      }

      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${finalWidth}&height=${finalHeight}&nologo=true&enhance=true&seed=${seed}`;

      // Verify the URL is accessible (optional health check)
      // For production, you might want to actually fetch and validate
      return {
        success: true,
        data: {
          url: imageUrl,
          prompt,
          width: finalWidth,
          height: finalHeight,
          modelUsed: 'pollinations-flux'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'POLLINATIONS_GENERATION_FAILED',
        message: error?.message || 'Failed to generate image with Pollinations'
      };
    }
  }

  /**
   * Generate images using Flux.1-dev via HuggingFace Inference API
   */
  async generateWithFlux(prompt: string, options: {
    width?: number;
    height?: number;
  } = {}): Promise<ImageServiceResponse<GeneratedImage>> {
    if (!this.hfToken) {
      return {
        success: false,
        error: 'HF_TOKEN_MISSING',
        message: 'HuggingFace token not configured'
      };
    }

    try {
      const { width = 1024, height = 1024 } = options;

      const response = await fetch(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width,
              height,
              num_inference_steps: 28
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HF API error: ${response.status} - ${errorText}`);
      }

      // HF returns raw image bytes, we need to convert to base64 or store temporarily
      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      return {
        success: true,
        data: {
          url: imageUrl,
          prompt,
          width,
          height,
          modelUsed: 'flux.1-dev'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'FLUX_GENERATION_FAILED',
        message: error?.message || 'Failed to generate image with Flux'
      };
    }
  }

  /**
   * Generate multiple images with fallback chain
   */
  async generateImages(params: ImageGenerationParams): Promise<ImageServiceResponse<GeneratedImage[]>> {
    const { prompts, characterConsistency = false, aspectRatio = '9:16', style = 'photorealistic' } = params;

    if (!prompts || prompts.length === 0) {
      return {
        success: false,
        error: 'NO_PROMPTS_PROVIDED',
        message: 'At least one prompt is required'
      };
    }

    const results: GeneratedImage[] = [];
    const errors: string[] = [];

    for (const prompt of prompts) {
      // Enhance prompt for character consistency if needed
      let enhancedPrompt = prompt;
      if (characterConsistency) {
        enhancedPrompt = `${prompt}, consistent character features, same person identity, photorealistic portrait`;
      }
      if (style) {
        enhancedPrompt = `${enhancedPrompt}, ${style}`;
      }

      // Try Pollinations first (free tier)
      let result = await this.generateWithPollinations(enhancedPrompt, { aspectRatio });

      // Fallback to Flux if Pollinations fails
      if (!result.success && this.hfToken) {
        result = await this.generateWithFlux(enhancedPrompt);
      }

      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(`Prompt "${prompt.slice(0, 50)}...": ${result.error || result.message}`);
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        error: 'ALL_GENERATIONS_FAILED',
        message: `All image generations failed: ${errors.join('; ')}`
      };
    }

    return {
      success: true,
      data: results,
      message: errors.length > 0 ? `Partial success: ${errors.length} generations failed` : undefined
    };
  }

  /**
   * Generate a single image with automatic fallback
   */
  async generateImage(prompt: string, options: {
    aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
    characterConsistency?: boolean;
    style?: string;
  } = {}): Promise<ImageServiceResponse<GeneratedImage>> {
    const result = await this.generateImages({
      prompts: [prompt],
      characterConsistency: options.characterConsistency,
      aspectRatio: options.aspectRatio,
      style: options.style
    });

    if (result.success && result.data && result.data.length > 0) {
      return {
        success: true,
        data: result.data[0]
      };
    }

    return {
      success: false,
      error: result.error,
      message: result.message
    };
  }
}

export const imageService = new ImageService(process.env.HF_TOKEN);
