import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Industry(Base):
    __tablename__ = "industries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    company_name = Column(String, nullable=False)
    sector = Column(String, nullable=True)
    csr_focus_area = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
