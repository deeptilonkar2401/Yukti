from typing import Optional, Union
import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.problem import ProblemPriority, ProblemStatus
from app.schemas.media import MediaRead


class ProblemBase(BaseModel):
    title: str
    description: str
    domain: str
    subdomain:Optional[ str] = None
    priority: ProblemPriority = ProblemPriority.medium
    location_text:Optional[ str] = None
    population_affected:Optional[ str] = None
    photo_url:Optional[ str] = None
    video_url:Optional[ str] = None
    voice_url:Optional[ str] = None
    upvotes:Optional[ int] = 0

    @field_validator("upvotes", mode="before")
    @classmethod
    def default_zero_if_none(cls, v):
        return v if v is not None else 0


class ProblemCreate(ProblemBase):
    latitude:Optional[ float] = None
    longitude:Optional[ float] = None


class ProblemRead(ProblemBase):
    id: uuid.UUID
    status: ProblemStatus
    submitted_by: uuid.UUID
    created_at: datetime

    clarification_requested: bool = False
    clarification_prompt:Optional[ str] = None
    clarification_response:Optional[ str] = None
    clarification_requested_at:Optional[datetime] = None
    clarification_responded_at:Optional[datetime] = None

    class Config:
        from_attributes = True


class ClarificationRequestPayload(BaseModel):
    prompt: str


class ClarificationResponsePayload(BaseModel):
    response: str
    additional_evidence_url:Optional[ str] = None


class ProblemDetailRead(ProblemRead):
    media: list[MediaRead] = []

    class Config:
        from_attributes = True


class DuplicateMatch(BaseModel):
    id: uuid.UUID
    title: str
    similarity: float  # 0.0 - 1.0


class ProblemCreateResponse(ProblemRead):
    """Same as ProblemRead, plus any likely duplicates found at submission time."""
    possible_duplicates: list[DuplicateMatch] = []


class ProblemSummaryResponse(BaseModel):
    problem_id: uuid.UUID
    summary: str


class ProblemStatusUpdate(BaseModel):
    status: ProblemStatus  # admin moves it forward, e.g. submitted -> verified
