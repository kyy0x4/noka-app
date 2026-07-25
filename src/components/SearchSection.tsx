import React from 'react';
import { Search, Key, Filter, Database, Layers, Check, FileSearch } from 'lucide-react';
import { SearchMode } from '../types/noka';

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  selectedBrand: string;
  onBrandSelect: (brand: string) => void;
  brands: string[];
  recordsFound: number;
  activeIndexName: string;
  onOpenBatchSearch: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  selectedBrand,
  onBrandSelect,
  brands,
  recordsFound,
  activeIndexName,
  onOpenBatchSearch,
  inputRef,
}) => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm mb-6 transition-colors">
      {/* Top Search Bar & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        {/* Search Input Box */}
        <div className="lg:col-span-3 relative">
          <div className="relative flex items-center">
            <Key className="w-4 h-4 absolute left-3.5 text-blue-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Enter NOKA / Nomor Rangka or Vehicle Model to search across database..."
              className="w-full pl-10 pr-20 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <div className="absolute right-3 flex items-center space-x-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
                Cmd
              </kbd>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
                K
              </kbd>
            </div>
          </div>

          {/* Mode Selector Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={() => onSearchModeChange('exact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                searchMode === 'exact'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Exact Match</span>
            </button>

            <button
              onClick={() => onSearchModeChange('fuzzy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                searchMode === 'fuzzy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Fuzzy Search</span>
            </button>

            <button
              onClick={onOpenBatchSearch}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                searchMode === 'batch'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Batch Search</span>
            </button>

            {/* Brand Chips */}
            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
              <button
                onClick={() => onBrandSelect('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedBrand === 'ALL'
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => onBrandSelect(brand)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedBrand === brand
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Index Info Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                ACTIVE INDEX
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {activeIndexName}
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              RECORDS FOUND
            </div>
            <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
              {recordsFound.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
