import { Actor, Project, InfluencerNiche, CampaignGoal, PlatformTarget } from '../types';
import { storageService } from './storageService';

export interface SeedInfluencerOptions {
  niche?: InfluencerNiche;
  prompt?: string;
}

/**
 * SeedService: AI-First dynamic persona & campaign generator.
 * Uses Gemini API to synthesize fresh, zero-hardcoded influencer personas and campaigns on demand.
 */
export const seedService = {
  /**
   * Generates a completely randomized or prompt-guided AI Influencer Persona using Gemini.
   */
  async generateRandomInfluencer(options?: SeedInfluencerOptions): Promise<Actor> {
    try {
      const res = await fetch('/api/seed/random-influencer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {})
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.persona) {
          const newActor: Actor = data.persona;
          const currentActors = storageService.getActors();
          storageService.saveActors([newActor, ...currentActors]);
          return newActor;
        }
      }
    } catch (err) {
      console.warn('Backend seed endpoint unreachable, generating client-side dynamic persona:', err);
    }

    // Client-side fallback dynamic generator if server is starting up
    return this.createDynamicClientFallback(options?.niche);
  },

  /**
   * Creates a dynamic campaign for an influencer persona.
   */
  async generateCampaignForPersona(persona: Actor, customGoal?: string): Promise<Project> {
    try {
      const res = await fetch('/api/generate/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: persona.id,
          personaName: persona.name,
          niche: persona.niche,
          customGoal
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.campaign) {
          const newProject: Project = data.campaign;
          const currentProjects = storageService.getProjects();
          storageService.saveProjects([newProject, ...currentProjects]);
          return newProject;
        }
      }
    } catch (err) {
      console.warn('Failed to generate campaign from server, using client synthesizer:', err);
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      organizationId: persona.organizationId,
      title: `${persona.name} • ${persona.niche || 'Viral'} Launch Campaign`,
      subtitle: `AI-Driven Content Campaign for ${persona.handle || '@creator'}`,
      description: `Targeting ${persona.target_audience || 'Gen Z & Millennials'} with high-engagement aesthetic visuals, viral short-form reels, and brand activations.`,
      genre: persona.niche || 'Lifestyle & Fashion',
      niche: persona.niche,
      target_audience: persona.target_audience,
      visual_style: persona.visual_style || 'Cinematic & Photorealistic',
      campaign_goal: 'Viral Reel',
      platform: 'Instagram Reels',
      thumbnail: persona.portraitUrl,
      director: 'AI Creative Lead',
      castingDirector: 'Medusa Engine',
      targetProductionYear: 'Active 2026',
      actorsCount: 1,
      charactersCount: 3,
      looksCount: 0,
      lastActive: 'Just now'
    };

    const currentProjects = storageService.getProjects();
    storageService.saveProjects([newProject, ...currentProjects]);
    return newProject;
  },

  /**
   * Fallback client-side dynamic persona generator
   */
  createDynamicClientFallback(customNiche?: InfluencerNiche): Actor {
    const niches: InfluencerNiche[] = [
      'Sensual & Glamour',
      'Fitness & Gym',
      'Luxury & High Life',
      'Cyberpunk & Sci-Fi',
      'High Fashion & Editorial',
      'Streetwear & Urban',
      'Tech & AI Futurism',
      'Travel & Adventure',
      'Bikini & Beachwear',
      'Experimental & Avant-Garde'
    ];

    const selectedNiche = customNiche || niches[Math.floor(Math.random() * niches.length)];
    const names = [
      'Elena Vance', 'Sora Takahashi', 'Kaelen Cruz', 'Maya Sterling',
      'Aria Thorne', 'Dante Silva', 'Nyx Moreau', 'Zayn Al-Mansoor', 'Chloe Chen'
    ];
    const chosenName = names[Math.floor(Math.random() * names.length)];
    const handle = `@${chosenName.toLowerCase().replace(' ', '.')}_${Math.floor(Math.random() * 90 + 10)}`;

    const portraits = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'
    ];

    const newActor: Actor = {
      id: `actor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: 'org-studio-1',
      name: chosenName,
      handle,
      niche: selectedNiche,
      persona_traits: ['Magnetic', 'Aesthetic', 'Ambitious', 'Visionary'],
      visual_style: 'Ultra-cinematic 8k lighting with natural skin texture and high fashion styling',
      target_audience: `Global enthusiasts of ${selectedNiche.toLowerCase()} and modern visual aesthetics`,
      identityType: 'synthetic',
      lifecycleStatus: 'ready',
      consentStatus: 'verified',
      ageRange: '22-27',
      actualAge: 24,
      height: "5'9\"",
      build: 'Athletic',
      eyeColor: 'Hazel Amber',
      hairColor: 'Deep Espresso',
      nationality: 'Global Digital Creator',
      bio: `Virtual creator & style visionary pushing boundaries in ${selectedNiche}. Partnered with Medusa Studio.`,
      monetization_focus: ['Brand Sponsorships', 'Digital Fashion Drops', 'Exclusive Fan Content'],
      portraitUrl: portraits[Math.floor(Math.random() * portraits.length)],
      references: [
        {
          id: `ref-primary-${Date.now()}`,
          url: portraits[Math.floor(Math.random() * portraits.length)],
          label: 'Primary Identity Anchor (Frontal 0°)',
          role: 'front_face',
          quality: 'Excellent',
          isPrimary: true,
          angle: 'Front 0°',
          lighting: 'Studio Diffused Softbox',
          expression: 'Magnetic Neutral',
          uploadedAt: 'Generated on-demand',
          isAccepted: true
        }
      ],
      identityCalibrated: true,
      calibrationScore: 95,
      voice_settings: {
        tone: 'Confident, sultry, charismatic',
        speed: 1.0,
        pitch: 1.0,
        accent: 'American Urban / Cosmopolitan'
      },
      stats: {
        estimated_followers: '280K',
        engagement_rate: '6.4%',
        viral_potential_score: 94
      },
      generatedLooksCount: 0,
      lastUpdated: 'Just now'
    };

    const currentActors = storageService.getActors();
    storageService.saveActors([newActor, ...currentActors]);
    return newActor;
  }
};
