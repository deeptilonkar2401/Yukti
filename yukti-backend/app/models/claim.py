import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ClaimantType(str, enum.Enum):
    university = "university"
    industry = "industry"


class ClaimStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class Claim(Base):
    """A university/industry claiming (accepting/rejecting) a matched problem."""
    __tablename__ = "claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)

    claimant_type = Column(Enum(ClaimantType), nullable=False)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=True)
    industry_id = Column(UUID(as_uuid=True), ForeignKey("industries.id"), nullable=True)

    status = Column(Enum(ClaimStatus), default=ClaimStatus.pending, nullable=False)

    # AI matching output (Phase 6), stored once computed
    match_score = Column(Integer, nullable=True)
    match_breakdown = Column(JSON, nullable=True)  # e.g. {"domain_expertise": 38, "faculty_strength": 22, ...}
    matched_skills = Column(JSON, nullable=True)   # e.g. ["Water Treatment", "Membrane Technology"]
    why_matched = Column(JSON, nullable=True)      # list of reason strings

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime, nullable=True)
