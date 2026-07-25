import React, { useState } from 'react';
import { X, FileSearch, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { NokaRecord } from '../types/noka';

interface BatchSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRecords: NokaRecord[];
}

export const BatchSearchModal: React.FC<BatchSearchModalProps> = ({
  isOpen,
  onClose,
  allRecords,
}) => {
  const [inputText, setInputText] = useState(
    'MHF11KE1001234567\nPL23348123000921\nMKA88291039821412\nMHF22GG8009182312\nINVALID_NOKA_SAMPLE'
  );
  const [results, setResults] = useState<{ query: string; match: NokaRecord | null }[]>([]);

  if (!isOpen) return null;

  const handleRunBatchSearch = () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim().toUpperCase())
      .filter((l) => l.length > 0);

    const lookupResults = lines.map((q) => {
      const found = allRecords.find((r) => r.noka.toUpperCase() === q || r.noka.includes(q));
      return { query: q, match: found || null };
    });

    setResults(lookupResults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Batch NOKA Lookup & Verification Tool
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search multiple NOKA / Nomor Rangka strings line by line
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">
              Paste NOKA / VIN List (One per line):
            </label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunBatchSearch}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <FileSearch className="w-4 h-4" />
              <span>Execute Batch Search</span>
            </button>
          </div>

          {/* Results List */}
          {results.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Batch Results ({results.filter((r) => r.match).length} Found / {results.length} Searched)</span>
              </div>

              <div className="space-y-2">
                {results.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1326] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      {res.match ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {res.query}
                        </div>
                        {res.match ? (
                          <div className="text-[11px] text-slate-500">
                            {res.match.brand} {res.match.model} ({res.match.year})
                          </div>
                        ) : (
                          <div className="text-[11px] text-rose-500">
                            Record not found in database index
                          </div>
                        )}
                      </div>
                    </div>

                    {res.match && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500">
                        MATCHED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1326]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
          >
            Close Batch Tool
          </button>
        </div>
      </div>
    </div>
  );
};
