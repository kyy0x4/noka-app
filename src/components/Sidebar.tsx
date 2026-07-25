import React from 'react';
import { Scan, FileSearch, Cpu } from 'lucide-react';
import { ActiveTab } from '../types/noka';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const items: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'ocr-search', label: 'NOKA Search', icon: FileSearch, desc: 'Search from OCR Index' },
    { id: 'ocr-upload', label: 'Data Import', icon: Scan, desc: 'Import PDF / SQLite DB' },
  ];

  return (
    <aside className="w-56 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d1a] flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 transition-colors duration-200">
      <div className="p-4 space-y-4">
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#131b2e] border border-slate-200 dark:border-[#222a3d] flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600 text-white"><Cpu className="w-4 h-4" /></div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">NOKA OCR</div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Supabase Engine</div>
          </div>
        </div>

        <div className="space-y-1">
          {items.map(({ id, label, icon: Icon, desc }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div>{label}</div>
                  <div className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>{desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
