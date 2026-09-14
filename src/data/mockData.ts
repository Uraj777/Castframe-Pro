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
import { buildCollectiveIdentityProfile } from '../services/identityAnalyzer';

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-studio-1',
  name: 'Paramount Horizon Studios',
  tier: 'Studio',
  quotaRemaining: 840,
  quotaTotal: 1000,
  createdAt: '2026-01-10T00:00:00.000Z'
};

export const INITIAL_USER: User = {
  id: 'user-maya-1',
  name: 'Maya Thorne',
  email: 'maya.thorne@paramounthorizon.com',
  role: 'owner',
  organizationId: 'org-studio-1',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
};

export const INITIAL_PROJECT: Project = {
  id: 'proj-1',
  organizationId: 'org-studio-1',
  title: 'MAHABHARATA',
  subtitle: 'Epic Mythological Feature Trilogy',
  description: 'An international cinematic adaptation of the epic Indian mythology focusing on moral dilemma, cosmic destiny, and warrior honor.',
  genre: 'Historical Mythological Epic',
  thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200',
  director: 'Aakash Verma',
  castingDirector: 'Maya Thorne (Lead Casting Director)',
  targetProductionYear: '2027 / 70mm IMAX',
  actorsCount: 12,
  charactersCount: 7,
  looksCount: 38,
  lastActive: '12 minutes ago'
};

export const ALL_PROJECTS: Project[] = [
  INITIAL_PROJECT,
  {
    id: 'proj-2',
    organizationId: 'org-studio-1',
    title: '1857: THE AWAKENING',
    subtitle: 'Historical Revolutionary Drama',
    description: 'A gritty pre-independence rebellion drama tracking regiment leaders and underground freedom fighters across Awadh.',
    genre: 'Period War Drama',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    director: 'Kabir Khanal',
    castingDirector: 'Maya Thorne',
    targetProductionYear: 'Late 2026',
    actorsCount: 8,
    charactersCount: 5,
    looksCount: 19,
    lastActive: '2 days ago'
  },
  {
    id: 'proj-3',
    organizationId: 'org-studio-1',
    title: 'SHADOWS OF THE GHATS',
    subtitle: 'Neo-Noir Crime Web Series',
    description: 'A ten-episode detective thriller set across Varanasi fog, ancient alleys, and underground river syndicates.',
    genre: 'Neo-Noir Mystery',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
    director: 'Zoya Sengupta',
    castingDirector: 'Maya Thorne',
    targetProductionYear: '2026',
    actorsCount: 14,
    charactersCount: 9,
    looksCount: 24,
    lastActive: '4 days ago'
  }
];

export const CHARACTERS: CharacterRole[] = [
  {
    id: 'char-1',
    projectId: 'proj-1',
    name: 'Karna',
    tagline: 'The Tragic Archer of the Sun God',
    description: 'Invincible archer endowed with natural celestial armor and golden ear-rings. Loyal to friendship over birthright, burdened by relentless tragic fate.',
    importance: 'Lead',
    ageTarget: '30-38',
    selectedLookId: 'look-1'
  },
  {
    id: 'char-2',
    projectId: 'proj-1',
    name: 'Arjuna',
    tagline: 'The Master of the Gandiva Bow',
    description: 'Peerless marksman, peer of demigods, torn between filial dharma and the cosmic war of Kurukshetra.',
    importance: 'Lead',
    ageTarget: '28-36',
    selectedLookId: 'look-4'
  },
  {
    id: 'char-3',
    projectId: 'proj-1',
    name: 'Krishna',
    tagline: 'The Cosmic Strategist & Charioteer',
    description: 'Dark-complexioned, serene sovereign. An aura of infinite grace, divine wisdom, and sovereign stillness amidst total carnage.',
    importance: 'Lead',
    ageTarget: '32-40',
    selectedLookId: 'look-7'
  },
  {
    id: 'char-4',
    projectId: 'proj-1',
    name: 'Duryodhana',
    tagline: 'Crown Prince of Hastinapur',
    description: 'Formidable mace warrior, proud, regal, uncompromising. A ruler driven by fierce entitlement and boundless loyalty to his trusted ally Karna.',
    importance: 'Lead',
    ageTarget: '32-38'
  },
  {
    id: 'char-5',
    projectId: 'proj-1',
    name: 'Bhima',
    tagline: 'Titan of the Vayu Clan',
    description: 'Colossal physical powerhouse with the strength of ten thousand elephants. Fierce, protective, and relentless in battle.',
    importance: 'Lead',
    ageTarget: '30-40'
  },
  {
    id: 'char-6',
    projectId: 'proj-1',
    name: 'Yudhishthira',
    tagline: 'The Dharmaraja / Righteous Sovereign',
    description: 'Austere, philosophical, principled eldest Pandava. A ruler whose devotion to truth is tested to the brink of ruin.',
    importance: 'Supporting',
    ageTarget: '34-44'
  },
  {
    id: 'char-7',
    projectId: 'proj-1',
    name: 'Draupadi',
    tagline: 'Born of Sacred Sacrificial Fire',
    description: 'Queen of untamed fire, incandescent beauty, sharp political intellect, and unyielding vengeance against injustice.',
    importance: 'Lead',
    ageTarget: '26-34',
    selectedLookId: 'look-10'
  }
];

