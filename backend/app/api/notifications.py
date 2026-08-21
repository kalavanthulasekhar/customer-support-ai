from fastapi import APIRouter, HTTPException

from app.services.notification_service import NotificationService


router = APIRouter(prefix="/notifications", tags=["Notifications"])
service = NotificationService()


@router.get("")
async def list_notifications(user_type: str = "AGENT", user_id: int | None = None, unread_only: bool = False):
    return service.list_notifications(user_type, user_id, unread_only)


@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: int):
    if not service.mark_read(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"id": notification_id, "is_read": True}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: int):
    if not service.delete(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"deleted": True}
