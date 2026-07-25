import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
OCR_DPI = int(os.getenv("OCR_DPI", "100"))
OCR_BATCH_SIZE = int(os.getenv("OCR_BATCH_SIZE", "10"))
