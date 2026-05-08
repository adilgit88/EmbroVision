/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Share2, 
  Printer, 
  Download,
  MoreVertical,
  Maximize2,
  FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

interface TopBarProps {
  title: string;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onOpenLocation?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onOpenDesign?: () => void;
}

export default function TopBar({ title, viewMode, setViewMode, onOpenLocation, onExport, onPrint, onOpenDesign }: TopBarProps) {
  return (
    <header id="app-topbar" className="h-[56px] bg-white border-b border-[#e0e0e0] flex items-center justify-between px-4 sticky top-0 z-10 select-none">
      <div className="flex items-center gap-5 h-full">
        <div className="text-[14px] font-bold text-[#1a1a1a] border-r border-[#e0e0e0] pr-5 h-8 flex items-center">
          {title}
        </div>
        <div className="flex items-center gap-2 border-r border-[#e0e0e0] pr-5 h-8">
          <button className="win-btn-primary" onClick={onOpenDesign}>
            Open Design
          </button>
          <button className="win-btn-secondary" onClick={onOpenLocation}>
            <FolderOpen className="w-3.5 h-3.5 mr-1.5 inline" />
            File Location
          </button>
        </div>
        
        <div className="flex items-center gap-3 border-r border-[#e0e0e0] pr-5 h-8">
          <span className="text-sm text-gray-500 font-medium">Zoom</span>
          <select className="border border-[#e0e0e0] text-sm p-1 rounded bg-white outline-none focus:ring-1 focus:ring-[#0067c0]">
            <option>Fit to Screen</option>
            <option>100% (Actual)</option>
            <option>200%</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-r border-[#e0e0e0] pr-5 h-8">
          <button 
            onClick={onPrint}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" 
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button 
            onClick={onExport}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" 
            title="Export PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 h-full">
        <div className="flex items-center gap-4 text-sm font-semibold tracking-tight">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("transition-colors", viewMode === 'grid' ? "text-[#0067c0]" : "text-gray-400 hover:text-[#1a1a1a]")}
          >
            Gallery
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("transition-colors", viewMode === 'list' ? "text-[#0067c0]" : "text-gray-400 hover:text-[#1a1a1a]")}
          >
            Technical View
          </button>
        </div>
        
        <div className="h-8 w-px bg-[#e0e0e0]" />
        
        <button className="p-2 hover:bg-gray-100 rounded text-gray-400">
           <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
