import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ProjectStatus(str, enum.Enum):
    active = "active"
    completed = "completed"


class Project(Base):
    """Created once a claim is accepted — tracks execution of a matched problem."""
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), ForeignKey("claims.id"), unique=True, nullable=False)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"), nullable=False)

    lead_name = Column(String, nullable=True)          # e.g. "Prof. Sinha"
    partner_name = Column(String, nullable=True)        # e.g. "Tata Steel Foundation", CSR/industry partner
    status = Column(Enum(ProjectStatus), default=ProjectStatus.active, nullable=False)

    milestones = Column(JSON, nullable=True)  # e.g. [true, true, false, false, false]

    # Outcome & Impact Tracking (IP/Patent, Startup, Tech Transfer)
    patent_filed = Column(String, nullable=True)         # e.g. "IN-PAT-2026-8891"
    startup_incubated = Column(String, nullable=True)    # e.g. "HydroClean Innovations Pvt Ltd"
    tech_transfer_status = Column(String, nullable=True) # e.g. "Transferred to Municipal Corp"

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

