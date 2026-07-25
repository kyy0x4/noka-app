import React from 'react';
import { Moon, Sun, Cpu } from 'lucide-react';
import { ActiveTab } from '../types/noka';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#080d1a]/80 backdrop-blur-md transition-colors duration-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">NOKA OCR Pipeline</h1>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Supabase &bull; Vercel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 dark:bg-[#131b2e] p-0.5 text-xs">
            {(['ocr-search', 'ocr-upload'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'ocr-search' ? 'Search' : 'Import'}
              </button>
            ))}
          </div>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
