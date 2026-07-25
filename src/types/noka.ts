export type SearchMode = 'exact' | 'fuzzy' | 'batch';
export type RecordStatus = 'ACTIVE' | 'ARCHIVED' | 'FLAGGED' | 'PENDING';
export type ActiveTab = 'ocr-upload' | 'ocr-search';

export interface OcrDocument {
  id: string;
  doc_name: string;
  total_pages: number;
  total_words: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface OcrSearchResult {
  id: number;
  doc_id: string;
  page: number;
  found_text: string;
  match_score: number;
  ocr_confidence: number;
  location: { x: number; y: number; w: number; h: number };
}

export interface OcrSearchResponse {
  query: string;
  total: number;
  results: OcrSearchResult[];
}
export type LogLevel = 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR' | 'INDEX';

export interface NokaRecord {
  id: string;
  noka: string; // VIN / Nomor Rangka
  brand: string;
  model: string;
  variant: string;
  year: number;
  engineCode: string;
  frameCode: string;
  fuelType: 'Bensin' | 'Diesel' | 'EV' | 'Hybrid';
  transmission: 'Automatic' | 'Manual' | 'CVT';
  color: string;
  status: RecordStatus;
  entryDate: string;
  registrationRegion: string; // e.g., 'DKI Jakarta (B)', 'Jawa Barat (D)', 'Jawa Timur (L)'
  dataChecksum: string;
  batchId?: string;
  notes?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
}

export interface PipelineStats {
  totalRecords: number;
  activeRecords: number;
  flaggedRecords: number;
  archivedRecords: number;
  lastIndexedAt: string;
  indexVersion: string;
  storageUsedMb: number;
  throughputRps: number;
}

export interface DecodedNoka {
  wmi: string; // World Manufacturer Identifier
  country: string;
  manufacturer: string;
  vds: string; // Vehicle Descriptor Section
  vis: string; // Vehicle Identifier Section
  modelYearCode: string;
  calculatedYear: number;
  plantCode: string;
  serialNumber: string;
  isValidLength: boolean;
}
