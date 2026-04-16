# app/routers/admin_notifications.py

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.models_admin import (
    list_notifications_history,
    send_broadcast_notification,
    delete_notification_record,
    remind_notification,
    clear_all_notification_logs,
    get_system_alert_count,
    list_schools,
)
from app.schemas_admin import (
    SendNotificationRequest,
    SendNotificationResponse,
    NotificationHistoryResponse,
    SystemAlertsResponse,
    GenericMessageResponse,
)

router = APIRouter(prefix="/api/admin/notifications", tags=["Admin Notifications"])


# ─────────────────────────────────────────────────────────
# GET /api/admin/notifications/history
# ─────────────────────────────────────────────────────────
@router.get("/history", response_model=NotificationHistoryResponse)
def get_notification_history(
    page:     int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """Return paginated broadcast notification history."""
    notifications, total = list_notifications_history(page=page, per_page=per_page)
    return {"notifications": notifications, "total": total}


# ─────────────────────────────────────────────────────────
# GET /api/admin/notifications/system-alerts
# ─────────────────────────────────────────────────────────
@router.get("/system-alerts", response_model=SystemAlertsResponse)
def get_system_alerts():
    """Return count of currently active system alerts."""
    count = get_system_alert_count()
    return {"active_count": count}


# ─────────────────────────────────────────────────────────
# POST /api/admin/notifications/send
# ─────────────────────────────────────────────────────────
@router.post("/send", response_model=SendNotificationResponse)
def send_notification(payload: SendNotificationRequest):
    """
    Broadcast a notification to:
      - all_schools  → every school in the system
      - school       → one specific school (recipient_id = school_id)
      - inspector    → one inspector (recipient_id = inspector_id)
    """
    result = send_broadcast_notification(
        message        = payload.message,
        recipient_type = payload.recipient_type,
        recipient_ids = payload.recipient_ids,
        recipient_label= payload.recipient_label,
    )
    return result


# ─────────────────────────────────────────────────────────
# POST /api/admin/notifications/{notification_id}/remind
# ─────────────────────────────────────────────────────────
@router.post("/{notification_id}/remind", response_model=GenericMessageResponse)
def resend_reminder(notification_id: str):
    """Re-broadcast an existing notification as a reminder."""
    ok = remind_notification(notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Reminder sent successfully."}


# ─────────────────────────────────────────────────────────
# DELETE /api/admin/notifications/{notification_id}
# ─────────────────────────────────────────────────────────
@router.delete("/{notification_id}", response_model=GenericMessageResponse)
def delete_notification(notification_id: str):
    """Delete a single notification record from history."""
    ok = delete_notification_record(notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted."}


# ─────────────────────────────────────────────────────────
# DELETE /api/admin/notifications/history   (clear all)
# ─────────────────────────────────────────────────────────
@router.delete("/history", response_model=GenericMessageResponse)
def clear_history():
    """Delete all broadcast notification records."""
    clear_all_notification_logs()
    return {"message": "All notification logs cleared."}


# ─────────────────────────────────────────────────────────
# GET /api/admin/notifications/export
# ─────────────────────────────────────────────────────────
@router.get("/export")
def export_notifications():
    """Export all notification history as JSON (extend to CSV/Excel as needed)."""
    notifications, total = list_notifications_history(page=1, per_page=10000)
    return {"total": total, "notifications": notifications}



# ─────────────────────────────────────────────────────────
# GET /api/admin/schools  (search schools for dropdown)
# ─────────────────────────────────────────────────────────
@router.get("/schools")
def get_schools(
    search: Optional[str] = Query(None),
    page: int = 1,
    per_page: int = 10,
):
    schools, total = list_schools(
        search=search,
        page=page,
        per_page=per_page,
    )
    return {
        "schools": schools,
        "total": total
    }