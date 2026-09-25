import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class DeviceToken(Base):
    """An FCM registration token for one of the user's devices/browsers."""
    __tablename__ = "device_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    platform = Column(String, nullable=True)  # "web" | "android" | "ios"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Notification(Base):
    """
    Persisted in-app record of every notification we send, independent of
    whether the FCM push itself succeeds. This is what a notifications bell
    icon on the frontend polls — push is a bonus if the user granted
    permission, this list always works.
    """
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    body = Column(String, nullable=False)
    data = Column(JSON, nullable=True)  # e.g. {"type": "claim_proposed", "claim_id": "..."}

    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
