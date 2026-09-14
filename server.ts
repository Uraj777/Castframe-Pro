import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';

// Import our service modules
import { geminiService } from './src/services/geminiService.js';
import { imageService } from './src/services/imageService.js';
import { audioService } from './src/services/audioService.js';
import { renderQueueService } from './src/services/renderQueueService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10);

// Initialize AI services
if (process.env.GEMINI_API_KEY) {
  geminiService.initialize(process.env.GEMINI_API_KEY);
}
if (process.env.HF_TOKEN) {
  imageService.initialize(process.env.HF_TOKEN);
}
if (process.env.ELEVENLABS_API_KEY) {
  audioService.initialize(process.env.ELEVENLABS_API_KEY);
}

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
});

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // CORS for Medusa Android app
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use('/api', apiLimiter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CASTFRAME-PRO AI Backend',
      version: '2.0.0',
      capabilities: {
        scriptGeneration: !!process.env.GEMINI_API_KEY,
        imageGeneration: true,
        audioGeneration: !!process.env.ELEVENLABS_API_KEY,
        videoRendering: true
      },
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/generate/script
  app.post('/api/generate/script', async (req, res) => {
    try {
      const schema = z.object({
        niche: z.string().min(1),
        tone: z.string().min(1),
        duration: z.number().min(5).max(60),
        personaName: z.string().optional(),
        handle: z.string().optional(),
        platform: z.string().optional(),
        campaignGoal: z.string().optional(),
        userPrompt: z.string().optional()
      });
      const validated = schema.parse(req.body);

      if (!geminiService.isInitialized()) {
        return res.status(503).json({
          success: false, error: 'GEMINI_NOT_CONFIGURED', message: 'Gemini API key not configured'
        });
      }

      const result = await geminiService.generateScript(validated);
      if (result.success && result.data) {
        res.json({ success: true, data: result.data, modelUsed: result.modelUsed });
      } else {
        res.status(500).json({ success: false, error: result.error, message: result.message });
      }
    } catch (error: any) {
      console.error('[API] Script generation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Invalid request body', details: error.issues });
      }
      res.status(500).json({ success: false, error: 'SCRIPT_GENERATION_FAILED', message: error?.message });
    }
  });

  // POST /api/generate/visuals
  app.post('/api/generate/visuals', async (req, res) => {
    try {
      const schema = z.object({
        prompts: z.array(z.string()).min(1),
        characterConsistency: z.boolean().optional(),
        aspectRatio: z.enum(['9:16', '16:9', '1:1', '4:5']).optional(),
        style: z.string().optional()
      });
      const validated = schema.parse(req.body);
      const result = await imageService.generateImages(validated);

      if (result.success && result.data) {
        res.json({ success: true, data: result.data, count: result.data.length, message: result.message });
      } else {
        res.status(500).json({ success: false, error: result.error, message: result.message });
      }
    } catch (error: any) {
      console.error('[API] Visual generation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Invalid request body', details: error.issues });
      }
      res.status(500).json({ success: false, error: 'VISUAL_GENERATION_FAILED', message: error?.message });
    }
  });

  // POST /api/generate/audio
  app.post('/api/generate/audio', async (req, res) => {
    try {
      const schema = z.object({
        text: z.string().min(1),
        voiceStyle: z.string().optional(),
        language: z.string().optional(),
        rate: z.number().optional(),
        pitch: z.number().optional()
      });
      const validated = schema.parse(req.body);
      const result = await audioService.generateAudio(validated);

      if (result.success && result.data) {
        res.json({ success: true, data: result.data });
      } else {
        res.status(500).json({ success: false, error: result.error, message: result.message });
      }
    } catch (error: any) {
      console.error('[API] Audio generation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Invalid request body', details: error.issues });
      }
      res.status(500).json({ success: false, error: 'AUDIO_GENERATION_FAILED', message: error?.message });
    }
  });

  // POST /api/render/video
  app.post('/api/render/video', async (req, res) => {
    try {
      const schema = z.object({
        imageUrls: z.array(z.string().url()).min(1),
        audioUrl: z.string().url().optional(),
        aspectRatio: z.enum(['9:16', '16:9', '1:1']),
        outputFormat: z.enum(['mp4', 'webm'])
      });
      const validated = schema.parse(req.body);
      const { jobId, success } = await renderQueueService.addJob(validated);

      if (success) {
        res.json({ success: true, jobId, status: 'queued', message: 'Video render job queued successfully' });
      } else {
        res.status(500).json({ success: false, error: 'QUEUE_FAILED', message: 'Failed to queue render job' });
      }
    } catch (error: any) {
      console.error('[API] Video render queue error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Invalid request body', details: error.issues });
      }
      res.status(500).json({ success: false, error: 'RENDER_QUEUE_FAILED', message: error?.message });
    }
  });

  // GET /api/status/:jobId
  app.get('/api/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const jobState = renderQueueService.getJobStatus(jobId);
    if (!jobState) {
      return res.status(404).json({ success: false, error: 'JOB_NOT_FOUND', message: `No job found with ID: ${jobId}` });
    }
    res.json({ success: true, data: jobState });
  });

  // GET /api/jobs
  app.get('/api/jobs', (req, res) => {
    const jobs = renderQueueService.getAllJobs();
    res.json({ success: true, data: jobs, count: jobs.length });
  });

  // DELETE /api/jobs/:jobId
  app.delete('/api/jobs/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const cancelled = await renderQueueService.cancelJob(jobId);
    if (cancelled) {
      res.json({ success: true, message: `Job ${jobId} cancelled successfully` });
    } else {
      res.status(400).json({ success: false, error: 'CANCEL_FAILED', message: 'Could not cancel job' });
    }
  });

  // GET /api/voices
  app.get('/api/voices', (req, res) => {
    res.json({ success: true, data: audioService.getAvailableVoices() });
  });

  // Static file serving
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/api/videos', express.static(path.join(uploadsDir, 'videos')));
  app.use('/api/media', express.static(uploadsDir));

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    try {
      const viteServer = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
      app.use(viteServer.middlewares);
    } catch (e) {
      console.warn('Vite dev server not available');
    }
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Error handlers
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` });
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERROR]', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Request validation failed', details: err.issues });
    }
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`CASTFRAME-PRO AI Backend running on http://localhost:${PORT}`);
    console.log(`Gemini: ${!!process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
    console.log(`Image Gen (Pollinations): Always Enabled`);
    console.log(`Audio (ElevenLabs): ${!!process.env.ELEVENLABS_API_KEY ? 'Enabled' : 'Disabled'}`);
    console.log(`Redis Queue: ${!!process.env.REDIS_URL ? 'Enabled' : 'Simulation Mode'}`);
  });
}

startServer().catch(console.error);
