import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="SET NULL"), nullable=True)
    university_name = Column(String(255), nullable=False, default="University Partner")
    title = Column(String(255), nullable=False)
    tech_stack = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    document_url = Column(String(512), nullable=True)
    document_filename = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    problem = relationship("Problem")
    university = relationship("University")
