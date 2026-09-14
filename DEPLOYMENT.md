# CASTFRAME-PRO Backend Deployment Guide

## Overview
This guide covers deploying the CastFrame-Pro AI backend to production hosting platforms (Render, Railway, Fly.io) with free tier compatibility.

## Prerequisites
- Node.js 18+ installed locally
- Git repository
- API keys for services you plan to use

## Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Required for script generation
GEMINI_API_KEY=your_gemini_api_key

# Optional - HuggingFace token for Flux.1-dev fallback
HF_TOKEN=your_hf_token

# Optional - ElevenLabs for premium TTS
ELEVENLABS_API_KEY=your_elevenlabs_key

# Redis (optional - for production async rendering)
REDIS_URL=redis://default:password@host:port

# Server config
PORT=3000
NODE_ENV=production
CORS_ORIGINS=https://your-medusa-app.com,https://your-domain.com
```

## Deployment Options

### Option 1: Render (Free Tier)

**Steps:**
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.cjs`
   - **Environment**: Node
5. Add environment variables from `.env`
6. Deploy!

**Free Tier Limits:**
- 750 hours/month (enough for one always-on service)
- 512 MB RAM
- Shared CPU

**Note:** Free instances spin down after 15 minutes of inactivity. First request after idle will take ~30 seconds.

### Option 2: Railway (Free Trial)

**Steps:**
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize project: `railway init`
4. Add environment variables: `railway variables set GEMINI_API_KEY=xxx`
5. Deploy: `railway up`

**Free Tier:**
- $5 credit/month (enough for small apps)
- No sleep mode

### Option 3: Fly.io (Free Allowance)

**Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Create app: `fly launch --name castframe-pro`
4. Set secrets: `fly secrets set GEMINI_API_KEY=xxx`
5. Deploy: `fly deploy`

**Free Allowance:**
- Up to 3 shared-cpu-1x VMs
- 256 MB RAM each
- 3 GB persistent volume storage

### Option 4: Self-Hosted (VPS)

**Requirements:**
- Ubuntu 20.04+ server
- Node.js 18+
- PM2 for process management
- Nginx as reverse proxy
- FFmpeg installed

**Setup Script:**
```bash
# Install dependencies
sudo apt update
sudo apt install -y nodejs npm ffmpeg nginx git

# Clone repo
git clone https://github.com/your-org/castframe-pro.git
cd castframe-pro
npm install
npm run build

# Setup PM2
npm install -g pm2
pm2 start dist/server.cjs --name castframe-api
pm2 startup
pm2 save

# Configure Nginx
sudo nano /etc/nginx/sites-available/castframe
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Medusa Android App Integration

Update your Medusa app's `ApiService.kt` base URL:

```kotlin
// Development
private val baseUrl = "http://10.0.2.2:3000/api" // Android emulator

// Production
private val baseUrl = "https://castframe-pro.onrender.com/api"
```

## API Endpoints Reference

### POST /api/generate/script
Generate viral social media scripts using Gemini AI.

**Request:**
```json
{
  "niche": "Fitness & Wellness",
  "tone": "Energetic",
  "duration": 30,
  "personaName": "FitAI Coach",
  "handle": "@fitai_coach",
  "platform": "Instagram Reels",
  "campaignGoal": "Viral Engagement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "script-123456",
    "title": "Transform Your Body in 30 Days",
    "hook": "Stop scrolling! This ONE trick changed everything...",
    "scenes": [...],
    "hashtags": ["#fitness", "#workout"],
    "total_duration_seconds": 30
  },
  "modelUsed": "gemini-2.5-flash"
}
```

### POST /api/generate/visuals
Generate images using Pollinations.ai (free) or Flux.1-dev.

**Request:**
```json
{
  "prompts": [
    "Professional fitness coach in modern gym, confident pose"
  ],
  "characterConsistency": true,
  "aspectRatio": "9:16",
  "style": "photorealistic"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "https://image.pollinations.ai/prompt/...",
      "prompt": "...",
      "width": 768,
      "height": 1344,
      "modelUsed": "pollinations-flux"
    }
  ],
  "count": 1
}
```

### POST /api/generate/audio
Generate voiceover using Edge TTS (free) or ElevenLabs.

**Request:**
```json
{
  "text": "Hey everyone! Ready to transform your fitness journey?",
  "voiceStyle": "energetic",
  "language": "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://edge-tts-placeholder.example.com/audio?...",
    "text": "Hey everyone!...",
    "voiceUsed": "en-US-MichelleNeural",
    "durationSeconds": 5,
    "format": "mp3"
  }
}
```

### POST /api/render/video
Queue video render job (combines images + audio).

**Request:**
```json
{
  "imageUrls": [
    "https://image.pollinations.ai/prompt/img1",
    "https://image.pollinations.ai/prompt/img2"
  ],
  "audioUrl": "https://example.com/audio.mp3",
  "aspectRatio": "9:16",
  "outputFormat": "mp4"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "render-123456-abc",
  "status": "queued",
  "message": "Video render job queued successfully"
}
```

### GET /api/status/:jobId
Check render job progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "render-123456-abc",
    "status": "active",
    "progress": 60,
    "createdAt": "2024-01-15T10:30:00Z",
    "result": {
      "videoUrl": "/api/videos/render-123456-abc.mp4",
      "durationSeconds": 30,
      "width": 720,
      "height": 1280,
      "format": "mp4"
    }
  }
}
```

