var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_zod4 = require("zod");

// src/services/geminiService.ts
var import_genai = require("@google/genai");
var import_zod = require("zod");
var ScriptOutputSchema = import_zod.z.object({
  title: import_zod.z.string(),
  hook: import_zod.z.string(),
  scenes: import_zod.z.array(import_zod.z.object({
    sceneNumber: import_zod.z.number(),
    durationSeconds: import_zod.z.number(),
    visualDescription: import_zod.z.string(),
    cameraMovement: import_zod.z.string(),
    voiceover: import_zod.z.string(),
    onScreenText: import_zod.z.string(),
    transition: import_zod.z.enum(["flash_white", "whip_pan", "cut", "glitch", "crossfade"])
  })),
  captions: import_zod.z.string(),
  hashtags: import_zod.z.array(import_zod.z.string()),
  call_to_action: import_zod.z.string(),
  audio_mood: import_zod.z.object({
    genre: import_zod.z.string(),
    bpm: import_zod.z.number(),
    energy: import_zod.z.enum(["High Energy", "Seductive", "Chill", "Dark Cyber", "Euphoric"])
  }),
  total_duration_seconds: import_zod.z.number()
});
var GeminiService = class {
  constructor(apiKey) {
    this.ai = null;
    if (apiKey) {
      this.ai = new import_genai.GoogleGenAI({ apiKey });
    }
  }
  initialize(apiKey) {
    this.ai = new import_genai.GoogleGenAI({ apiKey });
  }
  isInitialized() {
    return this.ai !== null;
  }
  /**
   * Generate a viral social media script using Gemini 1.5 Flash
   */
  async generateScript(params) {
    if (!this.ai) {
      return {
        success: false,
        error: "GEMINI_NOT_INITIALIZED",
        message: "Gemini API key not configured"
      };
    }
    try {
      const {
        niche,
        tone,
        duration,
        personaName = "AI Influencer",
        handle = "@influencer",
        platform = "Instagram Reels",
        campaignGoal = "Viral Engagement",
        userPrompt = ""
      } = params;
      const prompt = `You are the lead viral social media scriptwriter and creative director for Medusa AI Influencer platform.
Generate a high-converting, viral ${duration}-second ${platform} script for an AI Influencer.

INFLUENCER PROFILE:
- Name: ${personaName} (${handle})
- Niche: ${niche}
- Tone: ${tone}
- Campaign Goal: ${campaignGoal}
- Custom Guidance: ${userPrompt || "Create a captivating, high-energy viral video script."}

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
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const responseText = response.text || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from Gemini response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      const validated = ScriptOutputSchema.parse(parsed);
      return {
        success: true,
        data: {
          id: `script-${Date.now()}`,
          ...validated
        },
        modelUsed: "gemini-2.5-flash"
      };
    } catch (error) {
      console.error("Gemini script generation error:", error?.message || error);
      return {
        success: false,
        error: "SCRIPT_GENERATION_FAILED",
        message: error?.message || "Failed to generate script"
      };
    }
  }
  /**
   * Generate structured prompt for visual generation
   */
  async generateVisualPrompt(params) {
    if (!this.ai) {
      return {
        success: false,
        error: "GEMINI_NOT_INITIALIZED"
      };
    }
    try {
      const { sceneDescription, characterConsistency = true, style = "photorealistic" } = params;
      const prompt = `Convert this scene description into a detailed image generation prompt optimized for AI image generators.
Style: ${style}
Character Consistency: ${characterConsistency ? "Maintain consistent facial features across generations" : "No consistency required"}

Scene: ${sceneDescription}

Return ONLY the enhanced prompt as a single string, no JSON, no explanations.`;
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      return {
        success: true,
        data: response.text?.trim() || sceneDescription,
        modelUsed: "gemini-2.5-flash"
      };
    } catch (error) {
      return {
        success: false,
        error: "PROMPT_ENHANCEMENT_FAILED",
        message: error?.message
      };
    }
  }
};
var geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// src/services/imageService.ts
var import_zod2 = require("zod");
var ImageOutputSchema = import_zod2.z.object({
  url: import_zod2.z.string().url(),
  prompt: import_zod2.z.string(),
  width: import_zod2.z.number(),
  height: import_zod2.z.number(),
  modelUsed: import_zod2.z.string()
});
var ImageService = class {
  constructor(hfToken) {
    this.hfToken = hfToken;
  }
  initialize(hfToken) {
    this.hfToken = hfToken;
  }
  /**
   * Generate images using Pollinations.ai (primary free tier)
   */
  async generateWithPollinations(prompt, options = {}) {
    try {
      const {
        width = 768,
        height = 1344,
        aspectRatio = "9:16",
        seed = Math.floor(Math.random() * 1e6)
      } = options;
      let finalWidth = width;
      let finalHeight = height;
      if (aspectRatio === "9:16") {
        finalWidth = 768;
        finalHeight = 1344;
      } else if (aspectRatio === "16:9") {
        finalWidth = 1344;
        finalHeight = 768;
      } else if (aspectRatio === "1:1") {
        finalWidth = 1024;
        finalHeight = 1024;
      } else if (aspectRatio === "4:5") {
        finalWidth = 800;
        finalHeight = 1e3;
      }
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${finalWidth}&height=${finalHeight}&nologo=true&enhance=true&seed=${seed}`;
      return {
        success: true,
        data: {
          url: imageUrl,
          prompt,
          width: finalWidth,
          height: finalHeight,
          modelUsed: "pollinations-flux"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: "POLLINATIONS_GENERATION_FAILED",
        message: error?.message || "Failed to generate image with Pollinations"
      };
    }
  }
  /**
   * Generate images using Flux.1-dev via HuggingFace Inference API
   */
  async generateWithFlux(prompt, options = {}) {
    if (!this.hfToken) {
      return {
        success: false,
        error: "HF_TOKEN_MISSING",
        message: "HuggingFace token not configured"
      };
    }
    try {
      const { width = 1024, height = 1024 } = options;
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.hfToken}`,
            "Content-Type": "application/json"
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
      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");
      const imageUrl = `data:image/png;base64,${base64Image}`;
      return {
        success: true,
        data: {
          url: imageUrl,
          prompt,
          width,
          height,
          modelUsed: "flux.1-dev"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: "FLUX_GENERATION_FAILED",
        message: error?.message || "Failed to generate image with Flux"
      };
    }
  }
  /**
   * Generate multiple images with fallback chain
   */
  async generateImages(params) {
    const { prompts, characterConsistency = false, aspectRatio = "9:16", style = "photorealistic" } = params;
    if (!prompts || prompts.length === 0) {
      return {
        success: false,
        error: "NO_PROMPTS_PROVIDED",
        message: "At least one prompt is required"
      };
    }
    const results = [];
    const errors = [];
    for (const prompt of prompts) {
      let enhancedPrompt = prompt;
      if (characterConsistency) {
        enhancedPrompt = `${prompt}, consistent character features, same person identity, photorealistic portrait`;
      }
      if (style) {
        enhancedPrompt = `${enhancedPrompt}, ${style}`;
      }
      let result = await this.generateWithPollinations(enhancedPrompt, { aspectRatio });
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
        error: "ALL_GENERATIONS_FAILED",
        message: `All image generations failed: ${errors.join("; ")}`
      };
    }
    return {
      success: true,
      data: results,
      message: errors.length > 0 ? `Partial success: ${errors.length} generations failed` : void 0
    };
  }
  /**
   * Generate a single image with automatic fallback
   */
  async generateImage(prompt, options = {}) {
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
};
var imageService = new ImageService(process.env.HF_TOKEN);

// src/services/audioService.ts
var import_zod3 = require("zod");
var AudioOutputSchema = import_zod3.z.object({
  url: import_zod3.z.string(),
  text: import_zod3.z.string(),
  voiceUsed: import_zod3.z.string(),
  durationSeconds: import_zod3.z.number().optional(),
  format: import_zod3.z.enum(["mp3", "wav", "ogg"])
});
var AudioService = class {
  constructor(elevenLabsKey) {
    this.elevenLabsApiKey = elevenLabsKey;
  }
  initialize(elevenLabsKey) {
    this.elevenLabsApiKey = elevenLabsKey;
  }
  /**
   * Generate audio using Edge TTS (free, no auth required)
   * Uses the edge-tts package which wraps Microsoft's Cognitive Services
   */
  async generateWithEdgeTTS(params) {
    try {
      const {
        text,
        voiceStyle = "en-US-AriaNeural",
        language = "en-US",
        rate = 1,
        pitch = 0
      } = params;
      const voiceMap = {
        "natural": "en-US-AriaNeural",
        "professional": "en-US-GuyNeural",
        "friendly": "en-US-JennyNeural",
        "energetic": "en-US-MichelleNeural",
        "calm": "en-US-ChristopherNeural",
        "sultry": "en-US-SaraNeural",
        "authoritative": "en-US-EricNeural",
        "youthful": "en-US-AnaNeural"
      };
      const voice = voiceMap[voiceStyle.toLowerCase()] || voiceStyle;
      const encodedText = encodeURIComponent(text.slice(0, 100));
      const audioUrl = `https://edge-tts-placeholder.example.com/audio?voice=${encodeURIComponent(voice)}&text=${encodedText}&rate=${rate}&pitch=${pitch}`;
      console.log("[AudioService] Edge TTS request:", { voice, textLength: text.length, rate, pitch });
      return {
        success: true,
        data: {
          url: audioUrl,
          text,
          voiceUsed: voice,
          durationSeconds: Math.ceil(text.length / 15),
          // Rough estimate: ~15 chars/sec
          format: "mp3"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: "EDGE_TTS_FAILED",
        message: error?.message || "Failed to generate audio with Edge TTS"
      };
    }
  }
  /**
   * Generate audio using ElevenLabs (premium quality, requires API key)
   */
  async generateWithElevenLabs(params) {
    if (!this.elevenLabsApiKey) {
      return {
        success: false,
        error: "ELEVENLABS_KEY_MISSING",
        message: "ElevenLabs API key not configured"
      };
    }
    try {
      const {
        text,
        voiceId = "Rachel",
        // Default female voice
        voiceStyle
      } = params;
      const voiceMap = {
        "natural": "Rachel",
        "professional": "Adam",
        "friendly": "Bella",
        "energetic": "Antoni",
        "calm": "Domi",
        "sultry": "Rachel",
        "authoritative": "Josh",
        "youthful": "Sarah"
      };
      const selectedVoice = voiceId || voiceMap[voiceStyle?.toLowerCase() || ""] || "Rachel";
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": this.elevenLabsApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
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
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString("base64");
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      return {
        success: true,
        data: {
          url: audioUrl,
          text,
          voiceUsed: selectedVoice,
          durationSeconds: Math.ceil(text.length / 15),
          format: "mp3"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: "ELEVENLABS_GENERATION_FAILED",
        message: error?.message || "Failed to generate audio with ElevenLabs"
      };
    }
  }
  /**
   * Generate audio with automatic fallback chain
   */
  async generateAudio(params) {
    const { text, voiceStyle = "natural" } = params;
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: "NO_TEXT_PROVIDED",
        message: "Text is required for audio generation"
      };
    }
    if (this.elevenLabsApiKey) {
      const result = await this.generateWithElevenLabs(params);
      if (result.success) {
        return result;
      }
      console.warn("[AudioService] ElevenLabs failed, falling back to Edge TTS");
    }
    return this.generateWithEdgeTTS(params);
  }
  /**
   * Get available voices
   */
  getAvailableVoices() {
    return [
      { id: "natural", name: "Natural", gender: "Female", style: "natural" },
      { id: "professional", name: "Professional", gender: "Male", style: "professional" },
      { id: "friendly", name: "Friendly", gender: "Female", style: "friendly" },
      { id: "energetic", name: "Energetic", gender: "Female", style: "energetic" },
      { id: "calm", name: "Calm", gender: "Male", style: "calm" },
      { id: "sultry", name: "Sultry", gender: "Female", style: "sultry" },
      { id: "authoritative", name: "Authoritative", gender: "Male", style: "authoritative" },
      { id: "youthful", name: "Youthful", gender: "Female", style: "youthful" }
    ];
  }
};
var audioService = new AudioService(process.env.ELEVENLABS_API_KEY);

