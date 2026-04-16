# app/routers/admin_documents.py
"""
All endpoints powering the Admin Document Verification page.
Documents are uploaded by schools via /profile/upload-document (Cloudinary).
Admin decisions are stored in admin_doc_overrides sub-collection.

Endpoint map
────────────
GET   /admin/documents                                → school list (left panel)
GET   /admin/documents/{school_id}                    → full document page for one school
POST  /admin/documents/{school_id}/{doc_id}/approve   → approve with optional remarks
POST  /admin/documents/{school_id}/{doc_id}/reject    → reject with mandatory reason
POST  /admin/documents/{school_id}/{doc_id}/reset     → undo decision (back to Pending)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from pydantic import BaseModel

from app.routers.admin_dashboard import get_current_admin
from app.schemas_admin import (
    SchoolDocSummary,
    SchoolDocListResponse,
    DocumentItem,
    DocumentCategory,
    DocumentsPageStats,
    DocumentsPageResponse,
    DocumentActionResponse,
    DocStatus,
    DocRequirement,
    SchoolDocPriority,
    SchoolDocReviewStatus,
)
from app.models_admin import (
    list_schools_with_doc_summary,
    get_school_documents_page,
    approve_document,
    reject_document,
    reset_document,
)

router = APIRouter(prefix="/admin/documents", tags=["Admin Documents"])


# ─── Request bodies ───────────────────────────────────────────────────────────

class ApproveRequest(BaseModel):
    admin_remarks: Optional[str] = None   # optional remarks when approving


class RejectRequest(BaseModel):
    rejection_reason: str                 # mandatory reason


# ─────────────────────────────────────────────────────────
# 1. GET /admin/documents
# ─────────────────────────────────────────────────────────

@router.get("", response_model=SchoolDocListResponse)
async def list_schools_for_docs(
    search:        Optional[str] = Query(None),
    priority:      Optional[str] = Query(None),
    current_admin: str = Depends(get_current_admin),
):
    """
    Returns school list with real pending counts from profile_documents.
    Only shows schools that have submitted their profile (is_submitted = True).
    """
    schools_raw, total_pending = list_schools_with_doc_summary(
        search=search, priority=priority
    )
    items = [
        SchoolDocSummary(
            school_id     = s["school_id"],
            name          = s["name"],
            pending_count = s["pending_count"],
            priority      = SchoolDocPriority(s["priority"]),
            review_status = SchoolDocReviewStatus(s["review_status"]),
        )
        for s in schools_raw
    ]
    return SchoolDocListResponse(schools=items, total_pending=total_pending)


# ─────────────────────────────────────────────────────────
# 2. GET /admin/documents/{school_id}
# ─────────────────────────────────────────────────────────

@router.get("/{school_id}", response_model=DocumentsPageResponse)
async def get_school_docs(
    school_id:     str,
    current_admin: str = Depends(get_current_admin),
):
    """
    Returns all document categories with REAL Cloudinary URLs and admin decisions.
    """
    page_data = get_school_documents_page(school_id)
    if not page_data:
        raise HTTPException(status_code=404, detail="School not found.")

    categories = []
    for cat in page_data["categories"]:
        docs = []
        for d in cat["docs"]:
            # Map status string → DocStatus enum safely
            raw_status = d.get("status", "Pending")
            try:
                status_enum = DocStatus(raw_status)
            except ValueError:
                status_enum = DocStatus.pending

            raw_req = d.get("requirement", "Mandatory")
            try:
                req_enum = DocRequirement(raw_req)
            except ValueError:
                req_enum = DocRequirement.mandatory

            docs.append(DocumentItem(
                doc_id          = d["doc_id"],
                name            = d["name"],
                status          = status_enum,
                requirement     = req_enum,
                file_name       = d.get("file_name"),
                file_url        = d.get("file_url"),
                category        = d["category"],
                rejected_reason = d.get("rejected_reason"),
                admin_remarks   = d.get("admin_remarks"),
                uploaded_at     = d.get("uploaded_at"),
                content_type    = d.get("content_type"),
            ))
        categories.append(DocumentCategory(category=cat["category"], docs=docs))

    return DocumentsPageResponse(
        school_id   = page_data["school_id"],
        school_name = page_data["school_name"],
        stats       = DocumentsPageStats(**page_data["stats"]),
        categories  = categories,
    )


# ─────────────────────────────────────────────────────────
# 3. POST /admin/documents/{school_id}/{doc_id}/approve
# ─────────────────────────────────────────────────────────

@router.post("/{school_id}/{doc_id}/approve", response_model=DocumentActionResponse)
async def approve_doc(
    school_id:     str,
    doc_id:        str,
    body:          ApproveRequest = ApproveRequest(),
    current_admin: str = Depends(get_current_admin),
):
    """
    Mark a document as Approved. Optional admin remarks sent to school.
    """
    success = approve_document(school_id, doc_id, body.admin_remarks)
    if not success:
        raise HTTPException(status_code=500, detail="Approval failed.")
    return DocumentActionResponse(
        message   = "Document approved successfully.",
        doc_id    = doc_id,
        status    = DocStatus.approved,
        school_id = school_id,
    )


# ─────────────────────────────────────────────────────────
# 4. POST /admin/documents/{school_id}/{doc_id}/reject
# ─────────────────────────────────────────────────────────

@router.post("/{school_id}/{doc_id}/reject", response_model=DocumentActionResponse)
async def reject_doc(
    school_id:     str,
    doc_id:        str,
    body:          RejectRequest,
    current_admin: str = Depends(get_current_admin),
):
    """
    Mark a document as Rejected with a mandatory reason visible to the school.
    """
    if not body.rejection_reason.strip():
        raise HTTPException(status_code=400, detail="Rejection reason cannot be empty.")

    success = reject_document(school_id, doc_id, body.rejection_reason)
    if not success:
        raise HTTPException(status_code=500, detail="Rejection failed.")
    return DocumentActionResponse(
        message   = "Document rejected.",
        doc_id    = doc_id,
        status    = DocStatus.rejected,
        school_id = school_id,
    )


# ─────────────────────────────────────────────────────────
# 5. POST /admin/documents/{school_id}/{doc_id}/reset
# ─────────────────────────────────────────────────────────

@router.post("/{school_id}/{doc_id}/reset", response_model=DocumentActionResponse)
async def reset_doc(
    school_id:     str,
    doc_id:        str,
    current_admin: str = Depends(get_current_admin),
):
    """
    Undo a previous approve/reject — sets document back to Pending.
    """
    reset_document(school_id, doc_id)
    return DocumentActionResponse(
        message   = "Document reset to Pending.",
        doc_id    = doc_id,
        status    = DocStatus.pending,
        school_id = school_id,
    )