import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  ShieldCheck, 
  User, 
  Trash2, 
  Sparkles,
  Camera
} from 'lucide-react';
import { Actor, ActorReference } from '../types';

interface AddActorModalProps {
  onClose: () => void;
  onAddActor: (newActor: Actor) => void;
}

export const AddActorModal: React.FC<AddActorModalProps> = ({ onClose, onAddActor }) => {
  const [name, setName] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('28-35');
  const [actualAge, setActualAge] = useState<number>(32);
  const [height, setHeight] = useState<string>("5'11\"");
  const [build, setBuild] = useState<'Lean' | 'Athletic' | 'Muscular' | 'Heavy'>('Athletic');
  const [eyeColor, setEyeColor] = useState<string>('Dark Brown');
  const [hairColor, setHairStyle] = useState<string>('Black, Textured');
  const [notes, setNotes] = useState<string>('');
  const [portraitUrl, setPortraitUrl] = useState<string>(
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800'
  );

  // References list
  const [references, setReferences] = useState<ActorReference[]>([
    {
      id: 'ref-init-1',
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
      label: 'Front Close-up Neutral Studio',
      role: 'front_face',
      angle: 'Front 0°',
      lighting: 'Studio Key',
      quality: 'Excellent',
      isPrimary: true,
      uploadedAt: 'Just now',
      isAccepted: true
    },
    {
      id: 'ref-init-2',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      label: '3/4 Angle Right - Studio Lighting',
      role: 'three_quarter_right',
      angle: '3/4 Angle',
      lighting: 'Neutral Softbox',
      quality: 'Good',
      isPrimary: false,
      uploadedAt: 'Just now',
      isAccepted: true
    }
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newRef: ActorReference = {
            id: `ref-custom-${Date.now()}-${i}`,
            url: event.target.result as string,
            label: `Upload Reference #${references.length + 1}`,
            role: i % 2 === 0 ? 'front_face' : 'three_quarter_right',
            angle: i % 2 === 0 ? 'Front' : '3/4 Angle',
            lighting: 'Daylight',
            quality: 'Good',
            isPrimary: false,
            uploadedAt: 'Just now',
            isAccepted: true
          };
          setReferences((prev) => [...prev, newRef]);
          if (references.length === 0) {
            setPortraitUrl(newRef.url);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPresetImage = () => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800'
    ];
    const picked = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    const newRef: ActorReference = {
      id: `ref-sample-${Date.now()}`,
      url: picked,
      label: 'Profile Reference - High Key',
      role: 'profile_left',
      angle: 'Profile 90°',
      lighting: 'Dramatic',
      quality: 'Excellent',
      isPrimary: false,
      uploadedAt: 'Just now',
      isAccepted: true
    };
    setReferences((prev) => [...prev, newRef]);
  };

  const handleRemoveRef = (id: string) => {
    setReferences(references.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newActor: Actor = {
      id: `actor-${Date.now()}`,
      organizationId: 'org-castframe-studio',
      identityType: 'authorized_real_person',
      lifecycleStatus: 'ready',
      consentStatus: 'verified',
      name: name.trim(),
      portraitUrl: references[0]?.url || portraitUrl,
      ageRange,
      actualAge,
      height,
      build,
      eyeColor,
      hairColor,
      nationality: 'International Talent',
      identityCalibrated: true,
      notes: notes.trim() || 'New actor registered for casting considerations and look generation.',
      calibrationScore: Math.min(88 + references.length * 2, 98),
      generatedLooksCount: 0,
      references: references,
      lastUpdated: 'Just now'
    };

    onAddActor(newActor);
    onClose();
  };


  return (
    <div 
      id="add-actor-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#12161f] border border-[#262f40] rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212735] pb-4">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              Talent Registration
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Create Actor Reference Profile
            </h3>
          </div>
          <button onClick={onClose} className="text-[#69768a] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Main Info */}
          <div className="space-y-1">
            <label className="text-[#8997ac] font-mono">Actor Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikramaditya Rathore"
              className="w-full bg-[#171c26] border border-[#273042] text-white rounded px-3 py-2 outline-none focus:border-amber-500/50 text-sm font-medium"
            />
          </div>

          {/* Physical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[#8997ac] font-mono">Age Range</label>
              <input
                type="text"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                placeholder="28-35"
                className="w-full bg-[#171c26] border border-[#273042] text-white rounded px-2.5 py-1.5 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8997ac] font-mono">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="6'0&quot;"
                className="w-full bg-[#171c26] border border-[#273042] text-white rounded px-2.5 py-1.5 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8997ac] font-mono">Build</label>
              <select
                value={build}
                onChange={(e) => setBuild(e.target.value as any)}
                className="w-full bg-[#171c26] border border-[#273042] text-white rounded px-2.5 py-1.5 outline-none"
              >
                <option value="Athletic">Athletic</option>
                <option value="Muscular">Muscular</option>
                <option value="Lean">Lean</option>
                <option value="Heavy">Heavy</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[#8997ac] font-mono">Eye Color</label>
              <input
                type="text"
                value={eyeColor}
                onChange={(e) => setEyeColor(e.target.value)}
                placeholder="Dark Brown"
                className="w-full bg-[#171c26] border border-[#273042] text-white rounded px-2.5 py-1.5 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[#8997ac] font-mono">Casting Director Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vocal depth, emotional range, screen presence, martial arts training..."
              className="w-full bg-[#171c26] border border-[#273042] text-white rounded p-2.5 outline-none"
            />
          </div>

          {/* Reference Photos Upload Section */}
          <div className="space-y-2 pt-2 border-t border-[#202735]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold font-mono flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  Reference Photographs ({references.length} uploaded)
                </label>
                <p className="text-[11px] text-[#6d798d]">
                  10–15 multi-angle references recommended for optimal facial geometry.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPresetImage}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-mono"
              >
                + Add Sample Photo
              </button>
            </div>

            {/* Upload Drag/Click Zone */}
            <label className="block border border-dashed border-[#293244] hover:border-amber-500/50 bg-[#161a24] rounded-lg p-4 text-center cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <span className="text-xs text-white font-medium block">
                Drag & Drop or Click to Upload Photographs
              </span>
              <span className="text-[10px] text-[#616c80] font-mono">
                Accepts JPG, PNG, RAW headshots, 3/4 angles, profile shots
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Reference Thumbnails Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
              {references.map((ref) => (
                <div key={ref.id} className="aspect-square relative rounded overflow-hidden border border-[#283244] group bg-[#1a1f2c]">
                  <img src={ref.url} alt="Reference" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRef(ref.id)}
                      className="p-1 rounded bg-rose-500/80 text-white hover:bg-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 text-[8px] font-mono bg-black/80 text-white px-1 rounded">
                    {ref.angle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#212735]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#808d9f] hover:text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-colors shadow-sm"
            >
              Save & Register Actor Profile
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
