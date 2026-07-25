import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Loader2, Database, AlertCircle } from 'lucide-react';
import { searchNoka, listDocuments } from '../utils/ocrApi';
import { supabase } from '../utils/supabase';
import { OcrDocument, OcrSearchResult } from '../types/noka';

function normalize(text: string): string {
  return text.toUpperCase().replace(/O/g, '0').replace(/I/g, '1').replace(/B/g, '8');
}

async function searchViaSupabase(query: string, threshold: number, docId?: string): Promise<OcrSearchResult[]> {
  if (!supabase) return [];
  const q = normalize(query);

  let dbQuery = supabase
    .from('ocr_words')
    .select('id, doc_id, page_num, word, word_normalized, confidence, x, y, w, h')
    .ilike('word_normalized', `%${q}%`)
    .limit(200);

  if (docId) dbQuery = dbQuery.eq('doc_id', docId);
  const { data, error } = await dbQuery;
  if (error || !data) {
    console.error('Supabase search error:', error);
    return [];
  }

  const results: OcrSearchResult[] = [];
  for (const row of data) {
    const wn = normalize(row.word);
    let score = 0;
    if (q.length <= 3) {
      score = wn.includes(q) ? 100 : (wn.startsWith(q) ? 80 : 0);
    } else {
      let matches = 0;
      for (let i = 0; i <= q.length - 3; i++) {
        if (wn.includes(q.substring(i, i + 3))) matches++;
      }
      score = Math.round((matches / Math.max(1, q.length - 2)) * 100);
    }
    if (score >= threshold) {
      results.push({
        id: row.id,
        doc_id: row.doc_id,
        page: row.page_num,
        found_text: row.word,
        match_score: score,
        ocr_confidence: row.confidence,
        location: { x: row.x, y: row.y, w: row.w, h: row.h },
      });
    }
  }
  return results.sort((a, b) => b.match_score - a.match_score).slice(0, 50);
}

interface OcrSearchProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const OcrSearch: React.FC<OcrSearchProps> = ({ inputRef }) => {
  const [query, setQuery] = useState('');
  const [threshold, setThreshold] = useState(60);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [results, setResults] = useState<OcrSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<OcrDocument[]>([]);
  const [searched, setSearched] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  const useBackend = !!import.meta.env.VITE_OCR_API_URL;

  useEffect(() => {
    const check = async () => {
      if (supabase) {
        const { data } = await supabase.from('ocr_documents').select('count', { count: 'exact', head: true });
        setDbConnected(data !== null);
      } else {
        setDbConnected(false);
      }
    };
    check();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (useBackend) {
        try { const d = await listDocuments(); setDocuments(d.documents || []); } catch {}
      } else if (supabase) {
        const { data } = await supabase.from('ocr_documents').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) setDocuments(data as OcrDocument[]);
      }
    };
    load();
  }, [useBackend]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      let data: OcrSearchResult[];
      if (useBackend) {
        const resp = await searchNoka(query.trim(), selectedDoc || undefined, threshold);
        data = resp.results;
      } else {
        data = await searchViaSupabase(query.trim(), threshold, selectedDoc || undefined);
      }
      setResults(data);
      setTotal(data.length);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, threshold, selectedDoc, useBackend]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">NOKA OCR Search</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cari nomor rangka dari hasil OCR scan surat jalan.</p>
          </div>
          {dbConnected === true && <span className="flex items-center gap-1.5 text-[10px] text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Supabase Connected</span>}
          {dbConnected === false && <span className="flex items-center gap-1.5 text-[10px] text-red-400"><AlertCircle className="w-3 h-3" /> Supabase not configured</span>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Masukkan nomor rangka, misal: MHF11KE..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#333d52] bg-white dark:bg-[#0c1427] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {documents.length > 0 && (
            <select value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#333d52] bg-white dark:bg-[#0c1427] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Documents</option>
              {documents.filter(d => d.status === 'completed').map(d => (
                <option key={d.id} value={d.id}>{d.doc_name}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0">Match:</label>
            <input type="range" min={1} max={100} value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))} className="w-16" />
            <span className="text-xs text-slate-400 w-5">{threshold}%</span>
          </div>
          <button onClick={handleSearch} disabled={loading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white text-xs font-bold transition-all flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {!dbConnected && !useBackend && (
        <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 text-center">
          <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-amber-700 dark:text-amber-400">Supabase not configured. Set <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in Vercel env vars.</p>
        </div>
      )}

      {searched && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Results {total > 0 && <span className="text-slate-400 font-normal">({total} found)</span>}
            </h3>
            {documents.length > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3" /> {documents.length} docs
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No matches found. Try lowering the match threshold.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {results.map((r) => (
                <div key={r.id} className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c1427] border border-slate-100 dark:border-[#1a2235]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{r.found_text}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Match: {r.match_score}%</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">OCR: {r.ocr_confidence}%</span>
                      <span className="text-[10px] text-slate-400 font-mono">Page {r.page}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Doc: {r.doc_id.slice(0, 12)}...</span>
                    </div>
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
