import React from 'react';
import { Database, Settings, Moon, Sun, Terminal, RefreshCw, ShieldCheck, Cpu } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  recordCount: number;
  environmentStatus: string;
  onRefreshData: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  recordCount,
  environmentStatus,
  onRefreshData,
  onOpenSettings,
}) => {
  return (
    <header className="h-16 border-b transition-colors duration-200 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Brand */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            NOKA Processing & Database Search Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Vehicle Chassis Identification & Ingestion Data Pipeline
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Environment Status Badge */}
        <div className="hidden md:flex items-center space-x-2 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Environment Status: {environmentStatus}</span>
        </div>

        {/* Database Stats Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono font-semibold">{recordCount.toLocaleString()}</span>
          <span className="text-slate-400">Records</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefreshData}
          title="Refresh Engine Pipeline"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Engine Configuration"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
