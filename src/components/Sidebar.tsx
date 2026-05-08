/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Folder, 
  Star, 
  Clock, 
  Tag, 
  Settings, 
  Plus,
  Compass,
  FileDigit,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onImport: () => void;
}

export default function Sidebar({ activeView, setActiveView, onImport }: SidebarProps) {
  const menuItems = [
    { id: 'library', label: 'Library', icon: Folder },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'templates', label: 'Templates', icon: FileDigit },
  ];

  const secondaryItems = [
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside id="app-sidebar" className="w-[220px] bg-white h-full flex flex-col border-r border-[#e0e0e0] select-none">
      <div className="section-title mt-4">Library</div>
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "px-4 py-2 text-[13px] flex items-center gap-2.5 cursor-default transition-colors",
                isActive 
                  ? "bg-[#e5f1fb] border-l-4 border-[#0067c0] pl-[13px] text-[#1a1a1a] font-medium" 
                  : "hover:bg-gray-100 text-[#5d5d5d]"
              )}
            >
              <span className="text-base group-hover:scale-110 transition-transform">
                {item.id === 'favorites' ? '⭐' : '📁'}
              </span>
              {item.label}
            </div>
          );
        })}

        <div className="mt-8 section-title">Filters</div>
        {[
          { label: 'Client Projects', icon: '🏷️' },
          { label: 'Cloud Backup', icon: '☁️' },
        ].map((item) => (
          <div
            key={item.label}
            className="px-4 py-2 text-[13px] text-[#5d5d5d] flex items-center gap-2.5 hover:bg-gray-100 cursor-default"
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div className="mt-6 px-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Formats</p>
          <div className="flex flex-wrap gap-1.5">
            {['PES', 'DST', 'JEF', 'VP3', 'EXP'].map(format => (
              <span key={format} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold border border-gray-200">
                {format}
              </span>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[#e0e0e0] bg-[#f9f9f9]">
        <div className="bg-[#e5f1fb] p-3 rounded border border-[#0067c0]/10 mb-4">
           <h4 className="text-[11px] font-bold text-[#0067c0] mb-1">PRO TIP</h4>
           <p className="text-[11px] text-[#0067c0]/80 leading-snug">Drag and drop any embroidery file directly into the viewer.</p>
        </div>
        <button 
          onClick={onImport}
          className="win-btn-primary w-full flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Design
        </button>
      </div>
    </aside>
  );
}
