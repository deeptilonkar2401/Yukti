from typing import Optional, Union
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.project import ProjectStatus


class ProjectRead(BaseModel):
    id: uuid.UUID
    claim_id: uuid.UUID
    problem_id: uuid.UUID
    lead_name:Optional[ str] = None
    partner_name:Optional[ str] = None
    status: ProjectStatus
    milestones:Optional[ list[bool]] = None
    patent_filed:Optional[ str] = None
    startup_incubated:Optional[ str] = None
    tech_transfer_status:Optional[ str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    """All fields optional — send only what you're changing."""
    lead_name:Optional[ str] = None
    partner_name:Optional[ str] = None
    status:Optional[ ProjectStatus] = None
    milestones:Optional[ list[bool]] = None
    patent_filed:Optional[ str] = None
    startup_incubated:Optional[ str] = None
    tech_transfer_status:Optional[ str] = None

