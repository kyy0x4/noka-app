import cv2
import numpy as np
import pytesseract
from pytesseract import Output
from pdf2image import convert_from_path, pdfinfo_from_path
import os
import time
from typing import Optional
from supabase import Client

from .config import OCR_DPI, OCR_BATCH_SIZE


def normalize(text: str) -> str:
    return text.upper().replace("O", "0").replace("I", "1").replace("B", "8")


def preprocess(pil_image):
    img = np.array(pil_image.convert("L"))
    _, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    binary = cv2.resize(binary, None, fx=1.2, fy=1.2, interpolation=cv2.INTER_LINEAR)
    return binary


def ocr_words_from_page(doc_id: str, page_num: int, processed_img):
    data = pytesseract.image_to_data(processed_img, config="--psm 6", output_type=Output.DICT)
    rows = []
    for i, text in enumerate(data["text"]):
        if text.strip():
            rows.append({
                "doc_id": doc_id,
                "page_num": page_num,
                "word": text.strip(),
                "word_normalized": normalize(text.strip()),
                "confidence": data["conf"][i],
                "x": int(data["left"][i]),
                "y": int(data["top"][i]),
                "w": int(data["width"][i]),
                "h": int(data["height"][i]),
            })
    return rows


def run_indexing(pdf_path: str, doc_id: str, supabase: Client, on_progress=None):
    info = pdfinfo_from_path(pdf_path)
    total_pages = info["Pages"]
    total_words = 0

    for start in range(1, total_pages + 1, OCR_BATCH_SIZE):
        end = min(start + OCR_BATCH_SIZE - 1, total_pages)
        pages = convert_from_path(pdf_path, dpi=OCR_DPI, first_page=start, last_page=end)
        for i, page in enumerate(pages):
            page_num = start + i
            processed = preprocess(page)
            words = ocr_words_from_page(doc_id, page_num, processed)
            if words:
                supabase.table("ocr_words").insert(words).execute()
            total_words += len(words)
            if on_progress:
                on_progress(page_num, total_pages, len(words))
    return total_pages, total_words
