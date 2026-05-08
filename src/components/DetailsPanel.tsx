/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DesignMetadata } from '../types';
import { 
  Info, 
  Palette, 
  Activity, 
  MapPin, 
  Tag as TagIcon, 
  Notebook,
  Share2,
  Trash2,
  Copy,
  ChevronRight,
  Clock,
  MoreVertical,
  Star,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Monitor,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ThreadBrand, ThreadColor } from '../types';
import { THREAD_LIBRARIES, findNearestThread, isBlackOrVeryDark, isExactMatch } from '../lib/threads';

interface DetailsPanelProps {
  design: DesignMetadata | null;
  onOpenLocation?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onRescan?: () => void;
  onUpdateDesign?: (updates: Partial<DesignMetadata>) => void;
  isMachinePreview?: boolean;
  onToggleMachinePreview?: () => void;
}

export default function DetailsPanel({ 
  design, 
  onOpenLocation, 
  onToggleFavorite, 
  onDelete, 
  onPrint,
  onRescan,
  onUpdateDesign,
  isMachinePreview,
  onToggleMachinePreview
}: DetailsPanelProps) {
  const [editingColorIdx, setEditingColorIdx] = React.useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = React.useState<ThreadBrand>(ThreadBrand.MADEIRA);

  if (!design) {
    return (
      <aside className="w-80 bg-white border-l border-[#e0e0e0] flex flex-col items-center justify-center p-8 text-center select-none">
        <Info className="w-12 h-12 text-gray-100 mb-4" />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">Select Design</h3>
        <p className="text-[11px] text-gray-400 mt-2">Analysis data will appear here once a file is loaded.</p>
      </aside>
    );
  }

  return (
    <aside id="details-panel" className="w-[300px] bg-white border-l border-[#e0e0e0] h-full flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="p-5 border-b border-[#e0e0e0] bg-[#f9f9f9]">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Identity & Properties
          </h2>
          <div className="flex gap-1">
            <button 
              onClick={onToggleFavorite}
              className={cn(
                "p-1 hover:bg-gray-200 rounded transition-all",
                design.isFavorite ? "text-yellow-500" : "text-gray-400"
              )}
            >
              <Star className={cn("w-4 h-4", design.isFavorite && "fill-current")} />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded text-gray-400 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-lg font-bold text-[#1a1a1a] mb-4 truncate">{design.name}</h1>

        {design.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-[4px]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Parsing Failure</span>
            </div>
            <p className="text-[11px] text-red-700 font-medium mb-3">
              {design.error}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={onRescan}
                className="flex-1 bg-white border border-red-200 text-red-600 text-[10px] font-bold py-1.5 rounded hover:bg-red-100 transition-colors"
              >
                Rescan Library
              </button>
              <button 
                onClick={() => alert("File marked as permanently corrupted.")}
                className="flex-1 bg-white border border-red-200 text-red-600 text-[10px] font-bold py-1.5 rounded hover:bg-red-100 transition-colors"
              >
                Mark as Corrupted
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] text-[#5d5d5d] font-bold uppercase tracking-widest mb-1">Stitches</p>
              <p className="text-xl font-bold text-[#1a1a1a] font-mono leading-none">
                {design.totalStitches.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#5d5d5d] font-bold uppercase tracking-widest mb-1">Colors</p>
              <p className="text-xl font-bold text-[#1a1a1a] font-mono leading-none">
                {design.colorCount}
              </p>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-[9px] text-[#5d5d5d] font-bold uppercase tracking-widest mb-1">Dimensions</p>
            <p className="text-base font-bold text-[#1a1a1a] font-mono leading-none">
              {Math.round(design.width)} <span className="text-gray-300 font-normal">×</span> {Math.round(design.height)} mm
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        
        {/* Thread Sequence & Accuracy Validation */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               Thread Accuracy & Sequence
            </h3>
            <select 
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value as ThreadBrand)}
              className="text-[10px] bg-gray-100 border-none rounded px-2 py-0.5 font-bold text-gray-600 outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              {Object.values(ThreadBrand).map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* DST Warning */}
          {design.format === 'DST' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase">Input Warning</p>
                <p className="text-[10px] text-amber-600 leading-tight mt-0.5">
                  DST format has no color data. Assign threads manually for accuracy.
                </p>
              </div>
              {/* DST CSV Export */}
              {design.format === 'DST' && (
                <button 
                  onClick={() => {
                    const csv = "Stitch,Color,Thread,Brand\n" + design.colors.map((c, i) => `${i+1},${c},${design.threadInfo?.[i]?.code || 'N/A'},${design.threadInfo?.[i]?.brand || 'N/A'}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${design.name}_colors.csv`;
                    a.click();
                  }}
                  className="w-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold py-1.5 rounded hover:bg-blue-100 transition-colors mt-4 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3 h-3" />
                  Export DST Color Sequence CSV
                </button>
              )}
            </div>
          )}

          <div className="space-y-2">
            {design.colors.map((color, idx) => {
              const currentThread = design.threadInfo?.[idx];
              const bestMatch = findNearestThread(color, selectedBrand);
              const isPerfect = currentThread ? isExactMatch(color, currentThread.hex) : false;
              const isDark = isBlackOrVeryDark(color);
              
              return (
                <div 
                  key={idx} 
                  onClick={() => setEditingColorIdx(idx === editingColorIdx ? null : idx)}
                  className={cn(
                    "group p-2 rounded border transition-all cursor-pointer",
                    editingColorIdx === idx 
                      ? "bg-blue-50 border-blue-200" 
                      : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div 
                        className="w-10 h-10 rounded shadow-inner border border-black/5" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-gray-600 text-white text-[9px] flex items-center justify-center rounded-full font-bold border border-white">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-gray-900 truncate">
                          {currentThread ? `${currentThread.brand} ${currentThread.code} - ${currentThread.name}` : 'Unknown Thread'}
                        </p>
                        {isPerfect ? (
                           <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                        ) : (
                           <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {color.toUpperCase()} 
                        {!isPerfect && ` • Match: ${bestMatch.code} (${bestMatch.name})`}
                      </p>
                      {isDark && (
                        <p className="text-[9px] text-red-500 font-bold mt-1 flex items-center gap-1 uppercase">
                          <Activity className="w-2.5 h-2.5" /> Potential Black Mismatch
                        </p>
                      )}
                    </div>

                    <ChevronRight className={cn("w-3.5 h-3.5 text-gray-300 transition-transform", editingColorIdx === idx && "rotate-90")} />
                  </div>

                  {/* Color Editor Mini-Expander */}
                  {editingColorIdx === idx && (
                    <div className="mt-3 pt-3 border-t border-blue-100">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-2">Assign from {selectedBrand}</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {THREAD_LIBRARIES[selectedBrand].slice(0, 8).map((thread) => (
                           <button
                             key={thread.code}
                             onClick={(e) => {
                               e.stopPropagation();
                               if (onUpdateDesign) {
                                 const newColors = [...design.colors];
                                 const newThreads = [...(design.threadInfo || [])];
                                 newColors[idx] = thread.hex;
                                 newThreads[idx] = thread;
                                 onUpdateDesign({ colors: newColors, threadInfo: newThreads });
                               }
                             }}
                             className="group/btn flex flex-col items-center gap-1"
                           >
                             <div 
                               className="w-full aspect-square rounded-[2px] border border-black/5 hover:scale-105 transition-transform" 
                               style={{ backgroundColor: thread.hex }}
                               title={`${thread.code} - ${thread.name}`}
                             />
                             <span className="text-[8px] font-bold text-gray-400 scale-[0.8]">{thread.code}</span>
                           </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Machine Simulation Toggle */}
        <section>
          <div className="p-4 bg-gray-900 rounded-lg border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Monitor className="w-4 h-4 text-blue-400" />
                 <p className="text-[10px] font-bold text-white uppercase tracking-widest">Machine Simulation</p>
               </div>
               <button 
                 onClick={onToggleMachinePreview}
                 className={cn(
                   "w-8 h-4 rounded-full relative transition-colors",
                   isMachinePreview ? "bg-blue-500" : "bg-gray-700"
                 )}
               >
                 <div className={cn(
                   "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-md",
                   isMachinePreview ? "left-4.5" : "left-0.5"
                 )} />
               </button>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed italic">
              Enable to see how design renders on a low-fidelity machine LCD.
            </p>
          </div>
        </section>

        {/* Path Information */}
        <section>
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              File Registry
           </h3>
           <div className="p-3 bg-gray-50 border border-[#e0e0e0] rounded-[4px]">
              <p className="text-[10px] font-bold text-[#5d5d5d] mb-1">Disk Location</p>
              <p className="text-[10px] text-[#0067c0] font-mono leading-relaxed truncate">
                C:\\Users\\Main\\DesignLib\\{design.path}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] text-gray-400 font-bold uppercase">Added {format(design.createdAt, 'MMM d, yyyy')}</span>
                <span className="text-[9px] bg-gray-200 text-[#5d5d5d] px-1.5 py-0.5 rounded font-bold uppercase">{design.format}</span>
              </div>
           </div>
        </section>

        {/* Notes */}
        <section>
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Production Notes
           </h3>
           <textarea 
             className="w-full bg-white border border-[#e0e0e0] rounded-[4px] p-3 text-[11px] text-[#1a1a1a] min-h-[100px] focus:ring-1 focus:ring-[#0067c0] outline-none transition-all placeholder:text-gray-300"
             placeholder="Enter stabilizers, needle types, or customer details..."
             defaultValue={design.notes}
           />
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#e0e0e0] bg-[#f9f9f9] flex flex-col gap-2">
        <div className="flex gap-2">
          <button 
            onClick={onOpenLocation}
            className="win-btn-secondary flex-1 shadow-sm flex items-center justify-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            Show in Folder
          </button>
          <button 
            onClick={onPrint}
            className="win-btn-secondary flex-1 shadow-sm flex items-center justify-center gap-2"
          >
            Print
          </button>
        </div>
        <button 
          onClick={onDelete}
          className="win-btn-secondary w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 border-red-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Selection
        </button>
      </div>
    </aside>
  );
}