// Helper to seed initial actors with real multi-angle roles and verified consent
const DEVRAT_REFS = [
  {
    id: 'ref-1-1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    label: 'Front Close-up Neutral',
    role: 'front_face' as const,
    quality: 'Excellent' as const,
    isPrimary: true,
    angle: 'Front 0°',
    lighting: 'Even Studio Softbox',
    expression: 'Neutral',
    uploadedAt: '2026-03-01T10:00:00Z',
    isAccepted: true
  },
  {
    id: 'ref-1-2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    label: '3/4 Angle Right Portrait',
    role: 'three_quarter_right' as const,
    quality: 'Excellent' as const,
    isPrimary: false,
    angle: '3/4 Right (45°)',
    lighting: 'Natural Window Light',
    expression: 'Subtle Intense',
    uploadedAt: '2026-03-01T10:05:00Z',
    isAccepted: true
  },
  {
    id: 'ref-1-3',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    label: 'Profile Left (Jaw & Nose)',
    role: 'profile_left' as const,
    quality: 'Good' as const,
    isPrimary: false,
    angle: 'Profile Left (90°)',
    lighting: 'Direct Daylight',
    expression: 'Neutral',
    uploadedAt: '2026-03-01T10:10:00Z',
    isAccepted: true
  },
  {
    id: 'ref-1-4',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
    label: 'Full Body Standing Stance',
    role: 'full_body_front' as const,
    quality: 'Excellent' as const,
    isPrimary: false,
    angle: 'Full Length Frontal',
    lighting: 'Studio Rim Light',
    expression: 'Neutral Stance',
    uploadedAt: '2026-03-01T10:15:00Z',
    isAccepted: true
  }
];

