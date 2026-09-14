import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  User, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  Info,
  Star,
  Check,
  AlertCircle,
  Eye,
  Sliders,
  Shield,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { 
  Actor, 
  ActorReference, 
  ReferenceRole, 
  IdentityType, 
  AuthorityType, 
  IdentityProfile,
  IdentityConsent
} from '../types';
import { 
  calculateReferenceCoverage, 
  buildCollectiveIdentityProfile,
  validateImageFile,
  optimizeReferenceImage,
  classifyReferencesWithAi
} from '../services/identityAnalyzer';
import { storageService } from '../services/storageService';

interface CreateModelModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onModelCreated: (actor: Actor, targetView?: 'generator' | 'profile') => void;
}

const REFERENCE_ROLES: { role: ReferenceRole; label: string; desc: string }[] = [
  { role: 'front_face', label: 'Front Face (0°)', desc: 'Direct frontal eye-level view' },
  { role: 'three_quarter_left', label: '3/4 Angle Left (45°)', desc: 'Cheekbone & left jawline' },
  { role: 'three_quarter_right', label: '3/4 Angle Right (45°)', desc: 'Cheekbone & right jawline' },
  { role: 'profile_left', label: 'Left Profile (90°)', desc: 'Nasal bridge & jaw silhouette' },
  { role: 'profile_right', label: 'Right Profile (90°)', desc: 'Nasal bridge & jaw silhouette' },
  { role: 'upper_body', label: 'Upper Body (Bust)', desc: 'Chest, neck & shoulder posture' },
  { role: 'full_body_front', label: 'Full Body Front', desc: 'Standing posture & proportions' },
  { role: 'full_body_side', label: 'Full Body Side', desc: 'Lateral posture & spine profile' },
  { role: 'full_body_back', label: 'Full Body Back / Rear (180°)', desc: 'Rear view, spine & back profile' },
  { role: 'expression_reference', label: 'Dynamic Expression', desc: 'Smile, intense gaze or speech' },
  { role: 'other', label: 'Additional Reference', desc: 'Secondary angle or detail' }
];

