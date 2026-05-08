/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Rewind, 
  FastForward,
  Info,
  Layers,
  Circle
} from 'lucide-react';
import { DesignWithStitches, StitchType } from '../types';
import { cn } from '../lib/utils';

interface StitchSimulatorProps {
  design: DesignWithStitches;
  onProgress?: (index: number) => void;
}

export default function StitchSimulator({ design, onProgress }: StitchSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(10); // stitches per frame
  const timerRef = useRef<number | null>(null);

  if (!design || design.totalStitches === 0) return null;

  useEffect(() => {
    if (isPlaying) {
      const step = () => {
        setCurrentIndex(prev => {
          const next = prev + speed;
           if (next >= design.totalStitches) {
             setIsPlaying(false);
             return design.totalStitches - 1;
           }
           return next;
        });
        timerRef.current = requestAnimationFrame(step);
      };
      timerRef.current = requestAnimationFrame(step);
    } else if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying, speed, design.totalStitches]);

  useEffect(() => {
    onProgress?.(currentIndex);
  }, [currentIndex, onProgress]);

  const progress = (currentIndex / (design.totalStitches - 1)) * 100;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      <div className="bg-gray-900 shadow-2xl rounded-2xl p-4 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
             <button 
               onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}
               className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
             >
               <SkipBack className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-90"
             >
               {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
             </button>
             <button 
               onClick={() => { setCurrentIndex(design.totalStitches - 1); setIsPlaying(false); }}
               className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
             >
               <SkipForward className="w-4 h-4" />
             </button>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest">
               <span>Step {currentIndex.toLocaleString()}</span>
               <span>{Math.round(progress)}% Complete</span>
            </div>
            <div 
              className="h-1.5 w-full bg-gray-800 rounded-full cursor-pointer relative group overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const p = x / rect.width;
                setCurrentIndex(Math.floor(p * (design.totalStitches - 1)));
              }}
            >
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-75 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-blue-500 scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
             <select 
               value={speed} 
               onChange={(e) => setSpeed(Number(e.target.value))}
               className="bg-gray-800 border-none text-[10px] font-bold text-gray-400 rounded-md py-1 px-2 outline-none focus:ring-1 focus:ring-blue-500 font-mono"
             >
               <option value={1}>1x</option>
               <option value={10}>10x</option>
               <option value={50}>50x</option>
               <option value={200}>200x</option>
             </select>
             <p className="text-[10px] text-gray-600 font-mono">Speed</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-800 pt-3">
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: design.colors[design.stitches[currentIndex]?.colorIndex || 0] }} />
                 <span className="text-[10px] text-gray-400 font-bold font-mono uppercase">Color #{ (design.stitches[currentIndex]?.colorIndex || 0) + 1 }</span>
              </div>
              <div className="h-3 w-px bg-gray-800" />
              <div className="flex items-center gap-1.5 grayscale opacity-50">
                 <Layers className="w-3 h-3 text-gray-400" />
                 <span className="text-[10px] text-gray-400 font-bold font-mono uppercase">Layer 1</span>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <span className="text-[10px] text-gray-500 font-mono line-through">02:44 REMAINING</span>
              </div>
              <div className="h-3 w-px bg-gray-800" />
              <div className="flex items-center gap-1 text-gray-500">
                 <Info className="w-3 h-3" />
                 <span className="text-[9px] font-bold uppercase tracking-tight">Simulator Mode</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
