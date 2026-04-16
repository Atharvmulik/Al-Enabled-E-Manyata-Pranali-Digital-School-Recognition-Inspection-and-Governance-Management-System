# app/routers/admin_schools.py
# Complete replacement file

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.routers.admin_dashboard import get_current_admin
from app.schemas_admin import (
    SchoolListResponse,
    SchoolListItem,
    UpdateSchoolStatusRequest,
    VerifyApplicationRequest,
)
from app.models_admin import (
    list_schools,
    get_school_full_profile,
    update_school_status,
    verify_application,
)

router = APIRouter(prefix="/admin/schools", tags=["Admin Schools"])


@router.get("", response_model=SchoolListResponse)
async def list_schools_endpoint(
    search:        Optional[str] = Query(None),
    district:      Optional[str] = Query(None),
    status:        Optional[str] = Query(None),
    page:          int = Query(1, ge=1),
    per_page:      int = Query(10, ge=1, le=100),
    current_admin: str = Depends(get_current_admin),
):
    schools_raw, total = list_schools(search, district, status, page, per_page)

    items = []
    for s in schools_raw:
        try:
            items.append(SchoolListItem(**s))
        except Exception as e:
            print("❌ Skipping invalid school:", s, e)

    return SchoolListResponse(
        schools=items,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{school_id}/profile")
async def get_school_full_profile_endpoint(
    school_id:     str,
    current_admin: str = Depends(get_current_admin),
):
    """
    Return the FULL assembled school profile including all sub-collections.
    Used by the admin Profile Booklet Modal.
    """
    profile = get_school_full_profile(school_id)
    if not profile:
        raise HTTPException(status_code=404, detail="School not found")
    return profile


@router.get("/{school_id}")
async def get_school_detail(
    school_id:     str,
    current_admin: str = Depends(get_current_admin),
):
    """
    Return basic school info (top-level doc only).
    For full profile use /{school_id}/profile.
    """
    profile = get_school_full_profile(school_id)
    if not profile:
        raise HTTPException(status_code=404, detail="School not found")
    return profile


@router.patch("/{school_id}/status")
async def update_school_status_endpoint(
    school_id:     str,
    payload:       UpdateSchoolStatusRequest,
    current_admin: str = Depends(get_current_admin),
):
    allowed = {"Active", "Pending", "Blocked"}
    if payload.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of {allowed}",
        )

    success = update_school_status(school_id, payload.status)
    if not success:
        raise HTTPException(status_code=404, detail="School not found")

    return {"message": f"School status updated to '{payload.status}'"}


@router.post("/{school_id}/verify")
async def verify_school_application(
    school_id:     str,
    payload:       VerifyApplicationRequest,
    current_admin: str = Depends(get_current_admin),
):
    if payload.action not in ("approve", "reject"):
        raise HTTPException(
            status_code=400,
            detail="action must be 'approve' or 'reject'",
        )

    success = verify_application(school_id, payload.action, payload.remarks)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="No pending application found or invalid action",
        )

    return {"message": f"Application {payload.action}d successfully"}