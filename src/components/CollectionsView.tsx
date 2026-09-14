import React, { useState } from 'react';
import { 
  FolderArchive, 
  Plus, 
  Sparkles, 
  Eye, 
  Download, 
  Tag, 
  Clock, 
  ArrowLeft,
  X,
  Check
} from 'lucide-react';
import { LookCollection, GeneratedLook } from '../types';

interface CollectionsViewProps {
  collections: LookCollection[];
  allLooks: GeneratedLook[];
  onCreateCollection: (newColl: LookCollection) => void;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  allLooks,
  onCreateCollection,
  onOpenLightbox
}) => {
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  // Looks in the currently opened collection
  const collectionLooks = activeCollection
    ? allLooks.filter((l) => activeCollection.lookIds.includes(l.id))
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newColl: LookCollection = {
      id: `coll-${Date.now()}`,
      title: title.trim(),
      description: desc.trim() || 'Curated casting mood-board look collection.',
      coverImage: allLooks[0]?.imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
      itemCount: 0,
      lookIds: [],
      updatedAt: 'Just now',
      tags: tagInput ? tagInput.split(',').map(t => t.trim()) : ['Look Book']
    };

    onCreateCollection(newColl);
    setShowCreateModal(false);
    setTitle('');
    setDesc('');
    setTagInput('');
    setToastMessage(`Created mood-board collection "${newColl.title}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div id="collections-view" className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-md shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232938] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Visual Moodboards
            </span>
            <span className="text-xs text-[#738096] font-mono">
              Curated department portfolios & wardrobe references
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Collections & Look Books
          </h2>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Collection</span>
        </button>
      </div>

      {/* Main Content: Either Collection List or Opened Collection Detail */}
      {!activeCollectionId ? (
        /* Collections Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((coll) => (
            <div
              key={coll.id}
              onClick={() => setActiveCollectionId(coll.id)}
              className="group bg-[#12161f] border border-[#232938] hover:border-amber-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col shadow-lg"
            >
              {/* Moodboard Cover Collage Container */}
              <div className="aspect-[4/3] w-full bg-[#1b202c] relative overflow-hidden">
                <img
                  src={coll.coverImage}
                  alt={coll.title}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12161f] via-transparent to-transparent opacity-80" />

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    {coll.lookIds.length} Looks
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {coll.title}
                  </h3>
                  <p className="text-xs text-[#8c98ac] mt-1 line-clamp-2 leading-relaxed">
                    {coll.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1f2533] space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {coll.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#171c26] text-[#788498] border border-[#252c3c]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#606c80] pt-1">
                    <span>Updated {coll.updatedAt}</span>
                    <span className="text-amber-400 font-semibold group-hover:underline">Open →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Active Collection Opened View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveCollectionId(null)}
              className="flex items-center gap-1.5 text-xs text-[#8c98ad] hover:text-white transition-colors px-2.5 py-1.5 rounded hover:bg-[#161a22]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Collections</span>
            </button>

            <button
              onClick={() => {
                setToastMessage(`Exported PDF Moodboard for ${activeCollection?.title}`);
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171c26] hover:bg-[#202735] text-amber-300 border border-[#272f3e] text-xs font-mono rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Moodboard Sheet</span>
            </button>
          </div>

          {activeCollection && (
            <div className="p-6 rounded-xl bg-[#12161f] border border-[#232938] space-y-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                Moodboard Collection
              </span>
              <h3 className="text-xl font-bold text-white">{activeCollection.title}</h3>
              <p className="text-xs text-[#8c98ac] max-w-2xl">{activeCollection.description}</p>
            </div>
          )}

          {/* Looks in this collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionLooks.map((look, idx) => (
              <div
                key={`${look.id || 'look'}-${idx}`}
                onClick={() => onOpenLightbox(look.imageUrl, look.lookName, `${look.character} • ${look.actorName}`)}
                className="group bg-[#13161e] border border-[#242b3a] hover:border-amber-500/40 rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col shadow-md"
              >
                <div className="aspect-[16/10] w-full bg-[#1b202c] relative overflow-hidden">
                  <img
                    src={look.imageUrl}
                    alt={look.lookName}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-amber-300 border border-amber-500/30">
                      {look.character}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {look.lookName}
                  </h4>
                  <p className="text-[11px] text-[#717e92]">
                    Actor: <span className="text-[#a4b1c5] font-medium">{look.actorName}</span>
                  </p>
                  <p className="text-[10px] font-mono text-[#616d80] pt-1">
                    {look.config.visualStyle} • {look.config.lighting} Light
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-[#2b3345] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <h3 className="text-sm font-semibold text-white">Create New Moodboard Collection</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6d7a8e] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Collection Name (e.g. Summer Drop Looks)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Luxury Editorial & Streetwear"
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-3 py-2 outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Purpose of this lookbook collection..."
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded p-2.5 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8794a8] font-mono">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Campaign, Editorial, Streetwear"
                  className="w-full bg-[#181d28] border border-[#283244] text-white rounded px-3 py-2 outline-none"
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
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
