from typing import Optional, Union
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone:Optional[ str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str
    profile:Optional[ dict] = None
    profile_details:Optional[ dict] = None


class UserRead(UserBase):
    id: uuid.UUID
    is_verified: bool
    is_active: bool
    profile_details:Optional[ dict] = None
    created_at: datetime

    class Config:
        from_attributes = True

