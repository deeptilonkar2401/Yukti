from typing import Optional, Union
import uuid

from pydantic import BaseModel


class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [longitude, latitude] — GeoJSON order, not lat/lng


class ProblemProperties(BaseModel):
    id: uuid.UUID
    title: str
    domain: str
    subdomain:Optional[ str] = None
    priority: str
    status: str
    location_text:Optional[ str] = None


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry:Optional[ GeoJSONGeometry] = None
    properties: ProblemProperties


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[GeoJSONFeature]
