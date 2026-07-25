import os
import uuid
import asyncio
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from supabase import Client

from .config import UPLOAD_DIR
from .database import get_supabase
from .ocr_processor import run_indexing, normalize
from rapidfuzz import fuzz

router = APIRouter()
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed")

    doc_id = str(uuid.uuid4())
    ext = Path(file.filename).suffix
    save_path = os.path.join(UPLOAD_DIR, f"{doc_id}{ext}")

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    supabase = get_supabase()
    supabase.table("ocr_documents").insert({
        "id": doc_id,
        "doc_name": file.filename,
        "status": "pending",
    }).execute()

    return {"doc_id": doc_id, "doc_name": file.filename, "status": "pending", "message": "File uploaded"}


@router.post("/process/{doc_id}")
async def process_document(doc_id: str, background_tasks: BackgroundTasks):
    supabase = get_supabase()
    result = supabase.table("ocr_documents").select("*").eq("id", doc_id).execute()
    if not result.data:
        raise HTTPException(404, "Document not found")

    doc = result.data[0]
    if doc["status"] == "processing":
        raise HTTPException(400, "Document is already being processed")

    pdf_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(404, "PDF file not found on server")

    supabase.table("ocr_documents").update({"status": "processing"}).eq("id", doc_id).execute()

    background_tasks.add_task(_process_task, doc_id, pdf_path, supabase)
    return {"doc_id": doc_id, "status": "processing", "message": "OCR processing started in background"}


def _process_task(doc_id: str, pdf_path: str, supabase: Client):
    try:
        def on_progress(page_num, total_pages, n_words):
            supabase.table("ocr_documents").update({
                "total_pages": total_pages,
            }).eq("id", doc_id).execute()

        total_pages, total_words = run_indexing(pdf_path, doc_id, supabase, on_progress=on_progress)

        supabase.table("ocr_documents").update({
            "status": "completed",
            "total_pages": total_pages,
            "total_words": total_words,
        }).eq("id", doc_id).execute()
    except Exception as e:
        supabase.table("ocr_documents").update({
            "status": "failed",
            "error_message": str(e),
        }).eq("id", doc_id).execute()


@router.get("/status/{doc_id}")
async def get_status(doc_id: str):
    supabase = get_supabase()
    result = supabase.table("ocr_documents").select("*").eq("id", doc_id).execute()
    if not result.data:
        raise HTTPException(404, "Document not found")
    return result.data[0]


@router.get("/documents")
async def list_documents():
    supabase = get_supabase()
    result = supabase.table("ocr_documents").select("*").order("created_at", desc=True).execute()
    return {"documents": result.data}


@router.post("/process-sync/{doc_id}")
async def process_document_sync(doc_id: str):
    supabase = get_supabase()
    result = supabase.table("ocr_documents").select("*").eq("id", doc_id).execute()
    if not result.data:
        raise HTTPException(404, "Document not found")

    pdf_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(404, "PDF file not found on server")

    supabase.table("ocr_documents").update({"status": "processing"}).eq("id", doc_id).execute()

    try:
        total_pages, total_words = run_indexing(pdf_path, doc_id, supabase)
        supabase.table("ocr_documents").update({
            "status": "completed",
            "total_pages": total_pages,
            "total_words": total_words,
        }).eq("id", doc_id).execute()
        return {"doc_id": doc_id, "status": "completed", "total_pages": total_pages, "total_words": total_words}
    except Exception as e:
        supabase.table("ocr_documents").update({
            "status": "failed",
            "error_message": str(e),
        }).eq("id", doc_id).execute()
        raise HTTPException(500, str(e))


@router.get("/search")
async def search_noka(
    q: str = "",
    doc_id: str = "",
    threshold: int = 50,
    limit: int = 50
):
    if not q.strip():
        raise HTTPException(400, "Query parameter 'q' is required")

    supabase = get_supabase()
    query_normalized = normalize(q.strip())

    filter_args = {}
    if doc_id:
        filter_args["doc_id"] = doc_id

    result = supabase.table("ocr_words").select("*").eq("doc_id", doc_id if doc_id else "__none__").execute() if doc_id else supabase.table("ocr_words").select("*").execute()

    if doc_id:
        result = supabase.table("ocr_words").select("*").eq("doc_id", doc_id).execute()
    else:
        result = supabase.table("ocr_words").select("*").execute()

    all_words = result.data if result.data else []
    results = []

    for row in all_words:
        if len(query_normalized) < 3 and len(row["word_normalized"]) < 3:
            continue
        score = fuzz.ratio(query_normalized, row["word_normalized"])
        if score >= threshold:
            results.append({
                "id": row["id"],
                "doc_id": row["doc_id"],
                "page": row["page_num"],
                "found_text": row["word"],
                "match_score": round(score, 2),
                "ocr_confidence": row["confidence"],
                "location": {"x": row["x"], "y": row["y"], "w": row["w"], "h": row["h"]},
            })

    results.sort(key=lambda r: r["match_score"], reverse=True)
    results = results[:limit]
    return {"query": q, "total": len(results), "results": results}


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    supabase = get_supabase()
    supabase.table("ocr_words").delete().eq("doc_id", doc_id).execute()
    supabase.table("ocr_documents").delete().eq("id", doc_id).execute()
    pdf_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    return {"message": "Document deleted"}
