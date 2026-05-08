/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Explorer from './components/Explorer';
import Viewer from './components/Viewer';
import DetailsPanel from './components/DetailsPanel';
import StitchSimulator from './components/StitchSimulator';
import MenuBar from './components/MenuBar';
import { DesignMetadata, DesignWithStitches } from './types';
import { EMBROIDERY_FORMATS } from './constants';
import { parseEmbroideryFile, generateThumbnail } from './lib/parser';
import { db } from './lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderOpen, AlertCircle, FileUp, Loader2, Search as SearchIcon } from 'lucide-react';

export interface ScanProgress {
  total: number;
  processed: number;
  currentFile: string;
}

export default function App() {
  const [activeView, setActiveView] = useState('library');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchText]);

  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanningProgress, setScanningProgress] = useState<ScanProgress | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignWithStitches | null>(null);
  const [simulationIndex, setSimulationIndex] = useState<number>(-1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Use Dexie for designs
  const designs = useLiveQuery(
    async () => {
      let query;
      
      if (activeView.startsWith('source:')) {
        const sourceId = activeView.split(':')[1];
        query = db.designs.where('sourceId').equals(sourceId);
      } else if (activeView === 'favorites') {
        query = db.designs.where('isFavorite').equals(1);
      } else {
        query = db.designs.orderBy('createdAt');
      }

      return await query.toArray();
    },
    [activeView]
  ) || [];

  const [searchIndex, setSearchIndex] = useState<DesignMetadata[]>([]);

  // Update search index when designs change or component mounts
  useEffect(() => {
    if (designs && designs.length > 0) {
      setSearchIndex(designs);
    }
  }, [designs]);

  // Optimized filtering for large datasets
  const filteredDesigns = useMemo(() => {
    let result = designs;
    
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(lowerSearch));
    }

    if (selectedFormat) {
      result = result.filter(d => d.format.toUpperCase() === selectedFormat.toUpperCase());
    }
    
    // Sort by date reverse (newest first)
    return [...result].sort((a, b) => b.createdAt - a.createdAt);
  }, [designs, debouncedSearch, selectedFormat]);

  // Initialize with dummy data if empty
  useEffect(() => {
    const init = async () => {
      const count = await db.designs.count();
      if (count === 0) {
        const mockFiles = ['Welcome_Design.dst', 'Sample_Floral.pes'];
        for (const name of mockFiles) {
          const content = new Uint8Array([0, 1, 2]);
          const file = new File([content], name, { type: 'application/octet-stream' });
          const design = await parseEmbroideryFile(file);
          const thumb = generateThumbnail(design);
          await db.designs.add({ ...design, thumbnail: thumb });
        }
      }
    };
    init();
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

  const handleToggleFavorite = async (id: string) => {
    const design = await db.designs.get(id);
    if (design) {
      await db.designs.update(id, { isFavorite: !design.isFavorite });
      if (selectedDesign?.id === id) {
        setSelectedDesign(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
      }
    }
  };
  
  const handleRescan = () => {
    setIsLoading(true);
    setNotification({ message: "Rescanning library indexes...", type: 'success' });
    
    setTimeout(() => {
      setIsLoading(false);
      setNotification({ message: "Library up to date.", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }, 1000);
  };

  const handleDeleteDesign = async (id: string) => {
    if (confirm("Are you sure you want to delete this design from your library?")) {
      await db.designs.delete(id);
      if (selectedDesign?.id === id) setSelectedDesign(null);
      setNotification({ message: "Design removed.", type: 'success' });
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

  const handleCopyId = () => {
    if (!selectedDesign) return;
    navigator.clipboard.writeText(selectedDesign.id);
    setNotification({ message: "Design identifier copied to clipboard.", type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };


  const currentViewTitle = useMemo(() => {
    switch(activeView) {
      case 'library': return 'Full Library';
      case 'favorites': return 'Favorite Designs';
      case 'recent': return 'Recently Opened';
      case 'templates': return 'Design Templates';
      default: return 'Gallery';
    }
  }, [activeView]);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportFolder = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setScanningProgress({ total: files.length, processed: 0, currentFile: 'Initializing Worker...' });

    try {
      let sourceName = 'Imported Folder';
      if (files instanceof FileList && files.length > 0) {
        const firstPath = (files[0] as any).webkitRelativePath;
        if (firstPath) sourceName = firstPath.split('/')[0];
      }

      const sourceId = uuidv4();
      const worker = new Worker(new URL('./lib/importWorker.ts', import.meta.url), { type: 'module' });
      
      await db.importSources.add({
        id: sourceId,
        name: sourceName,
        path: sourceName,
        type: 'folder',
        fileCount: 0, // Will update at end
        createdAt: Date.now()
      });

      let totalFound = 0;

      worker.onmessage = async (e) => {
        const { type, progress, batch } = e.data;
        if (type === 'progress') {
          setScanningProgress(progress);
          if (batch && batch.length > 0) {
            totalFound += batch.length;
            await db.designs.bulkAdd(batch);
          }
        } else if (type === 'complete') {
          await db.importSources.update(sourceId, { fileCount: totalFound });
          setNotification({ message: `Imported ${totalFound} designs from "${sourceName}".`, type: 'success' });
          setIsLoading(false);
          setScanningProgress(null);
          worker.terminate();
        }
      };

      worker.postMessage({ type: 'scanFolder', files: Array.from(files), sourceId });
    } catch (err) {
      console.error(err);
      setNotification({ message: "Error during folder import.", type: 'error' });
      setIsLoading(false);
      setScanningProgress(null);
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setScanningProgress({ total: 100, processed: 0, currentFile: 'Reading ZIP Headers...' });

    try {
      const sourceId = uuidv4();
      const worker = new Worker(new URL('./lib/importWorker.ts', import.meta.url), { type: 'module' });

      await db.importSources.add({
        id: sourceId,
        name: file.name,
        path: file.name,
        type: 'zip',
        fileCount: 0,
        createdAt: Date.now()
      });

      let totalFound = 0;

      worker.onmessage = async (e) => {
        const { type, progress, batch } = e.data;
        if (type === 'progress') {
          setScanningProgress(progress);
          if (batch && batch.length > 0) {
            totalFound += batch.length;
            await db.designs.bulkAdd(batch);
          }
        } else if (type === 'complete') {
          await db.importSources.update(sourceId, { fileCount: totalFound });
          setNotification({ message: `Imported ${totalFound} designs from ZIP.`, type: 'success' });
          setIsLoading(false);
          setScanningProgress(null);
          worker.terminate();
        }
      };

      worker.postMessage({ type: 'scanZip', zipFile: file, sourceId });
    } catch (err) {
      console.error(err);
      setNotification({ message: "Error reading ZIP file.", type: 'error' });
      setIsLoading(false);
      setScanningProgress(null);
    } finally {
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImportFolder(files);
    }
  };

  const handleClearLibrary = async () => {
    if (confirm("This will remove all indexed designs and import history. The actual files on your computer will NOT be deleted. Proceed?")) {
      await db.designs.clear();
      await db.importSources.clear();
      setNotification({ message: "Library cleared successfully.", type: "success" });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div 
      className="flex flex-col h-screen bg-[#f3f3f3] font-sans text-[#1a1a1a] overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        multiple 
        accept=".dst,.pes,.jef,.exp,.vp3,.hus,.xxx" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleImportFolder(e.target.files)}
      />
      <input 
        type="file" 
        {...({ webkitdirectory: "", mozdirectory: "", directory: "" } as any)} 
        className="hidden" 
        ref={folderInputRef} 
        onChange={(e) => e.target.files && handleImportFolder(e.target.files)}
      />
      <input 
        type="file" 
        accept=".zip" 
        className="hidden" 
        ref={zipInputRef} 
        onChange={handleImportZip}
      />

      {/* Progress Overlay */}
      <AnimatePresence>
        {scanningProgress && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-8"
          >
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Importing Designs</h2>
                  <p className="text-sm text-gray-500 font-medium">Scanning folders and parsing metadata...</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round((scanningProgress.processed / scanningProgress.total) * 100)}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <motion.div 
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(scanningProgress.processed / scanningProgress.total) * 100}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate bg-gray-50 p-2 rounded border border-gray-100">
                  {scanningProgress.currentFile}
                </div>
                <div className="text-center pt-2">
                  <span className="text-2xl font-black text-blue-600">
                    {scanningProgress.processed.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 font-bold ml-2">
                    / {scanningProgress.total.toLocaleString()} files found
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* OS-like Top Bar */}
      <div className="h-8 bg-white border-b border-[#e0e0e0] flex items-center px-3 text-xs select-none">
        <MenuBar 
          onOpenDesign={handleImport}
          onImportFolder={() => folderInputRef.current?.click()}
          onImportZip={() => zipInputRef.current?.click()}
          onRescan={handleRescan}
          onClearLibrary={handleClearLibrary}
          onExport={handleExportPNG}
          onPrint={handlePrint}
          onToggleFavorite={() => selectedDesign && handleToggleFavorite(selectedDesign.id)}
          onDelete={() => selectedDesign && handleDeleteDesign(selectedDesign.id)}
          onCopyId={handleCopyId}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hasSelection={!!selectedDesign}
        />
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
            onOpenDesign={handleImport}
          />

          {/* Search/Filter Bar */}
          <div className="px-6 py-3 bg-white border-b border-[#e0e0e0] flex items-center gap-4">
             <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search library..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0067c0]/20 focus:border-[#0067c0] transition-all"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
             </div>
             <div className="h-6 w-px bg-gray-200" />
             <div className="flex gap-2">
               {['All', 'PES', 'DST', 'JEF', 'VP3', 'EXP'].map(f => (
                 <button
                   key={f}
                   onClick={() => setSelectedFormat(f === 'All' ? null : f)}
                   className={cn(
                     "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
                     (f === 'All' && !selectedFormat) || (f === selectedFormat)
                      ? "bg-[#0067c0] text-white shadow-md shadow-blue-600/20"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                   )}
                 >
                   {f}
                 </button>
               ))}
             </div>
          </div>

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

