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
import { 
  MOCK_PROJECTS, 
  MOCK_ACTORS, 
  MOCK_CHARACTERS, 
  MOCK_GENERATED_LOOKS, 
  MOCK_CASTING_CANDIDATES, 
  MOCK_COLLECTIONS,
  INITIAL_ORGANIZATION,
  INITIAL_USER,
  INITIAL_AUDIT_EVENTS,
  INITIAL_GENERATION_JOBS
} from '../data/mockData';

const STORAGE_KEYS = {
  ORGANIZATION: 'castframe_org_v5',
  USER: 'castframe_user_v5',
  PROJECTS: 'castframe_projects_v5',
  ACTIVE_PROJECT_ID: 'castframe_active_proj_id_v5',
  ACTORS: 'castframe_actors_v5',
  SELECTED_ACTOR_ID: 'castframe_selected_actor_id_v5',
  CHARACTERS: 'castframe_characters_v5',
  LOOKS: 'castframe_looks_v5',
  CANDIDATES: 'castframe_candidates_v5',
  COLLECTIONS: 'castframe_collections_v5',
  AUDIT_EVENTS: 'castframe_audit_events_v5',
  GENERATION_JOBS: 'castframe_generation_jobs_v5'
};

// One-time automatic cleanup of legacy Mahabharata and mythological data from old local storage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const legacyKeys = Object.keys(localStorage).filter(k => k.startsWith('castframe_'));
    for (const key of legacyKeys) {
      if (key.includes('_v1') || key.includes('_v2') || key.includes('_v3') || key.includes('_v4')) {
        const val = localStorage.getItem(key) || '';
        if (val.includes('MAHABHARATA') || val.includes('Mahabharata') || val.includes('Karna') || val.includes('Arjuna') || val.includes('Maya Thorne')) {
          localStorage.removeItem(key);
        }
      }
    }
  }
} catch (e) {
  console.warn('Storage cleanup pass:', e);
}

