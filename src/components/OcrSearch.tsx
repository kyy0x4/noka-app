import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Loader2 } from 'lucide-react';
import { searchNoka, listDocuments } from '../utils/ocrApi';
import { OcrDocument, OcrSearchResult } from '../types/noka';

export const OcrSearch = () => {
  const [query, setQuery] = useState('');
  const [threshold, setThreshold] = useState(50);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [results, setResults] = useState<OcrSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<OcrDocument[]>([]);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listDocuments().then((d) => setDocuments(d.documents || [])).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchNoka(query.trim(), selectedDoc || undefined, threshold);
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">NOKA OCR Search</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Cari nomor rangka dari hasil OCR scan surat jalan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Masukkan nomor rangka (NOKA)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#333d52] bg-white dark:bg-[#0c1427] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#333d52] bg-white dark:bg-[#0c1427] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Documents</option>
            {documents.filter(d => d.status === 'completed').map((d) => (
              <option key={d.id} value={d.id}>{d.doc_name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0">Threshold:</label>
            <input
              type="range"
              min={1}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-slate-400 w-6">{threshold}%</span>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {searched && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Results {total > 0 && <span className="text-slate-400 font-normal">({total} found)</span>}
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No matches found. Try lowering the threshold.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c1427] border border-slate-100 dark:border-[#1a2235]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                        {r.found_text}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        Match: {r.match_score}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        OCR: {r.ocr_confidence}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Page {r.page}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