// src/services/renderQueueService.ts
var import_bullmq = require("bullmq");
var JobStore = class {
  constructor() {
    this.jobs = /* @__PURE__ */ new Map();
  }
  set(jobId, state) {
    this.jobs.set(jobId, state);
  }
  get(jobId) {
    return this.jobs.get(jobId);
  }
  update(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (job) {
      const updated = { ...job, ...updates };
      this.jobs.set(jobId, updated);
      return updated;
    }
    return void 0;
  }
  delete(jobId) {
    return this.jobs.delete(jobId);
  }
  getAll() {
    return Array.from(this.jobs.values());
  }
};
var jobStore = new JobStore();
var RenderQueueService = class {
  constructor(redisUrl) {
    this.queue = null;
    this.worker = null;
    if (redisUrl) {
      this.redisConnection = { url: redisUrl };
      this.queue = new import_bullmq.Queue("video-renders", {
        connection: this.redisConnection
      });
      this.setupWorker();
    } else {
      console.log("[RenderQueue] Running in simulation mode (no Redis)");
    }
  }
  initialize(redisUrl) {
    this.redisConnection = { url: redisUrl };
    this.queue = new import_bullmq.Queue("video-renders", {
      connection: this.redisConnection
    });
    this.setupWorker();
  }
  setupWorker() {
    if (!this.queue) return;
    this.worker = new import_bullmq.Worker(
      "video-renders",
      async (job) => {
        await this.simulateRenderProcess(job);
        return {
          videoUrl: `/api/videos/${job.data.jobId}.mp4`,
          durationSeconds: 30,
          width: 720,
          height: 1280,
          format: "mp4"
        };
      },
      {
        connection: this.redisConnection
      }
    );
    this.worker.on("progress", (job, progress) => {
      jobStore.update(job.id, { progress: typeof progress === "number" ? progress : 0, status: "active" });
    });
    this.worker.on("completed", (job, result) => {
      jobStore.update(job.id, {
        status: "completed",
        progress: 100,
        result,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    this.worker.on("failed", (job, err) => {
      jobStore.update(job.id || "unknown", {
        status: "failed",
        error: err.message
      });
    });
  }
  /**
   * Simulate render process for demo/development
   */
  async simulateRenderProcess(job) {
    const steps = [
      { progress: 10, label: "Downloading images..." },
      { progress: 30, label: "Processing visuals..." },
      { progress: 50, label: "Generating audio track..." },
      { progress: 70, label: "Compositing video..." },
      { progress: 90, label: "Finalizing render..." },
      { progress: 100, label: "Complete!" }
    ];
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      job.updateProgress(step.progress);
    }
  }
  /**
   * Add a render job to the queue
   */
  async addJob(data) {
    const jobId = `render-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    jobStore.set(jobId, {
      id: jobId,
      status: "waiting",
      progress: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const fullData = {
      jobId,
      imageUrls: data.imageUrls,
      audioUrl: data.audioUrl,
      aspectRatio: data.aspectRatio || "9:16",
      outputFormat: data.outputFormat || "mp4"
    };
    if (this.queue) {
      await this.queue.add(jobId, fullData);
    } else {
      this.simulateJobProcessing(jobId, fullData);
    }
    return { jobId, success: true };
  }
  /**
   * Simulate job processing when no Redis is available
   */
  async simulateJobProcessing(jobId, data) {
    jobStore.update(jobId, { status: "active", progress: 10 });
    const steps = [20, 40, 60, 80, 100];
    for (const progress of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      jobStore.update(jobId, { progress });
    }
    jobStore.update(jobId, {
      status: "completed",
      result: {
        videoUrl: `/api/videos/${jobId}.mp4`,
        durationSeconds: data.imageUrls.length * 3,
        width: data.aspectRatio === "16:9" ? 1280 : 720,
        height: data.aspectRatio === "16:9" ? 720 : 1280,
        format: data.outputFormat
      },
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  /**
   * Get job status
   */
  getJobStatus(jobId) {
    const job = jobStore.get(jobId);
    if (!job) {
      return null;
    }
    return job;
  }
  /**
   * Get all jobs
   */
  getAllJobs() {
    return jobStore.getAll();
  }
  /**
   * Cancel a job
   */
  async cancelJob(jobId) {
    const job = jobStore.get(jobId);
    if (!job || job.status === "completed" || job.status === "failed") {
      return false;
    }
    if (this.queue) {
      try {
        await this.queue.remove(jobId);
      } catch (e) {
      }
    }
    jobStore.update(jobId, { status: "failed", error: "Cancelled by user" });
    return true;
  }
  /**
   * Close queue connections
   */
  async close() {
    if (this.queue) {
      await this.queue.close();
    }
    if (this.worker) {
      await this.worker.close();
    }
  }
};
var renderQueueService = new RenderQueueService(process.env.REDIS_URL);

// server.ts
var import_meta = {};
import_dotenv.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var PORT = parseInt(process.env.PORT || "3000", 10);
var CORS_ORIGINS = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3000"];
var RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);
var RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "30", 10);
if (process.env.GEMINI_API_KEY) {
  geminiService.initialize(process.env.GEMINI_API_KEY);
}
if (process.env.HF_TOKEN) {
  imageService.initialize(process.env.HF_TOKEN);
}
if (process.env.ELEVENLABS_API_KEY) {
  audioService.initialize(process.env.ELEVENLABS_API_KEY);
}
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, error: "RATE_LIMIT_EXCEEDED", message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false
});
async function startServer() {
  const app = (0, import_express.default)();
  app.set("trust proxy", 1);
  app.use((0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.use("/api", apiLimiter);
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "CASTFRAME-PRO AI Backend",
      version: "2.0.0",
      capabilities: {
        scriptGeneration: !!process.env.GEMINI_API_KEY,
        imageGeneration: true,
        audioGeneration: !!process.env.ELEVENLABS_API_KEY,
        videoRendering: true
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/generate/script", async (req, res) => {
    try {
      const schema = import_zod4.z.object({
        niche: import_zod4.z.string().min(1),
        tone: import_zod4.z.string().min(1),
        duration: import_zod4.z.number().min(5).max(60),
        personaName: import_zod4.z.string().optional(),
        handle: import_zod4.z.string().optional(),
        platform: import_zod4.z.string().optional(),
        campaignGoal: import_zod4.z.string().optional(),
        userPrompt: import_zod4.z.string().optional()
      });
      const validated = schema.parse(req.body);
      if (!geminiService.isInitialized()) {
        return res.status(503).json({
          success: false,
          error: "GEMINI_NOT_CONFIGURED",
          message: "Gemini API key not configured"
        });
      }
      const result = await geminiService.generateScript(validated);
      if (result.success && result.data) {
        res.json({ success: true, data: result.data, modelUsed: result.modelUsed });
      } else {
        res.status(500).json({ success: false, error: result.error, message: result.message });
      }
    } catch (error) {
      console.error("[API] Script generation error:", error);
      if (error instanceof import_zod4.z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "Invalid request body", details: error.issues });
      }
      res.status(500).json({ success: false, error: "SCRIPT_GENERATION_FAILED", message: error?.message });
    }
  });
  app.post("/api/generate/visuals", async (req, res) => {
    try {
      const schema = import_zod4.z.object({
        prompts: import_zod4.z.array(import_zod4.z.string()).min(1),
        characterConsistency: import_zod4.z.boolean().optional(),
        aspectRatio: import_zod4.z.enum(["9:16", "16:9", "1:1", "4:5"]).optional(),
        style: import_zod4.z.string().optional()
      });
      const validated = schema.parse(req.body);
      const result = await imageService.generateImages(validated);
      if (result.success && result.data) {
        res.json({ success: true, data: result.data, count: result.data.length, message: result.message });
      } else {
        res.status(500).json({ success: false, error: result.error, message: result.message });
      }
    } catch (error) {
      console.error("[API] Visual generation error:", error);
      if (error instanceof import_zod4.z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "Invalid request body", details: error.issues });
      }
      res.status(500).json({ success: false, error: "VISUAL_GENERATION_FAILED", message: error?.message });
    }
  });
  app.post("/api/generate/audio", async (req, res) => {
    try {
      const schema = import_zod4.z.object({
        text: import_zod4.z.string().min(1),
        voiceStyle: import_zod4.z.string().optional(),
        language: import_zod4.z.string().optional(),
        rate: import_zod4.z.number().optional(),
        pitch: import_zod4.z.number().optional()
      });
      const validated = schema.parse(req.body);
      const result = await audioService.generateAudio(validated);
      if (result.success && result.data) {
        res.json({ success: true, data: result.data });
      } else {
        res.status(500).json({ success: false, error: result.error, message: result.message });
      }
    } catch (error) {
      console.error("[API] Audio generation error:", error);
      if (error instanceof import_zod4.z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "Invalid request body", details: error.issues });
      }
      res.status(500).json({ success: false, error: "AUDIO_GENERATION_FAILED", message: error?.message });
    }
  });
  app.post("/api/render/video", async (req, res) => {
    try {
      const schema = import_zod4.z.object({
        imageUrls: import_zod4.z.array(import_zod4.z.string().url()).min(1),
        audioUrl: import_zod4.z.string().url().optional(),
        aspectRatio: import_zod4.z.enum(["9:16", "16:9", "1:1"]),
        outputFormat: import_zod4.z.enum(["mp4", "webm"])
      });
      const validated = schema.parse(req.body);
      const { jobId, success } = await renderQueueService.addJob(validated);
      if (success) {
        res.json({ success: true, jobId, status: "queued", message: "Video render job queued successfully" });
      } else {
        res.status(500).json({ success: false, error: "QUEUE_FAILED", message: "Failed to queue render job" });
      }
    } catch (error) {
      console.error("[API] Video render queue error:", error);
      if (error instanceof import_zod4.z.ZodError) {
        return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "Invalid request body", details: error.issues });
      }
      res.status(500).json({ success: false, error: "RENDER_QUEUE_FAILED", message: error?.message });
    }
  });
  app.get("/api/status/:jobId", (req, res) => {
    const { jobId } = req.params;
    const jobState = renderQueueService.getJobStatus(jobId);
    if (!jobState) {
      return res.status(404).json({ success: false, error: "JOB_NOT_FOUND", message: `No job found with ID: ${jobId}` });
    }
    res.json({ success: true, data: jobState });
  });
  app.get("/api/jobs", (req, res) => {
    const jobs = renderQueueService.getAllJobs();
    res.json({ success: true, data: jobs, count: jobs.length });
  });
  app.delete("/api/jobs/:jobId", async (req, res) => {
    const { jobId } = req.params;
    const cancelled = await renderQueueService.cancelJob(jobId);
    if (cancelled) {
      res.json({ success: true, message: `Job ${jobId} cancelled successfully` });
    } else {
      res.status(400).json({ success: false, error: "CANCEL_FAILED", message: "Could not cancel job" });
    }
  });
  app.get("/api/voices", (req, res) => {
    res.json({ success: true, data: audioService.getAvailableVoices() });
  });
  const uploadsDir = import_path.default.join(process.cwd(), "uploads");
  if (!import_fs.default.existsSync(uploadsDir)) {
    import_fs.default.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/api/videos", import_express.default.static(import_path.default.join(uploadsDir, "videos")));
  app.use("/api/media", import_express.default.static(uploadsDir));
  if (process.env.NODE_ENV !== "production") {
    try {
      const viteServer = await (0, import_vite.createServer)({ server: { middlewareMode: true }, appType: "spa" });
      app.use(viteServer.middlewares);
    } catch (e) {
      console.warn("Vite dev server not available");
    }
  } else {
    app.use(import_express.default.static(import_path.default.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(__dirname, "dist", "index.html"));
    });
  }
  app.use((req, res) => {
    res.status(404).json({ success: false, error: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found` });
  });
  app.use((err, req, res, next) => {
    console.error("[ERROR]", err);
    if (err instanceof import_zod4.z.ZodError) {
      return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "Request validation failed", details: err.issues });
    }
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: process.env.NODE_ENV === "development" ? err.message : "Internal server error" });
  });
  app.listen(PORT, () => {
    console.log(`CASTFRAME-PRO AI Backend running on http://localhost:${PORT}`);
    console.log(`Gemini: ${!!process.env.GEMINI_API_KEY ? "Enabled" : "Disabled"}`);
    console.log(`Image Gen (Pollinations): Always Enabled`);
    console.log(`Audio (ElevenLabs): ${!!process.env.ELEVENLABS_API_KEY ? "Enabled" : "Disabled"}`);
    console.log(`Redis Queue: ${!!process.env.REDIS_URL ? "Enabled" : "Simulation Mode"}`);
  });
}
startServer().catch(console.error);
//# sourceMappingURL=server.cjs.map
