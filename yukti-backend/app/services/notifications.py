from typing import Optional, Union
import logging
import uuid

from sqlalchemy.orm import Session

from app.core.fcm import send_push, FCMNotConfigured
from app.models.notification import Notification, DeviceToken

logger = logging.getLogger("yukti.notifications")


def notify_user(db: Session, user_id: uuid.UUID, title: str, body: str, data:Optional[ dict] = None) -> Notification:
    """
    Always creates the in-app Notification row (this is what the frontend's
    notification bell reads — it works even if Firebase is never configured).
    Then best-effort pushes to every device token the user has registered;
    a push failure is logged and swallowed, never raised to the caller, since
    e.g. an admin verifying a problem should succeed regardless of whether
    the citizen's push notification goes through.
    """
    notification = Notification(user_id=user_id, title=title, body=body, data=data)
    db.add(notification)
    db.commit()
    db.refresh(notification)

    tokens = db.query(DeviceToken).filter(DeviceToken.user_id == user_id).all()
    for device in tokens:
        try:
            send_push(device.token, title, body, data)
        except FCMNotConfigured:
            break  # not set up yet — no point trying the remaining tokens
        except Exception as exc:
            logger.warning("Push failed for device %s: %s", device.id, exc)

    return notification
