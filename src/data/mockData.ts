import { 
  Actor, 
  CharacterRole, 
  GeneratedLook, 
  CastingCandidate, 
  Project, 
  LookCollection,
  Organization,
  User,
  AuditEvent,
  GenerationJob
} from '../types';

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-studio-1',
  name: 'Medusa AI Influencer Studio',
  tier: 'Studio',
  quotaRemaining: 1000,
  quotaTotal: 1000,
  createdAt: new Date().toISOString()
};

export const INITIAL_USER: User = {
  id: 'user-creator-1',
  name: 'Creative Director',
  email: 'creator@medusa.ai',
  role: 'owner',
  organizationId: 'org-studio-1',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
};

// Database starts completely clean with ZERO hardcoded content
export const INITIAL_PROJECT: Project | null = null;
export const ALL_PROJECTS: Project[] = [];
export const CHARACTERS: CharacterRole[] = [];
export const MOCK_ACTORS: Actor[] = [];
export const MOCK_PROJECTS: Project[] = [];
export const MOCK_CHARACTERS: CharacterRole[] = [];
export const MOCK_GENERATED_LOOKS: GeneratedLook[] = [];
export const MOCK_CASTING_CANDIDATES: CastingCandidate[] = [];
export const MOCK_COLLECTIONS: LookCollection[] = [];
export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [];
export const INITIAL_GENERATION_JOBS: GenerationJob[] = [];
