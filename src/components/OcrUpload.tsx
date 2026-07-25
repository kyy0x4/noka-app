import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Database, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';
import { uploadPdf, processDocumentSync, deleteDocument } from '../utils/ocrApi';
import { supabase } from '../utils/supabase';
import { OcrDocument } from '../types/noka';

const useBackend = !!import.meta.env.VITE_OCR_API_URL;

export const OcrUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [documents, setDocuments] = useState<OcrDocument[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [dbFile, setDbFile] = useState<File | null>(null);
  const [dbImporting, setDbImporting] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [dbMsg, setDbMsg] = useState('');
  const dbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    if (supabase) {
      const { data } = await supabase.from('ocr_documents').select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setDocuments(data as OcrDocument[]);
    } else if (useBackend) {
      try {
        const res = await fetch(`${import.meta.env.VITE_OCR_API_URL}/documents`);
        const d = await res.json();
        setDocuments(d.documents || []);
      } catch {}
    }
  };

  const handlePdfUpload = async () => {
    if (!file) return;
    setUploading(true); setMessage('');
    try {
      const result = await uploadPdf(file);
      setMessage(`Uploaded: ${result.doc_name}`);
      const procResult = await processDocumentSync(result.doc_id);
      setStatus('done');
      setMessage(`Done! ${procResult.status}`);
      await loadDocuments();
    } catch (e: unknown) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Failed');
    } finally { setUploading(false); }
  };

  const handleDbImport = async () => {
    if (!dbFile || !supabase) return;
    setDbImporting(true); setDbMsg(''); setDbStatus('idle');
    try {
      const SQL = await (await import('sql.js')).default;
      const buf = await dbFile.arrayBuffer();
      const db = new SQL(new Uint8Array(buf));

      const docResult = db.exec("SELECT * FROM ocr_words LIMIT 1");
      if (!docResult.length) { setDbStatus('error'); setDbMsg('No ocr_words table found in DB'); setDbImporting(false); return; }

      const countResult = db.exec("SELECT COUNT(*) as c FROM ocr_words");
      const totalWords = countResult[0]?.values[0][0] as number || 0;

      const cols = docResult[0].columns;
      const nameIdx = cols.indexOf('doc_id');
      const pageIdx = cols.indexOf('page_num');
      const wordIdx = cols.indexOf('word');
      const normIdx = cols.indexOf('word_normalized');
      const confIdx = cols.indexOf('confidence');
      const xIdx = cols.indexOf('x');
      const yIdx = cols.indexOf('y');
      const wIdx = cols.indexOf('w');
      const hIdx = cols.indexOf('h');

      const docName = dbFile.name.replace('.db', '');
      const docId = `${docName}-${Date.now()}`;
      let totalPages = 0;
      let pageRows: { page_num: number }[] = [];
      try {
        pageRows = (db.exec("SELECT DISTINCT page_num FROM ocr_words ORDER BY page_num")[0]?.values || []).map((v: unknown[]) => ({ page_num: v[0] as number }));
        totalPages = pageRows.length;
      } catch { totalPages = 0; }

      await supabase.from('ocr_documents').insert({
        id: docId, doc_name: docName, status: 'completed',
        total_pages: totalPages, total_words: totalWords,
      }).maybeSingle();

      const BATCH = 500;
      let offset = 0;
      while (true) {
        const batch = db.exec(`SELECT * FROM ocr_words LIMIT ${BATCH} OFFSET ${offset}`);
        if (!batch.length) break;
        const rows = batch[0].values.map((v: unknown[]) => ({
          doc_id: v[nameIdx] as string,
          page_num: v[pageIdx] as number,
          word: v[wordIdx] as string,
          word_normalized: v[normIdx] as string,
          confidence: v[confIdx] as number,
          x: v[xIdx] as number,
          y: v[yIdx] as number,
          w: v[wIdx] as number,
          h: v[hIdx] as number,
        }));
        const { error } = await supabase.from('ocr_words').insert(rows);
        if (error) throw new Error(error.message);
        offset += BATCH;
        setDbMsg(`Importing... ${offset}/${totalWords} words`);
      }

      db.close();
      setDbStatus('done');
      setDbMsg(`Imported ${totalWords} words from ${totalPages} pages`);
      await loadDocuments();
    } catch (e: unknown) {
      setDbStatus('error');
      setDbMsg(e instanceof Error ? e.message : 'Failed');
    } finally { setDbImporting(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="space-y-6">
      {useBackend && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">PDF OCR Upload</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Upload scan surat jalan PDF untuk di-index.
          </p>
          <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-[#333d52] rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setStatus('idle'); setMessage(''); }}} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <><Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-500 dark:text-slate-400">Click to select a PDF file</p></>
            )}
          </div>
          {file && status === 'idle' && (
            <button onClick={handlePdfUpload} disabled={uploading} className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload & Process'}
            </button>
          )}
          {status === 'done' && <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><p className="text-xs text-emerald-700 dark:text-emerald-300">{message}</p></div>}
          {status === 'error' && <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"><XCircle className="w-5 h-5 text-red-600 shrink-0" /><p className="text-xs text-red-700 dark:text-red-300">{message}</p></div>}
        </div>
      )}

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Import SQLite DB</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Upload file <code className="text-blue-400">.db</code> hasil OCR dari Colab langsung ke Supabase.
        </p>
        <div onClick={() => dbInputRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-[#333d52] rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors">
          <input ref={dbInputRef} type="file" accept=".db,.sqlite,.sqlite3" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDbFile(f); setDbStatus('idle'); setDbMsg(''); }}} />
          {dbFile ? (
            <div className="flex items-center justify-center gap-3">
              <Database className="w-8 h-8 text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{dbFile.name}</p>
                <p className="text-xs text-slate-400">{(dbFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <><Database className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-500 dark:text-slate-400">Click to select a .db file</p></>
          )}
        </div>
        {dbFile && dbStatus === 'idle' && (
          <button onClick={handleDbImport} disabled={dbImporting || !supabase} className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
            {dbImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {dbImporting ? dbMsg || 'Importing...' : 'Import to Supabase'}
          </button>
        )}
        {dbMsg && dbStatus === 'done' && <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><p className="text-xs text-emerald-700 dark:text-emerald-300">{dbMsg}</p></div>}
        {dbStatus === 'error' && <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"><XCircle className="w-5 h-5 text-red-600 shrink-0" /><p className="text-xs text-red-700 dark:text-red-300">{dbMsg}</p></div>}
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" /> Document History
        </h3>
        {documents.length === 0 ? (
          <p className="text-xs text-slate-400">No documents imported yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0c1427] text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{doc.doc_name}</p>
                  <p className="text-slate-400">{doc.total_pages}p &middot; {doc.total_words} words &middot; {formatDate(doc.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {doc.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {doc.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  {doc.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
