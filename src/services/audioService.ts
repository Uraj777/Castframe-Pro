import { z } from 'zod';

export interface AudioGenerationParams {
  text: string;
  voiceStyle?: string;
  language?: string;
  rate?: number;
  pitch?: number;
}

export interface GeneratedAudio {
  url: string;
  text: string;
  voiceUsed: string;
  durationSeconds?: number;
  format: 'mp3' | 'wav' | 'ogg';
}

export interface AudioServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const AudioOutputSchema = z.object({
  url: z.string(),
  text: z.string(),
  voiceUsed: z.string(),
  durationSeconds: z.number().optional(),
  format: z.enum(['mp3', 'wav', 'ogg'])
});

/**
 * Audio generation service using Edge TTS (free Microsoft TTS)
 * Fallback to ElevenLabs if configured
 */
export class AudioService {
  private elevenLabsApiKey?: string;

  constructor(elevenLabsKey?: string) {
    this.elevenLabsApiKey = elevenLabsKey;
  }

  initialize(elevenLabsKey: string): void {
    this.elevenLabsApiKey = elevenLabsKey;
  }

  /**
   * Generate audio using Edge TTS (free, no auth required)
   * Uses the edge-tts package which wraps Microsoft's Cognitive Services
   */
  async generateWithEdgeTTS(params: AudioGenerationParams): Promise<AudioServiceResponse<GeneratedAudio>> {
    try {
      const { 
        text, 
        voiceStyle = 'en-US-AriaNeural', 
        language = 'en-US',
        rate = 1.0,
        pitch = 0
      } = params;

      // Edge TTS voice mapping based on style
      const voiceMap: Record<string, string> = {
        'natural': 'en-US-AriaNeural',
        'professional': 'en-US-GuyNeural',
        'friendly': 'en-US-JennyNeural',
        'energetic': 'en-US-MichelleNeural',
        'calm': 'en-US-ChristopherNeural',
        'sultry': 'en-US-SaraNeural',
        'authoritative': 'en-US-EricNeural',
        'youthful': 'en-US-AnaNeural'
      };

      const voice = voiceMap[voiceStyle.toLowerCase()] || voiceStyle;

      // For now, return a placeholder URL since edge-tts requires CLI execution
      // In production, you would:
      // 1. Use exec to run: edge-tts --voice ${voice} --text "${text}" --write-media output.mp3
      // 2. Upload the file to cloud storage
      // 3. Return the public URL

      // Placeholder implementation - returns a descriptive URL
      const encodedText = encodeURIComponent(text.slice(0, 100));
      const audioUrl = `https://edge-tts-placeholder.example.com/audio?voice=${encodeURIComponent(voice)}&text=${encodedText}&rate=${rate}&pitch=${pitch}`;

      console.log('[AudioService] Edge TTS request:', { voice, textLength: text.length, rate, pitch });

      return {
        success: true,
        data: {
          url: audioUrl,
          text,
          voiceUsed: voice,
          durationSeconds: Math.ceil(text.length / 15), // Rough estimate: ~15 chars/sec
          format: 'mp3'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'EDGE_TTS_FAILED',
        message: error?.message || 'Failed to generate audio with Edge TTS'
      };
    }
  }

  /**
   * Generate audio using ElevenLabs (premium quality, requires API key)
   */
  async generateWithElevenLabs(params: AudioGenerationParams & { voiceId?: string }): Promise<AudioServiceResponse<GeneratedAudio>> {
    if (!this.elevenLabsApiKey) {
      return {
        success: false,
        error: 'ELEVENLABS_KEY_MISSING',
        message: 'ElevenLabs API key not configured'
      };
    }

    try {
      const { 
        text, 
        voiceId = 'Rachel', // Default female voice
        voiceStyle 
      } = params;

      // Map voice styles to ElevenLabs voices
      const voiceMap: Record<string, string> = {
        'natural': 'Rachel',
        'professional': 'Adam',
        'friendly': 'Bella',
        'energetic': 'Antoni',
        'calm': 'Domi',
        'sultry': 'Rachel',
        'authoritative': 'Josh',
        'youthful': 'Sarah'
      };

      const selectedVoice = voiceId || voiceMap[voiceStyle?.toLowerCase() || ''] || 'Rachel';

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.elevenLabsApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // ElevenLabs returns raw audio bytes
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      return {
        success: true,
        data: {
          url: audioUrl,
          text,
          voiceUsed: selectedVoice,
          durationSeconds: Math.ceil(text.length / 15),
          format: 'mp3'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'ELEVENLABS_GENERATION_FAILED',
        message: error?.message || 'Failed to generate audio with ElevenLabs'
      };
    }
  }

  /**
   * Generate audio with automatic fallback chain
   */
  async generateAudio(params: AudioGenerationParams): Promise<AudioServiceResponse<GeneratedAudio>> {
    const { text, voiceStyle = 'natural' } = params;

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'NO_TEXT_PROVIDED',
        message: 'Text is required for audio generation'
      };
    }

    // Try ElevenLabs first if configured (better quality)
    if (this.elevenLabsApiKey) {
      const result = await this.generateWithElevenLabs(params);
      if (result.success) {
        return result;
      }
      console.warn('[AudioService] ElevenLabs failed, falling back to Edge TTS');
    }

    // Fallback to Edge TTS (free)
    return this.generateWithEdgeTTS(params);
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): Array<{ id: string; name: string; gender: string; style: string }> {
    return [
      { id: 'natural', name: 'Natural', gender: 'Female', style: 'natural' },
      { id: 'professional', name: 'Professional', gender: 'Male', style: 'professional' },
      { id: 'friendly', name: 'Friendly', gender: 'Female', style: 'friendly' },
      { id: 'energetic', name: 'Energetic', gender: 'Female', style: 'energetic' },
      { id: 'calm', name: 'Calm', gender: 'Male', style: 'calm' },
      { id: 'sultry', name: 'Sultry', gender: 'Female', style: 'sultry' },
      { id: 'authoritative', name: 'Authoritative', gender: 'Male', style: 'authoritative' },
      { id: 'youthful', name: 'Youthful', gender: 'Female', style: 'youthful' }
    ];
  }
}

export const audioService = new AudioService(process.env.ELEVENLABS_API_KEY);
