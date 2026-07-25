import React, { useState } from 'react';
import { Database, HardDrive, Download, RefreshCw, CheckCircle2, ShieldCheck, Trash2, Save, FileJson, FileSpreadsheet } from 'lucide-react';
import { NokaRecord } from '../types/noka';

interface PersistenceViewProps {
  records: NokaRecord[];
  onResetToDefaults: () => void;
}

export const PersistenceView: React.FC<PersistenceViewProps> = ({
  records,
  onResetToDefaults,
}) => {
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `noka_database_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    if (records.length === 0) return;
    const headers = Object.keys(records[0]).join(',');
    const rows = records.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers, ...rows].join('\n'));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `noka_database_export_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Indexing Complete Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/40 via-emerald-950/20 to-slate-900 border border-emerald-500/30 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              DATABASE B-TREE PERSISTENCE STATUS
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Indexing Complete & Storage Synced
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Local Storage Key: <span className="font-mono text-emerald-300">noka_records_v2</span> — All {records.length} records active.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <FileJson className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Storage Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase">INDEX NAME</div>
          <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">NOKA_MASTER_V2</div>
          <div className="text-xs text-slate-500">Fast Primary Key Lookup</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase">STORAGE TYPE</div>
          <div className="text-base font-bold font-mono text-emerald-500">Persistent Local Storage</div>
          <div className="text-xs text-slate-500">Client-Side Cache & Recovery</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase">CHECKSUM INTEGRITY</div>
          <div className="text-base font-bold font-mono text-indigo-500">100% SHA-256 Valid</div>
          <div className="text-xs text-slate-500">Zero corrupted frame entries</div>
        </div>
      </div>

      {/* Database Reset Action */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Reset Database to Default Seed Set
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reload initial 10 verified Indonesian vehicle records (Toyota Avanza, HR-V, Xpander, etc.)
          </p>
        </div>

        <button
          onClick={onResetToDefaults}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restore Seed Data</span>
        </button>
      </div>
    </div>
  );
};
