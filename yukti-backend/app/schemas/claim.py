from typing import Optional, Union
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.claim import ClaimantType, ClaimStatus


class ClaimCreate(BaseModel):
    """
    Admin creates this to propose a match: "this problem suits this
    university/industry". Phase 6's AI matching will eventually create
    these automatically (and fill match_score/breakdown) instead of an
    admin picking manually — the shape stays the same either way.
    """
    problem_id: uuid.UUID
    claimant_type: ClaimantType
    university_id: Optional[uuid.UUID] = None
    industry_id: Optional[uuid.UUID] = None


class ClaimRespond(BaseModel):
    status: ClaimStatus  # accepted / rejected


class ClaimRead(BaseModel):
    id: uuid.UUID
    problem_id: uuid.UUID
    claimant_type: ClaimantType
    status: ClaimStatus
    match_score:Optional[ int] = None
    match_breakdown:Optional[ dict] = None
    matched_skills:Optional[ list[str]] = None
    why_matched:Optional[ list[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TeamAssignmentPayload(BaseModel):
    lead_name: str
    faculty_mentor: str
    student_members: list[str] = []
    department:Optional[ str] = None


class ProposalSubmissionPayload(BaseModel):
    title: str
    executive_summary: str
    technical_architecture:Optional[ str] = None
    estimated_budget:Optional[ str] = None
    timeline_months:Optional[ int] = 6
    expected_impact:Optional[ str] = None

