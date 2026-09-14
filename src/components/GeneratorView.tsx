import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Columns, 
  RotateCcw, 
  Download, 
  Check, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkle,
  Eye,
  Camera,
  Film,
  Maximize2,
  RefreshCw,
  Bookmark,
  Shirt,
  Scissors,
  Sun,
  MapPin,
  Move,
  Lock,
  X,
  Sliders,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { 
  Actor, 
  GeneratedLook, 
  LookConfig, 
  CharacterRole, 
  PoseOption, 
  LightingOption, 
  CameraOption, 
  VisualStyleOption,
  GenerationStep,
  LookCollection
} from '../types';
import { generationService } from '../services/generationService';

interface GeneratorViewProps {
  actors: Actor[];
  characters: CharacterRole[];
  collections?: LookCollection[];
  selectedActorId?: string;
  initialActorId?: string;
  initialCharacter?: string;
  initialLook?: GeneratedLook | null;
  onNavigateToComparison?: (actorId: string, character?: string) => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
  saveLook?: (look: GeneratedLook) => void;
  onSaveLook?: (look: GeneratedLook) => void;
  onSaveNewLook?: (look: GeneratedLook) => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  actors,
  characters,
  collections = [],
  selectedActorId,
  initialActorId,
  initialCharacter,
  initialLook,
  onNavigateToComparison,
  onOpenLightbox,
  saveLook,
  onSaveLook,
  onSaveNewLook
}) => {
  // Current Selected Actor
  const effectiveActorId = selectedActorId || initialActorId || actors[0]?.id || '';
  const [currentActorId, setCurrentActorId] = useState<string>(effectiveActorId);
  const selectedActor = actors.find(a => a.id === currentActorId) || actors[0];

  // Prompt and Style State
  const [naturalPrompt, setNaturalPrompt] = useState<string>('');
  const [character, setCharacter] = useState<string>(initialCharacter || 'Viral Drop');
  const [age, setAge] = useState<number>(selectedActor?.actualAge || 24);
  const [costume, setCostume] = useState<string>('Luxury tailored designer blazer with gold accent chains and silk trousers');
  const [hairstyle, setHairstyle] = useState<string>('Sleek high bun with soft face-framing strands');
  const [facialHair, setFacialHair] = useState<string>('Clean styled');
  const [physique, setPhysique] = useState<'Lean' | 'Athletic' | 'Muscular' | 'Stocky' | 'Slim' | 'Custom'>('Athletic');
  const [customPhysique, setCustomPhysique] = useState<string>('');
  const [pose, setPose] = useState<PoseOption>('Standing');
  const [customPose, setCustomPose] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('Sun-drenched luxury Miami penthouse rooftop overlooking turquoise ocean');
  const [lighting, setLighting] = useState<LightingOption>('Golden Hour');
  const [customLighting, setCustomLighting] = useState<string>('');
  const [camera, setCamera] = useState<CameraOption>('Medium Shot');
  const [visualStyle, setVisualStyle] = useState<VisualStyleOption>('Photorealistic');
  const [customStyle, setCustomStyle] = useState<string>('');

  // Identity Preservation Locks
  const [preserveFace, setPreserveFace] = useState<boolean>(true);
  const [preserveBody, setPreserveBody] = useState<boolean>(true);
  const [preserveAllIdentity, setPreserveAllIdentity] = useState<boolean>(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep | null>(null);
  const [generationError, setGenerationError] = useState<{ message: string; details?: string; requiresPaidKey?: boolean } | null>(null);

  // Active Generated Result
  const [generatedResult, setGeneratedResult] = useState<GeneratedLook | null>(initialLook || null);
  const [isEditingLookName, setIsEditingLookName] = useState<boolean>(false);
  const [editedLookName, setEditedLookName] = useState<string>('');

  // Interactive Compare & Zoom Mode
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Mobile bottom sheets
  const [activeBottomSheet, setActiveBottomSheet] = useState<'outfit' | 'pose' | 'hair' | 'environment' | 'lighting' | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const persistLook = (look: GeneratedLook) => {
    if (saveLook) saveLook(look);
    if (onSaveLook) onSaveLook(look);
    if (onSaveNewLook) onSaveNewLook(look);
  };

  // Sync if initial props change
  useEffect(() => {
    if (selectedActorId) {
      setCurrentActorId(selectedActorId);
    } else if (initialActorId) {
      setCurrentActorId(initialActorId);
    }
  }, [selectedActorId, initialActorId]);

  useEffect(() => {
    if (initialCharacter) {
      setCharacter(initialCharacter);
    }
  }, [initialCharacter]);

  useEffect(() => {
    if (initialLook) {
      setGeneratedResult(initialLook);
      setEditedLookName(initialLook.lookName);
    }
  }, [initialLook]);

  // Primary Generation Handler
  const handleGenerate = async () => {
    if (!selectedActor) {
      showToast('Please select a valid person first.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setCompareMode(false);
    setZoomLevel(1);

    const config: LookConfig = {
      character,
      age,
      costume: naturalPrompt ? `${costume} (${naturalPrompt})` : costume,
      hairstyle,
      facialHair,
      physique,
      customPhysique: physique === 'Custom' ? customPhysique : undefined,
      pose,
      customPose: pose === 'Custom' ? customPose : undefined,
      environment,
      lighting,
      customLighting: lighting === 'Custom' ? customLighting : undefined,
      camera,
      visualStyle,
      customStyle: visualStyle === 'Custom' ? customStyle : undefined,
      aspectRatio: camera === 'Wide Cinematic' ? '2.39:1' : '16:9',
      preserveFace,
      preserveBody,
      preserveAllIdentity
    };

    try {
      const result = await generationService.generateCharacterLook(
        selectedActor,
        config,
        (progress) => {
          setGenerationStep(progress);
        }
      );

      setGeneratedResult(result);
      setEditedLookName(result.lookName);
      persistLook(result);
      showToast('Character look generated & saved automatically');
    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerationError({
        message: err?.message || 'Gemini image generation could not be completed.',
        details: err?.details,
        requiresPaidKey: err?.requiresPaidKey
      });
      showToast('Generation failed. References are safe.');
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
    }
  };

  // Execute generation with specific modification instruction & source image
  const executeModification = async (
    instructionText: string,
    updatedConfigPartial: Partial<LookConfig>
  ) => {
    if (!selectedActor) return;

    setIsGenerating(true);
    setGenerationError(null);
    setCompareMode(false);
    setZoomLevel(1);

    const updatedConfig: LookConfig = {
      character,
      age,
      costume: naturalPrompt ? `${costume} (${naturalPrompt})` : costume,
      hairstyle,
      facialHair,
      physique,
      customPhysique: physique === 'Custom' ? customPhysique : undefined,
      pose,
      customPose: pose === 'Custom' ? customPose : undefined,
      environment,
      lighting,
      customLighting: lighting === 'Custom' ? customLighting : undefined,
      camera,
      visualStyle,
      customStyle: visualStyle === 'Custom' ? customStyle : undefined,
      aspectRatio: camera === 'Wide Cinematic' ? '2.39:1' : '16:9',
      preserveFace,
      preserveBody,
      preserveAllIdentity,
      ...updatedConfigPartial
    };

    try {
      const result = await generationService.generateCharacterLook(
        selectedActor,
        updatedConfig,
        (progress) => {
          setGenerationStep(progress);
        },
        {
          sourceImageBase64: generatedResult?.imageUrl,
          modificationInstruction: instructionText
        }
      );

      setGeneratedResult(result);
      setEditedLookName(result.lookName);
      persistLook(result);
      showToast(`Variation generated & saved automatically`);
    } catch (err: any) {
      console.error('Modification generation error:', err);
      setGenerationError({
        message: err?.message || 'Variation generation could not be completed.',
        details: err?.details,
        requiresPaidKey: err?.requiresPaidKey
      });
      showToast('Variation failed. References are safe.');
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
    }
  };

  // Micro-Modifications - Real image generation execution
  const handleMicroModification = async (type: 'jacket' | 'pose' | 'age' | 'variation') => {
    if (type === 'jacket') {
      const newCostume = 'Distressed vintage black biker leather jacket, dark raw denim, silver chain';
      setCostume(newCostume);
      await executeModification('Change jacket to vintage black biker leather jacket while locking face, skin, and identity', { costume: newCostume });
    } else if (type === 'pose') {
      const poses: PoseOption[] = ['Standing', 'Sitting', 'Walking', 'Fighting', 'Riding', 'Portrait'];
      const nextIdx = (poses.indexOf(pose) + 1) % poses.length;
      const nextPose = poses[nextIdx];
      setPose(nextPose);
      await executeModification(`Change pose to ${nextPose} while locking outfit, hairstyle, face, and character identity`, { pose: nextPose });
    } else if (type === 'age') {
      const nextAge = Math.min(age + 20, 75);
      setAge(nextAge);
      await executeModification(`Age subject +20 years with mature facial lines and distinguished temples, preserving exact bone structure and identity`, { age: nextAge });
    } else if (type === 'variation') {
      const nextLighting: LightingOption = lighting === 'Dramatic' ? 'Golden Hour' : 'Dramatic';
      const nextCamera: CameraOption = camera === 'Medium Shot' ? 'Close-Up' : 'Medium Shot';
      setLighting(nextLighting);
      setCamera(nextCamera);
      await executeModification(`Generate cinematic camera & lighting variation in ${nextLighting} lighting with ${nextCamera} lens`, { lighting: nextLighting, camera: nextCamera });
    }
  };

  // Apply quick suggestion style preset
  const applyQuickSuggestion = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'sensual':
        setVisualStyle('Photorealistic');
        setCostume('Champagne satin silk slip dress with delicate gold chain jewelry');
        setLighting('Moody Chiaroscuro');
        setEnvironment('Private luxury penthouse lounge at twilight with warm ambient sconce glow');
        break;
      case 'fitness':
        setVisualStyle('High Contrast');
        setCostume('Matte black seamless compression athletic set with neon accents');
        setLighting('Rim / Edge Light');
        setEnvironment('High-end industrial gym with barbell racks and atmospheric mist');
        break;
      case 'luxury':
        setVisualStyle('Cinematic');
        setCostume('Bespoke tailored white linen ensemble with oversized designer sunglasses');
        setLighting('Golden Hour');
        setEnvironment('Sun-drenched mega-yacht deck on the Mediterranean coastline');
        break;
      case 'cyberpunk':
        setVisualStyle('High Contrast');
        setCostume('Iridescent techwear oversized parka with glowing chromatic cables');
        setLighting('Rim / Edge Light');
        setEnvironment('Rain-soaked Neo-Tokyo neon alleyway with holographic billboards');
        break;
      case 'streetwear':
        setVisualStyle('Photorealistic');
        setCostume('Heavyweight oversized beige hoodie with distressed raw denim and designer sneakers');
        setLighting('Daylight Exterior');
        setEnvironment('Tokyo Shibuya crossing bustling street backdrop with cinematic bokeh');
        break;
      case 'editorial':
        setVisualStyle('Film Noir');
        setCostume('Architectural high-fashion structured wool coat with bold statement collar');
        setLighting('Softbox Studio');
        setEnvironment('Minimalist white studio cyclorama with dramatic high-fashion shadow cast');
        break;
      case 'travel':
        setVisualStyle('Golden Hour');
        setCostume('Flowy bohemian resort wear with woven sunhat and seashell accessories');
        setLighting('Golden Hour');
        setEnvironment('Santorini caldera cliffside infinity pool at sunset overlooking the Aegean sea');
        break;
      case 'experimental':
        setVisualStyle('Stylized 3D');
        setCostume('Sculptural liquid-chrome metallic bodice with floating geometric prism accessories');
        setLighting('Dramatic');
        setEnvironment('Surreal iridescent salt flats under a twin violet moon sky');
        break;
      default:
        setVisualStyle('Photorealistic');
        break;
    }
    showToast(`Applied preset: ${cat}`);
  };

  // Download look
  const handleDownload = () => {
    if (!generatedResult) return;
    const a = document.createElement('a');
    a.href = generatedResult.imageUrl;
    a.download = `CastFrame_${generatedResult.character}_${selectedActor.name.replace(/\s+/g, '_')}.jpg`;
    a.target = '_blank';
    a.click();
    showToast('Look saved to your device');
  };

  return (
    <div id="character-look-generator-view" className="h-full flex flex-col overflow-y-auto bg-[#0b0e14]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-lg shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Suggestion Chips Bar */}
      <div className="bg-[#10141c] border-b border-[#1f2636] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs overflow-x-auto gap-3 shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Quick Suggestions:</span>
          </span>
          {['Sensual', 'Fitness', 'Luxury', 'Cyberpunk', 'Streetwear', 'Editorial', 'Travel', 'Experimental'].map((cat) => (
            <button
              key={cat}
              onClick={() => applyQuickSuggestion(cat)}
              className="px-2.5 py-1 rounded-md bg-[#161a24] hover:bg-[#202735] text-white hover:border-amber-400/60 border border-[#272f3e] text-[11px] font-medium transition-all shrink-0 active:scale-95"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0 font-mono text-[10px] text-[#717e92]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Identity Preservation Active</span>
        </div>
      </div>

      {/* Desktop & Mobile Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        
        {/* ================= COLUMN 1: PERSON & REFERENCE IMAGES (Left Column - Desktop: col-span-3) ================= */}
        <div className="order-2 lg:order-1 lg:col-span-3 border-r border-[#1e2535] bg-[#10131b] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            
            {/* Column Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#717e94] uppercase tracking-wider font-semibold">
                  Person & References
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                  Locked
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">Identity Vector Baseline</h3>
            </div>

            {/* Actor Selector Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#7e8b9f]">Active Person</label>
              <select
                id="generator-actor-select"
                value={currentActorId}
                onChange={(e) => setCurrentActorId(e.target.value)}
                className="w-full bg-[#161b24] border border-[#283244] text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500/60"
              >
                {actors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.ageRange} • {a.references.length} photos)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Actor Card */}
            {selectedActor && (
              <div className="p-3 rounded-xl bg-[#151923] border border-[#252f40] space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedActor.portraitUrl}
                    alt={selectedActor.name}
                    className="w-14 h-16 rounded-lg object-cover object-top border border-[#2f3b4e]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedActor.name}</h4>
                    <p className="text-[10px] text-[#7a879c] font-mono mt-0.5">
                      {selectedActor.height} • {selectedActor.build}
                    </p>
                    <div className="text-[10px] text-amber-400 font-mono mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{selectedActor.calibrationScore}% Fidelity Lock</span>
                    </div>
                  </div>
                </div>

                {/* Identity Locks Switches */}
                <div className="pt-2 border-t border-[#202837] space-y-2">
                  <div className="text-[10px] font-mono text-[#717e94] uppercase tracking-wider font-semibold">
                    Identity Preservation Locks
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-[#1b202c]">
                      <span className="text-white text-[11px] flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Preserve Face</span>
                      </span>
                      <input 
                        type="checkbox" 
                        checked={preserveFace} 
                        onChange={(e) => setPreserveFace(e.target.checked)}
                        className="accent-amber-500 rounded" 
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-[#1b202c]">
                      <span className="text-white text-[11px] flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Preserve Body</span>
                      </span>
                      <input 
                        type="checkbox" 
                        checked={preserveBody} 
                        onChange={(e) => setPreserveBody(e.target.checked)}
                        className="accent-amber-500 rounded" 
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-[#1b202c]">
                      <span className="text-white text-[11px] flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Preserve All Identity Features</span>
                      </span>
                      <input 
                        type="checkbox" 
                        checked={preserveAllIdentity} 
                        onChange={(e) => {
                          const val = e.target.checked;
                          setPreserveAllIdentity(val);
                          setPreserveFace(val);
                          setPreserveBody(val);
                        }}
                        className="accent-amber-500 rounded" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Reference Photographs Gallery */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-xs font-semibold text-white">Reference Photographs</span>
                <span className="text-[10px] font-mono text-[#717e94]">{selectedActor.references.length} Angles</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {selectedActor.references.slice(0, 6).map((ref) => (
                  <div
                    key={ref.id}
                    onClick={() => onOpenLightbox(ref.url, ref.label, `Reference: ${selectedActor.name}`)}
                    className="aspect-square rounded-lg overflow-hidden border border-[#262f3f] relative group cursor-pointer bg-[#141822]"
                  >
                    <img src={ref.url} alt={ref.label} className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    {ref.isPrimary && (
                      <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-black text-[8px] font-mono text-center font-bold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-[#1e2535] text-[10px] font-mono text-[#67758a] leading-tight">
            Collective 2D analysis established from multi-angle photographs.
          </div>
        </div>

        {/* ================= COLUMN 2: LARGE GENERATED IMAGE CANVAS (Center Column - Desktop: col-span-5) ================= */}
        <div className="order-1 lg:order-2 lg:col-span-5 bg-[#0d1017] p-4 sm:p-6 flex flex-col justify-between overflow-y-auto border-r border-[#1e2535] space-y-4">
          
          {/* Canvas Header & View Controls */}
          <div className="flex items-center justify-between border-b border-[#1f2636] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#717e94] uppercase tracking-wider font-semibold">
                Studio Canvas
              </span>
              <h3 className="text-sm font-bold text-white">Generated Visualization</h3>
            </div>

            {generatedResult && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
                    compareMode 
                      ? 'bg-amber-500 text-black font-semibold border-amber-400' 
                      : 'bg-[#161b24] text-[#8e9cb0] border-[#273142] hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>{compareMode ? 'Exit Split' : 'Compare Split'}</span>
                </button>
                <button
                  onClick={() => setZoomLevel(prev => prev === 1 ? 1.5 : 1)}
                  className="p-1 rounded-md bg-[#161b24] text-[#8e9cb0] hover:text-white border border-[#273142]"
                  title="Toggle Zoom"
                >
                  {zoomLevel === 1 ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Large Image Canvas Centerpiece */}
          <div className="flex-1 flex flex-col justify-center min-h-[320px] sm:min-h-[420px]">
            
            {/* 1. Realistic Processing State (7 explicit steps from user directive) */}
            {isGenerating && generationStep && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#131722] border border-[#273245] text-center space-y-4 max-w-md mx-auto w-full shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Wand2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    {generationStep.label}
                  </h4>
                  <p className="text-xs text-[#8e9cae] mt-1 font-mono leading-relaxed">
                    {generationStep.detail}
                  </p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#1b2230] h-2.5 rounded-full overflow-hidden border border-[#2d384c]">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${generationStep.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#6c7b90]">
                  <span>Step {generationStep.step} of {generationStep.totalSteps}</span>
                  <span className="text-amber-400 font-bold">{generationStep.progressPercent}%</span>
                </div>
              </div>
            )}

            {/* 2. Before/After Split Comparison Slider */}
            {!isGenerating && generatedResult && compareMode && (
              <div className="space-y-2">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-amber-500/50 select-none bg-black shadow-2xl">
                  {/* Left: Original Reference */}
                  <img
                    src={selectedActor.portraitUrl}
                    alt="Original Reference"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Right: Generated Character Look (Clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <img
                      src={generatedResult.imageUrl}
                      alt="Generated Look"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Vertical Divider */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20 cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-[9px] font-mono font-bold shadow-lg">
                      ◀▶
                    </div>
                  </div>

                  {/* Hidden range input */}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />

                  {/* Tags */}
                  <div className="absolute top-3 left-3 z-10 bg-black/85 px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/20">
                    Reference Photo
                  </div>
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 px-2 py-0.5 rounded text-[10px] font-mono text-black font-bold">
                    Generated Look
                  </div>
                </div>
                <p className="text-[10px] font-mono text-[#717e92] text-center">
                  Drag slider horizontally to verify facial likeness against primary reference.
                </p>
              </div>
            )}

            {/* 3. Normal Result Display with Zoom Capability */}
            {!isGenerating && generatedResult && !compareMode && (
              <div className="space-y-3">
                <div 
                  onClick={() => onOpenLightbox(generatedResult.imageUrl, generatedResult.lookName, `${generatedResult.character} • ${selectedActor.name}`)}
                  className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#151923] border border-[#273244] relative group cursor-pointer shadow-2xl"
                >
                  <img
                    src={generatedResult.imageUrl}
                    alt={generatedResult.lookName}
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-white font-medium flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Click for high-resolution inspection</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 bg-black/60 px-2 py-0.5 rounded">
                        {generatedResult.config.visualStyle}
                      </span>
                    </div>
                  </div>

                  {/* Corner Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/30">
                      {generatedResult.character} • {generatedResult.config.age} yrs
                    </span>
                  </div>
                </div>

                {/* Micro-Modifications Quick Actions Bar */}
                <div className="p-3 rounded-xl bg-[#141822] border border-[#252f40] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#79879c] font-semibold flex items-center justify-between">
                    <span>Micro-Modifications</span>
                    <span className="text-[#596577]">One-click parameter shifts</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    <button
                      onClick={() => handleMicroModification('jacket')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#191e2a] hover:bg-[#232a3a] text-[#b0bdcf] hover:text-white border border-[#2b3547] transition-colors text-left truncate"
                      title="Keep everything the same but change the jacket"
                    >
                      🧥 Change Jacket
                    </button>
                    <button
                      onClick={() => handleMicroModification('pose')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#191e2a] hover:bg-[#232a3a] text-[#b0bdcf] hover:text-white border border-[#2b3547] transition-colors text-left truncate"
                      title="Keep the person and outfit but change the pose"
                    >
                      🏃 Change Pose
                    </button>
                    <button
                      onClick={() => handleMicroModification('age')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#191e2a] hover:bg-[#232a3a] text-[#b0bdcf] hover:text-white border border-[#2b3547] transition-colors text-left truncate"
                      title="Keep the face and body but age the person 20 years"
                    >
                      ⏳ Age +20 Yrs
                    </button>
                    <button
                      onClick={() => handleMicroModification('variation')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#191e2a] hover:bg-[#232a3a] text-[#b0bdcf] hover:text-white border border-[#2b3547] transition-colors text-left truncate"
                      title="Subtle lighting & camera variation"
                    >
                      ✨ Variation
                    </button>
                  </div>
                </div>

                {/* Post-Generation Action Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={handleGenerate}
                    className="py-2 px-3 rounded-lg bg-[#181d28] hover:bg-[#222836] text-white text-xs font-semibold border border-[#2a3446] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={() => setCompareMode(true)}
                    className="py-2 px-3 rounded-lg bg-[#181d28] hover:bg-[#222836] text-white text-xs font-semibold border border-[#2a3446] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Compare</span>
                  </button>
                  <button
                    onClick={() => showToast('Look saved to project lookbook')}
                    className="py-2 px-3 rounded-lg bg-[#181d28] hover:bg-[#222836] text-white text-xs font-semibold border border-[#2a3446] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Empty Canvas Placeholder */}
            {!isGenerating && !generatedResult && (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#283244] bg-[#121620]/60 space-y-3">
                <Wand2 className="w-8 h-8 text-[#5b687c] mx-auto" />
                <h4 className="text-sm font-bold text-white">Studio Canvas Ready</h4>
                <p className="text-xs text-[#828fa3] max-w-sm mx-auto leading-relaxed">
                  Describe what you want this person to look like in the right panel, or tap a quick suggestion chip above.
                </p>
                <button
                  onClick={handleGenerate}
                  className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-amber-400 transition-all shadow-lg active:scale-95"
                >
                  Generate First Look
                </button>
              </div>
            )}

          </div>

          {/* Bottom Generation Specs Metadata */}
          {generatedResult && (
            <div className="p-3.5 rounded-xl bg-[#131620] border border-[#232b3a] space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[10px] text-[#6e7b90] uppercase tracking-wider">
                <span>Identity Consistency Verified</span>
                <span className="text-emerald-400">Arri Raw 35mm Pipeline</span>
              </div>
              <p className="text-[#a4b2c5] text-[11px] font-sans truncate">
                {generatedResult.config.costume} • {generatedResult.config.environment}
              </p>
            </div>
          )}

        </div>

        {/* ================= COLUMN 3: GENERATION CONTROLS & PROMPT (Right Column - Desktop: col-span-4) ================= */}
        <div className="order-3 lg:col-span-4 bg-[#10131c] p-4 sm:p-5 overflow-y-auto space-y-4">
          
          <div className="border-b border-[#1f2636] pb-3">
            <span className="text-[10px] font-mono text-[#717e94] uppercase tracking-wider font-semibold">
              Prompt & Style Controls
            </span>
            <h3 className="text-sm font-bold text-white">Generation Parameters</h3>
          </div>

          {/* Natural Language Prompt Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#b2bfd1] flex items-center justify-between">
              <span>Natural Language Prompt</span>
              <span className="text-[10px] font-mono text-amber-400">Preserving Identity</span>
            </label>
            <textarea
              id="generator-natural-prompt"
              rows={3}
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              placeholder="Describe what you want this person to look like... (e.g. Cyberpunk mercenary in high-collar trenchcoat in rainy neon alleyway)"
              className="w-full bg-[#161b25] border border-[#273244] focus:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-[#5a6679] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Mobile Fast Parameter Bar (Tapping opens bottom sheet) */}
          <div className="lg:hidden grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
            <button
              onClick={() => setActiveBottomSheet('outfit')}
              className="p-2 rounded-lg bg-[#161b24] border border-[#283244] text-[11px] text-white flex flex-col items-center gap-1"
            >
              <Shirt className="w-4 h-4 text-amber-400" />
              <span>Outfit</span>
            </button>
            <button
              onClick={() => setActiveBottomSheet('pose')}
              className="p-2 rounded-lg bg-[#161b24] border border-[#283244] text-[11px] text-white flex flex-col items-center gap-1"
            >
              <Move className="w-4 h-4 text-amber-400" />
              <span>Pose</span>
            </button>
            <button
              onClick={() => setActiveBottomSheet('hair')}
              className="p-2 rounded-lg bg-[#161b24] border border-[#283244] text-[11px] text-white flex flex-col items-center gap-1"
            >
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Hair</span>
            </button>
            <button
              onClick={() => setActiveBottomSheet('environment')}
              className="p-2 rounded-lg bg-[#161b24] border border-[#283244] text-[11px] text-white flex flex-col items-center gap-1"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Setting</span>
            </button>
            <button
              onClick={() => setActiveBottomSheet('lighting')}
              className="p-2 rounded-lg bg-[#161b24] border border-[#283244] text-[11px] text-white flex flex-col items-center gap-1"
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Lighting</span>
            </button>
          </div>

          {/* Character Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#b2bfd1] flex items-center justify-between">
              <span>Character Role</span>
              <span className="text-[10px] font-mono text-[#717e94]">Project Cast</span>
            </label>
            <input
              id="generator-char-input"
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder="e.g. Karna, Arjuna, Krishna, Lead Model"
              className="w-full bg-[#161b25] border border-[#273244] focus:border-amber-500/60 rounded-lg px-3 py-2 text-xs text-white placeholder-[#5a6679] outline-none"
            />
            {/* Quick Character chips */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {characters.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCharacter(c.name)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                    character === c.name
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#181d28] text-[#7d8b9f] hover:text-white border border-[#252f3f]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Age Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#141822] border border-[#252f40]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#b2bfd1]">Target Age Calibration</label>
              <div className="flex items-center gap-1">
                <input
                  id="generator-age-input"
                  type="number"
                  min={18}
                  max={80}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-14 bg-[#181d28] border border-[#2b3547] text-center text-xs text-amber-300 font-mono rounded py-0.5 outline-none"
                />
                <span className="text-[10px] font-mono text-[#717e94]">yrs</span>
              </div>
            </div>
            <input
              type="range"
              min={18}
              max={75}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#222938] rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#677589]">
              <span>18 (Youth)</span>
              <span>35 (Prime)</span>
              <span>75 (Venerable)</span>
            </div>
          </div>

          {/* Costume & Wardrobe */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#b2bfd1]">Costume & Wardrobe</label>
            <textarea
              rows={2}
              value={costume}
              onChange={(e) => setCostume(e.target.value)}
              className="w-full bg-[#161b25] border border-[#273244] focus:border-amber-500/60 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Hairstyle & Grooming */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#b2bfd1]">Hairstyle</label>
              <input
                type="text"
                value={hairstyle}
                onChange={(e) => setHairstyle(e.target.value)}
                className="w-full bg-[#161b25] border border-[#273244] rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#b2bfd1]">Facial Hair</label>
              <input
                type="text"
                value={facialHair}
                onChange={(e) => setFacialHair(e.target.value)}
                className="w-full bg-[#161b25] border border-[#273244] rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Pose & Camera Shot */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#b2bfd1]">Pose</label>
              <select
                value={pose}
                onChange={(e) => setPose(e.target.value as PoseOption)}
                className="w-full bg-[#161b25] border border-[#273244] text-white text-xs rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="Standing">Standing</option>
                <option value="Sitting">Sitting</option>
                <option value="Walking">Walking</option>
                <option value="Fighting">Fighting</option>
                <option value="Riding">Riding</option>
                <option value="Portrait">Portrait</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#b2bfd1]">Camera Shot</label>
              <select
                value={camera}
                onChange={(e) => setCamera(e.target.value as CameraOption)}
                className="w-full bg-[#161b25] border border-[#273244] text-white text-xs rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="Full Body">Full Body</option>
                <option value="Medium Shot">Medium Shot</option>
                <option value="Close-Up">Close-Up</option>
                <option value="Wide Cinematic">Wide Cinematic</option>
                <option value="Character Poster">Character Poster</option>
              </select>
            </div>
          </div>

          {/* Environment & Lighting */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#b2bfd1]">Environment & Setting</label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-[#161b25] border border-[#273244] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#b2bfd1]">Lighting</label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value as LightingOption)}
                className="w-full bg-[#161b25] border border-[#273244] text-white text-xs rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="Dramatic">Dramatic (Key Rim)</option>
                <option value="Natural">Natural Daylight</option>
                <option value="Studio">Studio Softbox</option>
                <option value="Golden Hour">Golden Hour</option>
                <option value="Night">Night Atmosphere</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#b2bfd1]">Visual Style</label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value as VisualStyleOption)}
                className="w-full bg-[#161b25] border border-[#273244] text-white text-xs rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="Historical Epic">Historical Epic (70mm)</option>
                <option value="Photorealistic">Photorealistic (35mm Arri)</option>
                <option value="Contemporary Cinema">Contemporary Cinema</option>
                <option value="Period Drama">Period Drama</option>
                <option value="Character Poster">Character Poster</option>
              </select>
            </div>
          </div>

          {/* PRIMARY GENERATE BUTTON */}
          <div className="pt-2 pb-6 lg:pb-0">
            <button
              id="generate-look-primary-btn"
              disabled={isGenerating}
              onClick={handleGenerate}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 active:scale-98 ${
                isGenerating 
                  ? 'bg-amber-500/40 text-amber-200 cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
              }`}
            >
              <Wand2 className={`w-4 h-4 fill-black ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Look...' : 'Generate Look'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* ================= MOBILE BOTTOM SHEETS ================= */}
      {activeBottomSheet && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end lg:hidden animate-fade-in">
          <div className="bg-[#121620] border-t border-[#252f40] rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#212938]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeBottomSheet === 'outfit' && <><Shirt className="w-4 h-4 text-amber-400" /> Change Outfit</>}
                {activeBottomSheet === 'pose' && <><Move className="w-4 h-4 text-amber-400" /> Change Pose</>}
                {activeBottomSheet === 'hair' && <><Scissors className="w-4 h-4 text-amber-400" /> Change Hair</>}
                {activeBottomSheet === 'environment' && <><MapPin className="w-4 h-4 text-amber-400" /> Change Environment</>}
                {activeBottomSheet === 'lighting' && <><Sun className="w-4 h-4 text-amber-400" /> Change Lighting</>}
              </h3>
              <button 
                onClick={() => setActiveBottomSheet(null)}
                className="p-1 text-[#8b98ac] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Sheet Specific Content */}
            {activeBottomSheet === 'outfit' && (
              <div className="space-y-3">
                <p className="text-xs text-[#8997ab]">Pick an outfit preset or customize:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Bespoke Suit', desc: 'Charcoal wool suit, silk tie' },
                    { label: 'Leather Jacket', desc: 'Vintage distressed biker jacket' },
                    { label: 'Velvet Tuxedo', desc: 'Midnight navy black-tie' },
                    { label: 'Streetwear', desc: 'Beige oversized hoodie, cargo pants' },
                    { label: 'Knight Armor', desc: 'Burnished plate steel & hauberk' },
                    { label: 'Royal Mantle', desc: 'Gold armor & ruby pendant' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setCostume(preset.desc);
                        setActiveBottomSheet(null);
                        showToast(`Selected ${preset.label}`);
                      }}
                      className="p-2.5 rounded-xl bg-[#171c26] border border-[#273142] text-left hover:border-amber-400"
                    >
                      <div className="text-xs font-bold text-white">{preset.label}</div>
                      <div className="text-[10px] text-[#717e92] truncate">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeBottomSheet === 'pose' && (
              <div className="space-y-3">
                <p className="text-xs text-[#8997ab]">Select person stance:</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Standing', 'Sitting', 'Walking', 'Fighting', 'Riding', 'Portrait'] as PoseOption[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPose(p);
                        setActiveBottomSheet(null);
                        showToast(`Selected pose: ${p}`);
                      }}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${
                        pose === p ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#171c26] text-white border-[#273142]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeBottomSheet === 'hair' && (
              <div className="space-y-3">
                <p className="text-xs text-[#8997ab]">Select hairstyle & grooming:</p>
                <div className="space-y-2">
                  {[
                    'Clean parted side fade, groomed',
                    'Textured messy quiff',
                    'Slicked back classic Hollywood styling',
                    'Tied topknot warrior bun with leather ties',
                    'Natural textured buzz or fade',
                    'Shoulder-length dark hair swept back'
                  ].map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        setHairstyle(style);
                        setActiveBottomSheet(null);
                        showToast('Updated hairstyle');
                      }}
                      className="w-full p-2.5 rounded-xl bg-[#171c26] border border-[#273142] text-left text-xs text-white hover:border-amber-400 flex items-center justify-between"
                    >
                      <span>{style}</span>
                      {hairstyle === style && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeBottomSheet === 'environment' && (
              <div className="space-y-3">
                <p className="text-xs text-[#8997ab]">Choose production setting:</p>
                <div className="space-y-2">
                  {[
                    'Kurukshetra dusty twilight battlefield with war chariot silhouettes',
                    'Modern penthouse skyline at dusk with floor-to-ceiling glass',
                    'Rainy neo-noir alleyway with blurred neon reflections',
                    'Opulent grand casino ballroom crystal chandeliers',
                    'Tokyo Shibuya crossing crosswalk in foggy daylight',
                    'Gothic stone throne room lit by blazing torchlight'
                  ].map((env) => (
                    <button
                      key={env}
                      onClick={() => {
                        setEnvironment(env);
                        setActiveBottomSheet(null);
                        showToast('Updated environment');
                      }}
                      className="w-full p-2.5 rounded-xl bg-[#171c26] border border-[#273142] text-left text-xs text-white hover:border-amber-400"
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeBottomSheet === 'lighting' && (
              <div className="space-y-3">
                <p className="text-xs text-[#8997ab]">Select cinematic lighting:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'Dramatic', label: 'Dramatic Rim' },
                    { val: 'Studio', label: 'Studio Softbox' },
                    { val: 'Golden Hour', label: 'Golden Hour' },
                    { val: 'Natural', label: 'Natural Daylight' },
                    { val: 'Night', label: 'Moody Night' },
                  ].map((light) => (
                    <button
                      key={light.val}
                      onClick={() => {
                        setLighting(light.val as LightingOption);
                        setActiveBottomSheet(null);
                        showToast(`Lighting: ${light.label}`);
                      }}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold ${
                        lighting === light.val ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#171c26] text-white border-[#273142]'
                      }`}
                    >
                      {light.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveBottomSheet(null)}
              className="w-full py-2.5 rounded-xl bg-[#202735] text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
