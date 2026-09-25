from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.problem import Problem
from app.models.claim import Claim
from app.models.project import Project
from app.models.university import University
from app.models.industry import Industry
from app.schemas.dashboard import DashboardSummary, DashboardTrend, CountByLabel, TrendPoint

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _group_counts(db: Session, model, column) -> list[CountByLabel]:
    rows = db.query(column, func.count(model.id)).group_by(column).all()
    return [CountByLabel(label=(label.value if hasattr(label, "value") else str(label)), count=count) for label, count in rows]


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """
    One call for the whole dashboard landing page — status/domain/priority
    breakdowns for ECharts pie/bar charts, plus a few top-line totals.
    Open to any authenticated role; nothing here is sensitive.
    """
    return DashboardSummary(
        total_problems=db.query(Problem).count(),
        by_status=_group_counts(db, Problem, Problem.status),
        by_domain=_group_counts(db, Problem, Problem.domain),
        by_priority=_group_counts(db, Problem, Problem.priority),
        total_claims=db.query(Claim).count(),
        claims_by_status=_group_counts(db, Claim, Claim.status),
        total_projects=db.query(Project).count(),
        projects_by_status=_group_counts(db, Project, Project.status),
        total_universities=db.query(University).count(),
        total_industries=db.query(Industry).count(),
        by_location=_group_counts(db, Problem, Problem.location_text),
    )


@router.get("/trends", response_model=DashboardTrend)
def get_submission_trend(
    days: int = Query(default=30, ge=7, le=365),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Problems submitted per day, for the last N days — feeds an ECharts line chart."""
    since = datetime.utcnow() - timedelta(days=days)
    day_column = func.date(Problem.created_at)
    rows = (
        db.query(day_column.label("day"), func.count(Problem.id))
        .filter(Problem.created_at >= since)
        .group_by(day_column)
        .order_by(day_column)
        .all()
    )
    counts_by_day = {str(day): count for day, count in rows}

    points = []
    for i in range(days):
        day = (since + timedelta(days=i)).date().isoformat()
        points.append(TrendPoint(date=day, count=counts_by_day.get(day, 0)))

    return DashboardTrend(days=days, points=points)
