import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.notification import DeviceToken, Notification
from app.schemas.notification import DeviceTokenRegister, NotificationRead

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.post("/register-device", status_code=status.HTTP_204_NO_CONTENT)
def register_device(
    payload: DeviceTokenRegister,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Call this once the frontend has a browser/app FCM token (after the user grants permission)."""
    existing = db.query(DeviceToken).filter(DeviceToken.token == payload.token).first()
    if existing:
        existing.user_id = current_user.id  # token may have belonged to a previous login on this device
        existing.platform = payload.platform
    else:
        db.add(DeviceToken(user_id=current_user.id, token=payload.token, platform=payload.platform))
    db.commit()


@router.delete("/register-device", status_code=status.HTTP_204_NO_CONTENT)
def unregister_device(payload: DeviceTokenRegister, db: Session = Depends(get_db)):
    """Call this on logout so a shared/public device stops receiving pushes for the previous user."""
    db.query(DeviceToken).filter(DeviceToken.token == payload.token).delete()
    db.commit()


@router.get("/mine", response_model=list[NotificationRead])
def list_my_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    return query.order_by(Notification.created_at.desc()).all()


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
