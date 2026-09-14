import React from 'react';
import { 
  Home, 
  Users, 
  Wand2, 
  Sparkles,
  Layers, 
  Film
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileMenu?: () => void;
  onOpenCreateModel: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateModel
}) => {
  return (
    <nav 
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1017]/95 backdrop-blur-lg border-t border-[#1e2536] px-3 py-2 flex items-center justify-around select-none safe-area-bottom shadow-2xl"
    >
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'dashboard' ? 'text-amber-400 font-semibold' : 'text-[#7e8d9f] hover:text-white'
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      {/* 2. People */}
      <button
        onClick={() => onSelectTab('actors')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'actors' || activeTab === 'actor-detail' ? 'text-amber-400 font-semibold' : 'text-[#7e8d9f] hover:text-white'
        }`}
      >
        <Users className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">People</span>
      </button>

      {/* 3. Prominent Central [+] Generate Action */}
      <button
        onClick={() => onSelectTab('generator')}
        className="flex flex-col items-center justify-center -mt-5 p-3 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25 active:scale-95 transition-transform"
        title="Generate Character Look"
      >
        <Wand2 className="w-5 h-5 fill-black" />
      </button>

      {/* 4. Looks */}
      <button
        onClick={() => onSelectTab('generations')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'generations' ? 'text-amber-400 font-semibold' : 'text-[#7e8d9f] hover:text-white'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Looks</span>
      </button>

      {/* 5. Casting */}
      <button
        onClick={() => onSelectTab('casting-board')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'casting-board' || activeTab === 'casting' ? 'text-amber-400 font-semibold' : 'text-[#7e8d9f] hover:text-white'
        }`}
      >
        <Film className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Casting</span>
      </button>
    </nav>
  );
};