export const storageService = {
  // Organization & User Session
  getOrganization(): Organization {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load organization:', e);
    }
    return INITIAL_ORGANIZATION;
  },

  saveOrganization(org: Organization): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(org));
    } catch (e) {
      console.warn('Failed to save organization:', e);
    }
  },

  getCurrentUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load user:', e);
    }
    return INITIAL_USER;
  },

  saveCurrentUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user:', e);
    }
  },

  // Actors / Identities
  getActors(): Actor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTORS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load actors from storage:', e);
    }
    return MOCK_ACTORS;
  },

  saveActors(actors: Actor[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTORS, JSON.stringify(actors));
    } catch (e) {
      console.warn('LocalStorage quota warning for actors. Attempting graceful compaction...', e);
      try {
        // If quota exceeded, prioritize retaining top 8 calibrated references per actor
        const compacted = actors.map(a => ({
          ...a,
          references: a.references?.slice(0, 8) || []
        }));
        localStorage.setItem(STORAGE_KEYS.ACTORS, JSON.stringify(compacted));
      } catch (compactErr) {
        console.warn('Storage quota critical, saving actors metadata with key primary references only:', compactErr);
        try {
          const minimal = actors.map(a => ({
            ...a,
            references: a.references?.filter(r => r.isPrimary).slice(0, 1) || []
          }));
          localStorage.setItem(STORAGE_KEYS.ACTORS, JSON.stringify(minimal));
        } catch {
          // In-memory state remains intact for the active session
        }
      }
    }
  },

  /**
   * Cascading identity deletion & consent purge
   */
  deleteIdentity(identityId: string, reason: string = 'User requested erasure'): void {
    try {
      const actors = this.getActors().filter(a => a.id !== identityId);
      this.saveActors(actors);

      // Clean up candidates for this identity
      const candidates = this.getCastingCandidates().filter(c => c.actorId !== identityId);
      this.saveCastingCandidates(candidates);

      // Log compliance audit event
      const user = this.getCurrentUser();
      const org = this.getOrganization();
      this.addAuditEvent({
        id: `aud-del-${Date.now()}`,
        organizationId: org.id,
        userId: user.id,
        userName: user.name,
        eventType: 'identity_deleted',
        entityId: identityId,
        entityType: 'identity',
        description: `Identity ${identityId} and reference evidence permanently purged (${reason}).`,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to purge identity:', e);
    }
  },

  // Projects
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load projects from storage:', e);
    }
    return MOCK_PROJECTS;
  },

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save projects to storage:', e);
    }
  },

  getActiveProjectId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    } catch (e) {
      return null;
    }
  },

  saveActiveProjectId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    } catch (e) {
      console.warn('Failed to save active project id:', e);
    }
  },

  // Generated Looks
  getLooks(): GeneratedLook[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOOKS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const unique: GeneratedLook[] = [];
          for (const item of parsed) {
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              unique.push(item);
            }
          }
          return unique;
        }
      }
    } catch (e) {
      console.warn('Failed to load looks from storage:', e);
    }
    return MOCK_GENERATED_LOOKS;
  },

  saveLooks(looks: GeneratedLook[]): void {
    try {
      const seen = new Set<string>();
      const unique: GeneratedLook[] = [];
      for (const item of looks) {
        if (item && item.id && !seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      localStorage.setItem(STORAGE_KEYS.LOOKS, JSON.stringify(unique));
    } catch (e) {
      console.warn('Failed to save looks to storage:', e);
    }
  },

  // Characters
  getCharacters(): CharacterRole[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load characters from storage:', e);
    }
    return MOCK_CHARACTERS;
  },

  saveCharacters(characters: CharacterRole[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
    } catch (e) {
      console.warn('Failed to save characters to storage:', e);
    }
  },

  // Casting Candidates
  getCastingCandidates(): CastingCandidate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load casting candidates:', e);
    }
    return MOCK_CASTING_CANDIDATES;
  },

  getCandidates(): CastingCandidate[] {
    return this.getCastingCandidates();
  },

  saveCastingCandidates(candidates: CastingCandidate[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    } catch (e) {
      console.warn('Failed to save casting candidates:', e);
    }
  },

  saveCandidates(candidates: CastingCandidate[]): void {
    this.saveCastingCandidates(candidates);
  },

  // Collections
  getCollections(): LookCollection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load collections:', e);
    }
    return MOCK_COLLECTIONS;
  },

  saveCollections(collections: LookCollection[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    } catch (e) {
      console.warn('Failed to save collections:', e);
    }
  },

  // Audit Events
  getAuditEvents(): AuditEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_EVENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load audit events:', e);
    }
    return INITIAL_AUDIT_EVENTS;
  },

  addAuditEvent(event: AuditEvent): void {
    try {
      const events = [event, ...this.getAuditEvents()];
      localStorage.setItem(STORAGE_KEYS.AUDIT_EVENTS, JSON.stringify(events.slice(0, 200)));
    } catch (e) {
      console.warn('Failed to save audit event:', e);
    }
  },

  // Generation Jobs (Durable Queue)
  getGenerationJobs(): GenerationJob[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERATION_JOBS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load generation jobs:', e);
    }
    return INITIAL_GENERATION_JOBS;
  },

  saveGenerationJobs(jobs: GenerationJob[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GENERATION_JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Failed to save generation jobs:', e);
    }
  },

  addOrUpdateJob(job: GenerationJob): void {
    try {
      const jobs = this.getGenerationJobs();
      const index = jobs.findIndex(j => j.id === job.id);
      if (index >= 0) {
        jobs[index] = job;
      } else {
        jobs.unshift(job);
      }
      this.saveGenerationJobs(jobs.slice(0, 50));
    } catch (e) {
      console.warn('Failed to add or update job:', e);
    }
  }
};
