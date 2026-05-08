/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { DesignWithStitches, StitchType } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize, 
  Minus, 
  Plus, 
  Sun, 
  Moon,
  Move,
  Layers,
  CircleDot,
  FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ViewerProps {
  design: DesignWithStitches;
  onClose: () => void;
  onOpenLocation?: () => void;
  simulationIndex?: number;
  isMachinePreview?: boolean;
}

export default function Viewer({ 
  design, 
  onClose, 
  onOpenLocation, 
  simulationIndex = -1,
  isMachinePreview = false
}: ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const [viewSettings, setViewSettings] = useState({
    showStitches: true,
    showConnectors: false,
    showPoints: false,
    showOutline: false,
    realistic: true
  });

  useEffect(() => {
    draw();
  }, [design, zoom, offset, isDarkMode, viewSettings, simulationIndex, isMachinePreview]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset and clear
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isMachinePreview) {
      // Split view: Left = App View, Right = Machine View
      const splitX = canvas.width / 2;
      
      // Draw App View (Left)
      renderView(ctx, 0, 0, splitX, canvas.height, 'app');
      
      // Draw Divider
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, canvas.height);
      ctx.stroke();

      // Draw Machine View (Right)
      renderView(ctx, splitX, 0, splitX, canvas.height, 'machine');
      
      // Labels
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('DESIGNER VIEW', 20, 30);
      ctx.fillText('MACHINE PREVIEW', splitX + 20, 30);
    } else {
      renderView(ctx, 0, 0, canvas.width, canvas.height, 'app');
    }
  };

  const renderView = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    mode: 'app' | 'machine'
  ) => {
    ctx.save();
    
    // Clip to region
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // Background
    if (mode === 'machine') {
      ctx.fillStyle = '#2c3e50'; // Industrial gray/blue
      ctx.fillRect(x, y, w, h);
      // Scanlines for LCD effect
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      for (let i = y; i < y + h; i += 3) {
        ctx.beginPath();
        ctx.moveTo(x, i);
        ctx.lineTo(x + w, i);
        ctx.stroke();
      }
    } else {
      drawGrid(ctx, w, h, x, y);
    }

    ctx.translate(x + w / 2 + offset.x, y + h / 2 + offset.y);
    ctx.scale(zoom, zoom);

    let lastX = 0;
    let lastY = 0;

    const stitchesToDraw = simulationIndex === -1 
      ? design.stitches 
      : design.stitches.slice(0, simulationIndex);

    stitchesToDraw.forEach((s) => {
      const px = s.x; 
      const py = s.y;

      if (viewSettings.showStitches && s.type === StitchType.STITCH) {
        ctx.beginPath();
        ctx.lineWidth = viewSettings.realistic ? 2 / zoom : 1 / zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        let strokeColor = design.colors[s.colorIndex % design.colors.length];
        
        if (mode === 'machine') {
          // Machine view simplifies colors and adds more contrast
          // Or just renders them slightly differently
          ctx.shadowBlur = 4 / zoom;
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
        }

        ctx.strokeStyle = strokeColor;
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(px, py);
        ctx.stroke();
        
        ctx.shadowBlur = 0;

        if (viewSettings.realistic && mode === 'app') {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 0.5 / zoom;
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }

      lastX = px;
      lastY = py;
    });

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, startX: number = 0, startY: number = 0) => {
    ctx.strokeStyle = isDarkMode ? '#1f2937' : '#e5e7eb';
    ctx.lineWidth = 1;
    
    const step = 50 * zoom;
    
    ctx.beginPath();
    for (let lx = (w / 2 + offset.x) % step; lx < w; lx += step) {
      ctx.moveTo(startX + lx, startY);
      ctx.lineTo(startX + lx, startY + h);
    }
    for (let ly = (h / 2 + offset.y) % step; ly < h; ly += step) {
      ctx.moveTo(startX, startY + ly);
      ctx.lineTo(startX + w, startY + ly);
    }
    ctx.stroke();
    
    ctx.strokeStyle = isDarkMode ? '#374151' : '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX + w/2 + offset.x, startY); ctx.lineTo(startX + w/2 + offset.x, startY + h);
    ctx.moveTo(startX, startY + h/2 + offset.y); ctx.lineTo(startX + w, startY + h/2 + offset.y);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 1.1;
    if (e.deltaY < 0) setZoom(prev => Math.min(prev * scaleFactor, 50));
    else setZoom(prev => Math.max(prev / scaleFactor, 0.1));
  };

  return (
    <div className="flex-1 bg-white flex flex-col relative overflow-hidden group/viewer" ref={containerRef}>
      {/* Background canvas container */}
      <div 
        className={cn(
          "flex-1 relative cursor-crosshair transition-colors duration-500 bg-[#f3f3f3]",
          isDarkMode && "bg-[#0A0A0A]"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Floating Toolbar Overlay */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white p-1.5 rounded-[4px] shadow-lg border border-[#e0e0e0] select-none">
           <div className="flex items-center gap-0.5 px-2 border-r border-[#e0e0e0]">
              <button 
                onClick={() => setZoom(prev => prev * 1.2)}
                className="p-1.5 hover:bg-gray-100 rounded transition-all active:scale-90"
              >
                <Plus className="w-3.5 h-3.5 text-[#1a1a1a]" />
              </button>
              <div className="min-w-[48px] text-center text-[11px] font-bold font-mono text-[#5d5d5d]">
                {Math.round(zoom * 100)}%
              </div>
              <button 
                onClick={() => setZoom(prev => prev / 1.2)}
                className="p-1.5 hover:bg-gray-100 rounded transition-all active:scale-90"
              >
                <Minus className="w-3.5 h-3.5 text-[#1a1a1a]" />
              </button>
           </div>
           
           <div className="flex items-center gap-3 px-3 border-r border-[#e0e0e0]">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Stitches</span>
                <span className="text-[11px] font-bold font-mono text-[#0067c0] leading-none">
                  {design.totalStitches.toLocaleString()}
                </span>
              </div>
           </div>
           
           <div className="flex items-center gap-1 px-1">
              <button 
                onClick={onOpenLocation}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Open file location"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#1a1a1a]" />
              </button>
              <button 
                onClick={() => { setZoom(1); setOffset({x:0, y:0}); }}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Fit to screen"
              >
                <Maximize className="w-3.5 h-3.5 text-[#1a1a1a]" />
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={cn(
                  "p-1.5 rounded transition-all",
                   isDarkMode ? "bg-[#0067c0] text-white" : "hover:bg-gray-100 text-[#1a1a1a]"
                )}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
           </div>

           <div className="flex items-center gap-1 border-l border-[#e0e0e0] pl-1">
              <button 
                onClick={() => setViewSettings(s => ({ ...s, realistic: !s.realistic }))}
                className={cn(
                  "px-3 py-1.5 rounded-[2px] text-[10px] font-bold transition-all uppercase tracking-tight shadow-sm",
                  viewSettings.realistic ? "bg-[#0067c0] text-white" : "bg-gray-100 text-[#5d5d5d]"
                )}
              >
                Realistic
              </button>
           </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 pointer-events-none">
           <div className="bg-white p-4 rounded-[4px] shadow-xl border border-[#e0e0e0] space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Scope</h4>
              <div className="flex items-center gap-8">
                 <div>
                    <p className="text-[9px] text-[#5d5d5d] uppercase font-bold mb-1">Scale</p>
                    <p className="text-sm font-bold text-[#1a1a1a] font-mono">1:1.00</p>
                 </div>
                 <div>
                    <p className="text-[9px] text-[#5d5d5d] uppercase font-bold mb-1">Current File</p>
                    <p className="text-sm font-bold text-[#1a1a1a] font-mono">{design.format} Protocol</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
