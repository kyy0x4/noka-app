-- Jalankan di Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS ocr_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doc_name TEXT NOT NULL,
    total_pages INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ocr_words (
    id BIGSERIAL PRIMARY KEY,
    doc_id UUID NOT NULL REFERENCES ocr_documents(id) ON DELETE CASCADE,
    page_num INTEGER NOT NULL,
    word TEXT NOT NULL,
    word_normalized TEXT NOT NULL,
    confidence INTEGER DEFAULT 0,
    x INTEGER, y INTEGER, w INTEGER, h INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocr_words_doc_id ON ocr_words(doc_id);
CREATE INDEX IF NOT EXISTS idx_ocr_words_word_normalized ON ocr_words(word_normalized);
CREATE INDEX IF NOT EXISTS idx_ocr_words_trgm ON ocr_words USING gin (word_normalized gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ocr_documents_status ON ocr_documents(status);
