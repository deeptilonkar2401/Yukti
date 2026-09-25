from typing import Optional, Union
import uuid

from pydantic import BaseModel


class IndustryCreate(BaseModel):
    company_name: str
    sector:Optional[ str] = None
    csr_focus_area:Optional[ str] = None


class IndustryRead(BaseModel):
    id: uuid.UUID
    company_name: str
    sector:Optional[ str] = None
    csr_focus_area:Optional[ str] = None

    class Config:
        from_attributes = True