### GET /api/voices
Get available TTS voices.

**Response:**
```json
{
  "success": true,
  "data": [
    {"id": "natural", "name": "Natural", "gender": "Female", "style": "natural"},
    {"id": "energetic", "name": "Energetic", "gender": "Female", "style": "energetic"}
  ]
}
```

## Testing

Run the test suite:
```bash
# Start server
npm start

# In another terminal
export GEMINI_API_KEY=your_key
bash test-api.sh
```

Or use curl directly:
```bash
# Health check
curl http://localhost:3000/api/health

# Generate visuals (no API key needed)
curl -X POST http://localhost:3000/api/generate/visuals \
  -H "Content-Type: application/json" \
  -d '{"prompts":["cyberpunk cityscape"],"aspectRatio":"16:9"}'
```

## Troubleshooting

### Common Issues

**1. "Gemini not configured" error**
- Ensure `GEMINI_API_KEY` is set in environment
- Restart server after adding key

**2. Video render fails**
- Check FFmpeg is installed: `ffmpeg -version`
- Verify image URLs are accessible
- Check server has enough disk space in `/uploads`

**3. CORS errors from Medusa app**
- Add your app's domain to `CORS_ORIGINS`
- Format: `CORS_ORIGINS=https://app1.com,https://app2.com`

**4. Rate limiting**
- Default: 30 requests/minute per IP
- Adjust: `RATE_LIMIT_MAX_REQUESTS=100`

**5. Redis connection failed**
- Service works without Redis (simulation mode)
- For production: set `REDIS_URL` to actual Redis instance

## Performance Optimization

### Production Recommendations

1. **Enable Redis** for async job processing
2. **Use CDN** for serving generated media files
3. **Set up monitoring** (e.g., Sentry, LogRocket)
4. **Implement caching** for repeated script generations
5. **Scale horizontally** with load balancer for high traffic

### Cost Management

**Free Tier Strategy:**
- Use Pollinations.ai for images (free, no auth)
- Use Edge TTS for audio (free via Microsoft)
- Gemini 1.5 Flash has generous free quota
- Avoid ElevenLabs unless premium quality needed

**Estimated Monthly Costs:**
- Hosting: $0 (Render free tier)
- Gemini: $0 (free quota sufficient for testing)
- Images: $0 (Pollinations free)
- Audio: $0 (Edge TTS free)
- **Total: $0/month** for development/testing

## Security Checklist

- [ ] All API keys in environment variables (not hardcoded)
- [ ] CORS configured for specific domains only
- [ ] Rate limiting enabled
- [ ] Input validation with Zod schemas
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enforced in production
- [ ] Regular dependency updates (`npm audit`)

## Support

For issues or questions:
1. Check logs: `tail -f logs/app.log` (if using PM2: `pm2 logs castframe-api`)
2. Review API response error codes
3. Test endpoints individually with curl
4. Verify environment variables are loaded correctly

---

**Built with ❤️ for Medusa AI Influencer Platform**
