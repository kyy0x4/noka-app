import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Database, Search } from 'lucide-react';
import { uploadPdf, processDocumentSync, listDocuments, deleteDocument } from '../utils/ocrApi';
import { OcrDocument } from '../types/noka';

export const OcrUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'processing' | 'done' | 'error'>('idle');
  const [docId, setDocId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<OcrDocument[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch { /* ignore */ }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const result = await uploadPdf(file);
      setDocId(result.doc_id);
      setStatus('uploaded');
      setMessage(`Uploaded: ${result.doc_name}`);
      setProcessing(true);
      setStatus('processing');
      const procResult = await processDocumentSync(result.doc_id);
      setStatus('done');
      setMessage(`Done! ${procResult.status}`);
      await loadDocuments();
    } catch (e: unknown) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Failed');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      await loadDocuments();
    } catch { /* ignore */ }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">PDF OCR Upload</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Upload scan surat jalan PDF untuk di-index dan dicari nomor rangka.
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-[#333d52] rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); setStatus('idle'); setMessage(''); }
            }}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Click to select a PDF file</p>
            </>
          )}
        </div>

        {file && status === 'idle' && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        )}

        {(status === 'processing' || processing) && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">OCR Processing in progress...</p>
          </div>
        )}

        {status === 'done' && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">{message}</p>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#222a3d] bg-white dark:bg-[#131b2e] shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" /> Document History
        </h3>
        {documents.length === 0 ? (
          <p className="text-xs text-slate-400">No documents processed yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0c1427] text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{doc.doc_name}</p>
                  <p className="text-slate-400">
                    {doc.total_pages}p &middot; {doc.total_words} words &middot; {formatDate(doc.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {doc.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {doc.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  {doc.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                  {doc.status === 'pending' && <span className="text-yellow-500">Pending</span>}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
