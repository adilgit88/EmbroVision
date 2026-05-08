/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { DesignMetadata, StitchType } from '../types';
import { cn } from '../lib/utils';
import { Star, FolderOpen, Copy, Trash2, Heart, Search } from 'lucide-react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { parseEmbroideryFile, generateThumbnail } from '../lib/parser';

interface ExplorerProps {
  designs: DesignMetadata[];
  selectedId: string | null;
  onSelect: (design: DesignMetadata) => void;
  viewMode: 'grid' | 'list';
  onOpenLocation?: (path: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const LazyThumbnail = ({ design }: { design: DesignMetadata }) => {
  const [thumb, setThumb] = useState<string | null>(design.thumbnail || null);
  const [loading, setLoading] = useState(!design.thumbnail);

  useEffect(() => {
    if (design.thumbnail) return;
    
    let isMounted = true;
    const loadThumb = async () => {
      // Simulate real file load for thumb generation
      // In a real app we'd fetch the file blob from ZIP/Disk here
      const file = new File([new Uint8Array([0])], `${design.name}.${design.format.toLowerCase()}`);
      const fullDesign = await parseEmbroideryFile(file);
      const generated = generateThumbnail(fullDesign);
      if (isMounted) {
        setThumb(generated);
        setLoading(false);
        // Cache it in DB optionally here if performance is an issue
      }
    };
    
    loadThumb();
    return () => { isMounted = false; };
  }, [design]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      {thumb ? (
        <img src={thumb} alt={design.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[8px] text-gray-300 font-bold uppercase tracking-tighter">Parsing</span>
        </div>
      )}
    </div>
  );
};

export default function Explorer({ designs, selectedId, onSelect, viewMode, onOpenLocation, onToggleFavorite, onDelete }: ExplorerProps) {
  const renderContextMenu = (design: DesignMetadata, children: React.ReactElement) => (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] bg-white rounded-md overflow-hidden shadow-xl border border-[#e0e0e0] p-1 z-[300] animate-in fade-in zoom-in-95 duration-100">
          <ContextMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#1a1a1a] outline-none hover:bg-[#e5f1fb] cursor-default rounded"
            onClick={() => onSelect(design)}
          >
            Open in Analysis
          </ContextMenu.Item>
          <ContextMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#1a1a1a] outline-none hover:bg-[#e5f1fb] cursor-default rounded"
            onClick={() => onOpenLocation?.(design.path)}
          >
            <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
            Show in File Manager
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
          <ContextMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#1a1a1a] outline-none hover:bg-[#e5f1fb] cursor-default rounded"
            onClick={() => onToggleFavorite?.(design.id)}
          >
            <Heart className={cn("w-3.5 h-3.5", design.isFavorite ? "text-yellow-500 fill-current" : "text-gray-400")} />
            {design.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </ContextMenu.Item>
          <ContextMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#1a1a1a] outline-none hover:bg-[#e5f1fb] cursor-default rounded"
            onClick={() => {
              navigator.clipboard.writeText(design.id);
            }}
          >
            <Copy className="w-3.5 h-3.5 text-gray-400" />
            Copy Identifier
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
          <ContextMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 outline-none hover:bg-red-50 cursor-default rounded"
            onClick={() => onDelete?.(design.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Entry
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );

  if (viewMode === 'list') {
    return (
      <div id="explorer-list" className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex text-[11px] font-bold text-gray-400 uppercase tracking-widest font-sans border-b border-[#e0e0e0] bg-white sticky top-0 z-10 px-4">
            <div className="w-16 py-3 px-2">Preview</div>
            <div className="flex-1 py-3 px-2">Name</div>
            <div className="w-24 py-3 px-2">Format</div>
            <div className="w-24 py-3 px-2">Stitches</div>
            <div className="w-32 py-3 px-2">Dimensions</div>
          </div>
          <Virtuoso
            data={designs}
            itemContent={(index, design) => (
              <div key={design.id} className="px-4">
                {renderContextMenu(design, (
                  <div 
                    onClick={() => onSelect(design)}
                    className={cn(
                      "flex items-center border-b border-gray-50 hover:bg-[#e5f1fb]/40 cursor-default transition-colors group h-14",
                      selectedId === design.id ? "bg-[#e5f1fb]" : ""
                    )}
                  >
                    <div className="w-16 h-12 p-1 flex items-center justify-center mr-2">
                       <div className="w-full h-full bg-white rounded border border-gray-100 overflow-hidden">
                         <LazyThumbnail design={design} />
                       </div>
                    </div>
                    <div className="flex-1 min-w-0 px-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#1a1a1a] truncate">{design.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono italic truncate opacity-60">
                           {design.path}
                        </span>
                      </div>
                    </div>
                    <div className="w-24 px-2">
                      <span className="bg-[#eee] text-[#444] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                        {design.format}
                      </span>
                    </div>
                    <div className="w-24 px-2 text-xs font-mono font-medium text-[#5d5d5d]">
                      {design.totalStitches.toLocaleString()}
                    </div>
                    <div className="w-32 px-2 text-xs font-mono text-gray-500">
                      {Math.round(design.width)}×{Math.round(design.height)}mm
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div id="explorer-grid" className="flex-1 bg-[#f3f3f3] relative">
      <VirtuosoGrid
        data={designs}
        listClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-5 p-6"
        itemContent={(index, design) => (
          <div key={design.id}>
            {renderContextMenu(design, (
              <div
                onClick={() => onSelect(design)}
                className={cn(
                  "group relative flex flex-col bg-white border border-[#e0e0e0] rounded-[4px] overflow-hidden cursor-default transition-all shadow-sm hover:shadow-md h-[240px]",
                  selectedId === design.id ? "ring-2 ring-[#0067c0] border-transparent" : ""
                )}
              >
                <div className="aspect-square bg-white relative flex items-center justify-center p-4 border-b border-gray-50 overflow-hidden">
                   <LazyThumbnail design={design} />
                  
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-[#eee] text-[#444] text-[9px] font-bold px-1.5 py-0.5 rounded leading-none shadow-sm uppercase font-mono">
                      {design.format}
                    </span>
                    {design.isFavorite && (
                      <div className="bg-yellow-400 p-0.5 rounded-sm shadow-sm scale-90">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenLocation?.(design.path); }}
                      className="p-1.5 bg-white border border-[#e0e0e0] rounded shadow-sm hover:bg-gray-50"
                      title="Show in File Manager"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#1a1a1a]" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-[12px] font-bold text-[#1a1a1a] truncate mb-1">
                    {design.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#5d5d5d] font-mono font-medium">
                      {Math.round(design.width)}×{Math.round(design.height)}mm
                    </span>
                    <span className="text-[10px] font-bold text-[#b0b0b0] font-mono tabular-nums">
                      {design.totalStitches.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}
