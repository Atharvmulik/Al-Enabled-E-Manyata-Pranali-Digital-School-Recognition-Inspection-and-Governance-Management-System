"""
routers/notifications.py
─────────────────────────────────────────────────────────────────────────────
All endpoints that power the Notifications page (page.tsx).

Endpoints:
  GET  /notifications/{school_id}                      → Fetch all notifications
  POST /notifications/{school_id}/{notif_id}/read      → Mark one as read
  POST /notifications/{school_id}/mark-all-read        → Mark all as read
  POST /notifications/{school_id}                      → Create notification (admin/internal)

How to register in main.py:
  from app.routers import notifications
  app.include_router(notifications.router)
─────────────────────────────────────────────────────────────────────────────
"""

from fastapi import APIRouter, HTTPException, Query
from app.schemas import (
    NotificationCreate,
    NotificationItem,
    NotificationsPageResponse,
    MarkReadResponse,
    MarkAllReadResponse,
    NotificationType,
)
from app import models   # uses the new functions added at bottom of models.py

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ─────────────────────────────────────────────
# Helper: dict → NotificationItem
# ─────────────────────────────────────────────

def _to_item(d: dict):
    return NotificationItem(
        id=d.get("id"),
        title=d.get("title", "Notification"),
        message=d.get("message", ""),
        date=d.get("date", ""),
        type=NotificationType(d.get("type", "info")),
        read=d.get("read", False),
    )


# ─────────────────────────────────────────────
# 1. GET all notifications  (powers the full page)
# ─────────────────────────────────────────────

@router.get(
    "/{school_id}",
    response_model=NotificationsPageResponse,
    summary="Get all notifications for a school",
)
async def get_notifications(
    school_id: str,
    limit: int = Query(default=50, ge=1, le=100, description="Max notifications to return"),
):
    """
    Called on page load of the Notifications page.
    Returns all notifications newest-first + unread count.

    Frontend usage:
        const res = await fetch(`/notifications/${schoolId}`)
        const { notifications, unread_count } = await res.json()
    """
    raw = models.get_notifications_for_school(school_id, limit=limit)
    unread = models.get_unread_count_for_school(school_id)
    return NotificationsPageResponse(
        notifications=[_to_item(n) for n in raw],
        unread_count=unread,
    )


# ─────────────────────────────────────────────
# 2. POST  mark a single notification as read
# ─────────────────────────────────────────────

@router.post(
    "/{school_id}/{notif_id}/read",
    response_model=MarkReadResponse,
    summary="Mark a single notification as read",
)
async def mark_one_read(school_id: str, notif_id: str):
    """
    Called when the user clicks 'Mark as read' on a single notification card.

    Frontend usage:
        await fetch(`/notifications/${schoolId}/${notifId}/read`, { method: 'POST' })
    """
    success = models.mark_notification_as_read(notif_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Notification '{notif_id}' not found.")
    return MarkReadResponse(
        message="Notification marked as read.",
        notif_id=notif_id,
    )


# ─────────────────────────────────────────────
# 3. POST  mark ALL notifications as read
# ─────────────────────────────────────────────

@router.post(
    "/{school_id}/mark-all-read",
    response_model=MarkAllReadResponse,
    summary="Mark all notifications as read",
)
async def mark_all_read(school_id: str):
    """
    Called when the user clicks 'Mark All as Read' button.

    Frontend usage:
        await fetch(`/notifications/${schoolId}/mark-all-read`, { method: 'POST' })
    """
    updated = models.mark_all_notifications_read(school_id)
    return MarkAllReadResponse(
        message=f"All notifications marked as read." if updated else "No unread notifications.",
        updated_count=updated,
    )


# ─────────────────────────────────────────────
# 4. POST  create a notification  (admin / internal use)
# ─────────────────────────────────────────────

@router.post(
    "/{school_id}",
    response_model=NotificationItem,
    status_code=201,
    summary="Create a notification for a school (admin/internal)",
)
async def create_notification(school_id: str, body: NotificationCreate):
    """
    Used internally (e.g. after application submitted, inspection scheduled)
    OR by admin panel to manually send a notification.

    Example body:
    {
        "title": "Inspection Scheduled",
        "message": "Your inspection is on 25 Feb 2026.",
        "type": "info"
    }
    """
    data = models.create_notification(
        school_id  = school_id,
        title      = body.title,
        message    = body.message,
        notif_type = body.type.value,
    )
    return _to_item(data)