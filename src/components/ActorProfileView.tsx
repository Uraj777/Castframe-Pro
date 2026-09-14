import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  Check, 
  Trash2, 
  RefreshCw, 
  Star, 
  Eye, 
  Wand2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Camera, 
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  Bookmark,
  Share2,
  Filter
} from 'lucide-react';
import { 
  Actor, 
  ActorReference, 
  GeneratedLook, 
  ReferenceQuality, 
  ReferenceRole,
  EstablishmentStatus,
  IdentityProfile 
} from '../types';
import { 
  calculateReferenceCoverage, 
  buildCollectiveIdentityProfile,
  optimizeReferenceImage,
  classifyReferencesWithAi 
} from '../services/identityAnalyzer';

interface ActorProfileViewProps {
  actor: Actor;
  allLooks?: GeneratedLook[];
  onBack: () => void;
  onUpdateActor: (updatedActor: Actor) => void;
  onLaunchGenerator: (actorId: string, character?: string) => void;
  onInspectLook?: (look: GeneratedLook) => void;
  onOpenLightbox?: (imageUrl: string, title: string, subtitle?: string) => void;
}

export const ActorProfileView: React.FC<ActorProfileViewProps> = ({
  actor,
  allLooks = [],
  onBack,
  onUpdateActor,
  onLaunchGenerator,
  onInspectLook,
  onOpenLightbox = (_imageUrl?: string, _title?: string, _subtitle?: string) => {}
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'references' | 'looks' | 'casting' | 'notes'>('overview');
  const [isDragging, setIsDragging] = useState(false);
  const [notesText, setNotesText] = useState(actor.notes || '');
  const [notesSavedToast, setNotesSavedToast] = useState(false);
  const [isClassifyingAngles, setIsClassifyingAngles] = useState(false);
  const [classifyNotice, setClassifyNotice] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingRefId, setReplacingRefId] = useState<string | null>(null);

  // Compute or obtain real identity profile
  const profile: IdentityProfile = actor.identityProfile || buildCollectiveIdentityProfile(actor.name, actor.references);

  // Looks for this specific person
  const actorLooks = allLooks.filter((l) => l.actorId === actor.id);

  // Auto-detect angles with AI for all references
  const handleAutoClassifyAll = async () => {
    if (actor.references.length === 0 || isClassifyingAngles) return;
    setIsClassifyingAngles(true);
    setClassifyNotice(null);

    try {
      const classifications = await classifyReferencesWithAi(actor.references);
      const updatedRefs = actor.references.map((r, idx) => {
        const found = classifications.find(c => c.originalIndex === idx);
        if (found) {
          return {
            ...r,
            role: found.role,
            angle: found.angle,
            lighting: found.lighting,
            expression: found.expression,
            isAiDetected: true,
            aiConfidence: found.confidence,
            label: `${actor.name} — ${found.angle}`
          };
        }
        return r;
      });

      const updatedProfile = buildCollectiveIdentityProfile(actor.name, updatedRefs);
      const coverage = calculateReferenceCoverage(updatedRefs);
      onUpdateActor({
        ...actor,
        references: updatedRefs,
        identityProfile: updatedProfile,
        calibrationScore: Math.round(coverage.overallScore * 100),
        lastUpdated: 'Just now'
      });
      setClassifyNotice(`✨ AI identified angles across ${updatedRefs.length} reference photographs!`);
      setTimeout(() => setClassifyNotice(null), 5000);
    } catch (err) {
      console.warn('AI classification error:', err);
    } finally {
      setIsClassifyingAngles(false);
    }
  };

  // Handle uploaded files with casting resolution optimization
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = Math.max(0, 20 - actor.references.length);
    const filesArray = Array.from(files).slice(0, remaining);

    let newReferences: ActorReference[] = [...actor.references];

    for (let index = 0; index < filesArray.length; index++) {
      const file = filesArray[index];
      try {
        const dataUrl = await optimizeReferenceImage(file, 1024, 0.85);
        if (dataUrl) {
          const isFirst = newReferences.length === 0 && index === 0;
          const newRef: ActorReference = {
            id: `ref-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
            url: dataUrl,
            label: file.name.replace(/\.[^/.]+$/, "") || `Angle ${newReferences.length + 1}`,
            role: isFirst ? 'front_face' : 'three_quarter_right',
            quality: 'Excellent',
            isPrimary: isFirst,
            angle: 'Front / 3/4',
            lighting: 'Studio / Natural',
            uploadedAt: 'Just now',
            isAccepted: true
          };
          newReferences.push(newRef);
        }
      } catch (err) {
        console.warn('Reference image optimization error:', err);
      }
    }

    const updatedProfile = buildCollectiveIdentityProfile(actor.name, newReferences);
    const coverage = calculateReferenceCoverage(newReferences);
    const updatedActor: Actor = {
      ...actor,
      references: newReferences,
      identityProfile: updatedProfile,
      calibrationScore: Math.round(coverage.overallScore * 100),
      lastUpdated: 'Just now'
    };
    onUpdateActor(updatedActor);

    // Run auto classification on the updated set
    try {
      const classifications = await classifyReferencesWithAi(newReferences);
      const enrichedRefs = newReferences.map((r, idx) => {
        const found = classifications.find(c => c.originalIndex === idx);
        if (found) {
          return {
            ...r,
            role: found.role,
            angle: found.angle,
            lighting: found.lighting,
            expression: found.expression,
            isAiDetected: true,
            aiConfidence: found.confidence
          };
        }
        return r;
      });
      onUpdateActor({
        ...updatedActor,
        references: enrichedRefs,
        identityProfile: buildCollectiveIdentityProfile(actor.name, enrichedRefs),
        calibrationScore: Math.round(calculateReferenceCoverage(enrichedRefs).overallScore * 100)
      });
    } catch {
      // Non-blocking
    }
  };

  // Delete reference
  const handleDeleteReference = (refId: string) => {
    const updatedRefs = actor.references.filter((r) => r.id !== refId);
    let newPrimaryUrl = actor.portraitUrl;
    if (updatedRefs.length > 0 && !updatedRefs.some((r) => r.isPrimary)) {
      updatedRefs[0].isPrimary = true;
      newPrimaryUrl = updatedRefs[0].url;
    }
    const updatedProfile = buildCollectiveIdentityProfile(actor.name, updatedRefs);
    const coverage = calculateReferenceCoverage(updatedRefs);
    const updatedActor: Actor = {
      ...actor,
      portraitUrl: newPrimaryUrl,
      references: updatedRefs,
      identityProfile: updatedProfile,
      calibrationScore: Math.round(coverage.overallScore * 100),
      lastUpdated: 'Just now'
    };
    onUpdateActor(updatedActor);
  };

  // Set as primary reference
  const handleSetPrimary = (refId: string) => {
    const target = actor.references.find((r) => r.id === refId);
    if (!target) return;

    const updatedRefs = actor.references.map((r) => ({
      ...r,
      isPrimary: r.id === refId
    }));

    const updatedProfile = buildCollectiveIdentityProfile(actor.name, updatedRefs);
    const updatedActor: Actor = {
      ...actor,
      portraitUrl: target.url,
      references: updatedRefs,
      identityProfile: updatedProfile,
      lastUpdated: 'Just now'
    };
    onUpdateActor(updatedActor);
  };

  // Change role
  const handleChangeRole = (refId: string, role: ReferenceRole) => {
    const updatedRefs = actor.references.map((r) => {
      if (r.id === refId) {
        return {
          ...r,
          role
        };
      }
      return r;
    });

    const updatedProfile = buildCollectiveIdentityProfile(actor.name, updatedRefs);
    const coverage = calculateReferenceCoverage(updatedRefs);
    onUpdateActor({
      ...actor,
      references: updatedRefs,
      identityProfile: updatedProfile,
      calibrationScore: Math.round(coverage.overallScore * 100),
      lastUpdated: 'Just now'
    });
  };

  // Trigger replace
  const triggerReplace = (refId: string) => {
    setReplacingRefId(refId);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !replacingRefId) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updatedRefs = actor.references.map((r) => {
          if (r.id === replacingRefId) {
            return {
              ...r,
              url: dataUrl,
              label: file.name.replace(/\.[^/.]+$/, "") || r.label,
              uploadedAt: 'Replaced just now'
            };
          }
          return r;
        });

        const targetRef = updatedRefs.find((r) => r.id === replacingRefId);
        let updatedPortrait = actor.portraitUrl;
        if (targetRef?.isPrimary) {
          updatedPortrait = dataUrl;
        }

        const updatedProfile = buildCollectiveIdentityProfile(actor.name, updatedRefs);
        const coverage = calculateReferenceCoverage(updatedRefs);
        const updatedActor: Actor = {
          ...actor,
          portraitUrl: updatedPortrait,
          references: updatedRefs,
          identityProfile: updatedProfile,
          calibrationScore: Math.round(coverage.overallScore * 100),
          lastUpdated: 'Just now'
        };
        onUpdateActor(updatedActor);
      }
    };
    reader.readAsDataURL(file);
    setReplacingRefId(null);
  };

  // Reorder reference photographs
  const handleMoveReference = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= actor.references.length) return;

    const newRefs = [...actor.references];
    const [moved] = newRefs.splice(index, 1);
    newRefs.splice(targetIndex, 0, moved);

    const updatedProfile = buildCollectiveIdentityProfile(actor.name, newRefs);
    const coverage = calculateReferenceCoverage(newRefs);
    onUpdateActor({
      ...actor,
      references: newRefs,
      identityProfile: updatedProfile,
      calibrationScore: Math.round(coverage.overallScore * 100),
      lastUpdated: 'Just now'
    });
  };

  // Save notes
  const handleSaveNotes = () => {
    onUpdateActor({
      ...actor,
      notes: notesText,
      lastUpdated: 'Just now'
    });
    setNotesSavedToast(true);
    setTimeout(() => setNotesSavedToast(false), 2500);
  };

  // Helper badge for establishment status
  const renderStatusBadge = (status: EstablishmentStatus) => {
    switch (status) {
      case 'established':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Established
          </span>
        );
      case 'partially_established':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Sliders className="w-3 h-3" />
            Partially Established
          </span>
        );
      case 'not_established':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-zinc-500" />
            Not Established
          </span>
        );
    }
  };

  const primaryRef = actor.references.find(r => r.isPrimary) || actor.references[0];

  return (
    <div id="actor-profile-view" className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 pb-24">
      
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#8c98ad] hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#161a22]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to People Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onLaunchGenerator(actor.id)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all shadow-md"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate Character Look</span>
          </button>
        </div>
      </div>

      {/* Hero Header with Dominant Primary Photograph as Visual Focus */}
      <div className="rounded-2xl border border-[#212736] bg-[#121620] overflow-hidden shadow-2xl relative">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8">
          
          {/* Dominant Primary Photograph */}
          <div 
            onClick={() => onOpenLightbox(primaryRef?.url || actor.portraitUrl, actor.name, "Primary Reference Identity Calibration")}
            className="relative w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden bg-black/60 border-2 border-amber-500/50 shadow-2xl shrink-0 group cursor-pointer"
          >
            <img
              src={primaryRef?.url || actor.portraitUrl}
              alt={actor.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
            
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-black" />
              <span>PRIMARY REFERENCE</span>
            </div>

            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white text-xs opacity-90 group-hover:opacity-100">
              <span className="text-[11px] font-mono text-amber-300">Tap to inspect</span>
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Identity Information & Metrics */}
          <div className="flex-1 flex flex-col justify-between space-y-4 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30">
                  Visual Identity Profile
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Identity Confidence: {profile.overallConfidence}%
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {actor.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#8c9bb0] font-mono">
                <span>{actor.ageRange} yrs (Actual: {actor.actualAge})</span>
                <span>•</span>
                <span>{actor.height}</span>
                <span>•</span>
                <span>{actor.build} Build</span>
                <span>•</span>
                <span>{actor.nationality || 'Verified Artist'}</span>
              </div>

              <p className="text-xs text-[#8292a8] max-w-2xl leading-relaxed pt-1">
                {profile.aiSummary}
              </p>
            </div>

            {/* High-Level Identity Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#0c0f16] border border-[#1f2638] text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-[#738299] tracking-wider block">
                  Reference Count
                </span>
                <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                  {actor.references.length} <span className="text-xs font-normal text-[#65738a]">/ 20</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0f16] border border-[#1f2638] text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-[#738299] tracking-wider block">
                  Face Match Conf.
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                  {profile.faceMatchConfidence}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0f16] border border-[#1f2638] text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-[#738299] tracking-wider block">
                  Body Proportion
                </span>
                <span className={`text-xl font-bold font-mono mt-0.5 block ${profile.bodyProportionConfidence > 60 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {profile.bodyProportionConfidence}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0f16] border border-[#1f2638] text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-[#738299] tracking-wider block">
                  Angle Coverage
                </span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
                  {profile.referenceCoverage}%
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-[#1e2535] bg-[#0f131c] flex items-center gap-2 overflow-x-auto py-2">
          {[
            { id: 'overview', label: 'Identity Profile & Breakdown' },
            { id: 'references', label: `Reference Gallery (${actor.references.length})` },
            { id: 'looks', label: `Generated Looks (${actorLooks.length})` },
            { id: 'casting', label: 'Casting & Auditions' },
            { id: 'notes', label: 'Director Notes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-sm'
                  : 'text-[#8492a6] hover:text-white hover:bg-[#161a25] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & IDENTITY BREAKDOWN */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Section 1: Observable Facial Structure */}
          <div className="p-6 rounded-2xl bg-[#121620] border border-[#212736] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2536] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Facial Structure & Features</span>
                </h3>
                <p className="text-xs text-[#7e8d9f]">
                  Preserved across all generative viewpoints and lighting styles
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                Facial Lock: 99.4%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                profile.facialStructure.faceShape,
                profile.facialStructure.eyeShapeAndSpacing,
                profile.facialStructure.eyebrows,
                profile.facialStructure.noseStructure,
                profile.facialStructure.lipsAndMouth,
                profile.facialStructure.jawlineAndChin,
                profile.facialStructure.ears,
                profile.facialStructure.hairline
              ].map((feature, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0d1017] border border-[#1d2332] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#7d8ca1]">{feature.name}</span>
                    {renderStatusBadge(feature.status)}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {feature.value}
                  </div>
                  {feature.notes && (
                    <div className="text-[11px] text-[#637286] italic">
                      {feature.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Hair & Grooming + Skin & Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Hair & Grooming */}
            <div className="p-6 rounded-2xl bg-[#121620] border border-[#212736] space-y-4">
              <div className="border-b border-[#1f2536] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Hair & Facial Grooming</span>
                </h3>
                <p className="text-xs text-[#7e8d9f]">Natural pigmentation and follicle density</p>
              </div>

              <div className="space-y-3">
                {[
                  profile.hairAndGrooming.style,
                  profile.hairAndGrooming.texture,
                  profile.hairAndGrooming.naturalColor,
                  profile.hairAndGrooming.facialHair
                ].map((feature, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0d1017] border border-[#1d2332] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#7d8ca1]">{feature.name}</span>
                      {renderStatusBadge(feature.status)}
                    </div>
                    <div className="text-xs font-semibold text-white">{feature.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skin Tone & Melanin */}
            <div className="p-6 rounded-2xl bg-[#121620] border border-[#212736] space-y-4">
              <div className="border-b border-[#1f2536] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Skin Tone & Undertone Calibration</span>
                </h3>
                <p className="text-xs text-[#7e8d9f]">Melanin profile under varied Kelvin lighting</p>
              </div>

              <div className="space-y-3">
                {[
                  profile.skinAndTone.undertone,
                  profile.skinAndTone.complexion,
                  profile.skinAndTone.frecklesAndPores,
                  profile.distinctiveFeatures.marksScarsTattoos
                ].map((feature, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0d1017] border border-[#1d2332] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#7d8ca1]">{feature.name}</span>
                      {renderStatusBadge(feature.status)}
                    </div>
                    <div className="text-xs font-semibold text-white">{feature.value}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section 3: Body & Proportions */}
          <div className="p-6 rounded-2xl bg-[#121620] border border-[#212736] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2536] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Body Proportions & Anatomical Build</span>
                </h3>
                <p className="text-xs text-[#7e8d9f]">
                  Strict reference verification: unseen regions are clearly marked as Not Established
                </p>
              </div>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                profile.bodyProportionConfidence > 60 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' 
                  : 'text-amber-300 bg-amber-500/10 border-amber-500/25'
              }`}>
                {profile.bodyProportionConfidence > 60 ? 'Full Anatomical Fit' : 'Requires Full Body Reference'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                profile.bodyAndProportions.shoulderWidth,
                profile.bodyAndProportions.neckTorso,
                profile.bodyAndProportions.musculature,
                profile.bodyAndProportions.limbProportions,
                profile.bodyAndProportions.estimatedBuild
              ].map((feature, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0d1017] border border-[#1d2332] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7d8ca1]">{feature.name}</span>
                    {renderStatusBadge(feature.status)}
                  </div>
                  <div className="text-xs font-semibold text-white">{feature.value}</div>
                  {feature.notes && (
                    <div className="text-[10px] text-[#637286] italic">{feature.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: REFERENCE GALLERY (1-20 Photos Management) */}
      {activeTab === 'references' && (
        <div className="space-y-6">
          
          {/* Upload Dropzone Bar */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-amber-400 bg-amber-500/10' 
                : 'border-[#232b3c] hover:border-amber-500/50 bg-[#121620]'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#1b212f] border border-[#263044] flex items-center justify-center mx-auto text-amber-400 mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              Add Reference Photographs ({actor.references.length} / 20)
            </h4>
            <p className="text-xs text-[#76849b] mt-0.5">
              Drag & drop or click to upload portraits, full-body shots, side profiles, or expressions
            </p>
          </div>

          {/* Reference Cards Grid */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#7e8d9f]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                  Reference Photographs ({actor.references.length})
                </span>
                <span className="text-[#627083] hidden sm:inline">• Multi-angle biometric calibration</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoClassifyAll}
                  disabled={isClassifyingAngles || actor.references.length === 0}
                  className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isClassifyingAngles ? 'animate-spin' : ''}`} />
                  {isClassifyingAngles ? 'AI Analyzing Angles...' : 'Auto-Detect Angles (AI)'}
                </button>
              </div>
            </div>

            {classifyNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{classifyNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {actor.references.map((ref, index) => (
                <div
                  key={ref.id}
                  className={`rounded-xl border overflow-hidden bg-[#121620] flex flex-col transition-all group ${
                    ref.isPrimary 
                      ? 'border-amber-400 ring-2 ring-amber-500/30' 
                      : 'border-[#212738] hover:border-[#354157]'
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[3/4] w-full bg-black/50 overflow-hidden">
                    <img
                      src={ref.url}
                      alt={ref.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Primary Badge */}
                    {ref.isPrimary && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-black" />
                        <span>PRIMARY</span>
                      </div>
                    )}

                    {/* Quick hover actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => onOpenLightbox(ref.url, `${actor.name} - ${ref.label}`, ref.designation)}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white text-xs"
                          title="View Full Resolution"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReference(ref.id)}
                          className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-xs"
                          title="Delete reference"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {!ref.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(ref.id)}
                            className="w-full py-1.5 bg-amber-500/90 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors"
                          >
                            Set as Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => triggerReplace(ref.id)}
                          className="w-full py-1 bg-[#1e2638] hover:bg-[#28334b] text-white text-[11px] font-medium rounded-lg transition-colors"
                        >
                          Replace Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata & Role Controls */}
                  <div className="p-3 space-y-2 bg-[#0e121a] border-t border-[#1d2332]">
                    {ref.isAiDetected && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                          ✨ AI: {ref.angle || ref.role}
                        </span>
                        {ref.aiConfidence && (
                          <span className="text-neutral-500">
                            {ref.aiConfidence}%
                          </span>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#717e92] uppercase font-mono tracking-wider">
                        Angle / Feature Role
                      </label>
                      <select
                        value={ref.role || 'front_face'}
                        onChange={(e) => handleChangeRole(ref.id, e.target.value as ReferenceRole)}
                        className="w-full text-xs bg-[#161c28] border border-[#273245] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-amber-400 font-mono"
                      >
                        <option value="front_face">Front Face (0°)</option>
                        <option value="three_quarter_left">3/4 Left (45°)</option>
                        <option value="three_quarter_right">3/4 Right (45°)</option>
                        <option value="profile_left">Left Profile (90°)</option>
                        <option value="profile_right">Right Profile (90°)</option>
                        <option value="full_body_front">Full Body Front</option>
                        <option value="full_body_three_quarter">Full Body 3/4</option>
                        <option value="full_body_back">Full Body Back / Rear (180°)</option>
                        <option value="upper_body">Upper Body</option>
                        <option value="detail_feature">Detail / Specific Feature</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#637286] pt-1">
                      <span className="truncate">{ref.label}</span>
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveReference(index, 'up')}
                            className="p-1 hover:text-white"
                            title="Move left"
                          >
                            ←
                          </button>
                        )}
                        {index < actor.references.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveReference(index, 'down')}
                            className="p-1 hover:text-white"
                            title="Move right"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: GENERATED LOOKS */}
      {activeTab === 'looks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Generated Character Looks ({actorLooks.length})
              </h3>
              <p className="text-xs text-[#7e8d9f]">
                Visualizations rendered maintaining {actor.name}’s calibrated identity
              </p>
            </div>

            <button
              onClick={() => onLaunchGenerator(actor.id)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>New Character Look</span>
            </button>
          </div>

          {actorLooks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#121620] border border-[#212736] space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto" />
              <h4 className="text-sm font-semibold text-white">No Character Looks Yet</h4>
              <p className="text-xs text-[#717e92] max-w-sm mx-auto">
                Generate this person in different characters, armors, historical eras, and lighting setups while preserving their exact face.
              </p>
              <button
                onClick={() => onLaunchGenerator(actor.id)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate First Look</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {actorLooks.map((look, idx) => (
                <div
                  key={`${look.id || 'look'}-${idx}`}
                  onClick={() => onInspectLook ? onInspectLook(look) : onOpenLightbox(look.imageUrl, look.lookName, look.character)}
                  className="rounded-xl border border-[#212738] bg-[#121620] overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all shadow-lg"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                    <img 
                      src={look.imageUrl} 
                      alt={look.lookName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141824]/90 text-amber-300 border border-amber-500/30">
                      {look.character}
                    </div>

                    <div className="absolute bottom-2.5 inset-x-2.5 space-y-0.5">
                      <div className="text-xs font-bold text-white truncate">{look.lookName}</div>
                      <div className="text-[10px] text-[#8c9bb0] font-mono">{look.config.visualStyle} • {look.config.lighting}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CASTING & AUDITIONS */}
      {activeTab === 'casting' && (
        <div className="p-6 rounded-2xl bg-[#121620] border border-[#212736] space-y-4">
          <div className="border-b border-[#1f2536] pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Casting Profile & Screen Tests</h3>
              <p className="text-xs text-[#7e8d9f]">Character candidate evaluations and shortlist status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {['Brand Ambassador', 'Campaign Lead', 'Editorial Hero'].map((role, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0d1017] border border-[#1d2332] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{role}</span>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    Shortlisted
                  </span>
                </div>
                <p className="text-xs text-[#78889c]">
                  High visual likeness and commanding posture. Recommended for Day 12 battle look test.
                </p>
                <button
                  onClick={() => onLaunchGenerator(actor.id, role.split(' ')[0])}
                  className="w-full py-1.5 text-xs font-semibold bg-[#171d2b] hover:bg-amber-500 hover:text-black text-amber-300 rounded-lg transition-all"
                >
                  Generate {role.split(' ')[0]} Look
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DIRECTOR NOTES */}
      {activeTab === 'notes' && (
        <div className="p-6 rounded-2xl bg-[#121620] border border-[#212736] space-y-4">
          <div className="border-b border-[#1f2536] pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Director & Casting Notes</h3>
              <p className="text-xs text-[#7e8d9f]">Observations, camera testing notes, and costume feedback</p>
            </div>

            {notesSavedToast && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={8}
            placeholder="Add specific notes about screen presence, voice, costume fit, and character compatibility..."
            className="w-full p-4 rounded-xl bg-[#0c0f16] border border-[#232b3c] text-sm text-white focus:outline-none focus:border-amber-400"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-sm"
            >
              Save Notes
            </button>
          </div>
        </div>
      )}

      {/* Floating Sticky Bottom Bar for instant generation */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#121622]/95 backdrop-blur-md border border-[#273247] rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4">
        <div className="flex items-center gap-2 pr-2 border-r border-[#263145]">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white font-mono">{actor.name}</span>
          <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded-full">
            {profile.overallConfidence}%
          </span>
        </div>

        <button
          onClick={() => onLaunchGenerator(actor.id)}
          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-full transition-all shadow-md flex items-center gap-1.5"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Generate Character Look</span>
        </button>
      </div>

    </div>
  );
};
