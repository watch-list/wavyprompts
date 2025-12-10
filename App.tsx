import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles } from './components/Icons';
import { PromptData, SharedData } from './types';
import { getPrompts, savePrompt } from './services/storageService';
import { decodeShareData } from './services/shareService';
import { PromptCard } from './components/PromptCard';
import { AddModal } from './components/AddModal';
import { FullView } from './components/FullView';

const App: React.FC = () => {
  const [view, setView] = useState<'gallery' | 'full' | 'shared'>('gallery');
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptData | null>(null);
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize and handle routing via Hash
  useEffect(() => {
    const loadData = () => {
      setPrompts(getPrompts());
    };

    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith('#/share/')) {
        const encoded = hash.split('#/share/')[1];
        const decoded = decodeShareData(encoded);
        if (decoded) {
          setSharedData(decoded);
          setView('shared');
        } else {
          window.location.hash = ''; // Invalid link
        }
      } else if (hash.startsWith('#/view/')) {
        // We need to wait for prompts to load if this is first render
        const id = hash.split('#/view/')[1];
        const allPrompts = getPrompts(); // Get fresh
        setPrompts(allPrompts);
        
        const found = allPrompts.find(p => p.id === id);
        if (found) {
          setSelectedPrompt(found);
          setView('full');
        } else {
          window.location.hash = '';
        }
      } else {
        setView('gallery');
        setSelectedPrompt(null);
        setSharedData(null);
        loadData();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSavePrompt = (newPrompt: PromptData) => {
    savePrompt(newPrompt);
    const updatedPrompts = getPrompts();
    setPrompts(updatedPrompts);
    
    // If we are editing the currently viewed prompt, update the view immediately
    if (selectedPrompt && selectedPrompt.id === newPrompt.id) {
        setSelectedPrompt(newPrompt);
    }
  };

  const openAddModal = () => {
    setEditingPrompt(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (prompt: PromptData) => {
    setEditingPrompt(prompt);
    setIsAddModalOpen(true);
  };

  const openPrompt = (prompt: PromptData) => {
    window.location.hash = `#/view/${prompt.id}`;
  };

  const closeFullView = () => {
    window.location.hash = '';
  };

  // Filter Logic
  const filteredPrompts = prompts.filter(p => {
    const matchesCategory = activeCategory === 'All' || (p.category || 'NanoBanana') === activeCategory;
    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'NanoBanana', 'Midjourney', 'Seedream'];

  // ----- SHARED VIEW RENDER -----
  if (view === 'shared' && sharedData) {
    return (
      <FullView 
        data={sharedData} 
        isOwner={false} 
        onBack={() => {}} // No back action for shared view as requested
      />
    );
  }

  // ----- OWNER FULL VIEW RENDER -----
  if (view === 'full' && selectedPrompt) {
    return (
      <>
        <FullView 
            data={selectedPrompt} 
            isOwner={true} 
            onBack={closeFullView}
            // Removed onEdit here as requested to keep full view clean
        />
        <AddModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSave={handleSavePrompt} 
            initialData={editingPrompt}
        />
      </>
    );
  }

  // ----- GALLERY VIEW RENDER -----
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#5C5CFF] selection:text-white">
      
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-30 px-4 md:px-6 py-4 md:py-6 bg-gradient-to-b from-[#050505] via-[#050505]/95 to-transparent pointer-events-none transition-all duration-300">
        <div className="flex items-center justify-between pointer-events-auto max-w-7xl mx-auto w-full">
           <div className="flex items-center gap-2 md:gap-3">
              {/* Logo */}
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#5C5CFF]/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(92,92,255,0.3)]">
                  <Sparkles size={18} className="text-[#5C5CFF] md:w-5 md:h-5" fill="currentColor" fillOpacity={0.2} />
              </div>
              <h1 className="text-xl md:text-2xl font-bold font-display tracking-tighter">
                Wavy<span className="text-[#5C5CFF]">Prompts</span>
              </h1>
           </div>

           <button 
             onClick={openAddModal}
             className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white text-black font-bold text-[10px] md:text-xs uppercase tracking-wider hover:bg-[#5C5CFF] hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 touch-manipulation"
           >
             <Plus size={14} strokeWidth={3} className="md:w-4 md:h-4" />
             <span>Add<span className="hidden sm:inline"> Prompt</span></span>
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 md:pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Controls Bar: Categories + Search */}
          <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
              
              {/* Category Filter Tabs - Mobile Edge-to-Edge Scroll */}
              <div className="w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                     {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`
                            px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 flex-shrink-0 touch-manipulation
                            ${activeCategory === cat 
                              ? 'bg-white text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)]' 
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}
                          `}
                        >
                          {cat}
                        </button>
                     ))}
                  </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72 shrink-0 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={16} className="text-white/30 group-focus-within:text-[#5C5CFF] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prompts..."
                    className="w-full bg-white/5 border border-white/10 text-white rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white/10 focus:border-[#5C5CFF]/50 transition-all placeholder:text-white/20 appearance-none"
                  />
              </div>

          </div>

          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center animate-in fade-in duration-700">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                 {searchQuery ? <Search size={28} className="text-white/20 md:w-8 md:h-8" /> : <Plus size={28} className="text-white/20 md:w-8 md:h-8" />}
              </div>
              <h2 className="text-lg md:text-xl font-display text-white/80 mb-2">
                 {searchQuery 
                    ? `No results for "${searchQuery}"`
                    : (activeCategory === 'All' ? 'Vault Empty' : `No ${activeCategory} Prompts`)}
              </h2>
              <p className="text-white/40 max-w-xs mx-auto mb-8 text-sm md:text-base">
                 {searchQuery 
                    ? 'Try checking your spelling or use different keywords.'
                    : (activeCategory === 'All' 
                       ? 'Start your collection by adding your first AI generation prompt.'
                       : 'Try selecting a different category or add a new one.')}
              </p>
              {activeCategory === 'All' && !searchQuery && (
                  <button 
                    onClick={openAddModal}
                    className="text-[#5C5CFF] hover:text-white transition-colors text-sm font-bold uppercase tracking-wider p-2"
                  >
                    + Add New Prompt
                  </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-x-6 md:gap-y-12">
              {filteredPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  data={prompt} 
                  onClick={() => openPrompt(prompt)} 
                  onEdit={() => openEditModal(prompt)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSavePrompt} 
        initialData={editingPrompt}
      />
    </div>
  );
};

export default App;