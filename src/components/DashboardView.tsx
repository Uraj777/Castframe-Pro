import React from 'react';
import { 
  Users, 
  Sparkles, 
  Plus, 
  Film, 
  Clock, 
  Layers, 
  ArrowUpRight, 
  ShieldCheck, 
  Wand2,
  Eye,
  Shirt,
  Scissors,
  UserPlus,
  SlidersHorizontal,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { Project, Actor, GeneratedLook, CharacterRole } from '../types';

interface DashboardViewProps {
  activeProject?: Project;
  project?: Project;
  actors: Actor[];
  recentGenerations: GeneratedLook[];
  characters: CharacterRole[];
  onSelectActor: (actorId: string) => void;
  onSelectLook: (look: GeneratedLook) => void;
  onOpenAddActor: () => void;
  onOpenCreateModel?: () => void;
  onOpenGenerator: (actorId?: string, character?: string) => void;
  onViewAllActors?: () => void;
  onViewAllGenerations?: () => void;
  onViewCastingBoard?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeProject,
  project,
  actors,
  recentGenerations,
  characters,
  onSelectActor,
  onSelectLook,
  onOpenAddActor,
  onOpenCreateModel,
  onOpenGenerator,
  onViewAllActors,
  onViewAllGenerations,
  onViewCastingBoard,
  onNavigateToTab
}) => {
  const proj = activeProject || project;
  const projectTitle = proj?.title || 'Mahabharata: The Anga Warrior';
  const projectSubtitle = proj?.subtitle || 'Historical Epic Feature Film';
  const projectGenre = proj?.genre || 'Historical Epic';
  const projectDirector = proj?.director || 'Aakash Verma';
  const projectCastingDirector = proj?.castingDirector || 'Maya Thorne';

  const handleViewAllActors = onViewAllActors || (() => onNavigateToTab?.('actors'));
  const handleViewAllGenerations = onViewAllGenerations || (() => onNavigateToTab?.('generations'));
  const handleViewCastingBoard = onViewCastingBoard || (() => onNavigateToTab?.('casting-board'));

  // Most recent person & look for hero card
  const primaryActor = actors[0] || {
    id: 'act-1',
    name: 'Devraj Sengupta',
    portraitUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200',
    character: 'Karna',
    calibrationScore: 99.4,
    references: []
  };

  const featuredLook = recentGenerations[0];
  const heroImage = featuredLook?.imageUrl || primaryActor.portraitUrl;
  const heroName = primaryActor.name.toUpperCase();
  const heroLookCount = recentGenerations.filter(g => g.actorId === primaryActor.id).length || 12;

  return (
    <div id="dashboard-view-container" className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto pb-24 md:pb-10">
      
      {/* 1. Header Greeting: Good morning / Your Studio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2635] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Your Studio
            </span>
            <span className="text-[#455065]">•</span>
            <span className="text-xs font-mono text-[#7d8b9f]">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Good morning, {projectCastingDirector.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded bg-[#151922] border border-[#262f3f] flex items-center gap-2 text-xs font-mono text-[#8a98ad]">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-medium truncate max-w-[180px]">{projectTitle}</span>
            <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/25">
              {projectGenre}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Large Cinematic Image Card for Most Recent Person/Project */}
      <section 
        id="hero-person-card"
        className="relative overflow-hidden rounded-2xl border border-[#283244] bg-[#10131b] shadow-2xl group min-h-[300px] sm:min-h-[340px] flex flex-col justify-end p-6 sm:p-8"
      >
        {/* Background Image with subtle zoom on hover */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={heroImage} 
            alt={heroName}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
          />
          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14]/90 via-[#0b0e14]/40 to-transparent" />
        </div>

        {/* Content Overlays */}
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500 text-black">
              Featured Identity
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{primaryActor.calibrationScore || 99.4}% Identity Lock</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
              {heroName}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 font-mono tracking-wide mt-1">
              {heroLookCount} Character Looks Generated • Primary Cast: Karna
            </p>
          </div>

          <p className="text-xs text-[#a6b4c9] leading-relaxed line-clamp-2 max-w-xl">
            Established multi-angle reference model calibrated across 20 studio photographs. Ready for full wardrobe synthesis, battle armor, and period lighting.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenGenerator(primaryActor.id, 'Karna')}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <Wand2 className="w-3.5 h-3.5 fill-black" />
              <span>Generate New Look</span>
            </button>
            <button
              onClick={() => onSelectActor(primaryActor.id)}
              className="px-4 py-2 rounded-lg bg-[#1a202c]/90 hover:bg-[#252e3e] text-white border border-[#2f3a4e] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>View Identity Profile</span>
            </button>
            <button
              onClick={handleViewCastingBoard}
              className="px-3.5 py-2 rounded-lg bg-[#141822]/80 hover:bg-[#1f2635] text-[#9eb0c6] hover:text-white border border-[#273142] text-xs transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span>Casting Grid</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Quick Create: 4 Compact Actions */}
      <section id="quick-create-actions" className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#79879c] font-semibold">
            Quick Actions
          </span>
          <span className="text-[10px] font-mono text-[#5f6c80]">Instant Generation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Action 1: Create Look */}
          <button
            onClick={() => onOpenGenerator(primaryActor.id)}
            className="p-3.5 rounded-xl bg-[#141822] hover:bg-[#1b212e] border border-[#242d3e] hover:border-amber-500/50 transition-all text-left group flex items-start gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Create Look
              </div>
              <div className="text-[10px] text-[#717e92] font-mono mt-0.5">
                Full prompt studio
              </div>
            </div>
          </button>

          {/* Action 2: Change Outfit */}
          <button
            onClick={() => onOpenGenerator(primaryActor.id, 'Karna')}
            className="p-3.5 rounded-xl bg-[#141822] hover:bg-[#1b212e] border border-[#242d3e] hover:border-amber-500/50 transition-all text-left group flex items-start gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1f2635] border border-[#2f3a4d] flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Change Outfit
              </div>
              <div className="text-[10px] text-[#717e92] font-mono mt-0.5">
                Wardrobe swap
              </div>
            </div>
          </button>

          {/* Action 3: Change Hair */}
          <button
            onClick={() => onOpenGenerator(primaryActor.id, 'Karna')}
            className="p-3.5 rounded-xl bg-[#141822] hover:bg-[#1b212e] border border-[#242d3e] hover:border-amber-500/50 transition-all text-left group flex items-start gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1f2635] border border-[#2f3a4d] flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Change Hair
              </div>
              <div className="text-[10px] text-[#717e92] font-mono mt-0.5">
                Grooming & style
              </div>
            </div>
          </button>

          {/* Action 4: New Person */}
          <button
            onClick={() => onOpenCreateModel ? onOpenCreateModel() : onOpenAddActor()}
            className="p-3.5 rounded-xl bg-gradient-to-br from-[#1b2230] to-[#141822] hover:from-[#21293a] hover:to-[#181e2b] border border-amber-500/35 hover:border-amber-400 transition-all text-left group flex items-start gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                New Person
              </div>
              <div className="text-[10px] text-amber-300/90 font-mono mt-0.5">
                Upload 1–20 photos
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Horizontal Scroll of Recent People */}
      <section id="recent-people-scroll" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Recent People & Models
            </h3>
            <span className="text-xs font-mono text-[#627083] bg-[#161a24] px-1.5 py-0.5 rounded border border-[#242c3d]">
              {actors.length} Active
            </span>
          </div>
          <button
            onClick={handleViewAllActors}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Row of Circular / Rounded Portrait Thumbnails */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#252e3e]">
          {/* + Add New Person Quick Bubble */}
          <button
            onClick={() => onOpenCreateModel ? onOpenCreateModel() : onOpenAddActor()}
            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-dashed border-[#343f55] group-hover:border-amber-400 bg-[#141822] flex items-center justify-center text-[#7e8c9f] group-hover:text-amber-300 transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono text-[#8a98ad] group-hover:text-white transition-colors">
              + New
            </span>
          </button>

          {actors.map((actor) => (
            <div
              key={actor.id}
              onClick={() => onSelectActor(actor.id)}
              className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
            >
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-[#2b3548] group-hover:border-amber-400 transition-all p-0.5 bg-[#171b24] shadow-md group-hover:shadow-amber-500/10">
                <img
                  src={actor.portraitUrl}
                  alt={actor.name}
                  className="w-full h-full object-cover object-top rounded-[14px]"
                />
                {/* Calibration score badge */}
                <span className="absolute bottom-1 right-1 bg-black/85 text-emerald-400 text-[8px] font-mono px-1 rounded border border-emerald-500/40">
                  {actor.calibrationScore}%
                </span>
              </div>
              <div className="text-center max-w-[80px]">
                <div className="text-xs font-semibold text-white group-hover:text-amber-300 truncate transition-colors">
                  {actor.name.split(' ')[0]}
                </div>
                <div className="text-[9px] font-mono text-[#6c798d] truncate">
                  {actor.references?.length || 12} photos
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Horizontal Scroll of Recent Looks */}
      <section id="recent-looks-scroll" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Recent Character Looks
            </h3>
            <span className="text-xs font-mono text-[#627083] bg-[#161a24] px-1.5 py-0.5 rounded border border-[#242c3d]">
              {recentGenerations.length} Rendered
            </span>
          </div>
          <button
            onClick={handleViewAllGenerations}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Row of Cinematic Cards */}
        <div className="flex items-stretch gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#252e3e]">
          {recentGenerations.slice(0, 8).map((look) => (
            <div
              key={look.id}
              onClick={() => onSelectLook(look)}
              className="w-56 sm:w-64 shrink-0 rounded-xl overflow-hidden bg-[#13161f] border border-[#232a39] hover:border-amber-500/50 transition-all group cursor-pointer shadow-lg flex flex-col justify-between"
            >
              {/* Image with 16:10 cinematic aspect */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={look.imageUrl}
                  alt={look.lookName}
                  className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>Inspect Look</span>
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-mono text-amber-300 border border-amber-500/30">
                    {look.character}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-3 space-y-1">
                <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate transition-colors">
                  {look.lookName}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#6c7a8e]">
                  <span>{look.actorName}</span>
                  <span className="text-[#a1b0c4]">{look.config?.visualStyle || '35mm Raw'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Production Casting Summary & Specs */}
      <section className="p-5 rounded-xl bg-[#11141c] border border-[#202735] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="space-y-1">
          <div className="text-[10px] text-[#637083] uppercase tracking-wider">Identity Pipeline</div>
          <div className="text-white flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-angle 2D Identity Locked</span>
          </div>
          <p className="text-[10px] text-[#717e92] font-sans">
            Facial geometry, skin tone, and distinguishing features preserved across all wardrobe variations.
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] text-[#637083] uppercase tracking-wider">Active Character Board</div>
          <div className="text-white flex items-center gap-1.5 font-medium">
            <Film className="w-4 h-4 text-amber-400" />
            <span>{characters.length} Primary Roles in Cast List</span>
          </div>
          <p className="text-[10px] text-[#717e92] font-sans">
            Karna, Arjuna, Krishna, Duryodhana, Bhishma, Draupadi, and ensemble cast.
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] text-[#637083] uppercase tracking-wider">Quick Navigation</div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleViewCastingBoard}
              className="px-2.5 py-1 rounded bg-[#191f2c] hover:bg-[#222a3b] text-white text-[11px] border border-[#293447] transition-colors"
            >
              Casting Board
            </button>
            <button
              onClick={() => onNavigateToTab?.('generator')}
              className="px-2.5 py-1 rounded bg-[#191f2c] hover:bg-[#222a3b] text-amber-300 text-[11px] border border-[#293447] transition-colors"
            >
              Try Outfits
            </button>
            <button
              onClick={() => onNavigateToTab?.('projects')}
              className="px-2.5 py-1 rounded bg-[#191f2c] hover:bg-[#222a3b] text-white text-[11px] border border-[#293447] transition-colors"
            >
              Project Docs
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