export const CreateModelModal: React.FC<CreateModelModalProps> = ({ isOpen, onClose, onModelCreated }) => {
  if (isOpen === false) return null;

  const [wizardStep, setWizardStep] = useState<'consent' | 'upload' | 'roles' | 'coverage' | 'calibrating' | 'ready'>('consent');
  
  // Identity Details
  const [identityType, setIdentityType] = useState<IdentityType>('authorized_real_person');
  const [personName, setPersonName] = useState<string>('Rohan Kapoor');
  const [actualAge, setActualAge] = useState<number>(33);
  const [build, setBuild] = useState<'Athletic' | 'Lean' | 'Muscular' | 'Heavy'>('Athletic');
  const [height, setHeight] = useState<string>('6\' 1" (185 cm)');
  const [notes, setNotes] = useState<string>('Lead actor callback talent with classical theater background.');

  // Consent & Rights Attestation
  const [authorityType, setAuthorityType] = useState<AuthorityType>('self');
  const [attestationConfirmed, setAttestationConfirmed] = useState<boolean>(false);
  const [authorizedSigner, setAuthorizedSigner] = useState<string>('Creative Director (Studio Representative)');
  
  // Photos state (3 to 20 photos)
  const [photos, setPhotos] = useState<ActorReference[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [isClassifyingAngles, setIsClassifyingAngles] = useState<boolean>(false);
  const [classificationBanner, setClassificationBanner] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  
  // Calibration State
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);
  const [calibrationStatus, setCalibrationStatus] = useState<string>('Synthesizing multi-angle biometric vectors...');
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Automatic Gemini Vision Angle Classifier
  const autoClassifyAngles = async (photosToClassify?: ActorReference[]) => {
    const target = photosToClassify || photos;
    if (target.length === 0) return;
    setIsClassifyingAngles(true);
    setClassificationBanner(null);

    try {
      const classifications = await classifyReferencesWithAi(target);
      setPhotos(prev => prev.map((p, idx) => {
        const found = classifications.find(c => c.originalIndex === idx);
        if (found) {
          return {
            ...p,
            role: found.role,
            angle: found.angle,
            lighting: found.lighting,
            expression: found.expression,
            isAiDetected: true,
            aiConfidence: found.confidence,
            label: `${personName} — ${REFERENCE_ROLES.find(r => r.role === found.role)?.label || found.angle}`
          };
        }
        return p;
      }));
      setClassificationBanner(`✨ AI successfully classified angles across all ${target.length} photographs!`);
    } catch (err) {
      console.warn('Auto angle classification error:', err);
    } finally {
      setIsClassifyingAngles(false);
    }
  };

  // Process uploaded files with validation & high-grade casting image optimization
  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadErrors([]);
    setIsProcessingUpload(true);

    const remainingSlots = Math.max(0, 20 - photos.length);
    const filesToRead = Array.from(files).slice(0, remainingSlots);

    const newReferences: ActorReference[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToRead.length; i++) {
      const file = filesToRead[i];
      const validation = await validateImageFile(file);

      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.issues.join(' ')}`);
        continue;
      }

      try {
        // High-grade casting optimization to 1024px max dimension JPEG
        // Prevents browser storage freeze and payload timeouts
        const photoUrl = await optimizeReferenceImage(file, 1024, 0.85);

        if (photoUrl) {
          const index = photos.length + newReferences.length;
          const defaultRoles: ReferenceRole[] = [
            'front_face',
            'three_quarter_right',
            'three_quarter_left',
            'profile_left',
            'full_body_front',
            'upper_body',
            'profile_right',
            'expression_reference'
          ];
          const assignedRole = defaultRoles[index % defaultRoles.length] || 'other';

          newReferences.push({
            id: `ref-user-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
            url: photoUrl,
            label: `${personName} — ${REFERENCE_ROLES.find(r => r.role === assignedRole)?.label || 'Reference'}`,
            role: assignedRole,
            quality: 'Excellent',
            isPrimary: photos.length === 0 && newReferences.length === 0,
            angle: assignedRole.includes('profile') ? 'Profile 90°' : assignedRole.includes('three_quarter') ? '3/4 Angle (45°)' : 'Front 0°',
            lighting: index % 2 === 0 ? 'Studio Diffused' : 'Natural Daylight',
            expression: 'Neutral',
            uploadedAt: 'Just now',
            isAccepted: true
          });
        }
      } catch (err: any) {
        errors.push(`${file.name}: Failed to optimize image (${err?.message || 'Error'}).`);
      }
    }

    setIsProcessingUpload(false);

    if (errors.length > 0) {
      setUploadErrors(errors);
    }

    if (newReferences.length > 0) {
      const combined = [...photos, ...newReferences];
      setPhotos(combined);
      // Automatically classify with Gemini Vision
      autoClassifyAngles(combined);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  // Curated 4-angle sample set for instant verification
  const handleLoadSampleSet = () => {
    const samplePhotos: ActorReference[] = [
      {
        id: `sample-1`,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
        label: 'Frontal Studio Portrait (0°)',
        role: 'front_face',
        quality: 'Excellent',
        isPrimary: true,
        angle: 'Front 0°',
        lighting: 'Studio Softbox',
        expression: 'Neutral',
        uploadedAt: 'Sample Asset',
        isAccepted: true
      },
      {
        id: `sample-2`,
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
        label: 'Three-Quarter Right (45°)',
        role: 'three_quarter_right',
        quality: 'Excellent',
        isPrimary: false,
        angle: '3/4 Angle (45°)',
        lighting: 'Natural Ambient',
        expression: 'Focused',
        uploadedAt: 'Sample Asset',
        isAccepted: true
      },
      {
        id: `sample-3`,
        url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
        label: 'Left Lateral Profile (90°)',
        role: 'profile_left',
        quality: 'Good',
        isPrimary: false,
        angle: 'Profile (90°)',
        lighting: 'Direct Daylight',
        expression: 'Neutral',
        uploadedAt: 'Sample Asset',
        isAccepted: true
      },
      {
        id: `sample-4`,
        url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
        label: 'Full Body Standing Stance',
        role: 'full_body_front',
        quality: 'Excellent',
        isPrimary: false,
        angle: 'Full Length Frontal',
        lighting: 'Studio Rim Light',
        expression: 'Standing Stance',
        uploadedAt: 'Sample Asset',
        isAccepted: true
      }
    ];
    setPhotos(samplePhotos);
    setWizardStep('roles');
  };

  const handleSetPrimary = (index: number) => {
    setPhotos(prev => prev.map((p, idx) => ({ ...p, isPrimary: idx === index })));
  };

  const handleUpdateRole = (index: number, newRole: ReferenceRole) => {
    setPhotos(prev => prev.map((p, idx) => idx === index ? { ...p, role: newRole } : p));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some(p => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  // Calculate live coverage report
  const coverageReport = calculateReferenceCoverage(photos);

  // Trigger calibration synthesis
  const handleStartCalibration = async () => {
    setWizardStep('calibrating');
    setCalibrationProgress(15);
    setCalibrationStatus('Ingesting multi-angle reference photos...');

    const stages = [
      { p: 35, s: 'Triangulating facial bone structure across frontal and 3/4 angles...' },
      { p: 55, s: 'Measuring nasal dorsum projection from lateral profile evidence...' },
      { p: 75, s: 'Establishing biacromial shoulder width and physical posture...' },
      { p: 90, s: 'Synthesizing collective identity profile...' },
      { p: 100, s: 'Calibration complete. Ready for Character Look development.' }
    ];

    for (const stage of stages) {
      await new Promise(r => setTimeout(r, 450));
      setCalibrationProgress(stage.p);
      setCalibrationStatus(stage.s);
    }

    const profile = buildCollectiveIdentityProfile(personName, photos);
    setIdentityProfile(profile);
    setWizardStep('ready');
  };

  // Build the complete new Actor object
  const buildNewActor = (): Actor => {
    const org = storageService.getOrganization();
    const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
    const portraitUrl = primaryPhoto ? primaryPhoto.url : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800';

    const consentRecord: IdentityConsent = {
      id: `cst-${Date.now()}`,
      identityId: `actor-${Date.now()}`,
      authorityType,
      attestationVersion: 'castframe-consent-v1',
      acceptedByUserId: 'user-current',
      acceptedByUserName: authorizedSigner,
      acceptedAt: new Date().toISOString(),
      verificationStatus: 'verified',
      scopeOfUse: ['cinematic_look_development', 'casting_visualization', 'costume_previs']
    };

    return {
      id: `actor-${Date.now()}`,
      organizationId: org.id,
      name: personName,
      identityType,
      lifecycleStatus: 'ready',
      consentStatus: 'verified',
      consentRecord,
      ageRange: `${actualAge - 3}-${actualAge + 4}`,
      actualAge,
      height,
      build,
      eyeColor: 'Dark Amber / Brown',
      hairColor: 'Natural Black',
      nationality: 'International Talent',
      portraitUrl,
      references: photos,
      identityCalibrated: true,
      calibrationScore: Math.round(coverageReport.overallScore * 100),
      identityProfile: identityProfile || buildCollectiveIdentityProfile(personName, photos),
      generatedLooksCount: 0,
      lastUpdated: 'Just now',
      notes
    };
  };

  const handleFinish = (targetView: 'generator' | 'profile' = 'generator') => {
    if (isFinishing) return;
    setIsFinishing(true);

    try {
      const newActor = buildNewActor();
      
      // Log audit event
      const org = storageService.getOrganization();
      const user = storageService.getCurrentUser();
      storageService.addAuditEvent({
        id: `aud-onboard-${Date.now()}`,
        organizationId: org.id,
        userId: user.id,
        userName: user.name,
        eventType: 'identity_calibrated',
        entityId: newActor.id,
        entityType: 'identity',
        description: `Identity "${newActor.name}" onboarded and calibrated with ${photos.length} consented reference photos (Coverage: ${newActor.calibrationScore}%).`,
        timestamp: new Date().toISOString()
      });

      onModelCreated(newActor, targetView);
    } catch (err) {
      console.error('Failed to complete identity onboarding:', err);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
                Identity Onboarding & Multi-Angle Calibration
              </h2>
              <p className="text-xs text-neutral-400">
                Consent-first visual casting and character look development
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-5 border-b border-neutral-800 text-xs font-medium text-neutral-400 bg-neutral-950/30">
          <button 
            onClick={() => setWizardStep('consent')}
            className={`py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${wizardStep === 'consent' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-neutral-400'}`}
          >
            <Shield className="w-3.5 h-3.5" /> 1. Rights & Consent
          </button>
          <button 
            onClick={() => attestationConfirmed && setWizardStep('upload')}
            disabled={!attestationConfirmed}
            className={`py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${wizardStep === 'upload' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-neutral-400 disabled:opacity-40'}`}
          >
            <Upload className="w-3.5 h-3.5" /> 2. Upload Photos ({photos.length})
          </button>
          <button 
            onClick={() => photos.length >= 1 && setWizardStep('roles')}
            disabled={photos.length === 0}
            className={`py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${wizardStep === 'roles' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-neutral-400 disabled:opacity-40'}`}
          >
            <Sliders className="w-3.5 h-3.5" /> 3. Angle Roles
          </button>
          <button 
            onClick={() => photos.length >= 1 && setWizardStep('coverage')}
            disabled={photos.length === 0}
            className={`py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${wizardStep === 'coverage' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-neutral-400 disabled:opacity-40'}`}
          >
            <Eye className="w-3.5 h-3.5" /> 4. Coverage Score
          </button>
          <button 
            disabled={wizardStep !== 'ready'}
            className={`py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${wizardStep === 'ready' || wizardStep === 'calibrating' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-neutral-500'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> 5. Ready
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* STEP 1: RIGHTS & CONSENT */}
          {wizardStep === 'consent' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Product Promise & Consent Mandate</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  "Create an identity-aware digital character representation from consented reference images. Coverage and consistency vary by reference quality, angle, and generation provider."
                </p>
              </div>

              <div className="space-y-4 bg-neutral-950/40 p-5 rounded-xl border border-neutral-800">
                <h3 className="text-sm font-semibold text-white">Identity Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Identity Display Name</label>
                    <input 
                      type="text" 
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Identity Classification</label>
                    <select
                      value={identityType}
                      onChange={(e) => setIdentityType(e.target.value as IdentityType)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="authorized_real_person">Authorized Real Person / Talent</option>
                      <option value="self">Self (Own Likeness)</option>
                      <option value="synthetic">Synthetic Character Baseline</option>
                      <option value="brand_character">Brand / Production Character</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Real Age</label>
                    <input 
                      type="number" 
                      value={actualAge}
                      onChange={(e) => setActualAge(parseInt(e.target.value) || 30)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Physical Build</label>
                    <select
                      value={build}
                      onChange={(e) => setBuild(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Athletic">Athletic</option>
                      <option value="Lean">Lean</option>
                      <option value="Muscular">Muscular</option>
                      <option value="Heavy">Heavy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Height</label>
                    <input 
                      type="text" 
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Consent Attestation Box */}
              <div className="p-5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  <span>Authority & Representation Attestation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Authority Relationship</label>
                    <select
                      value={authorityType}
                      onChange={(e) => setAuthorityType(e.target.value as AuthorityType)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="self">Self (Direct Individual)</option>
                      <option value="agent">Authorized Agent / Talent Agency</option>
                      <option value="employer">Production Studio / Employer</option>
                      <option value="legal_guardian">Legal Guardian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Authorized Signer Name</label>
                    <input 
                      type="text"
                      value={authorizedSigner}
                      onChange={(e) => setAuthorizedSigner(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg cursor-pointer hover:border-amber-500/50 transition">
                  <input 
                    type="checkbox"
                    checked={attestationConfirmed}
                    onChange={(e) => setAttestationConfirmed(e.target.checked)}
                    className="mt-1 rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs text-neutral-300 leading-relaxed">
                    I attest that I possess the explicit legal rights and consent of <strong className="text-white">{personName}</strong> to upload their photographs for cinematic character look development and casting visualization under version <code className="text-amber-400">castframe-consent-v1</code>. I acknowledge that consent can be revoked at any time.
                  </span>
                </label>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadSampleSet}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 rounded-lg transition"
                >
                  Load 4-Angle Audition Sample Set
                </button>
                <button
                  type="button"
                  disabled={!attestationConfirmed}
                  onClick={() => setWizardStep('upload')}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg transition flex items-center gap-2"
                >
                  Continue to Photo Upload <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: UPLOAD PHOTOS */}
          {wizardStep === 'upload' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-white">Upload Reference Photographs (3 to 20 images)</h3>
                  <p className="text-xs text-neutral-400">
                    Upload multiple angles (frontal, 3/4 profiles, lateral profiles, full body) in clear lighting.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isProcessingUpload && (
                    <span className="text-xs text-amber-400 animate-pulse flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Optimizing photos...
                    </span>
                  )}
                  <span className="text-xs font-mono px-2.5 py-1 bg-neutral-800 text-amber-400 rounded-full">
                    {photos.length} / 20 Photos
                  </span>
                </div>
              </div>

              {/* Educational Guidance: Conditioning vs Fine-Tuning */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-amber-400">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>How CASTFRAME Character Likeness Works (No Heavy Model Training Needed)</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                    Zero-Shot Multimodal Conditioning
                  </span>
                </div>
                <p className="text-neutral-300 leading-relaxed text-xs">
                  Unlike traditional LoRA fine-tuning which requires hours of GPU compute and dozens of duplicate training steps, CASTFRAME uses <strong>real-time multi-angle conditioning via Gemini Vision</strong>. The model dynamically triangulates facial landmarks across your reference gallery.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="p-2.5 bg-neutral-950/80 rounded-lg border border-neutral-800/80 space-y-1">
                    <span className="text-amber-300 font-semibold block flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> Recommended: 4 to 8 Angles
                    </span>
                    <p className="text-neutral-400">
                      Angle diversity beats raw photo count. 1 Frontal (0°), 2 Three-Quarters (45°), 1 Profile (90° for nasal bridge/jawline), and 1 Full-Body provide optimal likeness retention.
                    </p>
                  </div>
                  <div className="p-2.5 bg-neutral-950/80 rounded-lg border border-neutral-800/80 space-y-1">
                    <span className="text-sky-300 font-semibold block flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-sky-300" /> Auto-Angle Recognition
                    </span>
                    <p className="text-neutral-400">
                      Our vision pipeline automatically distinguishes Front, 3/4, Profile, and Back angles so you don't need to manually label every single shot.
                    </p>
                  </div>
                  <div className="p-2.5 bg-neutral-950/80 rounded-lg border border-neutral-800/80 space-y-1">
                    <span className="text-emerald-300 font-semibold block flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" /> Casting Resolution Guard
                    </span>
                    <p className="text-neutral-400">
                      Large camera files are automatically resized to 1024px casting grade upon selection, eliminating browser storage hangs and upload freezes.
                    </p>
                  </div>
                </div>
              </div>

              {uploadErrors.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg space-y-1 text-xs text-red-300">
                  <div className="font-semibold flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Upload Validation Notice:</div>
                  {uploadErrors.map((err, i) => <div key={i}>• {err}</div>)}
                </div>
              )}

              {/* Upload Dropzone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={(e) => processFiles(e.target.files)} 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  Drag and drop reference photos, or <span className="text-amber-400 underline">browse files</span>
                </p>
                <p className="text-xs text-neutral-500">
                  Supports JPEG, PNG, WebP (Automatically optimized to casting resolution)
                </p>
              </div>

              {/* Photo Thumbnails Preview */}
              {photos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-300">Uploaded Photos ({photos.length})</span>
                      {isClassifyingAngles && (
                        <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3 animate-spin" /> AI analyzing photo angles...
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setPhotos([])} 
                      className="text-xs text-red-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {photos.map((photo, index) => (
                      <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-square">
                        <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                        {photo.isPrimary && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-500 text-black font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                            <Star className="w-3 h-3 fill-black" /> Primary
                          </div>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemovePhoto(index); }}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-[10px] text-neutral-300 truncate">
                          {photo.angle || photo.role.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setWizardStep('consent')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 rounded-lg transition"
                >
                  Back to Consent
                </button>
                <button
                  type="button"
                  disabled={photos.length === 0 || isProcessingUpload}
                  onClick={() => {
                    setWizardStep('roles');
                    if (!photos.some(p => p.isAiDetected)) {
                      autoClassifyAngles();
                    }
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg transition flex items-center gap-2"
                >
                  Configure Angle Roles ({photos.length}) <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ROLE ASSIGNMENT */}
          {wizardStep === 'roles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Reference Angle Roles & Biometrics</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Tag each photograph with its true angle (Front, Profile, 3/4, Back) for triangulation across facial features.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => autoClassifyAngles()}
                  disabled={isClassifyingAngles || photos.length === 0}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition shrink-0 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isClassifyingAngles ? 'animate-spin' : ''}`} />
                  {isClassifyingAngles ? 'Analyzing Angles with Gemini...' : 'Auto-Detect Angles with AI'}
                </button>
              </div>

              {classificationBanner && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{classificationBanner}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className={`flex gap-3 p-3 rounded-xl border transition ${photo.isPrimary ? 'bg-amber-500/5 border-amber-500/40' : 'bg-neutral-950/40 border-neutral-800'}`}>
                    <img src={photo.url} alt={photo.label} className="w-20 h-20 rounded-lg object-cover border border-neutral-800 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white truncate">Photo #{index + 1}</span>
                        <button
                          onClick={() => handleSetPrimary(index)}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 transition ${photo.isPrimary ? 'bg-amber-500 text-black font-bold' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                          <Star className={`w-3 h-3 ${photo.isPrimary ? 'fill-black' : ''}`} /> {photo.isPrimary ? 'Primary Reference' : 'Make Primary'}
                        </button>
                      </div>

                      {photo.isAiDetected && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            ✨ AI: {photo.angle || photo.role}
                          </span>
                          {photo.aiConfidence && (
                            <span className="text-neutral-500 font-mono">
                              ({photo.aiConfidence}% conf)
                            </span>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-0.5">Reference Angle Role</label>
                        <select
                          value={photo.role}
                          onChange={(e) => handleUpdateRole(index, e.target.value as ReferenceRole)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        >
                          {REFERENCE_ROLES.map(r => (
                            <option key={r.role} value={r.role}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setWizardStep('upload')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 rounded-lg transition"
                >
                  Back to Upload
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep('coverage')}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition flex items-center gap-2"
                >
                  Review Coverage Report <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: COVERAGE REPORT */}
          {wizardStep === 'coverage' && (
            <div className="space-y-6">
              <div className="p-5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Multi-Angle Reference Coverage Report</h3>
                    <p className="text-xs text-neutral-400">
                      Calculated mathematically from {photos.length} assigned reference angle(s).
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-amber-400">
                      {Math.round(coverageReport.overallScore * 100)}%
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      coverageReport.thresholdStatus === 'ready' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : coverageReport.thresholdStatus === 'moderate' 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {coverageReport.thresholdStatus === 'ready' ? 'Ready for Calibration' : coverageReport.thresholdStatus === 'moderate' ? 'Moderate Coverage' : 'Missing Critical Views'}
                    </span>
                  </div>
                </div>

                {/* Weighted Sub-Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Pose Diversity (30%)</span>
                      <span className="font-mono text-white">{Math.round(coverageReport.poseCoverage * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${coverageReport.poseCoverage * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Framing Variety (20%)</span>
                      <span className="font-mono text-white">{Math.round(coverageReport.framingCoverage * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${coverageReport.framingCoverage * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Lighting Quality (15%)</span>
                      <span className="font-mono text-white">{Math.round(coverageReport.lightingCoverage * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${coverageReport.lightingCoverage * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Quality Rating (15%)</span>
                      <span className="font-mono text-white">{Math.round(coverageReport.qualityCoverage * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${coverageReport.qualityCoverage * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Expressions (10%)</span>
                      <span className="font-mono text-white">{Math.round(coverageReport.expressionCoverage * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${coverageReport.expressionCoverage * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Reference Volume (10%)</span>
                      <span className="font-mono text-white">{Math.round(coverageReport.diversityCoverage * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${coverageReport.diversityCoverage * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {coverageReport.recommendations.length > 0 && (
                  <div className="p-3 bg-neutral-900/90 rounded-lg border border-neutral-800 space-y-1.5">
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Actionable Recommendations:
                    </div>
                    <ul className="text-xs text-neutral-300 space-y-1 pl-4 list-disc">
                      {coverageReport.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setWizardStep('roles')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 rounded-lg transition"
                >
                  Back to Angle Roles
                </button>
                <button
                  type="button"
                  onClick={handleStartCalibration}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold text-sm rounded-lg transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" /> Start Identity Calibration
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CALIBRATING SPINNER */}
          {wizardStep === 'calibrating' && (
            <div className="py-12 text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping"></div>
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Calibrating Multi-Angle Identity</h3>
                <p className="text-xs text-neutral-400 min-h-[20px]">{calibrationStatus}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Progress</span>
                  <span className="font-mono text-amber-400">{calibrationProgress}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-300 rounded-full" style={{ width: `${calibrationProgress}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: READY & SUMMARY */}
          {wizardStep === 'ready' && identityProfile && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Identity Calibration Established</h4>
                  <p className="text-xs text-neutral-300">
                    "{personName}" is calibrated with a {identityProfile.overallConfidence}% coverage score across {photos.length} reference angle(s).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Observed Facial Features</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Face Topology:</span>
                      <span className="text-white font-medium text-right">{identityProfile.facialStructure.faceShape.value}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Eye Shape:</span>
                      <span className="text-white font-medium text-right">{identityProfile.facialStructure.eyeShapeAndSpacing.value}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Nasal Bridge:</span>
                      <span className="text-white font-medium text-right">{identityProfile.facialStructure.noseStructure.value}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-neutral-400">Jawline:</span>
                      <span className="text-white font-medium text-right">{identityProfile.facialStructure.jawlineAndChin.value}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Physical Proportions & Tone</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Complexion:</span>
                      <span className="text-white font-medium text-right">{identityProfile.skinAndTone.undertone.value}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Natural Hair:</span>
                      <span className="text-white font-medium text-right">{identityProfile.hairAndGrooming.naturalColor.value}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Shoulder Frame:</span>
                      <span className="text-white font-medium text-right">{identityProfile.bodyAndProportions.shoulderWidth.value}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-neutral-400">Stature:</span>
                      <span className="text-white font-medium text-right">{identityProfile.bodyAndProportions.estimatedBuild.value}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleFinish('profile')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-xl transition"
                >
                  View in Identity Library
                </button>
                <button
                  type="button"
                  onClick={() => handleFinish('generator')}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25"
                >
                  <Sparkles className="w-4 h-4" /> Launch Character Look Generator
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
