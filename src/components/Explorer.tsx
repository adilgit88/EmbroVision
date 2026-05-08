/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DesignMetadata } from '../types';
import { cn } from '../lib/utils';
import { Star, Hash, Palette, Ruler, FolderOpen, MoreVertical, Copy, Trash2, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import * as ContextMenu from '@radix-ui/react-context-menu';

interface ExplorerProps {
  designs: DesignMetadata[];
  selectedId: string | null;
  onSelect: (design: DesignMetadata) => void;
  viewMode: 'grid' | 'list';
  onOpenLocation?: (path: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function Explorer({ designs, selectedId, onSelect, viewMode, onOpenLocation, onToggleFavorite, onDelete }: ExplorerProps) {
  const renderContextMenu = (design: DesignMetadata, children: React.ReactNode) => (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
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
              alert("Design ID copied to clipboard");
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
      <div id="explorer-list" className="flex-1 overflow-y-auto p-4 bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white z-10 border-b border-[#e0e0e0]">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-sans">
              <th className="py-3 px-4">Preview</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Stitches</th>
              <th className="py-3 px-4">Dimensions</th>
              <th className="py-3 px-4">Process</th>
            </tr>
          </thead>
          <tbody>
            {designs.map((design) => (
              <React.Fragment key={design.id}>
                {renderContextMenu(design, (
                  <tr 
                    onClick={() => onSelect(design)}
                    className={cn(
                      "border-b border-gray-50 hover:bg-[#e5f1fb]/40 cursor-default transition-colors group",
                      selectedId === design.id ? "bg-[#e5f1fb]" : ""
                    )}
                  >
                    <td className="py-2 px-4">
                      <div className="w-10 h-10 bg-white rounded border border-gray-100 overflow-hidden flex items-center justify-center">
                        {design.thumbnail ? (
                          <img src={design.thumbnail} alt={design.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : <span className="text-[9px] text-gray-200">NA</span>}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#1a1a1a]">{design.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono italic max-w-[200px] truncate">{design.path}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <span className="bg-[#eee] text-[#444] text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                        {design.format}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-xs font-mono font-medium text-[#5d5d5d]">
                      {design.totalStitches.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-xs font-mono text-gray-500">
                      {Math.round(design.width)}×{Math.round(design.height)}mm
                    </td>
                    <td className="py-2 px-4">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                         <span className="text-[10px] font-bold uppercase text-gray-400">Validated</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div id="explorer-grid" className="flex-1 overflow-y-auto p-6 bg-[#f3f3f3]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {designs.map((design) => (
          <React.Fragment key={design.id}>
            {renderContextMenu(design, (
              <div
                onClick={() => onSelect(design)}
                className={cn(
                  "group relative flex flex-col bg-white border border-[#e0e0e0] rounded-[4px] overflow-hidden cursor-default transition-all shadow-sm hover:shadow-md",
                  selectedId === design.id ? "ring-2 ring-[#0067c0] border-transparent" : ""
                )}
              >
                {/* Thumbnail Area */}
                <div className="aspect-square bg-white relative flex items-center justify-center p-4 border-b border-gray-50">
                  {design.thumbnail ? (
                    <img 
                      src={design.thumbnail} 
                      alt={design.name} 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-gray-200 text-[10px] font-bold uppercase">Processing...</div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-[#eee] text-[#444] text-[9px] font-bold px-1.5 py-0.5 rounded leading-none shadow-sm">
                      {design.format}
                    </span>
                    {design.isFavorite && (
                      <div className="bg-yellow-400 p-0.5 rounded-sm shadow-sm scale-90">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Actions Overlay for Grid */}
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

                {/* Info Area */}
                <div className="p-3">
                  <h3 className="text-[13px] font-bold text-[#1a1a1a] truncate mb-0.5">
                    {design.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#5d5d5d] font-mono font-medium">
                      {Math.round(design.width)}×{Math.round(design.height)}mm
                    </span>
                    <span className="text-[10px] font-bold text-[#b0b0b0] font-mono">
                      {design.totalStitches.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Active Indicator Overlay */}
                {selectedId === design.id && (
                   <div className="absolute inset-0 border-2 border-[#0067c0]/20 pointer-events-none" />
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
