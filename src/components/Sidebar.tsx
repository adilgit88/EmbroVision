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
  Search,
  Archive,
  HardDrive
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onImport: () => void;
}

export default function Sidebar({ activeView, setActiveView, onImport }: SidebarProps) {
  const sources = useLiveQuery(() => db.importSources.orderBy('createdAt').reverse().toArray()) || [];

  const menuItems = [
    { id: 'library', label: 'All Designs', icon: Folder },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recent', icon: Clock },
  ];

  return (
    <aside id="app-sidebar" className="w-[230px] bg-white h-full flex flex-col border-r border-[#e0e0e0] select-none">
      <div className="section-title mt-4">Library</div>
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
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
              <Icon className={cn("w-4 h-4", isActive ? "text-[#0067c0]" : "text-gray-400")} />
              {item.label}
            </div>
          );
        })}

        {sources.length > 0 && (
          <>
            <div className="mt-8 section-title flex justify-between items-center pr-4">
              Imported Source
              <span className="text-[10px] bg-gray-100 px-1.5 rounded-full text-gray-500">{sources.length}</span>
            </div>
            {sources.map((source) => {
              const isActive = activeView === `source:${source.id}`;
              const Icon = source.type === 'zip' ? Archive : HardDrive;
              return (
                <div
                  key={source.id}
                  onClick={() => setActiveView(`source:${source.id}`)}
                  className={cn(
                    "px-4 py-2 text-[12px] flex items-center gap-2.5 cursor-default transition-colors group",
                    isActive 
                      ? "bg-[#e5f1fb] border-l-4 border-[#0067c0] pl-[13px] text-[#1a1a1a] font-medium" 
                      : "hover:bg-gray-100 text-[#5d5d5d]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#0067c0]" : "text-gray-400 group-hover:text-blue-400")} />
                  <span className="truncate flex-1">{source.name}</span>
                  <span className="text-[9px] text-gray-400 font-mono opacity-0 group-hover:opacity-100">
                    {source.fileCount}
                  </span>
                </div>
              );
            })}
          </>
        )}

        <div className="mt-8 section-title">Filters</div>
        {[
          { label: 'Client Projects', icon: Tag },
          { label: 'Cloud Backup', icon: Compass },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="px-4 py-2 text-[13px] text-[#5d5d5d] flex items-center gap-2.5 hover:bg-gray-100 cursor-default"
            >
              <Icon className="w-4 h-4 text-gray-400" />
              {item.label}
            </div>
          );
        })}

        <div className="mt-6 px-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Formats</p>
          <div className="grid grid-cols-3 gap-1.5">
            {['PES', 'DST', 'JEF', 'VP3', 'EXP', 'HUS'].map(format => (
              <span key={format} className="text-[9px] bg-gray-50 text-gray-500 px-1 py-1 rounded font-black border border-gray-100 text-center uppercase tracking-tighter">
                {format}
              </span>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[#e0e0e0] bg-[#fdfdfd] space-y-2">
        <button 
          onClick={onImport}
          className="win-btn-primary w-full flex items-center justify-center gap-2 shadow-sm text-xs py-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Single
        </button>
      </div>
    </aside>
  );
}