export const INITIAL_ACTORS: Actor[] = [
  {
    id: 'actor-1',
    organizationId: 'org-studio-1',
    name: 'Devrat Roy',
    identityType: 'authorized_real_person',
    lifecycleStatus: 'ready',
    consentStatus: 'verified',
    consentRecord: {
      id: 'cst-devrat-1',
      identityId: 'actor-1',
      authorityType: 'self',
      attestationVersion: 'castframe-consent-v1',
      acceptedByUserId: 'user-maya-1',
      acceptedByUserName: 'Maya Thorne (with Talent Authorization)',
      acceptedAt: '2026-03-01T09:30:00Z',
      verificationStatus: 'verified',
      scopeOfUse: ['cinematic_look_development', 'casting_visualization', 'costume_previs'],
      evidenceNotes: 'Signed Representation Consent Rider on file with CAA Talent Agency.'
    },
    ageRange: '30-38',
    actualAge: 34,
    height: '6\' 2" (188 cm)',
    build: 'Athletic',
    eyeColor: 'Dark Amber / Brown',
    hairColor: 'Natural Black',
    nationality: 'Indian / British',
    reps: 'Creative Artists Agency (London / Mumbai)',
    bio: 'Royal Academy of Dramatic Art alumnus. Classically trained theater actor with leading roles in international period dramas.',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    references: DEVRAT_REFS,
    identityCalibrated: true,
    calibrationScore: 92,
    identityProfile: buildCollectiveIdentityProfile('Devrat Roy', DEVRAT_REFS),
    generatedLooksCount: 14,
    lastUpdated: '2 hours ago',
    notes: 'Top callback candidate for Karna and Duryodhana. High physical presence, sharp jawline, excellent costume adaptation.'
  },
  {
    id: 'actor-2',
    organizationId: 'org-studio-1',
    name: 'Vikramaditya Rao',
    identityType: 'authorized_real_person',
    lifecycleStatus: 'ready',
    consentStatus: 'verified',
    consentRecord: {
      id: 'cst-vikram-2',
      identityId: 'actor-2',
      authorityType: 'self',
      attestationVersion: 'castframe-consent-v1',
      acceptedByUserId: 'user-maya-1',
      acceptedByUserName: 'Maya Thorne',
      acceptedAt: '2026-02-14T11:00:00Z',
      verificationStatus: 'verified',
      scopeOfUse: ['cinematic_look_development', 'casting_visualization']
    },
    ageRange: '28-36',
    actualAge: 31,
    height: '6\' 0" (183 cm)',
    build: 'Athletic',
    eyeColor: 'Hazel Brown',
    hairColor: 'Jet Black',
    nationality: 'Indian',
    reps: 'Kwan Entertainment',
    bio: 'Action specialist with extensive background in Kalaripayattu and equestrian stunts.',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    references: [
      {
        id: 'ref-2-1',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
        label: 'Frontal Studio Portrait',
        role: 'front_face',
        quality: 'Excellent',
        isPrimary: true,
        angle: 'Frontal (0°)',
        lighting: 'Studio Diffused',
        expression: 'Determined Neutral',
        uploadedAt: '2026-02-14T11:30:00Z',
        isAccepted: true
      },
      {
        id: 'ref-2-2',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
        label: '3/4 Angle Dynamic',
        role: 'three_quarter_right',
        quality: 'Excellent',
        isPrimary: false,
        angle: '3/4 Right (45°)',
        lighting: 'Golden Hour Rim',
        expression: 'Focused',
        uploadedAt: '2026-02-14T11:35:00Z',
        isAccepted: true
      },
      {
        id: 'ref-2-3',
        url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
        label: 'Left Lateral Profile',
        role: 'profile_left',
        quality: 'Good',
        isPrimary: false,
        angle: 'Profile (90°)',
        lighting: 'Natural Ambient',
        expression: 'Neutral',
        uploadedAt: '2026-02-14T11:40:00Z',
        isAccepted: true
      }
    ],
    identityCalibrated: true,
    calibrationScore: 88,
    generatedLooksCount: 9,
    lastUpdated: '1 day ago',
    notes: 'Shortlisted for Arjuna. Exceptional martial arts posture and archery stance.'
  },
  {
    id: 'actor-3',
    organizationId: 'org-studio-1',
    name: 'Siddharth Sen',
    identityType: 'authorized_real_person',
    lifecycleStatus: 'ready',
    consentStatus: 'verified',
    consentRecord: {
      id: 'cst-sid-3',
      identityId: 'actor-3',
      authorityType: 'self',
      attestationVersion: 'castframe-consent-v1',
      acceptedByUserId: 'user-maya-1',
      acceptedByUserName: 'Maya Thorne',
      acceptedAt: '2026-02-20T14:00:00Z',
      verificationStatus: 'verified',
      scopeOfUse: ['cinematic_look_development', 'casting_visualization']
    },
    ageRange: '32-40',
    actualAge: 36,
    height: '6\' 1" (185 cm)',
    build: 'Lean',
    eyeColor: 'Deep Brown',
    hairColor: 'Dark Brown',
    nationality: 'Indian',
    reps: 'Matrix Talent Management',
    bio: 'Known for nuanced psychological portrayals in prestige streaming dramas and independent cinema.',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    references: [
      {
        id: 'ref-3-1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
        label: 'Front Headshot Soft Light',
        role: 'front_face',
        quality: 'Excellent',
        isPrimary: true,
        angle: 'Front 0°',
        lighting: 'Softbox Diffused',
        expression: 'Serene Neutral',
        uploadedAt: '2026-02-20T14:30:00Z',
        isAccepted: true
      },
      {
        id: 'ref-3-2',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
        label: 'Three-Quarter Angle Left',
        role: 'three_quarter_left',
        quality: 'Good',
        isPrimary: false,
        angle: '3/4 Left (45°)',
        lighting: 'Natural Ambient',
        expression: 'Enigmatic',
        uploadedAt: '2026-02-20T14:35:00Z',
        isAccepted: true
      }
    ],
    identityCalibrated: true,
    calibrationScore: 84,
    generatedLooksCount: 7,
    lastUpdated: '3 days ago',
    notes: 'Considered for Krishna. Sovereign presence, piercing eyes, contemplative dialogue cadence.'
  },
  {
    id: 'actor-4',
    organizationId: 'org-studio-1',
    name: 'Tara Deshmukh',
    identityType: 'authorized_real_person',
    lifecycleStatus: 'ready',
    consentStatus: 'verified',
    consentRecord: {
      id: 'cst-tara-4',
      identityId: 'actor-4',
      authorityType: 'self',
      attestationVersion: 'castframe-consent-v1',
      acceptedByUserId: 'user-maya-1',
      acceptedByUserName: 'Maya Thorne',
      acceptedAt: '2026-02-22T16:00:00Z',
      verificationStatus: 'verified',
      scopeOfUse: ['cinematic_look_development', 'casting_visualization']
    },
    ageRange: '26-34',
    actualAge: 29,
    height: '5\' 8" (173 cm)',
    build: 'Athletic',
    eyeColor: 'Hazel',
    hairColor: 'Dark Wavy Black',
    nationality: 'Indian',
    reps: 'Tulsea Management',
    bio: 'Lead actress in National Award-winning historical dramas with classical Kathak training.',
    portraitUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    references: [
      {
        id: 'ref-4-1',
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
        label: 'Front Dramatic Studio Portrait',
        role: 'front_face',
        quality: 'Excellent',
        isPrimary: true,
        angle: 'Front 0°',
        lighting: 'Chiaroscuro Studio',
        expression: 'Regal / Intense',
        uploadedAt: '2026-02-22T16:20:00Z',
        isAccepted: true
      },
      {
        id: 'ref-4-2',
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
        label: '3/4 Angle Left Lighting',
        role: 'three_quarter_left',
        quality: 'Excellent',
        isPrimary: false,
        angle: '3/4 Left (45°)',
        lighting: 'Warm Ambient',
        expression: 'Proud & Fiery',
        uploadedAt: '2026-02-22T16:25:00Z',
        isAccepted: true
      },
      {
        id: 'ref-4-3',
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
        label: 'Profile Right Profile',
        role: 'profile_right',
        quality: 'Good',
        isPrimary: false,
        angle: 'Profile Right (90°)',
        lighting: 'Soft Daylight',
        expression: 'Neutral',
        uploadedAt: '2026-02-22T16:30:00Z',
        isAccepted: true
      }
    ],
    identityCalibrated: true,
    calibrationScore: 90,
    generatedLooksCount: 8,
    lastUpdated: '5 hours ago',
    notes: 'Frontrunner for Draupadi. Incandescent intensity, perfect aristocratic grace, commanding screen presence.'
  }
];

