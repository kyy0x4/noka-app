-- Jalanin di Supabase SQL Editor setelah schema.sql
-- Biar anon key bisa SELECT dari frontend

ALTER TABLE ocr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public SELECT on ocr_documents"
ON ocr_documents FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public SELECT on ocr_words"
ON ocr_words FOR SELECT
TO anon
USING (true);
