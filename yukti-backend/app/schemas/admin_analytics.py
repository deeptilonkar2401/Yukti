"""
Pydantic Schemas for Admin Impact Analytics
"""

from typing import Optional, Any, Dict, List
from pydantic import BaseModel


class MetricValue(BaseModel):
    value: Optional[Any] = None
    supported: bool = True
    note: Optional[str] = None
    source: Optional[str] = None


class KPI(BaseModel):
    total_citizens: MetricValue
    partner_universities: MetricValue
    industry_partners: MetricValue
    total_projects: MetricValue
    total_investment: MetricValue
    lives_impacted: MetricValue


class SeriesPoint(BaseModel):
    period: str
    problems_submitted: int = 0
    projects_initiated: int = 0
    projects_completed: int = 0


class SectorSlice(BaseModel):
    sector: str
    problem_count: int = 0
    project_count: int = 0
    percent_of_total: float = 0.0


class LocationSlice(BaseModel):
    location_text: str
    problem_count: int = 0
    project_count: int = 0


class GeographyOut(BaseModel):
    supported: bool = True
    note: Optional[str] = None
    by_location: List[LocationSlice] = []
    mapped_points: int = 0
    unmapped_points: int = 0


class ProjectStatusSlice(BaseModel):
    status: str
    count: int = 0


class OutcomeMetric(BaseModel):
    label: str
    value: int = 0
    source: Optional[str] = None


class TrendByCategoryPoint(BaseModel):
    period: str
    sector: str
    count: int = 0


class AlertItem(BaseModel):
    id: str
    severity: str
    category: str
    title: str
    count: int = 0
    rule: str


class DataQualityOut(BaseModel):
    problems_missing_location: int = 0
    problems_missing_domain: int = 0
    unverified_university_accounts: int = 0
    unverified_industry_accounts: int = 0
    projects_missing_partner_name: int = 0


class MetadataOut(BaseModel):
    last_updated: str
    methodology_version: str
    generated_for_role: str


class ImpactAnalyticsOut(BaseModel):
    period: Dict[str, str]
    filters_applied: Dict[str, Optional[str]]
    kpis: KPI
    overview_series: List[SeriesPoint] = []
    sector_impact: List[SectorSlice] = []
    geography: GeographyOut
    investment_flow: MetricValue
    rural_urban: MetricValue
    project_status: List[ProjectStatusSlice] = []
    outcomes: List[OutcomeMetric] = []
    trend_by_category: List[TrendByCategoryPoint] = []
    alerts: List[AlertItem] = []
    data_quality: DataQualityOut
    metadata: MetadataOut