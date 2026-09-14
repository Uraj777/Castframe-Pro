import ffmpeg from 'fluent-ffmpeg';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

export interface VideoRenderParams {
  imageUrls: string[];
  audioUrl?: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  transitionDuration?: number;
  outputFormat?: 'mp4' | 'webm';
}

export interface RenderedVideo {
  url: string;
  durationSeconds: number;
  width: number;
  height: number;
  format: string;
  sizeBytes?: number;
}

export interface VideoServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const VideoOutputSchema = z.object({
  url: z.string(),
  durationSeconds: z.number(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  sizeBytes: z.number().optional()
});

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Video rendering service using fluent-ffmpeg
 * Combines images with audio and transitions
 */
export class VideoService {
  private ffmpegPath?: string;

  constructor(ffmpegPath?: string) {
    this.ffmpegPath = ffmpegPath;
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  initialize(ffmpegPath: string): void {
    this.ffmpegPath = ffmpegPath;
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  /**
   * Download a remote image to local temp file
   */
  private async downloadImage(url: string, outputPath: string): Promise<void> {
    try {
      // Handle base64 data URLs
      if (url.startsWith('data:')) {
        const matches = url.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(outputPath, buffer);
          return;
        }
      }

      // Handle HTTP URLs
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
    } catch (error: any) {
      console.error('[VideoService] Image download failed:', error?.message);
      throw error;
    }
  }

  /**
   * Download audio file to local temp file
   */
  private async downloadAudio(url: string, outputPath: string): Promise<void> {
    try {
      if (url.startsWith('data:')) {
        const matches = url.match(/^data:audio\/(\w+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(outputPath, buffer);
          return;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
    } catch (error: any) {
      console.error('[VideoService] Audio download failed:', error?.message);
      throw error;
    }
  }

  /**
   * Render video from images and optional audio
   */
  async renderVideo(params: VideoRenderParams): Promise<VideoServiceResponse<RenderedVideo>> {
    const {
      imageUrls,
      audioUrl,
      aspectRatio = '9:16',
      transitionDuration = 0.5,
      outputFormat = 'mp4'
    } = params;

    if (!imageUrls || imageUrls.length === 0) {
      return {
        success: false,
        error: 'NO_IMAGES_PROVIDED',
        message: 'At least one image URL is required'
      };
    }

    try {
      const jobId = `render-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const outputFilename = `${jobId}.${outputFormat}`;
      const outputPath = path.join(UPLOADS_DIR, outputFilename);

      // Calculate dimensions based on aspect ratio
      let width = 720;
      let height = 1280;
      if (aspectRatio === '16:9') {
        width = 1280;
        height = 720;
      } else if (aspectRatio === '1:1') {
        width = 1080;
        height = 1080;
      }

      // Download all images
      const tempDir = path.join(process.cwd(), 'uploads', 'temp', jobId);
      fs.mkdirSync(tempDir, { recursive: true });

      const imagePaths: string[] = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const imagePath = path.join(tempDir, `image_${i}.jpg`);
        await this.downloadImage(imageUrls[i], imagePath);
        imagePaths.push(imagePath);
      }

      let audioPath: string | undefined;
      if (audioUrl) {
        audioPath = path.join(tempDir, 'audio.mp3');
        await this.downloadAudio(audioUrl, audioPath);
      }

      // Calculate duration per image
      const totalDuration = audioUrl ? 
        (await this.getAudioDuration(audioPath)).duration : 
        imageUrls.length * 3; // Default 3 seconds per image
      
      const imageDuration = Math.max(1, (totalDuration - (imageUrls.length - 1) * transitionDuration) / imageUrls.length);

      // Create concat file for ffmpeg
      const concatFilePath = path.join(tempDir, 'concat.txt');
      const concatContent = imagePaths.map(imgPath => 
        `file '${imgPath}'\nduration ${imageDuration}`
      ).join('\n');
      fs.writeFileSync(concatFilePath, concatContent);

      // Build ffmpeg command
      return new Promise((resolve, reject) => {
        const command = ffmpeg();

        // Add input for concatenated images
        command.input(concatFilePath);
        command.inputOptions(['-f', 'concat', '-safe', '0']);

        // Add audio if provided
        if (audioPath) {
          command.input(audioPath);
        }

        // Configure output
        command
          .outputOptions([
            `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
            `-c:v libx264`,
            `-preset medium`,
            `-crf 23`,
            `-pix_fmt yuv420p`,
            `-r 30`,
            audioPath ? '-c:a aac' : '-an',
            audioPath ? '-b:a 128k' : ''
          ])
          .duration(totalDuration)
          .on('start', (cmd) => {
            console.log('[VideoService] FFmpeg started:', cmd);
          })
          .on('progress', (progress) => {
            console.log('[VideoService] Progress:', progress.percent?.toFixed(2) + '%');
          })
          .on('end', () => {
            // Clean up temp files
            fs.rmSync(tempDir, { recursive: true, force: true });

            // Get file size
            const stats = fs.statSync(outputPath);
            
            resolve({
              success: true,
              data: {
                url: `/api/videos/${outputFilename}`,
                durationSeconds: totalDuration,
                width,
                height,
                format: outputFormat,
                sizeBytes: stats.size
              }
            });
          })
          .on('error', (err) => {
            console.error('[VideoService] FFmpeg error:', err);
            fs.rmSync(tempDir, { recursive: true, force: true });
            resolve({
              success: false,
              error: 'FFMPEG_RENDER_FAILED',
              message: err.message
            });
          })
          .save(outputPath);
      });
    } catch (error: any) {
      return {
        success: false,
        error: 'VIDEO_RENDER_FAILED',
        message: error?.message || 'Failed to render video'
      };
    }
  }

  /**
   * Get audio duration using ffprobe
   */
  private getAudioDuration(audioPath: string): Promise<{ duration: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const duration = metadata.format.duration || 0;
          resolve({ duration });
        }
      });
    });
  }

  /**
   * Simple slideshow without audio (quick preview)
   */
  async createSlideshow(imageUrls: string[], options: {
    aspectRatio?: '9:16' | '16:9' | '1:1';
    durationPerImage?: number;
  } = {}): Promise<VideoServiceResponse<RenderedVideo>> {
    return this.renderVideo({
      imageUrls,
      aspectRatio: options.aspectRatio,
      transitionDuration: 0.3
    });
  }
}

export const videoService = new VideoService();
