# app/routers/admin_inspections.py
"""
All endpoints powering the Admin Inspections page (page.tsx).

Endpoint map
────────────
GET    /admin/inspections                          → list all inspections (paginated + filters)
POST   /admin/inspections                          → schedule new inspection
GET    /admin/inspections/inspectors               → list available inspectors (for dropdowns)
GET    /admin/inspections/{inspection_id}          → full inspection detail (InspectionDetailsModal)
PATCH  /admin/inspections/{inspection_id}/reassign → reassign inspector (ReassignInspectorModal)
PATCH  /admin/inspections/{inspection_id}/status   → update inspection status lifecycle
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.routers.admin_dashboard import get_current_admin
from app.schemas_admin import (
    AdminInspectionItem,
    AdminInspectionsListResponse,
    ScheduleInspectionRequest,
    ScheduleInspectionResponse,
    ReassignInspectorRequest,
    ReassignInspectorResponse,
    InspectionDetailResponse,
    ChecklistItemAdmin,
    InspectorsListResponse,
    InspectorItem,
    UpdateInspectionStatusRequest,
)
from app.models_admin import (
    list_admin_inspections,
    get_admin_inspection_detail,
    schedule_admin_inspection,
    reassign_inspector,
    update_admin_inspection_status,
    list_inspectors,
)

router = APIRouter(prefix="/admin/inspections", tags=["Admin Inspections"])


# ─────────────────────────────────────────────────────────
# 1. GET /admin/inspections
#    Powers the "Pending Inspections" table on page.tsx
# ─────────────────────────────────────────────────────────

@router.get("", response_model=AdminInspectionsListResponse)
async def list_inspections_endpoint(
    status:   Optional[str] = Query(None, description="Pending | Scheduled | In Progress | Completed | Cancelled"),
    district: Optional[str] = Query(None),
    search:   Optional[str] = Query(None, description="Search by school name"),
    page:     int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_admin: str = Depends(get_current_admin),
):
    """
    Returns paginated list of inspections.

    Frontend usage:
        GET /admin/inspections?status=Pending&page=1
        → powers the pending inspections list + "14 Active" badge
    """
    inspections_raw, total, active_count = list_admin_inspections(
        status=status,
        district=district,
        search=search,
        page=page,
        per_page=per_page,
    )
    items = [AdminInspectionItem(**i) for i in inspections_raw]
    return AdminInspectionsListResponse(
        inspections=items,
        total=total,
        active_count=active_count,
    )


# ─────────────────────────────────────────────────────────
# 2. POST /admin/inspections
#    Called by ScheduleInspectionModal on submit
# ─────────────────────────────────────────────────────────

@router.post("", response_model=ScheduleInspectionResponse, status_code=201)
async def schedule_inspection_endpoint(
    body: ScheduleInspectionRequest,
    current_admin: str = Depends(get_current_admin),
):
    """
    Schedule a new inspection for a school.
    Auto-creates a school notification on success.
    Also auto-populates a default checklist.

    Example body:
    {
        "school_id":  "abc123",
        "date":       "2026-04-10",
        "time":       "10:30 AM",
        "inspector":  "Dr. R.K. Verma",
        "type":       "Regular",
        "remarks":    "Annual inspection"
    }
    """
    result = schedule_admin_inspection(
        school_id    = body.school_id,
        date         = body.date,
        time         = body.time,
        inspector    = body.inspector,
        inspector_id = body.inspector_id,
        insp_type    = body.type.value,
        remarks      = body.remarks,
    )
    return ScheduleInspectionResponse(
        message       = "Inspection scheduled successfully.",
        inspection_id = result["inspection_id"],
        school_id     = result["school_id"],
        date          = result["date"],
        time          = result["time"],
        inspector     = result["inspector"],
        type          = result["type"],
        status        = result["status"],
    )


# ─────────────────────────────────────────────────────────
# 3. GET /admin/inspections/inspectors
#    Populates inspector dropdown in both modals
#    NOTE: must be defined BEFORE /{inspection_id} to avoid routing conflict
# ─────────────────────────────────────────────────────────

@router.get("/inspectors", response_model=InspectorsListResponse)
async def get_inspectors(
    current_admin: str = Depends(get_current_admin),
):
    """
    Returns the list of available inspectors.
    Used to populate the dropdown in ScheduleInspectionModal
    and ReassignInspectorModal.

    Frontend usage:
        GET /admin/inspections/inspectors
        → map results to <option> elements in modal dropdowns
    """
    raw = list_inspectors()
    return InspectorsListResponse(
        inspectors=[InspectorItem(**i) for i in raw]
    )


# ─────────────────────────────────────────────────────────
# 4. GET /admin/inspections/{inspection_id}
#    Called when user clicks ExternalLink → InspectionDetailsModal
# ─────────────────────────────────────────────────────────

@router.get("/{inspection_id}", response_model=InspectionDetailResponse)
async def get_inspection_detail(
    inspection_id: str,
    current_admin: str = Depends(get_current_admin),
):
    """
    Returns full inspection detail including checklist.
    Powers the InspectionDetailsModal.

    Frontend usage:
        GET /admin/inspections/${inspectionId}
        → populate InspectionDetailsModal with all fields + checklist
    """
    detail = get_admin_inspection_detail(inspection_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    return InspectionDetailResponse(
        **{k: v for k, v in detail.items() if k != "checklist"},
        checklist=[ChecklistItemAdmin(**c) for c in detail.get("checklist", [])],
    )


# ─────────────────────────────────────────────────────────
# 5. PATCH /admin/inspections/{inspection_id}/reassign
#    Called by ReassignInspectorModal on submit
# ─────────────────────────────────────────────────────────

@router.patch("/{inspection_id}/reassign", response_model=ReassignInspectorResponse)
async def reassign_inspector_endpoint(
    inspection_id: str,
    body: ReassignInspectorRequest,
    current_admin: str = Depends(get_current_admin),
):
    """
    Reassign a different inspector to an existing inspection.

    Example body:
    {
        "inspector":    "Ms. Sunita Singh",
        "inspector_id": "insp_xyz",
        "reason":       "Original inspector unavailable"
    }
    """
    result = reassign_inspector(
        inspection_id = inspection_id,
        new_inspector = body.inspector,
        inspector_id  = body.inspector_id,
        reason        = body.reason,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    return ReassignInspectorResponse(**result)


# ─────────────────────────────────────────────────────────
# 6. PATCH /admin/inspections/{inspection_id}/status
#    Admin moves inspection through lifecycle
# ─────────────────────────────────────────────────────────

@router.patch("/{inspection_id}/status")
async def update_inspection_status_endpoint(
    inspection_id: str,
    body: UpdateInspectionStatusRequest,
    current_admin: str = Depends(get_current_admin),
):
    """
    Move inspection through its lifecycle:
    Scheduled → In Progress → Completed  (or Cancelled at any point)

    Example body:
    {
        "status":  "In Progress",
        "remarks": "Inspector has arrived at school"
    }
    """
    success = update_admin_inspection_status(
        inspection_id = inspection_id,
        status        = body.status.value,
        remarks       = body.remarks,
    )
    if not success:
        raise HTTPException(status_code=404, detail="Inspection not found.")
    return {
        "message":       f"Inspection status updated to '{body.status.value}'.",
        "inspection_id": inspection_id,
        "status":        body.status.value,
    }