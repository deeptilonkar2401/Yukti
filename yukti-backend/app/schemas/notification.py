from typing import Optional, Union
import uuid
from datetime import datetime

from pydantic import BaseModel


class DeviceTokenRegister(BaseModel):
    token: str
    platform:Optional[ str] = None  # "web" | "android" | "ios"


class NotificationRead(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    data:Optional[ dict] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
