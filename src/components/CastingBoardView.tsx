import React, { useState } from 'react';
import { 
  Kanban, 
  Star, 
  Check, 
  X, 
  FileText, 
  Plus, 
  ArrowRight, 
  UserCheck, 
  Filter, 
  Eye, 
  MoreVertical,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { CastingCandidate, CharacterRole, Actor, GeneratedLook } from '../types';

interface CastingBoardViewProps {
  candidates: CastingCandidate[];
  characters: CharacterRole[];
  actors: Actor[];
  onUpdateCandidate: (updatedCandidate: CastingCandidate) => void;
  onAddCandidate: (newCandidate: CastingCandidate) => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
}

export const CastingBoardView: React.FC<CastingBoardViewProps> = ({
  candidates,
  characters,
  actors,
  onUpdateCandidate,
  onAddCandidate,
  onOpenLightbox
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'shortlisted' | 'final_callback' | 'cast_confirmed'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  
  // Modal to add candidate
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [targetCharacter, setTargetCharacter] = useState<string>('Lead Creator');
  const [selectedActorId, setSelectedActorId] = useState<string>(actors[0]?.id || '');

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  // Action handlers
  const handleToggleFavorite = (candidate: CastingCandidate) => {
    onUpdateCandidate({
      ...candidate,
      status: candidate.status === 'final_callback' ? 'under_consideration' : 'final_callback'
    });
  };

  const handleToggleShortlist = (candidate: CastingCandidate) => {
    onUpdateCandidate({
      ...candidate,
      status: candidate.status === 'shortlisted' ? 'under_consideration' : 'shortlisted'
    });
  };

  const handleReject = (candidate: CastingCandidate) => {
    onUpdateCandidate({
      ...candidate,
      status: 'under_consideration'
    });
  };

  const handleRatingChange = (candidate: CastingCandidate, rating: number) => {
    onUpdateCandidate({
      ...candidate,
      rating
    });
  };

  const handleMoveCharacter = (candidate: CastingCandidate, newChar: string) => {
    const existingCount = candidates.filter((c) => c.character === newChar).length;
    const nextCandidateNum = `Candidate 0${existingCount + 1}`;

    onUpdateCandidate({
      ...candidate,
      character: newChar,
      candidateNumber: nextCandidateNum
    });
  };

  const openNotesModal = (candidate: CastingCandidate) => {
    setEditingNotesId(candidate.id);
    setNoteContent(candidate.notes);
  };

  const saveNotes = () => {
    const target = candidates.find((c) => c.id === editingNotesId);
    if (target) {
      onUpdateCandidate({
        ...target,
        notes: noteContent
      });
    }
    setEditingNotesId(null);
  };

  const handleCreateCandidate = () => {
    const actor = actors.find((a) => a.id === selectedActorId);
    if (!actor) return;

    const existingCount = candidates.filter((c) => c.character === targetCharacter).length;
    const nextCandidateNum = `Candidate 0${existingCount + 1}`;

    const newCandidate: CastingCandidate = {
      id: `cand-${Date.now()}`,
      actorId: actor.id,
      actorName: actor.name,
      actorPortrait: actor.portraitUrl,
      character: targetCharacter,
      candidateNumber: nextCandidateNum,
      status: 'under_consideration',
      rating: 4,
      notes: `Screen test candidate for ${targetCharacter}. Added to board by casting director.`,
      pinnedLookUrl: actor.portraitUrl,
      lookName: 'Baseline Reference'
    };

    onAddCandidate(newCandidate);
    setShowAddModal(false);
  };

  return (
    <div id="casting-board-view" className="p-6 md:p-8 space-y-6 max-w-full overflow-x-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232938] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Role Allocation
            </span>
            <span className="text-xs text-[#738096] font-mono">
              Campaign Matrix
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-amber-400" />
            Casting Decision Board
          </h2>
        </div>

        {/* Filter Pills & Add Candidate CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#151923] border border-[#262e3d] rounded-lg p-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded transition-colors ${
                activeFilter === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-[#7d8b9f] hover:text-white'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setActiveFilter('Favorite')}
              className={`px-3 py-1 rounded transition-colors ${
                activeFilter === 'Favorite'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-[#7d8b9f] hover:text-white'
              }`}
            >
              ★ Favorites
            </button>
            <button
              onClick={() => setActiveFilter('Shortlisted')}
              className={`px-3 py-1 rounded transition-colors ${
                activeFilter === 'Shortlisted'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-[#7d8b9f] hover:text-white'
              }`}
            >
              Shortlisted
            </button>
          </div>

          <button
            id="casting-add-candidate-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Actor to Role</span>
          </button>
        </div>
      </div>

      {/* Swimlanes / Character Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char) => {
          const charCandidates = filteredCandidates.filter(
            (c) => c.character.toLowerCase() === char.name.toLowerCase()
          );

          return (
            <div
              key={char.id}
              className="rounded-xl border border-[#232938] bg-[#11141c] flex flex-col min-h-[500px] overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-4 bg-[#161a24] border-b border-[#222837] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      {char.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#212736] text-amber-300 border border-[#2c3447]">
                      {charCandidates.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#717e92] font-mono line-clamp-1 mt-0.5">
                    {char.tagline}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setTargetCharacter(char.name);
                    setShowAddModal(true);
                  }}
                  className="p-1 rounded text-[#717e92] hover:text-white hover:bg-[#202735] transition-colors"
                  title={`Add candidate for ${char.name}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Candidate Cards List */}
              <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                {charCandidates.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#202735] rounded-lg text-[#5b677a]">
                    <span className="text-xs">No candidates currently assigned</span>
                    <button
                      onClick={() => {
                        setTargetCharacter(char.name);
                        setShowAddModal(true);
                      }}
                      className="mt-2 text-[11px] text-amber-400 hover:underline"
                    >
                      + Assign Candidate
                    </button>
                  </div>
                ) : (
                  charCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`p-3.5 rounded-lg border transition-all space-y-3 bg-[#151922] ${
                        candidate.status === 'Favorite'
                          ? 'border-amber-500/50 shadow-md shadow-amber-500/5'
                          : candidate.status === 'Rejected'
                          ? 'border-rose-500/30 opacity-60'
                          : 'border-[#242b3a] hover:border-[#384357]'
                      }`}
                    >
                      {/* Top Candidate Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {/* Actor Portrait */}
                          <img
                            src={candidate.actorPortrait}
                            alt={candidate.actorName}
                            onClick={() => onOpenLightbox(candidate.pinnedLookUrl || candidate.actorPortrait, candidate.actorName, `${candidate.character} • ${candidate.candidateNumber}`)}
                            className="w-12 h-14 rounded object-cover object-top border border-[#293243] shrink-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">
                              {candidate.candidateNumber}
                            </span>
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {candidate.actorName}
                            </h4>
                            <div className="text-[10px] text-[#717e92] font-mono mt-0.5">
                              {candidate.lookName || 'Concept Look'}
                            </div>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                          candidate.status === 'Favorite'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : candidate.status === 'Shortlisted'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : candidate.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-[#1e2533] text-[#8694aa] border-[#293244]'
                        }`}>
                          {candidate.status}
                        </span>
                      </div>

                      {/* Pinned Look Preview if present */}
                      {candidate.pinnedLookUrl && candidate.pinnedLookUrl !== candidate.actorPortrait && (
                        <div 
                          onClick={() => onOpenLightbox(candidate.pinnedLookUrl!, `${candidate.character} Look`, `Candidate: ${candidate.actorName}`)}
                          className="aspect-[16/9] w-full rounded overflow-hidden relative cursor-pointer group bg-[#1c222e] border border-[#272f3e]"
                        >
                          <img src={candidate.pinnedLookUrl} alt="Character Look" className="w-full h-full object-cover group-hover:scale-102 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Notes snippet */}
                      <p className="text-[11px] text-[#8b97ab] line-clamp-2 leading-relaxed italic bg-[#11141c] p-2 rounded border border-[#1e2432]">
                        "{candidate.notes}"
                      </p>

                      {/* Interactive Controls: Rating, Favorite, Shortlist, Notes */}
                      <div className="pt-2 border-t border-[#202735] flex items-center justify-between">
                        {/* 1-5 Star Rating */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(candidate, star)}
                              className="text-xs transition-colors p-0.5"
                            >
                              <Star className={`w-3.5 h-3.5 ${
                                star <= candidate.rating 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-[#384255]'
                              }`} />
                            </button>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(candidate)}
                            className={`p-1 rounded text-xs transition-colors ${
                              candidate.status === 'Favorite'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'text-[#6e7b90] hover:text-white'
                            }`}
                            title="Favorite"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleShortlist(candidate)}
                            className={`p-1 rounded text-xs transition-colors ${
                              candidate.status === 'Shortlisted'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'text-[#6e7b90] hover:text-white'
                            }`}
                            title="Shortlist"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openNotesModal(candidate)}
                            className="p-1 rounded text-[#6e7b90] hover:text-white transition-colors"
                            title="Edit notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(candidate)}
                            className="p-1 rounded text-[#6e7b90] hover:text-rose-400 transition-colors"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Move between characters dropdown */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#5f6b7d] pt-1">
                        <span>Reassign Role:</span>
                        <select
                          value={candidate.character}
                          onChange={(e) => handleMoveCharacter(candidate, e.target.value)}
                          className="bg-[#191f2c] border border-[#252c3c] text-[#abb8cb] rounded px-1.5 py-0.5 outline-none text-[10px]"
                        >
                          {characters.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Notes Modal */}
      {editingNotesId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-[#2b3345] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <h3 className="text-sm font-semibold text-white">Candidate Casting Notes</h3>
              <button
                onClick={() => setEditingNotesId(null)}
                className="text-[#6d7a8e] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={5}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full bg-[#181d28] border border-[#283244] text-xs text-white rounded p-3 outline-none focus:border-amber-500/50"
              placeholder="Enter director evaluation, screen test dates, vocal modulation notes..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNotesId(null)}
                className="px-3 py-1.5 text-xs text-[#828fa3] hover:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-[#2b3345] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <h3 className="text-sm font-semibold text-white">Assign Actor to Character Role</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6d7a8e] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Target Character</label>
                <select
                  value={targetCharacter}
                  onChange={(e) => setTargetCharacter(e.target.value)}
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-3 py-2 outline-none font-medium"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.importance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Select Actor from Profile Database</label>
                <select
                  value={selectedActorId}
                  onChange={(e) => setSelectedActorId(e.target.value)}
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-3 py-2 outline-none font-medium"
                >
                  {actors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.ageRange} yrs • {a.build})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-[#828fa3] hover:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCandidate}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-colors"
              >
                Add to Board
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
