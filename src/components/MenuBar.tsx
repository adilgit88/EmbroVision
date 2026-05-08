import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  FileText, 
  FolderOpen, 
  Save, 
  LogOut, 
  Copy, 
  Heart, 
  Trash2, 
  LayoutGrid, 
  List, 
  Moon, 
  Sun,
  Search,
  Settings,
  HelpCircle,
  Info,
  Maximize,
  Download,
  Printer,
  RefreshCw,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MenuBarProps {
  onOpenDesign: () => void;
  onImportFolder: () => void;
  onImportZip: () => void;
  onRescan: () => void;
  onClearLibrary: () => void;
  onExport: () => void;
  onPrint: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onCopyId: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  hasSelection: boolean;
}

export default function MenuBar({
  onOpenDesign,
  onImportFolder,
  onImportZip,
  onRescan,
  onClearLibrary,
  onExport,
  onPrint,
  onToggleFavorite,
  onDelete,
  onCopyId,
  viewMode,
  setViewMode,
  hasSelection
}: MenuBarProps) {
  const MenuItem = ({ children, onClick, icon: Icon, shortcut, disabled = false, className = "" }: any) => (
    <DropdownMenu.Item
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 py-1.5 text-[12px] outline-none cursor-default select-none rounded hover:bg-[#e5f1fb] text-[#1a1a1a]",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0067c0]" />}
        {children}
      </div>
      {shortcut && <span className="text-[10px] text-gray-400 font-mono ml-4 uppercase">{shortcut}</span>}
    </DropdownMenu.Item>
  );

  return (
    <div className="flex gap-1 h-full items-center">
      {/* File Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="px-2 py-1 rounded hover:bg-gray-100 outline-none font-medium transition-colors">
          File
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md shadow-xl border border-[#e0e0e0] p-1 z-[300] animate-in fade-in zoom-in-95 duration-75">
            <MenuItem onClick={onOpenDesign} icon={Plus} shortcut="Ctrl+O">Open Design</MenuItem>
            <MenuItem onClick={onImportFolder} icon={Plus}>Import Folder</MenuItem>
            <MenuItem onClick={onImportZip} icon={FolderOpen}>Import ZIP</MenuItem>
            <DropdownMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
            <MenuItem disabled icon={Save}>Save Metadata</MenuItem>
            <DropdownMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
            <MenuItem onClick={() => window.location.reload()} icon={LogOut}>Exit Application</MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Edit Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="px-2 py-1 rounded hover:bg-gray-100 outline-none font-medium transition-colors">
          Edit
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md shadow-xl border border-[#e0e0e0] p-1 z-[300] animate-in fade-in zoom-in-95 duration-75">
            <MenuItem disabled={!hasSelection} onClick={onCopyId} icon={Copy} shortcut="Ctrl+C">Copy ID</MenuItem>
            <MenuItem disabled={!hasSelection} onClick={onToggleFavorite} icon={Heart}>Toggle Favorite</MenuItem>
            <DropdownMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
            <MenuItem disabled={!hasSelection} onClick={onDelete} icon={Trash2} shortcut="Del" className="text-red-600">Delete Selection</MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* View Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="px-2 py-1 rounded hover:bg-gray-100 outline-none font-medium transition-colors">
          View
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md shadow-xl border border-[#e0e0e0] p-1 z-[300] animate-in fade-in zoom-in-95 duration-75">
            <MenuItem onClick={() => setViewMode('grid')} icon={LayoutGrid} className={cn(viewMode === 'grid' && "bg-[#e5f1fb] text-[#0067c0] font-bold")}>Grid View</MenuItem>
            <MenuItem onClick={() => setViewMode('list')} icon={List} className={cn(viewMode === 'list' && "bg-[#e5f1fb] text-[#0067c0] font-bold")}>List View</MenuItem>
            <DropdownMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
            <MenuItem icon={Moon}>Dark Theme</MenuItem>
            <MenuItem icon={Maximize}>Full Screen</MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Tools Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="px-2 py-1 rounded hover:bg-gray-100 outline-none font-medium transition-colors">
          Tools
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md shadow-xl border border-[#e0e0e0] p-1 z-[300] animate-in fade-in zoom-in-95 duration-75">
            <MenuItem onClick={onRescan} icon={RefreshCw}>Rescan Library</MenuItem>
            <MenuItem onClick={onClearLibrary} icon={Trash2} className="text-red-600">Clear All Metadata</MenuItem>
            <DropdownMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
            <MenuItem disabled={!hasSelection} onClick={onExport} icon={Download}>Export Preview</MenuItem>
            <MenuItem disabled={!hasSelection} onClick={onPrint} icon={Printer}>Print Sheets</MenuItem>
            <DropdownMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
            <MenuItem icon={Settings}>Preferences</MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Help Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="px-2 py-1 rounded hover:bg-gray-100 outline-none font-medium transition-colors">
          Help
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md shadow-xl border border-[#e0e0e0] p-1 z-[300] animate-in fade-in zoom-in-95 duration-75">
            <MenuItem icon={HelpCircle}>Documentation</MenuItem>
            <MenuItem icon={Search}>Check For Updates</MenuItem>
            <DropdownMenu.Separator className="h-px bg-[#e0e0e0] my-1" />
            <MenuItem onClick={() => alert("Embroidery Design Viewer Pro v1.0\nProfessional analysis tool for industrial formats.")} icon={Info}>About</MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
