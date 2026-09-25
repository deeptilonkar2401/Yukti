from pydantic import BaseModel


class CountByLabel(BaseModel):
    label: str
    count: int


class DashboardSummary(BaseModel):
    total_problems: int
    by_status: list[CountByLabel]
    by_domain: list[CountByLabel]
    by_priority: list[CountByLabel]
    total_claims: int
    claims_by_status: list[CountByLabel]
    total_projects: int
    projects_by_status: list[CountByLabel]
    total_universities: int
    total_industries: int
    by_location: list[CountByLabel] = []


class TrendPoint(BaseModel):
    date: str  # "YYYY-MM-DD"
    count: int


class DashboardTrend(BaseModel):
    days: int
    points: list[TrendPoint]
