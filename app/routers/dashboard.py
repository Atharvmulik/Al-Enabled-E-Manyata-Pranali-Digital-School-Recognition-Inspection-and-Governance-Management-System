"""
routers/dashboard.py
All endpoints powering the school dashboard frontend (page.tsx).

Endpoints:
  GET  /dashboard/{school_id}/summary          → Full dashboard summary (1 call loads entire page)
  GET  /dashboard/{school_id}/profile          → Profile completion status
  PUT  /dashboard/{school_id}/profile          → Update school profile (any section)
  GET  /dashboard/{school_id}/application      → Latest application status
  POST /dashboard/{school_id}/application      → Submit a new application
  GET  /dashboard/{school_id}/notifications    → All notifications (paginated)
  POST /dashboard/{school_id}/notifications/{notif_id}/read  → Mark notification as read
  GET  /dashboard/{school_id}/inspection       → Inspection status
  POST /dashboard/{school_id}/inspection/schedule → Schedule inspection (admin)
  GET  /dashboard/{school_id}/certificate      → Certificate status
  POST /dashboard/{school_id}/certificate/issue   → Issue certificate (admin)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app import models
from app.models import get_db
from app.schemas import (
    ProfileCompletionResponse,
    ApplicationCreateRequest,
    ApplicationResponse,
    NotificationResponse,
    NotificationsListResponse,
    InspectionResponse,
    CertificateResponse,
    DashboardSummaryResponse,
    ApplicationStatus,
    InspectionStatus,
    CertificateStatus,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ─────────────────────────────────────────────
# Helpers: dict → schema
# ─────────────────────────────────────────────

def _to_application(d: Optional[dict]) -> Optional[ApplicationResponse]:
    if not d:
        return None
    return ApplicationResponse(
        application_id=d.get("application_id", ""),
        school_id=d.get("school_id", ""),
        status=ApplicationStatus(d.get("status", "Draft")),
        submitted_on=d.get("submitted_on"),
        last_updated=d.get("last_updated"),
        notes=d.get("notes"),
    )


def _to_notification(d: dict) -> NotificationResponse:
    return NotificationResponse(
        id=d.get("id", ""),
        text=d.get("text", ""),
        icon_type=d.get("icon_type", "bell"),
        time_ago=d.get("time_ago", ""),
        color_variant=d.get("color_variant", "blue"),
        is_read=d.get("is_read", False),
        created_at=d.get("created_at"),
    )


def _to_inspection(d: dict) -> InspectionResponse:
    raw_status = d.get("status", "Pending")
    # Map to valid enum values, default to Scheduled if unrecognized
    status_map = {
        "Pending":     "Scheduled",
        "Scheduled":   "Scheduled",
        "In Progress": "Completed",
        "Completed":   "Completed",
        "Cancelled":   "Cancelled",
        "Failed":      "Cancelled",
    }
    safe_status = status_map.get(raw_status, "Scheduled")
    return InspectionResponse(
        school_id=d.get("school_id", ""),
        status=InspectionStatus(safe_status),
        scheduled_date=d.get("scheduled_date"),
        completed_date=d.get("completed_date"),
        inspector_name=d.get("inspector_name"),
        remarks=d.get("remarks"),
    )


def _to_certificate(d: dict) -> CertificateResponse:
    return CertificateResponse(
        school_id=d.get("school_id", ""),
        status=CertificateStatus(d.get("status", "Not Issued")),
        certificate_id=d.get("certificate_id"),
        issued_on=d.get("issued_on"),
        valid_until=d.get("valid_until"),
        download_url=d.get("download_url"),
    )


def _to_profile_completion(d: dict) -> ProfileCompletionResponse:
    return ProfileCompletionResponse(
        school_id=d["school_id"],
        completion_percentage=d["completion_percentage"],
        sections=d["sections"],
    )


# ─────────────────────────────────────────────
# 1. Dashboard Summary (loads entire page in 1 call)
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/summary",
    response_model=DashboardSummaryResponse,
    summary="Get full dashboard summary for a school",
)

@router.get("/{school_id}/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(school_id: str):

    db = get_db()

    # 🔥 FETCH FROM CORRECT COLLECTION
    reg_doc = db.collection("school_profiles").document(school_id).get()

    if not reg_doc.exists:
        raise HTTPException(status_code=404, detail=f"School '{school_id}' not found.")

    reg_data = reg_doc.to_dict()

    # 🔥 STEP COMPLETION (this is your real progress)
    completion_data = models.compute_profile_completion(school_id)

    # 🔥 OTHER DATA (keep same)
    application_data = models.get_application_by_school(school_id)
    inspection_data = models.get_inspection(school_id)
    certificate_data = models.get_certificate(school_id)
    notifications_raw = models.get_notifications(school_id, limit=3)

    return DashboardSummaryResponse(
        school_id=school_id,
        school_name=reg_data.get("school_name", reg_data.get("basic_details", {}).get("school_name", "Your School")),
        profile_completion=_to_profile_completion(completion_data),
        application=_to_application(application_data),
        inspection=_to_inspection(inspection_data),
        certificate=_to_certificate(certificate_data),
        recent_notifications=[_to_notification(n) for n in notifications_raw],
    )


# ─────────────────────────────────────────────
# 2. Profile
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/profile",
    response_model=ProfileCompletionResponse,
    summary="Get profile completion status",
)
async def get_profile_completion(school_id: str):
    """Returns which profile sections are complete and overall % (powers the checklist card)."""
    school = models.get_school_profile(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")
    data = models.compute_profile_completion(school_id)
    return _to_profile_completion(data)


@router.put(
    "/{school_id}/profile",
    summary="Update school profile (any section)",
)
async def update_profile(school_id: str, payload: dict):
    """
    Accepts a flat dict of any profile fields to update (partial update supported).
    Frontend sends whichever section fields changed.

    Example body:
    {
        "school_name": "St. Mary's School",
        "city": "Pune",
        "total_teachers": 42
    }
    """
    if not payload:
        raise HTTPException(status_code=400, detail="Empty payload.")
    updated = models.upsert_school_profile(school_id, payload)
    completion = models.compute_profile_completion(school_id)
    return {
        "message": "Profile updated successfully.",
        "updated_fields": list(payload.keys()),
        "completion_percentage": completion["completion_percentage"],
    }


# ─────────────────────────────────────────────
# 3. Application
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/application",
    response_model=ApplicationResponse,
    summary="Get latest application status",
)
async def get_application(school_id: str):
    """Powers the 'Application Status' card on the dashboard."""
    data = models.get_application_by_school(school_id)
    if not data:
        raise HTTPException(status_code=404, detail="No application found for this school.")
    return _to_application(data)


@router.post(
    "/{school_id}/application",
    response_model=ApplicationResponse,
    status_code=201,
    summary="Submit a new application",
)
async def submit_application(school_id: str, body: ApplicationCreateRequest):
    """Creates a new application for the school and stores it in Firestore."""
    school = models.get_school_profile(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found. Complete your profile first.")

    # Check profile completion (optional guard — require at least 60%)
    completion = models.compute_profile_completion(school_id)
    if completion["completion_percentage"] < 60:
        raise HTTPException(
            status_code=400,
            detail=f"Profile only {completion['completion_percentage']}% complete. Minimum 60% required to apply.",
        )

    existing = models.get_application_by_school(school_id)
    if existing and existing.get("status") in ["Submitted", "Under Review"]:
        raise HTTPException(
            status_code=409,
            detail="An active application already exists. Wait for it to be processed.",
        )

    data = models.create_application(school_id=school_id, notes=body.notes)
    return _to_application(data)


# ─────────────────────────────────────────────
# 4. Notifications
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/notifications",
    response_model=NotificationsListResponse,
    summary="Get all notifications for a school",
)
async def get_notifications(
    school_id: str,
    limit: int = Query(default=20, ge=1, le=100),
):
    """Powers the Notifications card and the /notifications page."""
    notifs = models.get_notifications(school_id, limit=limit)
    unread = models.get_unread_count(school_id)
    return NotificationsListResponse(
        notifications=[_to_notification(n) for n in notifs],
        unread_count=unread,
    )


@router.post(
    "/{school_id}/notifications/{notif_id}/read",
    summary="Mark a notification as read",
)
async def mark_read(school_id: str, notif_id: str):
    """Called when user clicks a notification."""
    success = models.mark_notification_read(notif_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"message": "Notification marked as read.", "notif_id": notif_id}


# ─────────────────────────────────────────────
# 5. Inspection
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/inspection",
    response_model=InspectionResponse,
    summary="Get inspection status",
)
async def get_inspection(school_id: str):
    """Powers the 'Inspection Status' card."""
    data = models.get_inspection(school_id)
    return _to_inspection(data)


@router.post(
    "/{school_id}/inspection/schedule",
    response_model=InspectionResponse,
    summary="Schedule an inspection (admin only)",
)
async def schedule_inspection(
    school_id: str,
    scheduled_date: str,
    inspector_name: str,
):
    """
    Admin endpoint to schedule an inspection for a school.
    - scheduled_date: ISO date string e.g. "2026-04-15"
    - inspector_name: name of assigned inspector
    """
    data = models.schedule_inspection(
        school_id=school_id,
        scheduled_date=scheduled_date,
        inspector_name=inspector_name,
    )
    return _to_inspection(data)


# ─────────────────────────────────────────────
# 6. Certificate
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}/certificate",
    response_model=CertificateResponse,
    summary="Get certificate status",
)
async def get_certificate(school_id: str):
    """Powers the 'Certificate Status' card."""
    data = models.get_certificate(school_id)
    return _to_certificate(data)


@router.post(
    "/{school_id}/certificate/issue",
    response_model=CertificateResponse,
    status_code=201,
    summary="Issue a certificate to a school (admin only)",
)
async def issue_certificate(
    school_id: str,
    valid_until: str,
    download_url: Optional[str] = None,
):
    """
    Admin endpoint to issue a certificate after inspection passes.
    - valid_until: ISO date string e.g. "2027-03-01"
    - download_url: optional Firebase Storage URL to the certificate PDF
    """
    inspection = models.get_inspection(school_id)
    if inspection.get("status") not in ["Completed"]:
        raise HTTPException(
            status_code=400,
            detail="Inspection must be completed before issuing a certificate.",
        )
    data = models.issue_certificate(
        school_id=school_id,
        valid_until=valid_until,
        download_url=download_url,
    )
    return _to_certificate(data)