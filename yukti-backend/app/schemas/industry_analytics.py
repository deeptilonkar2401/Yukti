from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class IndustryKPIs(BaseModel):
    total_investment_inr: float
    formatted_investment: str
    projects_supported: int
    lives_impacted: int
    partner_universities: int
    rural_communities: int

class InvestmentCategory(BaseModel):
    category: str
    amount_inr: float
    percentage: float
    color: str

class ImpactArea(BaseModel):
    domain: str
    beneficiaries_count: int
    unit: str
    color: str

class GeographicPoint(BaseModel):
    location_text: str
    lat: float
    lng: float
    project_title: str
    investment_inr: float
    status: str
    district: str

class TimeSeriesPoint(BaseModel):
    month: str
    investment_inr: float
    lives_impacted: int

class RuralUrbanDistribution(BaseModel):
    rural_percentage: float
    urban_percentage: float
    rural_count: int
    urban_count: int

class OutcomeItem(BaseModel):
    type: str
    value: str
    unit: str
    description: str

class ProjectStatusSlice(BaseModel):
    status: str
    label: str
    count: int
    percentage: float
    color: str

class SocialIndicator(BaseModel):
    name: str
    baseline: str
    current: str
    change_pct: float
    period: str

class ChallengeItem(BaseModel):
    title: str
    category: str
    severity: str
    description: str
    action_taken: str

class ActiveFilterContext(BaseModel):
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[str] = None

class IndustryImpactAnalyticsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    kpis: IndustryKPIs
    investment_breakdown: List[InvestmentCategory]
    impact_areas: List[ImpactArea]
    geography: List[GeographicPoint]
    time_series: List[TimeSeriesPoint]
    rural_urban: RuralUrbanDistribution
    key_outcomes: List[OutcomeItem]
    project_status: List[ProjectStatusSlice]
    social_indicators: List[SocialIndicator]
    challenges: List[ChallengeItem]
    filters: ActiveFilterContext
    last_updated: str
