import React from 'react';
import {
  UploadCloud,
  Terminal,
  Database,
  Search,
  PlusCircle,
  BarChart3,
  Layers,
  CheckCircle2,
  Cpu,
  Scan,
  FileSearch
} from 'lucide-react';
import { ActiveTab } from '../types/noka';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewPipelineModal: () => void;
  logCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewPipelineModal,
  logCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; count?: number }[] = [
    { id: 'lookup', label: 'NOKA Lookup', icon: Search, badge: 'Core' },
    { id: 'ingest', label: 'Data Ingest', icon: UploadCloud },
    { id: 'logs', label: 'Process Log', icon: Terminal, count: logCount },
    { id: 'persistence', label: 'DB Persistence', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const ocrItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ocr-upload', label: 'OCR Upload', icon: Scan },
    { id: 'ocr-search', label: 'OCR Search', icon: FileSearch },
  ];

  const renderNavItem = (
    id: ActiveTab,
    Icon: React.ComponentType<{ className?: string }>,
    label: string,
    isActive: boolean,
    badge?: string,
    count?: number,
  ) => (
    <button
      key={id}
      onClick={() => onTabChange(id)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center space-x-2.5">
        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
            isActive
              ? 'bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          {badge}
        </span>
      )}
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full ${
            isActive
              ? 'bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d1a] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 transition-colors duration-200">
      {/* Top Navigation Group */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* System Core Badge */}
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#131b2e] border border-slate-200 dark:border-[#222a3d] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-blue-600 text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                System Core
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                V2.4.0-Stable
              </div>
            </div>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return renderNavItem(item.id, Icon, item.label, isActive, item.badge, item.count);
          })}
          <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            OCR Pipeline
          </div>
          {ocrItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return renderNavItem(item.id, Icon, item.label, isActive);
          })}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <button
          onClick={onOpenNewPipelineModal}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Pipeline</span>
        </button>
      </div>
    </aside>
  );
};