export const INITIAL_GENERATED_LOOKS: GeneratedLook[] = [
  {
    id: 'look-1',
    organizationId: 'org-studio-1',
    projectId: 'proj-1',
    actorId: 'actor-1',
    actorName: 'Devrat Roy',
    character: 'Karna',
    characterId: 'char-1',
    lookName: 'Karna — Battle of Kurukshetra (Sunset Armor)',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200',
    config: {
      character: 'Karna',
      characterId: 'char-1',
      age: 34,
      costume: 'Gilded celestial gold armor with battle-tested filigree, deep maroon silk cape',
      hairstyle: 'Long black hair pulled into a warrior knot with loose wind-swept strands',
      facialHair: 'Defined stubble beard',
      physique: 'Athletic',
      pose: 'Standing',
      environment: 'Dusty Kurukshetra battlefield at sunset with burning war chariots in distant bokeh',
      lighting: 'Golden Hour',
      camera: 'Medium Shot',
      visualStyle: 'Historical Epic',
      aspectRatio: '16:9',
      preserveFace: true,
      preserveBody: true,
      preserveAllIdentity: true
    },
    createdAt: '2026-03-02T14:20:00Z',
    status: 'Approved',
    model: 'gemini-3.1-flash-image',
    rating: 5,
    isFavorite: true,
    collections: ['coll-1'],
    notes: 'Director favorite. Celestial armor plate catches the low-angle sunset beautifully while preserving Devrat\'s facial structure.',
    isPrimaryForCharacter: true
  },
  {
    id: 'look-2',
    organizationId: 'org-studio-1',
    projectId: 'proj-1',
    actorId: 'actor-1',
    actorName: 'Devrat Roy',
    character: 'Karna',
    characterId: 'char-1',
    parentLookId: 'look-1',
    lookName: 'Karna — Royal Court Coronation (Hastinapur)',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    config: {
      character: 'Karna',
      characterId: 'char-1',
      age: 32,
      costume: 'Embroidered royal ivory angavastram draped over crimson gold-trimmed tunic',
      hairstyle: 'Neat ceremonial warrior braid with gold clasps',
      facialHair: 'Clean trimmed stubble',
      physique: 'Athletic',
      pose: 'Standing',
      environment: 'Ornate sandstone throne hall with high arched stone pillars and oil-lamp chandeliers',
      lighting: 'Dramatic',
      camera: 'Full Body',
      visualStyle: 'Historical Epic',
      aspectRatio: '16:9',
      preserveFace: true,
      preserveBody: true
    },
    createdAt: '2026-03-02T16:45:00Z',
    status: 'Ready',
    model: 'gemini-3.1-flash-image',
    rating: 4,
    isFavorite: false,
    collections: ['coll-1']
  },
  {
    id: 'look-3',
    organizationId: 'org-studio-1',
    projectId: 'proj-1',
    actorId: 'actor-1',
    actorName: 'Devrat Roy',
    character: 'Karna',
    characterId: 'char-1',
    parentLookId: 'look-1',
    lookName: 'Karna — Sunrise Ganges Prayer (Ascetic Stance)',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
    config: {
      character: 'Karna',
      characterId: 'char-1',
      age: 33,
      costume: 'Minimal saffron waist-cloth with sacred thread, celestial kavacha naturally glowing on chest',
      hairstyle: 'Loose long wet hair over broad shoulders',
      facialHair: 'Natural shadow',
      physique: 'Athletic',
      pose: 'Standing',
      environment: 'Misty Ganges riverbank at dawn, water rippling around knees with soft morning fog',
      lighting: 'Golden Hour',
      camera: 'Medium Shot',
      visualStyle: 'Photorealistic',
      aspectRatio: '16:9',
      preserveFace: true,
      preserveBody: true
    },
    createdAt: '2026-03-03T08:15:00Z',
    status: 'In Review',
    model: 'gemini-3.1-flash-image',
    rating: 5,
    isFavorite: true,
    collections: ['coll-1']
  },
  {
    id: 'look-4',
    organizationId: 'org-studio-1',
    projectId: 'proj-1',
    actorId: 'actor-2',
    actorName: 'Vikramaditya Rao',
    character: 'Arjuna',
    characterId: 'char-2',
    lookName: 'Arjuna — Drawing the Gandiva Bow (Rain-Soaked)',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    config: {
      character: 'Arjuna',
      characterId: 'char-2',
      age: 30,
      costume: 'Silver scale armor with midnight-blue layered leather pauldrons',
      hairstyle: 'High tied samurai-style warrior ponytail',
      facialHair: 'Clean shaven',
      physique: 'Athletic',
      pose: 'Fighting',
      environment: 'Thunderous torrential rain over battlefield mud, lightning reflecting on bowstring',
      lighting: 'Dramatic',
      camera: 'Wide Cinematic',
      visualStyle: 'Historical Epic',
      aspectRatio: '2.39:1',
      preserveFace: true,
      preserveBody: true
    },
    createdAt: '2026-03-03T11:30:00Z',
    status: 'Approved',
    model: 'gemini-3.1-flash-image',
    rating: 5,
    isFavorite: true,
    isPrimaryForCharacter: true
  },
  {
    id: 'look-7',
    organizationId: 'org-studio-1',
    projectId: 'proj-1',
    actorId: 'actor-3',
    actorName: 'Siddharth Sen',
    character: 'Krishna',
    characterId: 'char-3',
    lookName: 'Krishna — The Cosmic Charioteer at Kurukshetra',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    config: {
      character: 'Krishna',
      characterId: 'char-3',
      age: 35,
      costume: 'Yellow pitambara silk garment with subtle gold border, peacock feather in diadem',
      hairstyle: 'Shoulder-length curls with diadem',
      facialHair: 'Clean shaven',
      physique: 'Lean',
      pose: 'Standing',
      environment: 'Chariot reins in hands, cosmic starry twilight illuminating the battlefield',
      lighting: 'Studio',
      camera: 'Medium Shot',
      visualStyle: 'Historical Epic',
      aspectRatio: '16:9',
      preserveFace: true,
      preserveBody: true
    },
    createdAt: '2026-03-03T15:00:00Z',
    status: 'Approved',
    model: 'gemini-3.1-flash-image',
    rating: 5,
    isFavorite: true,
    isPrimaryForCharacter: true
  },
  {
    id: 'look-10',
    organizationId: 'org-studio-1',
    projectId: 'proj-1',
    actorId: 'actor-4',
    actorName: 'Tara Deshmukh',
    character: 'Draupadi',
    characterId: 'char-7',
    lookName: 'Draupadi — The Vow of Fire (Imperial Sabhā)',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200',
    config: {
      character: 'Draupadi',
      characterId: 'char-7',
      age: 28,
      costume: 'Single drape torn crimson silk saree with antique gold temple jewelry',
      hairstyle: 'Wild unbraided cascading black hair framing fierce face',
      facialHair: 'None',
      physique: 'Athletic',
      pose: 'Standing',
      environment: 'Palace assembly hall with roaring ceremonial firepit casting dramatic red glow',
      lighting: 'Dramatic',
      camera: 'Close-Up',
      visualStyle: 'Historical Epic',
      aspectRatio: '16:9',
      preserveFace: true,
      preserveBody: true
    },
    createdAt: '2026-03-03T18:00:00Z',
    status: 'Approved',
    model: 'gemini-3.1-flash-image',
    rating: 5,
    isFavorite: true,
    isPrimaryForCharacter: true
  }
];

