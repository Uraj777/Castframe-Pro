import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  Film, 
  Sparkles, 
  CheckCircle2, 
  Menu,
  X,
  Shirt
} from 'lucide-react';
import { Project } from '../types';

interface TopNavProps {
  currentProject?: Project;
  activeProject?: Project;
  allProjects?: Project[];
  projects?: Project[];
  onSelectProject: (proj: Project) => void;
  onOpenNewLook?: () => void;
  onOpenAddActor: () => void;
  onOpenCreateModel?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentProject,
  activeProject,
  allProjects,
  projects,
  onSelectProject,
  onOpenNewLook,
  onOpenAddActor,
  onOpenCreateModel,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
  onNavigateToTab,
  onToggleMobileMenu
}) => {
  const current = currentProject || activeProject;
  const projectList = allProjects || projects || [];
  const handleOpenLook = onOpenNewLook || (() => onNavigateToTab?.('generator'));
  const [showProjectsMenu, setShowProjectsMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const notifications = [
    {
      id: 1,
      title: 'Identity Profile Calibrated',
      desc: 'Model calibrated with 20 angles (99.4% likeness fidelity)',
      time: '12m ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'Batch Outfit Render Complete',
      desc: 'Bespoke Suit and Knight Armor looks generated for review',
      time: '45m ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'Screen Test Shortlist Updated',
      desc: 'New wardrobe comparison set pinned to Moodboard',
      time: '2h ago',
      type: 'update'
    }
  ];

  return (
    <header 
      id="main-topnav"
      className="h-14 bg-[#12151b] border-b border-[#222733] px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 select-none"
    >
      {/* Left: Mobile hamburger & Project Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          id="topnav-mobile-menu-btn"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#9ba4b5] hover:text-white hover:bg-[#1c222e] transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            id="topnav-project-switcher-btn"
            onClick={() => setShowProjectsMenu(!showProjectsMenu)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded bg-[#171b22] hover:bg-[#1f2530] border border-[#272e3c] transition-colors max-w-[140px] sm:max-w-[220px]"
          >
            <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="text-left truncate">
              <span className="text-[9px] font-mono text-[#6c778c] uppercase tracking-wider block leading-none">
                Production
              </span>
              <span className="text-xs font-semibold text-white leading-tight flex items-center gap-1 mt-0.5 truncate">
                <span className="truncate">{current?.title || 'Main Production'}</span>
                <ChevronDown className="w-3 h-3 text-[#79859b] shrink-0" />
              </span>
            </div>
          </button>

          {showProjectsMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#151921] border border-[#2b3342] rounded-lg shadow-2xl p-1.5 z-50">
              <div className="px-2.5 py-1.5 text-[10px] font-mono text-[#6c788d] uppercase tracking-wider border-b border-[#202735]">
                Switch Production
              </div>
              <div className="py-1 space-y-0.5">
                {projectList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p);
                      setShowProjectsMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                      p.id === current?.id
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-[#9ba5b7] hover:bg-[#1e2430] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{p.title}</div>
                      <div className="text-[10px] text-[#6c778d]">{p.genre}</div>
                    </div>
                    {p.id === current?.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Search - responsive */}
        <div className="relative hidden sm:block w-36 md:w-60 lg:w-72">
          <Search className="w-3.5 h-3.5 text-[#5d677a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="topnav-search-input"
            type="text"
            placeholder="Search actors, outfits..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#161a22] border border-[#262c3a] focus:border-amber-500/50 rounded-md pl-8 pr-7 py-1.5 text-xs text-white placeholder-[#5a6476] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687387] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick actions, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Create Identity Profile CTA Button */}
        <button
          id="topnav-create-my-model-btn"
          onClick={onOpenCreateModel || onOpenAddActor}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-black font-bold text-xs rounded-lg transition-all shadow-sm"
          title="Upload reference photos of yourself to establish an Identity Profile"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="inline">+ Create Identity Profile</span>
        </button>

        {/* Quick Generation CTA */}
        <button
          id="topnav-generate-look-btn"
          onClick={handleOpenLook}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1b212c] hover:bg-[#252d3d] border border-[#2e394e] text-white font-medium text-xs rounded-lg transition-all"
        >
          <span>Try Outfits</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="topnav-notifications-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadNotifications(0);
            }}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#1b202a] text-[#818d9f] hover:text-white relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#12151b]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#161a22] border border-[#2b3343] rounded-lg shadow-2xl p-2 z-50">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#232a37]">
                <span className="text-xs font-semibold text-white">Production Notifications</span>
                <span className="text-[10px] font-mono text-amber-400">Live</span>
              </div>
              <div className="divide-y divide-[#202735] max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-[#1a202b] transition-colors rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-amber-200">{n.title}</span>
                      <span className="text-[9px] font-mono text-[#616c80]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#8692a5] mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-[#262c3a]">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160"
            alt="Creative Director"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-500/40"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white leading-none">Creative Director</div>
            <div className="text-[10px] text-[#6d788b] leading-tight mt-0.5 font-mono">Medusa Studio Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
