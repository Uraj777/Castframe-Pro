import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Columns, 
  CheckCircle2, 
  Clock, 
  Maximize2 
} from 'lucide-react';
import { GeneratedLook } from '../types';

interface GenerationsListViewProps {
  looks: GeneratedLook[];
  onSelectLook: (look: GeneratedLook) => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
  onOpenGenerator: () => void;
}

export const GenerationsListView: React.FC<GenerationsListViewProps> = ({
  looks,
  onSelectLook,
  onOpenLightbox,
  onOpenGenerator
}) => {
  const [filterChar, setFilterChar] = useState<string>('all');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredLooks = looks.filter((l) => {
    if (filterChar !== 'all' && l.character.toLowerCase() !== filterChar.toLowerCase()) return false;
    if (filterStyle !== 'all' && l.config.visualStyle !== filterStyle) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.lookName.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.character.toLowerCase().includes(q) ||
        l.config.costume.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="generations-list-view" className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232938] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Visual Archive
            </span>
            <span className="text-xs text-[#738096] font-mono">
              Identity-calibrated render outputs
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Character Look Generations ({looks.length})
          </h2>
        </div>

        <button
          onClick={onOpenGenerator}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-all shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Generate New Look</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#12161f] border border-[#232938] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Character Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-mono text-[#717e92]">Character:</span>
            <select
              value={filterChar}
              onChange={(e) => setFilterChar(e.target.value)}
              className="bg-[#171c26] border border-[#272f3e] text-white text-xs rounded px-2.5 py-1.5 outline-none"
            >
              <option value="all">All Characters</option>
              <option value="Karna">Karna</option>
              <option value="Arjuna">Arjuna</option>
              <option value="Krishna">Krishna</option>
              <option value="Duryodhana">Duryodhana</option>
              <option value="Draupadi">Draupadi</option>
            </select>
          </div>

          {/* Visual Style Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-mono text-[#717e92]">Style:</span>
            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
              className="bg-[#171c26] border border-[#272f3e] text-white text-xs rounded px-2.5 py-1.5 outline-none"
            >
              <option value="all">All Styles</option>
              <option value="Historical Epic">Historical Epic</option>
              <option value="Photorealistic">Photorealistic</option>
              <option value="Contemporary Cinema">Contemporary Cinema</option>
              <option value="Character Poster">Character Poster</option>
            </select>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-[#5f6c81] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompt, actor, look..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171c26] border border-[#272f3e] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#586377] outline-none"
          />
        </div>
      </div>

      {/* Grid of Generations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredLooks.map((look) => (
          <div
            key={look.id}
            onClick={() => onSelectLook(look)}
            className="group bg-[#13161e] border border-[#242b3a] hover:border-amber-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col shadow-md"
          >
            {/* Cinematic Aspect Ratio container */}
            <div className="aspect-[16/10] w-full bg-[#1c222e] relative overflow-hidden">
              <img
                src={look.imageUrl}
                alt={look.lookName}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13161e] via-transparent to-transparent opacity-80" />

              {/* Status & Character Tags */}
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-amber-300 border border-amber-500/30">
                  {look.character}
                </span>
              </div>
              <div className="absolute top-2.5 right-2.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {look.status}
                </span>
              </div>

              <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(look.imageUrl, look.lookName, `${look.character} • ${look.actorName}`);
                  }}
                  className="p-1 rounded bg-black/80 text-white hover:bg-black"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Look Details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {look.lookName}
                </h4>
                <p className="text-[11px] text-[#717e92] mt-0.5">
                  Actor: <span className="text-[#a4b1c5]">{look.actorName}</span>
                </p>
                <p className="text-[10px] text-[#5e6b7f] line-clamp-2 mt-1 italic">
                  "{look.config.costume}"
                </p>
              </div>

              <div className="pt-2 border-t border-[#1f2533] flex items-center justify-between text-[10px] font-mono text-[#616e82]">
                <span>{look.createdAt}</span>
                <span className="text-[#8492a7]">{look.config.visualStyle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
