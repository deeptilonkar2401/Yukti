import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class University(Base):
    __tablename__ = "universities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    institute_name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    distance_from_hq_km = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    capabilities = relationship("UniversityCapability", back_populates="university")
    faculty = relationship("Faculty", back_populates="university")


class UniversityCapability(Base):
    """Department expertise score per domain, e.g. Water Management: 90."""
    __tablename__ = "university_capabilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)

    domain = Column(String, nullable=False)
    score = Column(Integer, nullable=False, default=0)

    university = relationship("University", back_populates="capabilities")


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)

    name = Column(String, nullable=False)
    designation = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    publications = Column(Integer, default=0)

    university = relationship("University", back_populates="faculty")
