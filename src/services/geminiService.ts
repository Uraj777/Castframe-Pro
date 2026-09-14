import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export interface ScriptGenerationParams {
  niche: string;
  tone: string;
  duration: number;
  personaName?: string;
  handle?: string;
  platform?: string;
  campaignGoal?: string;
  userPrompt?: string;
}

export interface ScriptScene {
  sceneNumber: number;
  durationSeconds: number;
  visualDescription: string;
  cameraMovement: string;
  voiceover: string;
  onScreenText: string;
  transition: string;
}

export interface GeneratedScript {
  id: string;
  title: string;
  hook: string;
  scenes: ScriptScene[];
  captions: string;
  hashtags: string[];
  call_to_action: string;
  audio_mood: {
    genre: string;
    bpm: number;
    energy: string;
  };
  total_duration_seconds: number;
}

export interface GeminiServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  modelUsed?: string;
}

const ScriptOutputSchema = z.object({
  title: z.string(),
  hook: z.string(),
  scenes: z.array(z.object({
    sceneNumber: z.number(),
    durationSeconds: z.number(),
    visualDescription: z.string(),
    cameraMovement: z.string(),
    voiceover: z.string(),
    onScreenText: z.string(),
    transition: z.enum(['flash_white', 'whip_pan', 'cut', 'glitch', 'crossfade'])
  })),
  captions: z.string(),
  hashtags: z.array(z.string()),
  call_to_action: z.string(),
  audio_mood: z.object({
    genre: z.string(),
    bpm: z.number(),
    energy: z.enum(['High Energy', 'Seductive', 'Chill', 'Dark Cyber', 'Euphoric'])
  }),
  total_duration_seconds: z.number()
});

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  initialize(apiKey: string): void {
    this.ai = new GoogleGenAI({ apiKey });
  }

  isInitialized(): boolean {
    return this.ai !== null;
  }

  /**
   * Generate a viral social media script using Gemini 1.5 Flash
   */
  async generateScript(params: ScriptGenerationParams): Promise<GeminiServiceResponse<GeneratedScript>> {
    if (!this.ai) {
      return {
        success: false,
        error: 'GEMINI_NOT_INITIALIZED',
        message: 'Gemini API key not configured'
      };
    }

    try {
      const {
        niche,
        tone,
        duration,
        personaName = 'AI Influencer',
        handle = '@influencer',
        platform = 'Instagram Reels',
        campaignGoal = 'Viral Engagement',
        userPrompt = ''
      } = params;

      const prompt = `You are the lead viral social media scriptwriter and creative director for Medusa AI Influencer platform.
Generate a high-converting, viral ${duration}-second ${platform} script for an AI Influencer.

INFLUENCER PROFILE:
- Name: ${personaName} (${handle})
- Niche: ${niche}
- Tone: ${tone}
- Campaign Goal: ${campaignGoal}
- Custom Guidance: ${userPrompt || 'Create a captivating, high-energy viral video script.'}

FORMAT REQUIREMENTS:
Return ONLY valid JSON matching this exact schema. No markdown, no explanations:
{
  "title": "Short catchy title for the script",
  "hook": "Compelling 3-second hook that stops the scroll",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 3,
      "visualDescription": "Precise cinematic visual direction for image generation (lighting, camera angle, pose, outfit)",
      "cameraMovement": "e.g. Fast zoom-in, Orbit Right, Dolly push, Whip pan",
      "voiceover": "Spoken sentence by the influencer",
      "onScreenText": "Dynamic short text overlay for the screen (uppercase with emojis)",
      "transition": "flash_white | whip_pan | cut | glitch | crossfade"
    }
  ],
  "captions": "Engaging Instagram/TikTok caption copy with emojis and line breaks",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "call_to_action": "Clear action for the viewer (comment, link in bio, share)",
  "audio_mood": {
    "genre": "e.g. Dark Phonk, Melodic Deep House, Future Bass, Cyberpunk Ambient",
    "bpm": 128,
    "energy": "High Energy | Seductive | Chill | Dark Cyber | Euphoric"
  },
  "total_duration_seconds": ${duration}
}`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = ScriptOutputSchema.parse(parsed);

      return {
        success: true,
        data: {
          id: `script-${Date.now()}`,
          ...validated
        },
        modelUsed: 'gemini-2.5-flash'
      };
    } catch (error: any) {
      console.error('Gemini script generation error:', error?.message || error);
      return {
        success: false,
        error: 'SCRIPT_GENERATION_FAILED',
        message: error?.message || 'Failed to generate script'
      };
    }
  }

  /**
   * Generate structured prompt for visual generation
   */
  async generateVisualPrompt(params: {
    sceneDescription: string;
    characterConsistency?: boolean;
    style?: string;
  }): Promise<GeminiServiceResponse<string>> {
    if (!this.ai) {
      return {
        success: false,
        error: 'GEMINI_NOT_INITIALIZED'
      };
    }

    try {
      const { sceneDescription, characterConsistency = true, style = 'photorealistic' } = params;

      const prompt = `Convert this scene description into a detailed image generation prompt optimized for AI image generators.
Style: ${style}
Character Consistency: ${characterConsistency ? 'Maintain consistent facial features across generations' : 'No consistency required'}

Scene: ${sceneDescription}

Return ONLY the enhanced prompt as a single string, no JSON, no explanations.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        success: true,
        data: response.text?.trim() || sceneDescription,
        modelUsed: 'gemini-2.5-flash'
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'PROMPT_ENHANCEMENT_FAILED',
        message: error?.message
      };
    }
  }
}

export const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
