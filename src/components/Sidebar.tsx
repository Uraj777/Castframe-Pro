import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Film, 
  Kanban, 
  Wand2, 
  Sparkles, 
  FolderArchive, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  X,
  Plus,
  Shirt
} from 'lucide-react';
import { Project } from '../types';
import { Columns } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange?: (tab: any) => void;
  onSelectTab?: (tab: any) => void;
  activeProjectTitle?: string;
  activeProject?: Project;
  onOpenAddActor?: () => void;
  onOpenCreateModel?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  activeProjectTitle,
  activeProject,
  onOpenAddActor,
  onOpenCreateModel,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const handleTab = (tab: string) => {
    if (onTabChange) onTabChange(tab);
    if (onSelectTab) onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const projectTitle = activeProjectTitle || activeProject?.title || 'Active Influencer Campaign';

  const navItems: { id: string; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Studio Dashboard', icon: LayoutDashboard },
    { id: 'actors', label: 'Influencer Personas', icon: Users },
    { id: 'projects', label: 'Campaigns & Drops', icon: Film },
    { id: 'generator', label: 'Visuals & Script Studio', icon: Wand2 },
    { id: 'casting-board', label: 'Campaign Roster', icon: Kanban },
    { id: 'comparison', label: 'Aesthetic Matrix', icon: Columns },
    { id: 'generations', label: 'Lookbook & Assets', icon: Sparkles },
    { id: 'collections', label: 'Lookbook Drops', icon: FolderArchive },
    { id: 'settings', label: 'Medusa & API Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full w-full bg-[#12151b]">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#222733]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs tracking-wider shadow-sm">
              CF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[15px] font-bold tracking-[0.18em] text-white uppercase">
                  CASTFRAME<span className="text-amber-400 font-mono text-xs ml-1 font-semibold tracking-normal">STUDIO</span>
                </h1>
              </div>
              <p className="text-[10px] text-[#788296] tracking-tight font-medium">
                AI Influencer & Medusa Engine
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[#7c879c] hover:text-white hover:bg-[#202738] transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Create Identity Profile CTA Button in Sidebar */}
        <button
          onClick={() => {
            if (onOpenCreateModel) onOpenCreateModel();
            else if (onOpenAddActor) onOpenAddActor();
            if (onCloseMobile) onCloseMobile();
          }}
          className="mt-3.5 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Create AI Persona</span>
        </button>

        {/* Current Active Project Ribbon */}
        <div className="mt-3 px-2.5 py-1.5 rounded bg-[#171b22] border border-[#272e3c] flex items-center justify-between">
          <div className="overflow-hidden">
            <span className="text-[9px] uppercase tracking-wider text-[#697489] font-mono block">
              Active Campaign
            </span>
            <span className="text-xs font-semibold text-amber-200 truncate block">
              {projectTitle}
            </span>
          </div>
          <button 
            id="sidebar-switch-project-btn"
            onClick={() => handleTab('projects')}
            className="text-[10px] text-[#9aa4b7] hover:text-white p-1 hover:bg-[#202632] rounded transition-colors"
            title="Switch project"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-2 pb-1.5 pt-1 text-[10px] font-mono uppercase tracking-wider text-[#5a6578]">
          Production Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-xs'
                  : 'text-[#9ba4b5] hover:text-white hover:bg-[#181d26] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-[#6c788d]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span 
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-amber-500/20 text-amber-200' 
                      : 'bg-[#1e2430] text-[#788397]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Engine Telemetry */}
      <div className="p-3.5 border-t border-[#222733] bg-[#0e1116]">
        <div className="p-2.5 rounded-lg bg-[#151921] border border-[#232a38] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-[#abb5c7] uppercase">Identity Mesh</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              v3.4 Locked
            </span>
          </div>
          <p className="text-[11px] text-[#717c91] leading-relaxed">
            Multi-angle facial geometry & outfit transfer calibrated.
          </p>
          <div className="w-full bg-[#202735] h-1 rounded overflow-hidden">
            <div className="bg-amber-400 h-full w-[98%]" />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#616c80]">
            <span>Mobile Ready</span>
            <span>Acc: 99.4%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside 
        id="main-sidebar-desktop"
        className="hidden md:flex w-64 bg-[#12151b] border-r border-[#222733] flex-col justify-between shrink-0 select-none z-20 h-screen sticky top-0"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer (only shown when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

