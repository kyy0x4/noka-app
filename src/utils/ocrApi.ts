import { OcrDocument, OcrSearchResponse } from '../types/noka';

const API_BASE = import.meta.env.VITE_OCR_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Accept': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export async function uploadPdf(file: File): Promise<{ doc_id: string; doc_name: string; status: string }> {
  const form = new FormData();
  form.append('file', file);
  return request('/upload', { method: 'POST', body: form });
}

export async function processDocument(docId: string): Promise<{ doc_id: string; status: string }> {
  return request(`/process/${docId}`, { method: 'POST' });
}

export async function processDocumentSync(docId: string): Promise<{ doc_id: string; status: string }> {
  return request(`/process-sync/${docId}`, { method: 'POST' });
}

export async function getStatus(docId: string): Promise<OcrDocument> {
  return request(`/status/${docId}`);
}

export async function listDocuments(): Promise<{ documents: OcrDocument[] }> {
  return request('/documents');
}

export async function searchNoka(
  q: string,
  docId?: string,
  threshold = 50,
  limit = 50
): Promise<OcrSearchResponse> {
  const params = new URLSearchParams({ q, threshold: String(threshold), limit: String(limit) });
  if (docId) params.set('doc_id', docId);
  return request(`/search?${params}`);
}

export async function deleteDocument(docId: string): Promise<void> {
  return request(`/documents/${docId}`, { method: 'DELETE' });
}
