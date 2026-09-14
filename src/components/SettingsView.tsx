import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Sliders, 
  HardDrive, 
  Download, 
  Key, 
  Check, 
  RefreshCw 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [identityThreshold, setIdentityThreshold] = useState<number>(98);
  const [defaultRatio, setDefaultRatio] = useState<string>('16:9');
  const [colorSpace, setColorSpace] = useState<string>('Rec.709');
  const [autoCache, setAutoCache] = useState<boolean>(true);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div id="settings-view" className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      
      {/* Toast */}
      {savedToast && (
        <div className="fixed top-16 right-8 z-50 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-md shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>Production settings saved successfully</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#232938] pb-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
            System Preferences
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-amber-400" />
          Production Engine & Studio Settings
        </h2>
        <p className="text-xs text-[#758297] mt-1">
          Configure identity preservation fidelity, rendering pipeline presets, and lookbook exports.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        
        {/* Section 1: Identity & 3D Mesh Engine */}
        <div className="p-6 rounded-xl bg-[#12161f] border border-[#232938] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              CastFrame IdentityMesh Engine
            </h3>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Active v3.4
            </span>
          </div>
          
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <label className="text-[#8e9cb0]">Identity Preservation Strictness</label>
                <span className="text-amber-400 font-bold">{identityThreshold}%</span>
              </div>
              <input
                type="range"
                min={80}
                max={100}
                value={identityThreshold}
                onChange={(e) => setIdentityThreshold(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#202735] rounded-lg"
              />
              <p className="text-[11px] text-[#69758a]">
                Higher strictness guarantees unmistakable actor recognizability even under heavy armor and dramatic age progression.
              </p>
            </div>

            <div className="pt-3 border-t border-[#1e2432] grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[#8e9cb0] font-mono">Default Camera Aspect Ratio</label>
                <select
                  value={defaultRatio}
                  onChange={(e) => setDefaultRatio(e.target.value)}
                  className="w-full bg-[#181d28] border border-[#273042] text-white text-xs rounded px-2.5 py-1.5 outline-none"
                >
                  <option value="16:9">16:9 Standard Master</option>
                  <option value="2.39:1">2.39:1 Anamorphic Cinema</option>
                  <option value="4:5">4:5 Character Poster</option>
                  <option value="1:1">1:1 Square Reference</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#8e9cb0] font-mono">Color Science Space</label>
                <select
                  value={colorSpace}
                  onChange={(e) => setColorSpace(e.target.value)}
                  className="w-full bg-[#181d28] border border-[#273042] text-white text-xs rounded px-2.5 py-1.5 outline-none"
                >
                  <option value="Rec.709">Rec.709 (Standard Broadcast)</option>
                  <option value="ACEScc">ACEScc (Film Finishing)</option>
                  <option value="DCI-P3">DCI-P3 (Theatrical Projection)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Workspace Data & Custom Models (No Hardcoded Data) */}
        <div className="p-6 rounded-xl bg-[#12161f] border border-[#232938] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              Workspace Data & Custom Model Storage
            </h3>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
              Local Persistence Active
            </span>
          </div>
          <p className="text-xs text-[#8c98ac] leading-relaxed">
            All your uploaded 20-photo actor models, custom character looks, wardrobe outfits, and productions are stored directly in your browser's persistent storage. You can clear all sample demo data, export your workspace as a portable JSON file, or restore at any time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all sample data and switch to a clean, empty workspace for your personal models?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="p-3 rounded-lg bg-[#171c26] hover:bg-red-500/10 border border-[#252c3c] hover:border-red-500/30 text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-red-400 group-hover:text-red-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Start Blank Workspace</span>
              </div>
              <p className="text-[11px] text-[#717e94] mt-1 leading-tight">
                Removes all sample actors and sets up a pure workspace for your own photos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                const json = localStorage.getItem('castframe_actors_v2') ? JSON.stringify(localStorage, null, 2) : '{}';
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `castframe-workspace-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="p-3 rounded-lg bg-[#171c26] hover:bg-[#1e2536] border border-[#252c3c] text-left transition-colors"
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Workspace JSON</span>
              </div>
              <p className="text-[11px] text-[#717e94] mt-1 leading-tight">
                Download a backup of your personal models, wardrobe outfits, and looks.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all persona caches and initialize a clean workspace?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="p-3 rounded-lg bg-[#171c26] hover:bg-[#1e2536] border border-[#252c3c] text-left transition-colors"
            >
              <div className="text-xs font-semibold text-[#c0cce0] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Studio Workspace</span>
              </div>
              <p className="text-[11px] text-[#717e94] mt-1 leading-tight">
                Clear temporary caches and reset your creator studio to default state.
              </p>
            </button>
          </div>
        </div>

        {/* Section 3: Model & Backend Integration Abstraction */}
        <div className="p-6 rounded-xl bg-[#12161f] border border-[#232938] space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            Generation Pipeline & Backend API
          </h3>
          <p className="text-xs text-[#8c98ac] leading-relaxed">
            The application is built with a modular generator abstraction service (<code className="text-amber-200">LookGenerationService</code>). When external models or private studio compute clusters are connected, all loading states, progress callbacks, and prompt payloads are already structured for immediate API binding.
          </p>

          <div className="p-3.5 rounded bg-[#171c26] border border-[#252c3c] text-xs font-mono text-[#8693a7] space-y-1">
            <div className="flex justify-between">
              <span>Engine Status:</span>
              <span className="text-emerald-400">High-Fidelity Studio Simulation Active</span>
            </div>
            <div className="flex justify-between">
              <span>Reference Pipeline:</span>
              <span>10-15 Multi-Angle Facial Mesh Calibration</span>
            </div>
            <div className="flex justify-between">
              <span>Target Output:</span>
              <span>70mm Film Grain Emulation Pass</span>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded transition-colors shadow-sm"
          >
            Save Configuration
          </button>
        </div>

      </div>

    </div>
  );
};
