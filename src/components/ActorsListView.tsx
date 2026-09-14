import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Eye, 
  Wand2, 
  ArrowUpRight 
} from 'lucide-react';
import { Actor } from '../types';

interface ActorsListViewProps {
  actors: Actor[];
  onSelectActor: (actorId: string) => void;
  onOpenAddActor: () => void;
  onOpenCreateModel?: () => void;
  onLaunchGenerator: (actorId: string) => void;
}

export const ActorsListView: React.FC<ActorsListViewProps> = ({
  actors,
  onSelectActor,
  onOpenAddActor,
  onOpenCreateModel,
  onLaunchGenerator
}) => {
  const [search, setSearch] = useState<string>('');
  const [buildFilter, setBuildFilter] = useState<string>('all');

  const filteredActors = actors.filter((a) => {
    if (buildFilter !== 'all' && a.build !== buildFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.ageRange.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div id="actors-list-view" className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232938] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Talent Roster
            </span>
            <span className="text-xs text-[#738096] font-mono">
              Calibrated Actor Reference Profiles
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Actor Reference Profiles ({actors.length})
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenCreateModel && (
            <button
              onClick={onOpenCreateModel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold text-xs rounded transition-all shadow-sm"
              title="Upload reference photos and establish a calibrated Identity Profile"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Identity Profile</span>
            </button>
          )}
          <button
            onClick={onOpenAddActor}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#191f2b] hover:bg-[#232b3c] text-white border border-[#2b3548] font-medium text-xs rounded transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Actor Profile</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#12161f] border border-[#232938] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-mono text-[#717e92]">Build:</span>
            <select
              value={buildFilter}
              onChange={(e) => setBuildFilter(e.target.value)}
              className="bg-[#171c26] border border-[#272f3e] text-white text-xs rounded px-2.5 py-1.5 outline-none"
            >
              <option value="all">All Builds</option>
              <option value="Lean">Lean</option>
              <option value="Athletic">Athletic</option>
              <option value="Muscular">Muscular</option>
              <option value="Heavy">Heavy</option>
            </select>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-[#5f6c81] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actors by name or specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171c26] border border-[#272f3e] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#586377] outline-none"
          />
        </div>
      </div>

      {/* Actors Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredActors.map((actor) => (
          <div
            key={actor.id}
            id={`actor-directory-card-${actor.id}`}
            className="group bg-[#12161f] border border-[#232938] hover:border-amber-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col shadow-md"
            onClick={() => onSelectActor(actor.id)}
          >
            {/* Aspect Ratio Preserving Headshot Container */}
            <div className="aspect-[4/5] w-full bg-[#1c222e] relative overflow-hidden">
              <img
                src={actor.portraitUrl}
                alt={actor.name}
                className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12161f] via-transparent to-transparent opacity-80" />

              {/* Calibration Badge */}
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {actor.calibrationScore}%
                </span>
              </div>

              {/* References count badge */}
              <div className="absolute bottom-2.5 left-2.5">
                <span className="text-[10px] font-mono text-white bg-black/80 px-2 py-0.5 rounded border border-white/10">
                  {actor.references.length} ref photos
                </span>
              </div>
            </div>

            {/* Info details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {actor.name}
                </h3>
                <div className="text-[11px] text-[#78859a] font-mono mt-0.5 flex items-center gap-2">
                  <span>{actor.ageRange} yrs</span>
                  <span>•</span>
                  <span>{actor.height}</span>
                  <span>•</span>
                  <span>{actor.build}</span>
                </div>
                {actor.notes && (
                  <p className="text-[10px] text-[#616e82] line-clamp-2 mt-1.5 leading-relaxed">
                    {actor.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#1f2533] flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-[#6c788d]">
                  {actor.generatedLooksCount} looks rendered
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchGenerator(actor.id);
                  }}
                  className="px-2.5 py-1 rounded bg-[#181d28] hover:bg-amber-500/20 text-amber-300 border border-[#273042] text-[11px] font-medium transition-colors flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
