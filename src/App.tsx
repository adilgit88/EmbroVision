/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Explorer from './components/Explorer';
import Viewer from './components/Viewer';
import DetailsPanel from './components/DetailsPanel';
import StitchSimulator from './components/StitchSimulator';
import { DesignMetadata, DesignWithStitches } from './types';
import { EMBROIDERY_FORMATS } from './constants';
import { parseEmbroideryFile, generateThumbnail } from './lib/parser';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderOpen, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('library');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [designs, setDesigns] = useState<DesignMetadata[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<DesignWithStitches | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [simulationIndex, setSimulationIndex] = useState<number>(-1);

  // Initialize with some mock designs
  useEffect(() => {
    const initMockData = async () => {
      const mockFiles = [
        'Spring_Floral.dst',
        'Company_Logo_Final.pes',
        'Baby_Bib_Pattern.jef',
        'Vintage_Border.exp',
        'Gothic_Monogram.vp3',
        'Kawaii_Cat.pes',
        'Southwest_Sun.dst',
        'Elegant_Lace.hus',
      ];

      const mockDesigns = await Promise.all(
        mockFiles.map(async (name) => {
          const content = new Uint8Array([0, 1, 2]);
          const file = new File([content], name, { type: 'application/octet-stream' });
          const design = await parseEmbroideryFile(file);
          const thumb = generateThumbnail(design);
          return { ...design, thumbnail: thumb };
        })
      );

      setDesigns(mockDesigns);
      
      // Restore selection after load
      const savedSelectedId = localStorage.getItem('selected_design_id');
      if (savedSelectedId) {
        const found = mockDesigns.find(d => d.id === savedSelectedId);
        if (found) handleSelectDesign(found);
      }
    };

    const saved = localStorage.getItem('embroidery_library');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDesigns(parsed);
        const savedSelectedId = localStorage.getItem('selected_design_id');
        if (savedSelectedId) {
          const found = parsed.find((d: any) => d.id === savedSelectedId);
          if (found) handleSelectDesign(found);
        }
      } catch (e) {
        initMockData();
      }
    } else {
      initMockData();
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        if (selectedDesign) showInExplorer(selectedDesign.path);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDesign]);

  const showInExplorer = (path: string) => {
    // Simulator for desktop behavior
    setNotification({ 
      message: `Opening Windows Explorer at: ${path}`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    console.log(`OS Command: explorer.exe /select,"${path}"`);
  };

  // Save to local storage
  useEffect(() => {
    if (designs.length > 0) {
      localStorage.setItem('embroidery_library', JSON.stringify(designs.map(d => ({ ...d, stitches: undefined }))));
    }
  }, [designs]);

  const handleSelectDesign = async (metadata: DesignMetadata) => {
    setIsLoading(true);
    localStorage.setItem('selected_design_id', metadata.id);
    setSimulationIndex(-1); // Reset simulation
    try {
      const file = new File([new Uint8Array([0])], `${metadata.name}.${metadata.format.toLowerCase()}`);
      const design = await parseEmbroideryFile(file);
      setSelectedDesign({ ...metadata, stitches: design.stitches });
    } catch (err) {
       setNotification({ message: "Failed to load design stitches.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setDesigns(prev => prev.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
    if (selectedDesign?.id === id) {
      setSelectedDesign(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };
  
  const handleRescan = () => {
    setIsLoading(true);
    setNotification({ message: "Rescanning library for changes...", type: 'success' });
    
    // Simulate a library scan
    setTimeout(() => {
      setIsLoading(false);
      setNotification({ message: "Library scan complete. All files up to date.", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  const handleDeleteDesign = (id: string) => {
    if (confirm("Are you sure you want to delete this design from your library?")) {
      setDesigns(prev => prev.filter(d => d.id !== id));
      if (selectedDesign?.id === id) setSelectedDesign(null);
      setNotification({ message: "Design removed from library.", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportPNG = () => {
    if (!selectedDesign) return;
    const link = document.createElement('a');
    link.download = `${selectedDesign.name}_preview.png`;
    link.href = selectedDesign.thumbnail || '';
    link.click();
    setNotification({ message: "Exported PNG preview successfully.", type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredDesigns = useMemo(() => {
    let result = designs;
    
    if (activeView === 'favorites') {
      result = result.filter(d => d.isFavorite);
    }
    
    if (searchText) {
      result = result.filter(d => d.name.toLowerCase().includes(searchText.toLowerCase()));
    }
    
    return result;
  }, [designs, activeView, searchText]);

  const currentViewTitle = useMemo(() => {
    switch(activeView) {
      case 'library': return 'Full Library';
      case 'favorites': return 'Favorite Designs';
      case 'recent': return 'Recently Opened';
      case 'templates': return 'Design Templates';
      default: return 'Gallery';
    }
  }, [activeView]);

  const handleImport = async () => {
    const names = ['Abstract_Geometry.dst', 'Lace_Vines.pes', 'Classic_Car.jef', 'Sun_Ray.exp'];
    const name = names[Math.floor(Math.random() * names.length)];
    const content = new Uint8Array([0, 1, 2]);
    const file = new File([content], name, { type: 'application/octet-stream' });
    const design = await parseEmbroideryFile(file);
    const thumb = generateThumbnail(design);
    const newDesign = { ...design, thumbnail: thumb, status: 'New' as any };
    setDesigns(prev => [newDesign, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f3f3] font-sans text-[#1a1a1a] overflow-hidden">
      {/* OS-like Top Bar */}
      <div className="h-8 bg-white border-b border-[#e0e0e0] flex items-center px-3 text-xs select-none">
        <div className="flex gap-4">
          {['File', 'Edit', 'View', 'Tools', 'Help'].map(item => (
            <span key={item} className="cursor-default hover:bg-gray-100 px-2 py-1 rounded transition-colors text-[#1a1a1a] font-medium">
              {item}
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <div className="text-[10px] text-gray-400 font-medium px-2 opacity-60">
          Embroidery Design Viewer Pro v1.0
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fixed */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} onImport={handleImport} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#f3f3f3]">
          <TopBar 
            title={currentViewTitle} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            onOpenLocation={() => selectedDesign && showInExplorer(selectedDesign.path)}
            onExport={handleExportPNG}
            onPrint={handlePrint}
          />

          <div className="flex-1 flex overflow-hidden">
            {/* Explorer Section */}
            <section className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[#e0e0e0]">
               <Explorer 
                  designs={filteredDesigns} 
                  selectedId={selectedDesign?.id || null}
                  onSelect={handleSelectDesign}
                  viewMode={viewMode}
                  onOpenLocation={showInExplorer}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteDesign}
               />
            </section>

            {/* Details Section */}
            <DetailsPanel 
              design={selectedDesign} 
              onOpenLocation={() => selectedDesign && showInExplorer(selectedDesign.path)}
              onToggleFavorite={() => selectedDesign && handleToggleFavorite(selectedDesign.id)}
              onDelete={() => selectedDesign && handleDeleteDesign(selectedDesign.id)}
              onPrint={handlePrint}
              onRescan={handleRescan}
            />
          </div>
        </main>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-gray-900 text-white rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
          >
             {notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <FolderOpen className="w-5 h-5 text-blue-400" />}
             <span className="text-sm font-bold tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="h-[28px] bg-[#0067c0] text-white flex items-center justify-between px-3 text-[11px] font-medium select-none z-50">
        <div className="flex items-center gap-2 truncate pr-4">
          <span>Ready</span>
          <span className="opacity-40">|</span>
          <span className="truncate">{selectedDesign ? `Selected: ${selectedDesign.path}` : 'Welcome to Embroidery Viewer Pro'}</span>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <div className="flex gap-3">
            <span>Stitches: {selectedDesign?.totalStitches.toLocaleString() || '0'}</span>
            <span>Colors: {selectedDesign?.colorCount || '0'}</span>
            <span>Zoom: 100%</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay Viewer */}
      <AnimatePresence>
        {selectedDesign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex bg-black/40 backdrop-blur-sm"
          >
             <div className="w-[300px] h-full bg-white shadow-2xl z-10 border-r border-[#e0e0e0] flex flex-col text-[#1a1a1a] overflow-hidden">
               <div className="p-6 border-b border-[#e0e0e0] bg-[#f9f9f9]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#0067c0] rounded flex items-center justify-center font-bold text-white text-sm">E</div>
                    <h2 className="text-sm font-bold tracking-tight uppercase text-gray-400">Precision Analysis</h2>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight truncate">{selectedDesign.name}</h1>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded border border-[#e0e0e0]">
                      <p className="text-[9px] text-[#5d5d5d] font-bold uppercase tracking-widest leading-none mb-1">Width</p>
                      <p className="text-base font-bold font-mono">{Math.round(selectedDesign.width)}mm</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded border border-[#e0e0e0]">
                      <p className="text-[9px] text-[#5d5d5d] font-bold uppercase tracking-widest leading-none mb-1">Height</p>
                      <p className="text-base font-bold font-mono">{Math.round(selectedDesign.height)}mm</p>
                    </div>
                 </div>

                 <div className="p-4 bg-[#0067c0]/5 rounded border border-[#0067c0]/20">
                    <p className="text-[10px] text-[#0067c0] font-bold uppercase tracking-widest mb-1">Total Stitches</p>
                    <div className="flex justify-between items-end">
                       <span className="text-3xl font-black tabular-nums">{selectedDesign.totalStitches.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full mt-3 overflow-hidden">
                       <div className="h-full bg-[#0067c0] w-3/4 rounded-full" />
                    </div>
                 </div>

                 <section>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Thread Sequence</h3>
                    <div className="space-y-1">
                       {selectedDesign.colors.map((c, i) => (
                         <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors rounded-md group cursor-default">
                           <span className="w-4 text-[10px] font-bold text-gray-400 font-mono">{i+1}</span>
                           <div className="w-8 h-4 rounded shadow-sm border border-black/10" style={{ backgroundColor: c }} />
                           <div className="flex-1">
                             <p className="text-[11px] font-bold text-[#1a1a1a]">Thread Color {i+1}</p>
                             <p className="text-[9px] text-[#5d5d5d] font-mono opacity-80">{c}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                 </section>
               </div>

               <div className="p-6 border-t border-[#e0e0e0] bg-[#f9f9f9]">
                 <button 
                  onClick={() => setSelectedDesign(null)}
                  className="w-full bg-[#0067c0] hover:bg-[#005aab] text-white font-bold py-3 rounded transition-all active:scale-95 text-sm"
                 >
                   Close Analysis
                 </button>
               </div>
             </div>

             <Viewer 
               design={selectedDesign} 
               onClose={() => setSelectedDesign(null)} 
               onOpenLocation={() => showInExplorer(selectedDesign.path)}
               simulationIndex={simulationIndex}
             />
             
             {/* Simulator Hook */}
             <StitchSimulator 
               design={selectedDesign} 
               onProgress={setSimulationIndex}
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