export const INITIAL_CASTING_CANDIDATES: CastingCandidate[] = [
  {
    id: 'cand-1',
    actorId: 'actor-1',
    actorName: 'Devrat Roy',
    actorPortrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    character: 'Karna',
    characterId: 'char-1',
    candidateNumber: 'Candidate 01 (Lead Callback)',
    status: 'final_callback',
    rating: 5,
    notes: 'Exceptional physical presence in celestial armor look test. Retains tragic nobility and piercing eye contact.',
    pinnedLookUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200',
    lookName: 'Karna — Battle of Kurukshetra (Sunset Armor)',
    coverageScore: 0.92
  },
  {
    id: 'cand-2',
    actorId: 'actor-2',
    actorName: 'Vikramaditya Rao',
    actorPortrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    character: 'Arjuna',
    characterId: 'char-2',
    candidateNumber: 'Candidate 01',
    status: 'cast_confirmed',
    rating: 5,
    notes: 'Confirmed for Arjuna. Archery biomechanics and wet armor look test approved by director and action choreographer.',
    pinnedLookUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    lookName: 'Arjuna — Drawing the Gandiva Bow',
    coverageScore: 0.88
  },
  {
    id: 'cand-3',
    actorId: 'actor-3',
    actorName: 'Siddharth Sen',
    actorPortrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    character: 'Krishna',
    characterId: 'char-3',
    candidateNumber: 'Candidate 01',
    status: 'shortlisted',
    rating: 4,
    notes: 'Screen test pending for chariot monologue scene. Excellent look-development reception from producers.',
    pinnedLookUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    lookName: 'Krishna — The Cosmic Charioteer',
    coverageScore: 0.84
  },
  {
    id: 'cand-4',
    actorId: 'actor-4',
    actorName: 'Tara Deshmukh',
    actorPortrait: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    character: 'Draupadi',
    characterId: 'char-7',
    candidateNumber: 'Candidate 01',
    status: 'final_callback',
    rating: 5,
    notes: 'Vow of Fire look test was mesmerizing. Ready for chemistry read with Devrat Roy and Vikramaditya Rao.',
    pinnedLookUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200',
    lookName: 'Draupadi — The Vow of Fire',
    coverageScore: 0.90
  }
];

