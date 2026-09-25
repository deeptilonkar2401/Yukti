from typing import Optional, Union
import uuid

from pydantic import BaseModel


class UniversityCreate(BaseModel):
    institute_name: str
    location:Optional[ str] = None
    distance_from_hq_km:Optional[ int] = None


class CapabilityCreate(BaseModel):
    domain: str
    score: int = 0


class FacultyCreate(BaseModel):
    name: str
    designation:Optional[ str] = None
    specialization:Optional[ str] = None
    publications: int = 0


class CapabilityRead(BaseModel):
    domain: str
    score: int

    class Config:
        from_attributes = True


class FacultyRead(BaseModel):
    name: str
    designation:Optional[ str] = None
    specialization:Optional[ str] = None
    publications: int

    class Config:
        from_attributes = True


class UniversityRead(BaseModel):
    id: uuid.UUID
    institute_name: str
    location:Optional[ str] = None
    capabilities: list[CapabilityRead] = []
    faculty: list[FacultyRead] = []

    class Config:
        from_attributes = True
