import React, { useState } from 'react';
import { 
  Columns, 
  CheckSquare, 
  Square, 
  UserCheck, 
  Download, 
  Eye, 
  Maximize2, 
  Sliders, 
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';
import { Actor, GeneratedLook, CharacterRole } from '../types';

interface ComparisonViewProps {
  actors: Actor[];
  characters: CharacterRole[];
  allLooks: GeneratedLook[];
  initialActorId?: string;
  initialCharacter?: string;
  onCreateShortlist: (selectedLookIds: string[]) => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  actors,
  characters,
  allLooks,
  initialActorId,
  initialCharacter,
  onCreateShortlist,
  onOpenLightbox
}) => {
  const [selectedActorId, setSelectedActorId] = useState<string>(
    initialActorId || actors[0]?.id || ''
  );
  const [selectedCharacter, setSelectedCharacter] = useState<string>(
    initialCharacter || 'Karna'
  );

  const selectedActor = actors.find((a) => a.id === selectedActorId) || actors[0];

  // Filter looks matching selected actor & character
  const matchingLooks = allLooks.filter(
    (l) => l.actorId === selectedActorId && l.character.toLowerCase() === selectedCharacter.toLowerCase()
  );

  // If none match exactly, show all looks for this actor
  const comparisonLooks = matchingLooks.length >= 2 
    ? matchingLooks 
    : allLooks.filter((l) => l.actorId === selectedActorId).slice(0, 4);

  // Selected looks for shortlist
  const [selectedLookIds, setSelectedLookIds] = useState<string[]>(
    comparisonLooks.slice(0, 2).map((l) => l.id)
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleSelectLook = (id: string) => {
    if (selectedLookIds.includes(id)) {
      setSelectedLookIds(selectedLookIds.filter((item) => item !== id));
    } else {
      setSelectedLookIds([...selectedLookIds, id]);
    }
  };

  const handleCreateShortlist = () => {
    onCreateShortlist(selectedLookIds);
    setToastMessage(`Created casting shortlist with ${selectedLookIds.length} candidate looks`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div id="look-comparison-view" className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-md shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232a39] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Look Comparison Matrix
            </span>
            <span className="text-xs text-[#738096] font-mono">
              Side-by-side identity & costume variance analysis
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Character Visualization Comparison
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="comparison-create-shortlist-btn"
            disabled={selectedLookIds.length === 0}
            onClick={handleCreateShortlist}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedLookIds.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg cursor-pointer'
                : 'bg-[#1b202c] text-[#616c80] cursor-not-allowed border border-[#252c3c]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Create Casting Shortlist ({selectedLookIds.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Select Actor & Character */}
      <div className="p-4 rounded-xl bg-[#12161f] border border-[#232938] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#717e92]">Actor:</span>
            <select
              value={selectedActorId}
              onChange={(e) => setSelectedActorId(e.target.value)}
              className="bg-[#171c26] border border-[#272f3e] text-white text-xs rounded px-3 py-1.5 outline-none font-medium"
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#717e92]">Character:</span>
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="bg-[#171c26] border border-[#272f3e] text-amber-300 text-xs rounded px-3 py-1.5 outline-none font-medium"
            >
              {characters.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#717e92] font-mono">
          <span>Comparing: <strong className="text-white">{comparisonLooks.length} Look Variants</strong></span>
        </div>
      </div>

      {/* 4-Way Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisonLooks.map((look, index) => {
          const letter = String.fromCharCode(65 + index); // Look A, Look B, Look C, Look D
          const isSelected = selectedLookIds.includes(look.id);

          return (
            <div
              key={look.id}
              className={`rounded-xl overflow-hidden border bg-[#13161e] transition-all flex flex-col ${
                isSelected 
                  ? 'border-amber-400 ring-1 ring-amber-400/40' 
                  : 'border-[#242b3a] hover:border-[#384358]'
              }`}
            >
              {/* Header Label: e.g. "Look A: Young Warrior" */}
              <div className="p-3 bg-[#171c26] border-b border-[#222837] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">
                    {letter}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">
                      Look {letter}
                    </h4>
                    <span className="text-[10px] text-amber-200/70 font-mono">
                      {look.config.costume.slice(0, 22)}...
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleSelectLook(look.id)}
                  className={`p-1 rounded transition-colors ${
                    isSelected ? 'text-amber-400' : 'text-[#626e82] hover:text-white'
                  }`}
                  title={isSelected ? 'Deselect look' : 'Select look for shortlist'}
                >
                  {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              </div>

              {/* Large Image Aspect Container */}
              <div 
                onClick={() => onOpenLightbox(look.imageUrl, look.lookName, `Look ${letter}: ${look.character}`)}
                className="aspect-[3/4] w-full bg-[#1b202c] relative overflow-hidden group cursor-pointer"
              >
                <img
                  src={look.imageUrl}
                  alt={look.lookName}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>

                {/* Status tag */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="text-[10px] font-mono text-white bg-black/80 px-2 py-0.5 rounded border border-white/10">
                    Age {look.config.age} yrs
                  </span>
                </div>
              </div>

              {/* Look Specifications Table */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between text-xs bg-[#12151d]">
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between border-b border-[#1f2533] pb-1">
                    <span className="text-[#647185]">Lighting:</span>
                    <span className="text-[#a8b6cb]">{look.config.lighting}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1f2533] pb-1">
                    <span className="text-[#647185]">Pose:</span>
                    <span className="text-[#a8b6cb]">{look.config.pose}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1f2533] pb-1">
                    <span className="text-[#647185]">Framing:</span>
                    <span className="text-[#a8b6cb]">{look.config.camera}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#647185]">Style:</span>
                    <span className="text-amber-300 font-semibold">{look.config.visualStyle}</span>
                  </div>
                </div>

                {/* Select Toggle Button */}
                <button
                  onClick={() => toggleSelectLook(look.id)}
                  className={`w-full py-1.5 rounded text-[11px] font-mono font-medium transition-colors border ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#181d27] text-[#818e9f] hover:text-white border-[#272f3e]'
                  }`}
                >
                  {isSelected ? '✓ Selected for Shortlist' : '+ Select Look'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Comparison Summary Footer */}
      <div className="p-4 rounded-xl bg-[#11141b] border border-[#232938] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="text-[#7d8aa0]">
          <span className="text-white font-medium">Casting Review Tip:</span> Look B (Anga King) & Look C (Battlefield) show highest facial likeness alignment under hard directional lighting.
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCreateShortlist}
            disabled={selectedLookIds.length === 0}
            className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Create Casting Shortlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
