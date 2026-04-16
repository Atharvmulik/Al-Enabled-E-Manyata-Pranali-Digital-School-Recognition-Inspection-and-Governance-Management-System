"""
routers/inspection.py
─────────────────────────────────────────────────────────────────────────────
All endpoints that power the Inspection page (page.tsx).

Endpoints:
  GET   /inspection/{school_id}                → Full page data (details + checklist + report)
  POST  /inspection/{school_id}/schedule       → Schedule inspection (admin)
  PUT   /inspection/{school_id}/checklist      → Update checklist items (inspector)
  PUT   /inspection/{school_id}/report         → Update result & remarks (inspector)
  PATCH /inspection/{school_id}/status         → Update status lifecycle (admin)

How to register in main.py:
  from app.routers import inspection
  app.include_router(inspection.router)
─────────────────────────────────────────────────────────────────────────────
"""

from fastapi import APIRouter, HTTPException
from app.schemas import (
    InspectionPageResponse,
    InspectionDetailResponse,
    InspectionReportResponse,
    InspectionStatus,
    ChecklistItem,
    ChecklistItemStatus,
    ChecklistUpdateRequest,
    ScheduleInspectionRequest,
    UpdateReportRequest,
    UpdateStatusRequest,
    OverallResult,
)
from app import models

router = APIRouter(prefix="/inspection", tags=["Inspection"])


# ─────────────────────────────────────────────
# Helpers: Firestore dict → response schemas
# ─────────────────────────────────────────────

def _to_detail(d: dict) -> InspectionDetailResponse:
    return InspectionDetailResponse(
        inspection_id = d.get("inspection_id", "—"),
        school_id     = d.get("school_id", ""),
        date          = d.get("date"),
        time          = d.get("time"),
        officer_name  = d.get("officer_name"),
        status        = InspectionStatus(d.get("status", "Scheduled")),
    )


def _to_checklist(raw: list) -> list[ChecklistItem]:
    return [
        ChecklistItem(
            item   = r.get("item", ""),
            status = ChecklistItemStatus(r.get("status", "Not Checked")),
        )
        for r in (raw or [])
    ]


def _to_report(d: dict) -> InspectionReportResponse:
    return InspectionReportResponse(
        overall_result = OverallResult(d.get("overall_result", "Pending")),
        remarks        = d.get("remarks"),
    )


# ─────────────────────────────────────────────
# 1. GET full inspection page  (single call)
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}",
    response_model=InspectionPageResponse,
    summary="Get full inspection page data",
)
async def get_inspection_page(school_id: str):
    """
    Single endpoint that powers the entire Inspection page.
    Returns inspection details, checklist, and report in one call.

    Frontend usage:
        const res = await fetch(`/inspection/${schoolId}`)
        const { details, checklist, report } = await res.json()
    """
    data = models.get_inspection_data(school_id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail="No inspection found for this school. Admin needs to schedule one first.",
        )
    return InspectionPageResponse(
        details   = _to_detail(data),
        checklist = _to_checklist(data.get("checklist", [])),
        report    = _to_report(data),
    )


# ─────────────────────────────────────────────
# 2. POST  schedule inspection  (admin only)
# ─────────────────────────────────────────────

@router.post(
    "/{school_id}/schedule",
    response_model=InspectionPageResponse,
    status_code=201,
    summary="Schedule an inspection for a school (admin only)",
)
async def schedule_inspection(school_id: str, body: ScheduleInspectionRequest):
    """
    Admin creates / reschedules an inspection.
    Also auto-creates a notification for the school (triggers notification).

    Example body:
    {
        "date": "25 Feb 2026",
        "time": "10:00 AM",
        "officer_name": "Mr. Rajesh Kumar"
    }
    """
    data = models.schedule_new_inspection(
        school_id    = school_id,
        date         = body.date,
        time         = body.time,
        officer_name = body.officer_name,
    )

    # Auto-notify the school
    models.create_notification(
        school_id  = school_id,
        title      = "Inspection Scheduled",
        message    = f"An inspection has been scheduled for {body.date} at {body.time}. Officer: {body.officer_name}. Please ensure all required documents and facilities are ready.",
        notif_type = "info",
    )

    return InspectionPageResponse(
        details   = _to_detail(data),
        checklist = _to_checklist(data.get("checklist", [])),
        report    = _to_report(data),
    )


# ─────────────────────────────────────────────
# 3. PUT  update checklist  (inspector / admin)
# ─────────────────────────────────────────────

@router.put(
    "/{school_id}/checklist",
    summary="Update inspection checklist items (inspector / admin)",
)
async def update_checklist(school_id: str, body: ChecklistUpdateRequest):
    """
    Inspector updates checklist statuses after visiting the school.

    Example body:
    {
        "items": [
            { "item": "Classrooms",  "status": "Satisfactory" },
            { "item": "Fire Safety", "status": "Needs Improvement" }
        ]
    }
    """
    items_raw = [{"item": i.item, "status": i.status.value} for i in body.items]
    success   = models.update_inspection_checklist(school_id, items_raw)
    if not success:
        raise HTTPException(status_code=404, detail="Inspection not found for this school.")
    return {"message": "Checklist updated successfully.", "updated_items": len(body.items)}


# ─────────────────────────────────────────────
# 4. PUT  update report  (inspector / admin)
# ─────────────────────────────────────────────

@router.put(
    "/{school_id}/report",
    summary="Update inspection overall result and remarks (inspector / admin)",
)
async def update_report(school_id: str, body: UpdateReportRequest):
    """
    Inspector submits final result after completing the inspection.
    Also auto-notifies the school with the result.

    Example body:
    {
        "overall_result": "Passed",
        "remarks": "All infrastructure is satisfactory. Minor improvements needed in Science Lab."
    }
    """
    success = models.update_inspection_report(
        school_id      = school_id,
        overall_result = body.overall_result.value,
        remarks        = body.remarks,
    )
    if not success:
        raise HTTPException(status_code=404, detail="Inspection not found for this school.")

    # Auto-notify school about result
    result_type_map = {
        "Passed":   "success",
        "Failed":   "warning",
        "Deferred": "warning",
        "Pending":  "info",
    }
    models.create_notification(
        school_id  = school_id,
        title      = f"Inspection Result: {body.overall_result.value}",
        message    = body.remarks or f"Your inspection result has been updated to '{body.overall_result.value}'.",
        notif_type = result_type_map.get(body.overall_result.value, "info"),
    )

    return {
        "message":        "Inspection report updated.",
        "overall_result": body.overall_result.value,
    }


# ─────────────────────────────────────────────
# 5. PATCH  update status  (admin only)
# ─────────────────────────────────────────────

@router.patch(
    "/{school_id}/status",
    summary="Update inspection status lifecycle (admin only)",
)
async def update_status(school_id: str, body: UpdateStatusRequest):
    """
    Move inspection through its lifecycle:
    Scheduled → In Progress → Completed  (or Cancelled at any point)

    Example body:
    {
        "status": "In Progress"
    }
    """
    success = models.update_inspection_status(school_id, body.status.value)
    if not success:
        raise HTTPException(status_code=404, detail="Inspection not found for this school.")
    return {"message": f"Inspection status updated to '{body.status.value}'.", "status": body.status.value}