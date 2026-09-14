import { Queue, Worker, Job } from 'bullmq';

export interface RenderJobData {
  jobId: string;
  imageUrls: string[];
  audioUrl?: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  outputFormat: 'mp4' | 'webm';
}

export interface RenderJobResult {
  videoUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
  format: string;
  sizeBytes?: number;
}

export type JobStatus = 
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'delayed'
  | 'paused';

export interface JobState {
  id: string;
  status: JobStatus;
  progress: number;
  result?: RenderJobResult;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * In-memory job store (replace with Redis/MongoDB in production)
 */
class JobStore {
  private jobs: Map<string, JobState> = new Map();

  set(jobId: string, state: JobState): void {
    this.jobs.set(jobId, state);
  }

  get(jobId: string): JobState | undefined {
    return this.jobs.get(jobId);
  }

  update(jobId: string, updates: Partial<JobState>): JobState | undefined {
    const job = this.jobs.get(jobId);
    if (job) {
      const updated = { ...job, ...updates };
      this.jobs.set(jobId, updated);
      return updated;
    }
    return undefined;
  }

  delete(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  getAll(): JobState[] {
    return Array.from(this.jobs.values());
  }
}

const jobStore = new JobStore();

/**
 * Video render queue using BullMQ
 * For production: Connect to actual Redis instance
 * For development/demo: Uses in-memory simulation
 */
export class RenderQueueService {
  private queue: Queue<RenderJobData, RenderJobResult> | null = null;
  private worker: Worker<RenderJobData, RenderJobResult> | null = null;
  private redisConnection?: any;

  constructor(redisUrl?: string) {
    if (redisUrl) {
      this.redisConnection = { url: redisUrl };
      this.queue = new Queue<RenderJobData, RenderJobResult>('video-renders', {
        connection: this.redisConnection
      });
      
      this.setupWorker();
    } else {
      console.log('[RenderQueue] Running in simulation mode (no Redis)');
    }
  }

  initialize(redisUrl: string): void {
    this.redisConnection = { url: redisUrl };
    this.queue = new Queue<RenderJobData, RenderJobResult>('video-renders', {
      connection: this.redisConnection
    });
    this.setupWorker();
  }

  private setupWorker(): void {
    if (!this.queue) return;

    this.worker = new Worker<RenderJobData, RenderJobResult>(
      'video-renders',
      async (job) => {
        // This is where actual video rendering would happen
        // For now, simulate the process
        await this.simulateRenderProcess(job);
        
        return {
          videoUrl: `/api/videos/${job.data.jobId}.mp4`,
          durationSeconds: 30,
          width: 720,
          height: 1280,
          format: 'mp4'
        };
      },
      {
        connection: this.redisConnection
      }
    );

    this.worker.on('progress', (job, progress) => {
      jobStore.update(job.id, { progress: typeof progress === 'number' ? progress : 0, status: 'active' });
    });

    this.worker.on('completed', (job, result) => {
      jobStore.update(job.id, {
        status: 'completed',
        progress: 100,
        result,
        completedAt: new Date().toISOString()
      });
    });

    this.worker.on('failed', (job, err) => {
      jobStore.update(job.id || 'unknown', {
        status: 'failed',
        error: err.message
      });
    });
  }

  /**
   * Simulate render process for demo/development
   */
  private async simulateRenderProcess(job: Job<RenderJobData, RenderJobResult>): Promise<void> {
    const steps = [
      { progress: 10, label: 'Downloading images...' },
      { progress: 30, label: 'Processing visuals...' },
      { progress: 50, label: 'Generating audio track...' },
      { progress: 70, label: 'Compositing video...' },
      { progress: 90, label: 'Finalizing render...' },
      { progress: 100, label: 'Complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      job.updateProgress(step.progress);
    }
  }

  /**
   * Add a render job to the queue
   */
  async addJob(data: Omit<RenderJobData, 'jobId'>): Promise<{ jobId: string; success: boolean }> {
    const jobId = `render-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Initialize job state
    jobStore.set(jobId, {
      id: jobId,
      status: 'waiting',
      progress: 0,
      createdAt: new Date().toISOString()
    });

    const fullData: RenderJobData = {
      jobId,
      imageUrls: data.imageUrls,
      audioUrl: data.audioUrl,
      aspectRatio: data.aspectRatio || '9:16',
      outputFormat: data.outputFormat || 'mp4'
    };

    if (this.queue) {
      // Add to actual queue
      await this.queue.add(jobId, fullData);
    } else {
      // Simulate async processing
      this.simulateJobProcessing(jobId, fullData);
    }

    return { jobId, success: true };
  }

  /**
   * Simulate job processing when no Redis is available
   */
  private async simulateJobProcessing(jobId: string, data: RenderJobData): Promise<void> {
    jobStore.update(jobId, { status: 'active', progress: 10 });

    const steps = [20, 40, 60, 80, 100];
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      jobStore.update(jobId, { progress });
    }

    jobStore.update(jobId, {
      status: 'completed',
      result: {
        videoUrl: `/api/videos/${jobId}.mp4`,
        durationSeconds: data.imageUrls.length * 3,
        width: data.aspectRatio === '16:9' ? 1280 : 720,
        height: data.aspectRatio === '16:9' ? 720 : 1280,
        format: data.outputFormat
      },
      completedAt: new Date().toISOString()
    });
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): JobState | null {
    const job = jobStore.get(jobId);
    if (!job) {
      return null;
    }
    return job;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): JobState[] {
    return jobStore.getAll();
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = jobStore.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    if (this.queue) {
      try {
        await this.queue.remove(jobId);
      } catch (e) {
        // Job might already be processed
      }
    }

    jobStore.update(jobId, { status: 'failed', error: 'Cancelled by user' });
    return true;
  }

  /**
   * Close queue connections
   */
  async close(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
    }
    if (this.worker) {
      await this.worker.close();
    }
  }
}

// Export singleton instance
export const renderQueueService = new RenderQueueService(process.env.REDIS_URL);