export const INITIAL_COLLECTIONS: LookCollection[] = [
  {
    id: 'coll-1',
    organizationId: 'org-studio-1',
    title: 'Karna — Heroic Look Evolution',
    description: 'Complete wardrobe and scene progression for Karna from ascetic youth to final Kurukshetra battle.',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200',
    itemCount: 3,
    lookIds: ['look-1', 'look-2', 'look-3'],
    updatedAt: '2026-03-03T18:30:00Z',
    tags: ['Hero Wardrobe', 'Armor Study', 'Karna']
  },
  {
    id: 'coll-2',
    organizationId: 'org-studio-1',
    title: 'Lead Characters — Director Pitch Book',
    description: 'Curated high-res look tests for executive board and production designer review.',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    itemCount: 4,
    lookIds: ['look-1', 'look-4', 'look-7', 'look-10'],
    updatedAt: '2026-03-03T19:00:00Z',
    tags: ['Executive Board', 'Lookbook', 'Lead Cast']
  }
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-1',
    organizationId: 'org-studio-1',
    userId: 'user-maya-1',
    userName: 'Maya Thorne',
    eventType: 'consent_attested',
    entityId: 'actor-1',
    entityType: 'identity',
    description: 'Consent attested for Devrat Roy under authority type: Self / Representation Rider (castframe-consent-v1).',
    timestamp: '2026-03-01T09:30:00Z'
  },
  {
    id: 'aud-2',
    organizationId: 'org-studio-1',
    userId: 'user-maya-1',
    userName: 'Maya Thorne',
    eventType: 'identity_calibrated',
    entityId: 'actor-1',
    entityType: 'identity',
    description: 'Collective multi-angle calibration synthesized across 4 reference angles (Coverage: 92%).',
    timestamp: '2026-03-01T10:20:00Z'
  },
  {
    id: 'aud-3',
    organizationId: 'org-studio-1',
    userId: 'user-maya-1',
    userName: 'Maya Thorne',
    eventType: 'generation_succeeded',
    entityId: 'look-1',
    entityType: 'look',
    description: 'Generated Look "Karna — Battle of Kurukshetra (Sunset Armor)" with prompt-recipe/3.',
    timestamp: '2026-03-02T14:20:00Z'
  }
];

export const INITIAL_GENERATION_JOBS: GenerationJob[] = [
  {
    id: 'job-1',
    organizationId: 'org-studio-1',
    userId: 'user-maya-1',
    identityId: 'actor-1',
    characterName: 'Karna',
    state: 'succeeded',
    progressPercent: 100,
    currentStepLabel: 'Quality evaluation approved',
    detail: 'Photorealistic look test successfully validated and stored.',
    createdAt: '2026-03-02T14:18:00Z',
    updatedAt: '2026-03-02T14:20:00Z',
    outputLookId: 'look-1'
  }
];

export const MOCK_PROJECTS = ALL_PROJECTS;
export const MOCK_ACTORS = INITIAL_ACTORS;
export const MOCK_CHARACTERS = CHARACTERS;
export const MOCK_GENERATED_LOOKS = INITIAL_GENERATED_LOOKS;
export const MOCK_CASTING_CANDIDATES = INITIAL_CASTING_CANDIDATES;
export const MOCK_COLLECTIONS = INITIAL_COLLECTIONS;
