from typing import Optional, Union
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.media import MediaType


class MediaRead(BaseModel):
    id: uuid.UUID
    problem_id: uuid.UUID
    file_url: str
    file_type: MediaType
    original_filename:Optional[ str] = None
    created_at: datetime

    class Config:
        from_attributes = True
