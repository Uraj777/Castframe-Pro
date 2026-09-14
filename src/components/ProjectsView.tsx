import React, { useState } from 'react';
import { 
  Film, 
  Plus, 
  Users, 
  Sparkles, 
  Kanban, 
  FolderArchive, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  X,
  Check
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (proj: Project) => void;
  onCreateProject: (newProj: Project) => void;
  onNavigateToTab: (tab: any) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onNavigateToTab
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [genre, setGenre] = useState<string>('Historical Drama');
  const [description, setDescription] = useState<string>('');
  const [director, setDirector] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: title.toUpperCase(),
      subtitle: subtitle || 'Feature Film Production',
      description: description || 'New film production portfolio initialized for casting and visual development.',
      genre: genre,
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
      director: director || 'Lead Director',
      castingDirector: 'Maya Thorne',
      targetProductionYear: '2027',
      actorsCount: 0,
      charactersCount: 0,
      looksCount: 0,
      lastActive: 'Just now'
    };

    onCreateProject(newProject);
    onSelectProject(newProject);
    setShowCreateModal(false);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setDirector('');
    setToastMessage(`Created and activated project "${newProject.title}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div id="projects-view" className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-md shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232938] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Project Management
            </span>
            <span className="text-xs text-[#738096] font-mono">
              Active Productions & Pitch Decks
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Film & Series Productions
          </h2>
        </div>

        <button
          id="projects-create-new-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const isActive = p.id === activeProject.id;

          return (
            <div
              key={p.id}
              className={`rounded-xl overflow-hidden border bg-[#12161f] transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-amber-500 ring-1 ring-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'border-[#232938] hover:border-[#354054]'
              }`}
            >
              <div>
                {/* Project Banner Container */}
                <div className="aspect-[16/9] w-full bg-[#1b202c] relative overflow-hidden">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12161f] via-[#12161f66] to-transparent" />

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500 text-black font-bold flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Project
                      </span>
                    </div>
                  )}

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">
                      {p.genre}
                    </span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      {p.title}
                    </h3>
                  </div>
                </div>

                {/* Project Metadata */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#8f9cb0] leading-relaxed line-clamp-2">
                    {p.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1f2533] text-center">
                    <div className="p-2 rounded bg-[#161a24] border border-[#232a37]">
                      <span className="text-sm font-bold font-mono text-white block">
                        {p.actorsCount}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#6f7b8f]">Actors</span>
                    </div>
                    <div className="p-2 rounded bg-[#161a24] border border-[#232a37]">
                      <span className="text-sm font-bold font-mono text-amber-300 block">
                        {p.charactersCount}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#6f7b8f]">Characters</span>
                    </div>
                    <div className="p-2 rounded bg-[#161a24] border border-[#232a37]">
                      <span className="text-sm font-bold font-mono text-white block">
                        {p.looksCount}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#6f7b8f]">Looks</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#717e92] font-mono space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>Director:</span>
                      <span className="text-[#aeb9cb]">{p.director}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="text-[#aeb9cb]">{p.targetProductionYear}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-4 bg-[#10131b] border-t border-[#1e2330] flex items-center justify-between">
                {!isActive ? (
                  <button
                    onClick={() => {
                      onSelectProject(p);
                      setToastMessage(`Switched active project to "${p.title}"`);
                    }}
                    className="w-full py-1.5 rounded bg-[#191f2c] hover:bg-[#22293b] text-amber-300 text-xs font-mono font-medium border border-[#283244] transition-colors text-center"
                  >
                    Set as Active Production
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateToTab('dashboard')}
                    className="w-full py-1.5 rounded bg-amber-500/20 text-amber-300 text-xs font-mono font-medium border border-amber-500/40 flex items-center justify-center gap-1.5"
                  >
                    <span>Enter Workspace</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-[#2b3345] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <h3 className="text-sm font-semibold text-white">Create New Film Production Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6d7a8e] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Project Title (e.g. MAHABHARATA, 1857)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. HISTORICAL DRAMA SEASON 1"
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-3 py-2 outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Subtitle / Format</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Feature Film Trilogy / 70mm IMAX"
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#8794a8] font-mono">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-2.5 py-2 outline-none"
                  >
                    <option value="Historical Mythological Epic">Historical Mythological Epic</option>
                    <option value="Period War Drama">Period War Drama</option>
                    <option value="Neo-Noir Mystery">Neo-Noir Mystery</option>
                    <option value="Contemporary Cinema">Contemporary Cinema</option>
                    <option value="Sci-Fi Dystopian">Sci-Fi Dystopian</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#8794a8] font-mono">Director</label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="e.g. Aakash Verma"
                    className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Synopsis / Production Vision</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the core story, tone, and character casting goals..."
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#202735]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-[#828fa3] hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-colors"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
