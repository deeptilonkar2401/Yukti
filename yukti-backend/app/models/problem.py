import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.database import Base


class ProblemPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ProblemStatus(str, enum.Enum):
    submitted = "submitted"
    verified = "verified"
    matched = "matched"
    in_progress = "in_progress"
    completed = "completed"


class Problem(Base):
    __tablename__ = "problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    domain = Column(String, nullable=False)
    subdomain = Column(String, nullable=True)
    priority = Column(Enum(ProblemPriority), default=ProblemPriority.medium, nullable=False)
    status = Column(Enum(ProblemStatus), default=ProblemStatus.submitted, nullable=False)

    # Point(longitude, latitude) — PostGIS geography type, SRID 4326
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    location_text = Column(String, nullable=True)  # human-readable, e.g. "Palamu District, Jharkhand"
    population_affected = Column(String, nullable=True)
    photo_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    voice_url = Column(Text, nullable=True)
    document_url = Column(Text, nullable=True)
    upvotes = Column(Integer, default=0, nullable=False)

    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # 384-dim vector from Sentence Transformers (all-MiniLM-L6-v2), for
    # semantic duplicate detection. Plain JSON, not pgvector — fine at
    # prototype scale where we brute-force cosine similarity in Python.
    embedding = Column(JSON, nullable=True)

    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)

    clarification_requested = Column(Boolean, default=False, nullable=False)
    clarification_prompt = Column(Text, nullable=True)
    clarification_response = Column(Text, nullable=True)
    clarification_requested_at = Column(DateTime, nullable=True)
    clarification_responded_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    media = relationship("Media", back_populates="problem")
