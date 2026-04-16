"""
routers/status.py
─────────────────────────────────────────────────────────────────────────────
All endpoints powering the Application Status page (page.tsx).

Page sections covered:
  ┌─ Application Info cards (ID, type, submitted on, current status)
  ├─ Progress Timeline      (5 steps: Submitted → Docs → Inspection → Approval → Certificate)
  ├─ Remarks                (inspector / admin notes on the application)
  └─ Pending Actions        (actionable tasks the school must complete)

Endpoints:
  GET  /status/{school_id}                        → Full page data (1 call loads entire page)
  GET  /status/{school_id}/timeline               → Progress timeline steps only
  GET  /status/{school_id}/remarks                → All remarks for the application
  POST /status/{school_id}/remarks                → Add a remark (admin / inspector)
  GET  /status/{school_id}/pending-actions        → All pending actions for the school
  POST /status/{school_id}/pending-actions        → Add a pending action (admin)
  PATCH /status/{school_id}/pending-actions/{action_id}/resolve  → Mark action as resolved
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from app.models import get_db

from app import models
from app.schemas import (
    ApplicationStatus,
    InspectionStatus,
    CertificateStatus,
)
from pydantic import BaseModel
from enum import Enum


router = APIRouter(prefix="/status", tags=["Application Status"])


# ─────────────────────────────────────────────
# Local schemas (status-page specific)
# ─────────────────────────────────────────────

class TimelineStepStatus(str, Enum):
    done    = "done"
    current = "current"
    pending = "pending"


class TimelineStep(BaseModel):
    step:   str                  # machine key e.g. "application_submitted"
    label:  str                  # display label
    date:   Optional[str] = "--" # ISO date string or "--"
    status: TimelineStepStatus
    detail: str


class RemarkCreate(BaseModel):
    author:      str             # "Inspector" | "Admin" | school name
    message:     str
    is_urgent:   bool = False


class RemarkResponse(BaseModel):
    id:          str
    author:      str
    message:     str
    is_urgent:   bool
    created_at:  str


class PendingActionSeverity(str, Enum):
    high   = "high"    # red  – blocks progress
    medium = "medium"  # amber – advisory


class PendingActionCreate(BaseModel):
    title:       str
    description: Optional[str] = None
    due_date:    Optional[str] = None   # ISO date string e.g. "2026-02-20"
    severity:    PendingActionSeverity = PendingActionSeverity.medium


class PendingActionResponse(BaseModel):
    id:          str
    title:       str
    description: Optional[str] = None
    due_date:    Optional[str] = None
    severity:    PendingActionSeverity
    resolved:    bool = False
    created_at:  str


class StatusPageResponse(BaseModel):
    """Single-call response that loads the entire Application Status page."""
    application_id:   str
    application_type: str
    submitted_on:     Optional[str]
    current_status:   str
    timeline:         List[TimelineStep]
    remarks:          List[RemarkResponse]
    pending_actions:  List[PendingActionResponse]


# ─────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_timeline(
    application_data: Optional[dict],
    inspection_data:  Optional[dict],
    certificate_data: Optional[dict],
) -> List[TimelineStep]:
    """
    Derives the 5-step timeline purely from existing Firestore documents.
    No extra collection needed — status is inferred from application /
    inspection / certificate status fields.
    """
    app_status   = application_data.get("status", "")  if application_data  else ""
    insp_status  = inspection_data.get("status",  "")  if inspection_data   else ""
    cert_status  = certificate_data.get("status", "")  if certificate_data  else ""

    submitted_on   = application_data.get("submitted_on")   if application_data else None
    insp_sched     = inspection_data.get("scheduled_date")  if inspection_data  else None
    insp_done      = inspection_data.get("completed_date")  if inspection_data  else None
    cert_issued    = certificate_data.get("issued_on")      if certificate_data else None

    # ── Step 1: Application Submitted ──────────────────────────────────────
    step1_status = TimelineStepStatus.done if app_status in [
        ApplicationStatus.submitted, ApplicationStatus.under_review,
        ApplicationStatus.approved,  ApplicationStatus.rejected,
    ] else TimelineStepStatus.current if app_status == ApplicationStatus.draft \
      else TimelineStepStatus.pending

    # ── Step 2: Document Verification ──────────────────────────────────────
    # Treat "Under Review" as docs verified (review started)
    step2_status = TimelineStepStatus.done if app_status in [
        ApplicationStatus.under_review, ApplicationStatus.approved,
    ] else TimelineStepStatus.current if app_status == ApplicationStatus.submitted \
      else TimelineStepStatus.pending

    # ── Step 3: Inspection ─────────────────────────────────────────────────
    if insp_status == InspectionStatus.completed:
        step3_status = TimelineStepStatus.done
    elif insp_status in [InspectionStatus.scheduled, InspectionStatus.pending]:
        step3_status = TimelineStepStatus.current
    else:
        step3_status = TimelineStepStatus.pending

    # ── Step 4: Approval ───────────────────────────────────────────────────
    if app_status == ApplicationStatus.approved:
        step4_status = TimelineStepStatus.done
    elif insp_status == InspectionStatus.completed:
        step4_status = TimelineStepStatus.current
    else:
        step4_status = TimelineStepStatus.pending

    # ── Step 5: Certificate Issued ─────────────────────────────────────────
    if cert_status == CertificateStatus.issued:
        step5_status = TimelineStepStatus.done
    elif app_status == ApplicationStatus.approved:
        step5_status = TimelineStepStatus.current
    else:
        step5_status = TimelineStepStatus.pending

    return [
        TimelineStep(
            step="application_submitted",
            label="Application Submitted",
            date=submitted_on or "--",
            status=step1_status,
            detail="Your application has been received successfully.",
        ),
        TimelineStep(
            step="document_verification",
            label="Document Verification",
            date=submitted_on or "--",   # verification happens at submission time
            status=step2_status,
            detail="All submitted documents have been verified.",
        ),
        TimelineStep(
            step="inspection",
            label="Inspection",
            date=insp_sched or insp_done or "--",
            status=step3_status,
            detail="On-site inspection is being processed." if step3_status == TimelineStepStatus.current
                   else "Inspection completed." if step3_status == TimelineStepStatus.done
                   else "Awaiting document verification to schedule inspection.",
        ),
        TimelineStep(
            step="approval",
            label="Approval",
            date="--",
            status=step4_status,
            detail="Awaiting inspection completion for approval." if step4_status != TimelineStepStatus.done
                   else "Application has been approved.",
        ),
        TimelineStep(
            step="certificate_issued",
            label="Certificate Issued",
            date=cert_issued or "--",
            status=step5_status,
            detail="Certificate will be issued after approval." if step5_status == TimelineStepStatus.pending
                   else "Certificate is being prepared." if step5_status == TimelineStepStatus.current
                   else "Certificate has been issued.",
        ),
    ]


def _get_remarks(school_id: str) -> List[dict]:
    """Fetch remarks from Firestore sub-collection  school_profiles/{id}/remarks"""
    db  = models.get_db()
    ref = db.collection(models.COL_SCHOOLS).document(school_id).collection("remarks")
    return [doc.to_dict() | {"id": doc.id} for doc in ref.order_by("created_at").stream()]


def _get_pending_actions(school_id: str) -> List[dict]:
    """Fetch unresolved pending actions from sub-collection  …/pending_actions"""
    db  = models.get_db()
    ref = (
        db.collection(models.COL_SCHOOLS)
          .document(school_id)
          .collection("pending_actions")
    )
    return [doc.to_dict() | {"id": doc.id} for doc in ref.order_by("created_at").stream()]


def _to_remark(d: dict) -> RemarkResponse:
    return RemarkResponse(
        id         = d.get("id", ""),
        author = "Admin" if d.get("author") in ["Inspector", "Review Officer"] else d.get("author", ""),
        message    = d.get("message", ""),
        is_urgent  = d.get("is_urgent", False),
        created_at = d.get("created_at", ""),
    )


def _to_pending_action(d: dict) -> PendingActionResponse:
    return PendingActionResponse(
        id          = d.get("id", ""),
        title       = d.get("title", ""),
        description = d.get("description"),
        due_date    = d.get("due_date"),
        severity    = PendingActionSeverity(d.get("severity", "medium")),
        resolved    = d.get("resolved", False),
        created_at  = d.get("created_at", ""),
    )


# ─────────────────────────────────────────────
# 1. Full status page  (1 call loads entire page)
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}",
    response_model=StatusPageResponse,
    summary="Get full Application Status page data",
)
async def get_status_page(school_id: str):

    db = get_db()

    # ── Fetch registration ─────────────────────────────────────────
    reg_doc = db.collection("school_registrations").document(school_id).get()
    if not reg_doc.exists:
        raise HTTPException(status_code=404, detail=f"School '{school_id}' not found.")
    reg_data = reg_doc.to_dict()

    # ── Fetch application ──────────────────────────────────────────
    application_data = reg_data   # 🔥 USE REGISTRATION DATA DIRECTLY
    if not application_data:
        raise HTTPException(
            status_code=404,
            detail="No application found for this school. Submit an application first.",
        )

    inspection_data  = models.get_inspection(school_id)
    certificate_data = models.get_certificate(school_id)

    # ── STATUS LOGIC (FIXED) ───────────────────────────────────────
    status = application_data.get("status", "Draft").lower()

    if status in ["submitted", "under_review"]:
        current_status = "Under Review"
    elif inspection_data:
        current_status = "Under Inspection"
    elif status == "approved":
        current_status = "Approved"
    elif status == "rejected":
        current_status = "Rejected"
    else:
        current_status = "Draft"

    # ── Build response ─────────────────────────────────────────────
    timeline    = _build_timeline(application_data, inspection_data, certificate_data)
    remarks_raw = _get_remarks(school_id)
    actions_raw = _get_pending_actions(school_id)

    return StatusPageResponse(
    application_id   = application_data.get("application_id", ""),
    application_type = reg_data.get("application_type", "New Recognition"),
    submitted_on     = (
        reg_data.get("submitted_at").isoformat()
        if reg_data.get("submitted_at")
        else None
    ),
    current_status   = current_status,

    timeline         = timeline,
    remarks          = [_to_remark(r) for r in remarks_raw],
    pending_actions  = [_to_pending_action(a) for a in actions_raw],
)

# ─────────────────────────────────────────────
# 2. Timeline only  (lightweight polling)
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/timeline",
    response_model=List[TimelineStep],
    summary="Get application progress timeline",
)
async def get_timeline(school_id: str):
    """
    Returns the 5-step progress timeline.
    Use this endpoint for lightweight polling to refresh just the timeline
    without reloading the full page.
    """
    if not models.get_school_profile(school_id):
        raise HTTPException(status_code=404, detail="School not found.")

    application_data = reg_data
    inspection_data  = models.get_inspection(school_id)
    certificate_data = models.get_certificate(school_id)

    return _build_timeline(application_data, inspection_data, certificate_data)


# ─────────────────────────────────────────────
# 3. Remarks
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/remarks",
    response_model=List[RemarkResponse],
    summary="Get all remarks for the application",
)
async def get_remarks(school_id: str):
    """
    Returns all remarks (inspector notes, admin comments) on this school's application.
    Displayed in the 'Remarks' card on the status page.
    """
    if not models.get_school_profile(school_id):
        raise HTTPException(status_code=404, detail="School not found.")
    return [_to_remark(r) for r in _get_remarks(school_id)]


@router.post(
    "/{school_id}/remarks",
    response_model=RemarkResponse,
    status_code=201,
    summary="Add a remark to the application (admin / inspector)",
)
async def add_remark(school_id: str, body: RemarkCreate):
    """
    Admin / inspector endpoint to attach a note to the school's application.

    Example body:
    {
        "author": "Inspector",
        "message": "Please upload a clearer copy of the fire safety certificate.",
        "is_urgent": true
    }
    """
    if not models.get_school_profile(school_id):
        raise HTTPException(status_code=404, detail="School not found.")
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Remark message cannot be empty.")

    db     = models.get_db()
    ref    = db.collection(models.COL_SCHOOLS).document(school_id).collection("remarks")
    doc_id = str(uuid.uuid4())
    now    = _now_iso()

    data = {
        "id":         doc_id,
        "author":     body.author,
        "message":    body.message,
        "is_urgent":  body.is_urgent,
        "created_at": now,
    }
    ref.document(doc_id).set(data)
    return RemarkResponse(**data)


# ─────────────────────────────────────────────
# 4. Pending Actions
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/pending-actions",
    response_model=List[PendingActionResponse],
    summary="Get pending actions for the school",
)
async def get_pending_actions(
    school_id: str,
    include_resolved: bool = Query(default=False, description="Include already-resolved actions"),
):
    """
    Returns the list of tasks the school must complete.
    Displayed in the 'Pending Actions' card on the status page.

    Pass ?include_resolved=true to also return resolved actions (for audit history).
    """
    if not models.get_school_profile(school_id):
        raise HTTPException(status_code=404, detail="School not found.")

    actions = _get_pending_actions(school_id)
    if not include_resolved:
        actions = [a for a in actions if not a.get("resolved", False)]
    return [_to_pending_action(a) for a in actions]


@router.post(
    "/{school_id}/pending-actions",
    response_model=PendingActionResponse,
    status_code=201,
    summary="Add a pending action (admin)",
)
async def add_pending_action(school_id: str, body: PendingActionCreate):
    """
    Admin endpoint to assign a new pending action to the school.

    Example body:
    {
        "title": "Upload Fire Safety Certificate",
        "description": "The uploaded document is unreadable. Please re-upload.",
        "due_date": "2026-02-20",
        "severity": "high"
    }
    """
    if not models.get_school_profile(school_id):
        raise HTTPException(status_code=404, detail="School not found.")
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="Action title cannot be empty.")

    db     = models.get_db()
    ref    = (
        db.collection(models.COL_SCHOOLS)
          .document(school_id)
          .collection("pending_actions")
    )
    doc_id = str(uuid.uuid4())
    now    = _now_iso()

    data = {
        "id":          doc_id,
        "title":       body.title,
        "description": body.description,
        "due_date":    body.due_date,
        "severity":    body.severity.value,
        "resolved":    False,
        "created_at":  now,
    }
    ref.document(doc_id).set(data)
    return PendingActionResponse(**data)


@router.patch(
    "/{school_id}/pending-actions/{action_id}/resolve",
    response_model=PendingActionResponse,
    summary="Mark a pending action as resolved",
)
async def resolve_pending_action(school_id: str, action_id: str):
    """
    Called when the school completes a pending action (e.g. uploads the missing document).
    Sets resolved=True on the action document.
    """
    db  = models.get_db()
    ref = (
        db.collection(models.COL_SCHOOLS)
          .document(school_id)
          .collection("pending_actions")
          .document(action_id)
    )
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Pending action not found.")

    ref.update({"resolved": True})
    data = doc.to_dict() | {"id": action_id, "resolved": True}
    return _to_pending_action(data)