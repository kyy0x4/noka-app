import React from 'react';
import { UploadCloud, Terminal, CheckCircle2, Database, ArrowRight, Play, RefreshCw } from 'lucide-react';
import { LogEntry } from '../types/noka';

interface PipelineWorkflowProps {
  onOpenUploadModal: () => void;
  onSelectTab: (tab: 'ingest' | 'logs' | 'persistence') => void;
  recentLog?: LogEntry;
  totalRecords: number;
  isProcessing: boolean;
  onSimulateIngest: () => void;
}

export const PipelineWorkflow: React.FC<PipelineWorkflowProps> = ({
  onOpenUploadModal,
  onSelectTab,
  recentLog,
  totalRecords,
  isProcessing,
  onSimulateIngest,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 01 Stage: File Upload */}
      <div className="relative group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4 shadow-sm hover:border-blue-500/50 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold flex items-center justify-center">
              01
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">File Upload</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">STAGE_1</span>
        </div>

        <div
          onClick={onOpenUploadModal}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40"
        >
          <UploadCloud className="w-6 h-6 mx-auto text-blue-500 mb-1 animate-bounce" />
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Click or drag CSV/JSON files
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Support NOKA data import (Max 50MB)
          </p>
        </div>
      </div>

      {/* 02 Stage: Processing & Indexing Log */}
      <div
        onClick={() => onSelectTab('logs')}
        className="relative group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
              02
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Processing & Indexing Log</span>
          </div>
          <div className="flex items-center space-x-1">
            {isProcessing && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400">process_engine.sh</span>
          </div>
        </div>

        {/* Terminal Mini Window */}
        <div className="rounded-lg bg-black/90 p-2.5 font-mono text-[11px] space-y-1 text-slate-300 border border-slate-800 h-[68px] overflow-hidden">
          <div className="flex items-center justify-between text-[9px] text-slate-500 pb-1 border-b border-slate-800">
            <span>TERMINAL STREAM</span>
            <span className="text-emerald-400">● RUNNING</span>
          </div>
          <div className="truncate text-emerald-400">
            [{recentLog?.timestamp || '14:20:01'}] <span className="text-blue-400">INFO</span> {recentLog?.message || 'Parsing NOKA chassis dataset...'}
          </div>
        </div>
      </div>

      {/* 03 Stage: Database Persistence */}
      <div
        onClick={() => onSelectTab('persistence')}
        className="relative group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
              03
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Database Persistence</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">INDEX_READY</span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Indexing Complete
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Exporting to Local Storage B-Tree...
              </p>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {totalRecords}
            </div>
            <div className="text-[9px] text-slate-400">SYNCED</div>
          </div>
        </div>
      </div>
    </div>
  );
};
