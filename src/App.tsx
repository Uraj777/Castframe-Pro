/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { 
  Project, 
  Actor, 
  CharacterRole, 
  GeneratedLook, 
  CastingCandidate, 
  LookCollection 
} from './types';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { ActorProfileView } from './components/ActorProfileView';
import { GeneratorView } from './components/GeneratorView';
import { ComparisonView } from './components/ComparisonView';
import { CastingBoardView } from './components/CastingBoardView';
import { CollectionsView } from './components/CollectionsView';
import { GenerationsListView } from './components/GenerationsListView';
import { ActorsListView } from './components/ActorsListView';
import { ProjectsView } from './components/ProjectsView';
import { SettingsView } from './components/SettingsView';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { AddActorModal } from './components/AddActorModal';
import { CreateModelModal } from './components/CreateModelModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Application Data States (Backed by storageService for persistent custom models)
  const [projects, setProjects] = useState<Project[]>(() => storageService.getProjects());
  const [activeProject, setActiveProject] = useState<Project>(() => {
    const savedProjects = storageService.getProjects();
    const activeId = storageService.getActiveProjectId();
    return savedProjects.find(p => p.id === activeId) || savedProjects[0];
  });
  const [actors, setActors] = useState<Actor[]>(() => storageService.getActors());
  const [selectedActorId, setSelectedActorId] = useState<string>(() => {
    const initialActors = storageService.getActors();
    return initialActors[0]?.id || '';
  });
  const [characters, setCharacters] = useState<CharacterRole[]>(() => storageService.getCharacters());
  const [allLooks, setAllLooks] = useState<GeneratedLook[]>(() => storageService.getLooks());
  const [candidates, setCandidates] = useState<CastingCandidate[]>(() => storageService.getCandidates());
  const [collections, setCollections] = useState<LookCollection[]>(() => storageService.getCollections());
  const [preloadedLook, setPreloadedLook] = useState<GeneratedLook | null>(null);

  // Modals
  const [showAddActorModal, setShowAddActorModal] = useState<boolean>(false);
  const [showCreateModelModal, setShowCreateModelModal] = useState<boolean>(false);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: ''
  });

  // Persistent storage synchronization
  useEffect(() => {
    storageService.saveActors(actors);
  }, [actors]);

  useEffect(() => {
    storageService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (activeProject?.id) {
      storageService.saveActiveProjectId(activeProject.id);
    }
  }, [activeProject]);

  useEffect(() => {
    storageService.saveLooks(allLooks);
  }, [allLooks]);

  useEffect(() => {
    storageService.saveCharacters(characters);
  }, [characters]);

  useEffect(() => {
    storageService.saveCandidates(candidates);
  }, [candidates]);

  useEffect(() => {
    storageService.saveCollections(collections);
  }, [collections]);

  // Keep selectedActorId valid
  useEffect(() => {
    if (actors.length > 0 && (!selectedActorId || !actors.some(a => a.id === selectedActorId))) {
      setSelectedActorId(actors[0].id);
    }
  }, [actors, selectedActorId]);

  // Handler helpers
  const handleOpenLightbox = (imageUrl: string, title: string, subtitle?: string) => {
    setLightboxData({
      isOpen: true,
      imageUrl,
      title,
      subtitle
    });
  };

  const handleCloseLightbox = () => {
    setLightboxData({
      isOpen: false,
      imageUrl: '',
      title: '',
      subtitle: ''
    });
  };

  const handleSelectActor = (actorId: string) => {
    setSelectedActorId(actorId);
    setActiveTab('actor-detail');
  };

  const handleLaunchGeneratorForActor = (actorId: string) => {
    setSelectedActorId(actorId);
    setPreloadedLook(null);
    setActiveTab('generator');
  };

  const handleSelectLook = (look: GeneratedLook) => {
    setSelectedActorId(look.actorId);
    setPreloadedLook(look);
    setActiveTab('generator');
  };

  const handleUpdateActor = (updatedActor: Actor) => {
    setActors((prev) => prev.map((a) => (a.id === updatedActor.id ? updatedActor : a)));
  };

  const handleAddActor = (newActor: Actor) => {
    setActors((prev) => [newActor, ...prev]);
    setSelectedActorId(newActor.id);
    setActiveProject((prev) => ({
      ...prev,
      actorsCount: (prev?.actorsCount || 0) + 1
    }));
  };

  const handleAddLook = (newLook: GeneratedLook) => {
    setAllLooks((prev) => {
      const filtered = prev.filter((l) => l.id !== newLook.id);
      return [newLook, ...filtered];
    });
    // increment count for actor and project
    setActors((prev) =>
      prev.map((a) =>
        a.id === newLook.actorId
          ? { ...a, generatedLooksCount: (a.generatedLooksCount || 0) + 1, lastUpdated: 'Just now' }
          : a
      )
    );
    setActiveProject((prev) => ({
      ...prev,
      looksCount: (prev?.looksCount || 0) + 1
    }));
  };

  const handleUpdateCandidate = (updatedCandidate: CastingCandidate) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
    );
  };

  const handleAddCandidate = (newCandidate: CastingCandidate) => {
    setCandidates((prev) => [newCandidate, ...prev]);
  };

  const handleCreateShortlistFromComparison = (selectedLookIds: string[]) => {
    selectedLookIds.forEach((lookId) => {
      const look = allLooks.find((l) => l.id === lookId);
      if (!look) return;
      const actor = actors.find((a) => a.id === look.actorId);
      const character = characters.find((c) => c.name.toLowerCase() === look.character.toLowerCase()) || characters[0];
      
      const newCand: CastingCandidate = {
        id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        actorId: look.actorId,
        actorName: actor ? actor.name : 'Unknown Actor',
        actorPortrait: actor ? actor.portraitUrl : look.imageUrl,
        character: look.character,
        candidateNumber: `Candidate ${(candidates.length + 1).toString().padStart(2, '0')}`,
        status: 'shortlisted',
        rating: 5,
        notes: `Selected from comparison matrix. Likeness: ${look.likenessScore}%`,
        pinnedLookUrl: look.imageUrl,
        lookName: look.title
      };
      handleAddCandidate(newCand);
    });
    setActiveTab('casting-board');
  };

  const handleCreateCollection = (title: string, description: string, lookIds: string[]) => {
    const newColl: LookCollection = {
      id: `coll-${Date.now()}`,
      title,
      description,
      coverImage: allLooks.find((l) => lookIds.includes(l.id))?.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
      lookIds,
      itemCount: lookIds.length,
      updatedAt: 'Just now',
      tags: ['Custom Lookbook']
    };
    setCollections((prev) => [newColl, ...prev]);
  };

  const handleCreateProject = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
    setActiveProject(newProj);
    setActiveTab('dashboard');
  };

  const selectedActor = actors.find((a) => a.id === selectedActorId) || actors[0];

  return (
    <div className="flex h-screen w-screen bg-[#0e1013] text-[#e0e4eb] overflow-hidden font-sans select-none">
      
      {/* Permanent Cinematic Sidebar (Desktop) + Slide-Over Drawer (Mobile) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectTab={setActiveTab}
        activeProject={activeProject}
        activeProjectTitle={activeProject?.title}
        onOpenAddActor={() => setShowAddActorModal(true)}
        onOpenCreateModel={() => setShowCreateModelModal(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0e1013]">
        
        {/* Sticky Top Navigation */}
        <TopNav
          currentProject={activeProject}
          activeProject={activeProject}
          allProjects={projects}
          projects={projects}
          onSelectProject={setActiveProject}
          onOpenNewLook={() => {
            setPreloadedLook(null);
            setActiveTab('generator');
          }}
          onOpenAddActor={() => setShowAddActorModal(true)}
          onOpenCreateModel={() => setShowCreateModelModal(true)}
          onNavigateToTab={setActiveTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Scrollable View Container (pb-20 on mobile to leave room for MobileBottomNav) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              activeProject={activeProject}
              project={activeProject}
              actors={actors}
              recentGenerations={allLooks}
              characters={characters}
              onSelectActor={handleSelectActor}
              onSelectLook={handleSelectLook}
              onOpenGenerator={(actorId) => {
                if (actorId) setSelectedActorId(actorId);
                setPreloadedLook(null);
                setActiveTab('generator');
              }}
              onOpenAddActor={() => setShowAddActorModal(true)}
              onOpenCreateModel={() => setShowCreateModelModal(true)}
              onViewAllActors={() => setActiveTab('actors')}
              onViewAllGenerations={() => setActiveTab('generations')}
              onViewCastingBoard={() => setActiveTab('casting-board')}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'actors' && (
            <ActorsListView
              actors={actors}
              onSelectActor={handleSelectActor}
              onOpenAddActor={() => setShowAddActorModal(true)}
              onOpenCreateModel={() => setShowCreateModelModal(true)}
              onLaunchGenerator={handleLaunchGeneratorForActor}
            />
          )}

          {activeTab === 'actor-detail' && selectedActor && (
            <ActorProfileView
              actor={selectedActor}
              allLooks={allLooks}
              onBack={() => setActiveTab('actors')}
              onUpdateActor={handleUpdateActor}
              onLaunchGenerator={handleLaunchGeneratorForActor}
              onInspectLook={handleSelectLook}
              onOpenLightbox={handleOpenLightbox}
            />
          )}

          {activeTab === 'generator' && (
            <GeneratorView
              actors={actors}
              characters={characters}
              collections={collections}
              selectedActorId={selectedActorId}
              initialActorId={selectedActorId}
              initialLook={preloadedLook}
              onSaveLook={handleAddLook}
              onSaveNewLook={handleAddLook}
              onOpenLightbox={handleOpenLightbox}
              onNavigateToComparison={(actorId) => {
                setSelectedActorId(actorId);
                setActiveTab('comparison');
              }}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonView
              actors={actors}
              characters={characters}
              allLooks={allLooks}
              initialActorId={selectedActorId}
              onCreateShortlist={handleCreateShortlistFromComparison}
              onOpenLightbox={handleOpenLightbox}
            />
          )}

          {activeTab === 'casting-board' && (
            <CastingBoardView
              candidates={candidates}
              characters={characters}
              actors={actors}
              onUpdateCandidate={handleUpdateCandidate}
              onAddCandidate={handleAddCandidate}
              onOpenLightbox={handleOpenLightbox}
            />
          )}

          {activeTab === 'collections' && (
            <CollectionsView
              collections={collections}
              allLooks={allLooks}
              onCreateCollection={handleCreateCollection}
              onOpenLightbox={handleOpenLightbox}
            />
          )}

          {activeTab === 'generations' && (
            <GenerationsListView
              looks={allLooks}
              onSelectLook={handleSelectLook}
              onOpenLightbox={handleOpenLightbox}
              onOpenGenerator={() => {
                setPreloadedLook(null);
                setActiveTab('generator');
              }}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              activeProject={activeProject}
              onSelectProject={setActiveProject}
              onCreateProject={handleCreateProject}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone layout) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenCreateModel={() => setShowCreateModelModal(true)}
      />

      {/* 20-Photo Personal Identity Profile Creator Modal */}
      <CreateModelModal
        isOpen={showCreateModelModal}
        onClose={() => setShowCreateModelModal(false)}
        onModelCreated={(newActor, navigateToGenerator) => {
          handleAddActor(newActor);
          setShowCreateModelModal(false);
          setSelectedActorId(newActor.id);
          setPreloadedLook(null);
          if (navigateToGenerator) {
            setActiveTab('generator');
          } else {
            setActiveTab('actors');
          }
        }}
      />

      {/* Add Actor Modal (Standard studio workflow) */}
      {showAddActorModal && (
        <AddActorModal
          onClose={() => setShowAddActorModal(false)}
          onAddActor={handleAddActor}
        />
      )}

      {/* Global Image Lightbox Modal */}
      {lightboxData.isOpen && (
        <ImageLightboxModal
          imageUrl={lightboxData.imageUrl}
          title={lightboxData.title}
          subtitle={lightboxData.subtitle}
          onClose={handleCloseLightbox}
        />
      )}

    </div>
  );
}
