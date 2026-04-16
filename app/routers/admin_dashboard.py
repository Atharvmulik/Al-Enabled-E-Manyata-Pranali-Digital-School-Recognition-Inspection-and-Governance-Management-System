# app/routers/admin_dashboard.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.routers.auth import get_current_user, verify_token
from app.models import get_db, COL_USERS
from app.schemas_admin import AdminDashboardResponse, AdminDashboardStats, RecentInspection, UrgentAction
from app.models_admin import (
    get_total_schools,
    get_approved_recognitions,
    get_under_improvement,
    get_recent_inspections,
    get_urgent_actions,
)

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


# ─────────────────────────────────────────────────────────
# Admin auth dependency
# (reuses the JWT logic from auth.py, adds role check)
# ─────────────────────────────────────────────────────────

def get_current_admin(payload: dict = Depends(verify_token)):
    """
    Dependency that verifies the JWT token AND checks that the
    authenticated user has role == 'admin'.
    """
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = get_db()
    user_doc = db.collection(COL_USERS).document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=401, detail="User not found")

    user_data = user_doc.to_dict() or {}
    if user_data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return user_id


# ─────────────────────────────────────────────────────────
# GET /admin/dashboard
# ─────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=AdminDashboardResponse)
async def admin_dashboard(current_admin: str = Depends(get_current_admin)):
    """
    Single endpoint that powers the entire Admin Dashboard page.

    Returns:
      - stats: total_schools, approved_recognitions, under_improvement
      - recent_inspections: latest 5 inspections
      - urgent_actions: up to 3 unresolved high-severity actions
    """
    stats = AdminDashboardStats(
        total_schools=get_total_schools(),
        approved_recognitions=get_approved_recognitions(),
        under_improvement=get_under_improvement(),
    )
    recent_raw = get_recent_inspections(limit=5)
    urgent_raw = get_urgent_actions(limit=3)

    recent = [RecentInspection(**r) for r in recent_raw]
    urgent = [UrgentAction(**u) for u in urgent_raw]

    return AdminDashboardResponse(
        stats=stats,
        recent_inspections=recent,
        urgent_actions=urgent,
    )