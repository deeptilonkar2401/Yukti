from typing import Optional, Union
"""
Admin — Impact Analytics
========================

Every value returned here is either:
  1. a direct count/aggregation over an existing table, or
  2. a documented derived rule (explicitly labelled `rule=` in AlertItem), or
  3. explicitly marked `supported=False` with a `note` explaining what is
     missing, when YUKTI's current schema has no field to back a metric
     the reference UI shows (e.g. ₹ investment, "lives impacted").

Nothing on this endpoint is hard-coded or invented to "fill the screen".
If a new metric needs to be added, extend the data model first, then
extend this aggregation — never fake the number here.
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_roles, get_current_user_optional
from app.database import get_db
from app.models.user import User, UserRole
from app.models.problem import Problem, ProblemStatus
from app.models.project import Project, ProjectStatus
from app.models.claim import Claim, ClaimStatus
from app.models.university import University
from app.models.industry import Industry
from app.schemas.admin_analytics import (
    ImpactAnalyticsOut, KPI, MetricValue, SeriesPoint, SectorSlice,
    GeographyOut, LocationSlice, ProjectStatusSlice, OutcomeMetric,
    TrendByCategoryPoint, AlertItem, DataQualityOut, MetadataOut,
)

router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])

METHODOLOGY_VERSION = "yukti-admin-impact-v1"

# A project with no milestone/field update in this many days, and still
# "active", is surfaced as a documented "stalled" signal in Challenges &
# Alerts. This is a derived operational rule, not a backend status value —
# it is never mixed into the real ProjectStatus enum shown elsewhere.
STALLED_PROJECT_DAYS = 90

# A submitted problem waiting this long without verification is surfaced as
# a backlog alert.
VERIFICATION_BACKLOG_DAYS = 7

# A pending claim open this long is surfaced as an engagement alert.
CLAIM_STALE_DAYS = 14


def _parse_date(value: Optional[str], default: datetime) -> datetime:
    if not value:
        return default
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        return default


@router.get("/impact", response_model=ImpactAnalyticsOut)
def get_impact_analytics(
    from_: Optional[str] = Query(default=None, alias="from", description="YYYY-MM-DD"),
    to: Optional[str] = Query(default=None, description="YYYY-MM-DD"),
    state: Optional[str] = Query(default=None, description="Substring match against problems.location_text — YUKTI has no structured state field yet."),
    sector: Optional[str] = Query(default=None, description="Exact match against problems.domain"),
    status: Optional[str] = Query(default=None, description="Project status: Union[active, completed]"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    default_from = now - timedelta(days=365)
    date_from = _parse_date(from_, default_from)
    date_to = _parse_date(to, now)

    # ---------- base filtered querysets ----------
    problem_q = db.query(Problem).filter(Problem.created_at >= date_from, Problem.created_at <= date_to)
    if sector:
        problem_q = problem_q.filter(Problem.domain == sector)
    if state:
        problem_q = problem_q.filter(Problem.location_text.ilike(f"%{state}%"))
    problems = problem_q.all()
    problem_ids = {p.id for p in problems}

    project_q = db.query(Project).filter(Project.created_at >= date_from, Project.created_at <= date_to)
    if status:
        try:
            project_q = project_q.filter(Project.status == ProjectStatus(status))
        except ValueError:
            pass
    if sector or state:
        # Projects don't carry sector/location directly — join through their problem.
        project_q = project_q.join(Problem, Project.problem_id == Problem.id)
        if sector:
            project_q = project_q.filter(Problem.domain == sector)
        if state:
            project_q = project_q.filter(Problem.location_text.ilike(f"%{state}%"))
    projects = project_q.all()

    # ---------- KPIs ----------
    total_citizens = db.query(func.count(User.id)).filter(User.role == UserRole.citizen).scalar() or 0
    partner_universities = db.query(func.count(University.id)).scalar() or 0
    industry_partners = db.query(func.count(Industry.id)).scalar() or 0
    total_projects_all_time = db.query(func.count(Project.id)).scalar() or 0

    kpis = KPI(
        total_citizens=MetricValue(value=total_citizens, source="users WHERE role='citizen' (registered citizen accounts)"),
        partner_universities=MetricValue(value=partner_universities, source="universities table row count"),
        industry_partners=MetricValue(value=industry_partners, source="industries table row count"),
        total_projects=MetricValue(value=total_projects_all_time, source="projects table row count"),
        total_investment=MetricValue(
            supported=False,
            note="YUKTI's schema has no funding/investment/grant amount field yet (no CSR, grant or budget table). "
                 "Add a funding model before this can be shown as a real number.",
        ),
        lives_impacted=MetricValue(
            supported=False,
            note="No beneficiary/lives-impacted counting field exists on Problem or Project yet, and no rule "
                 "distinguishes unique people from repeat visits. Define this metric and add tracking before showing it.",
        ),
    )

    # ---------- overview time series (monthly) ----------
    monthly = {}

    def _bucket(dt: datetime) -> str:
        return dt.strftime("%Y-%m")

    for p in problems:
        key = _bucket(p.created_at)
        monthly.setdefault(key, {"problems_submitted": 0, "projects_initiated": 0, "projects_completed": 0})
        monthly[key]["problems_submitted"] += 1

    for pr in projects:
        key = _bucket(pr.created_at)
        monthly.setdefault(key, {"problems_submitted": 0, "projects_initiated": 0, "projects_completed": 0})
        monthly[key]["projects_initiated"] += 1
        if pr.status == ProjectStatus.completed:
            comp_key = _bucket(pr.updated_at or pr.created_at)
            monthly.setdefault(comp_key, {"problems_submitted": 0, "projects_initiated": 0, "projects_completed": 0})
            monthly[comp_key]["projects_completed"] += 1

    overview_series = [
        SeriesPoint(period=k, **v) for k, v in sorted(monthly.items())
    ]

    # ---------- sector impact (real domain taxonomy) ----------
    sector_counts = {}
    for p in problems:
        sector_counts.setdefault(p.domain, {"problem_count": 0, "project_count": 0})
        sector_counts[p.domain]["problem_count"] += 1
    project_by_problem = {pr.problem_id: pr for pr in projects}
    problems_by_id = {p.id: p for p in problems}
    for pr in projects:
        parent = problems_by_id.get(pr.problem_id)
        if parent:
            sector_counts.setdefault(parent.domain, {"problem_count": 0, "project_count": 0})
            sector_counts[parent.domain]["project_count"] += 1

    total_problem_count = len(problems) or 1
    sector_impact = [
        SectorSlice(
            sector=k,
            problem_count=v["problem_count"],
            project_count=v["project_count"],
            percent_of_total=round(100 * v["problem_count"] / total_problem_count, 1),
        )
        for k, v in sorted(sector_counts.items(), key=lambda kv: -kv[1]["problem_count"])
    ]

    # ---------- geography (only what's real: raw location_text + geometry presence) ----------
    location_counts = {}
    mapped_points = 0
    unmapped_points = 0
    for p in problems:
        loc = (p.location_text or "").strip()
        if loc:
            location_counts.setdefault(loc, {"problem_count": 0, "project_count": 0})
            location_counts[loc]["problem_count"] += 1
        if p.location is not None:
            mapped_points += 1
        else:
            unmapped_points += 1
    for pr in projects:
        parent = problems_by_id.get(pr.problem_id)
        if parent and parent.location_text:
            loc = parent.location_text.strip()
            location_counts.setdefault(loc, {"problem_count": 0, "project_count": 0})
            location_counts[loc]["project_count"] += 1

    geography = GeographyOut(
        supported=True,
        note="YUKTI stores a free-text location and a point geometry per problem, but no verified "
             "state/district boundary lookup yet — figures below are grouped by the raw submitted "
             "location text, not an official administrative hierarchy.",
        by_location=[
            LocationSlice(location_text=k, problem_count=v["problem_count"], project_count=v["project_count"])
            for k, v in sorted(location_counts.items(), key=lambda kv: -kv[1]["problem_count"])[:15]
        ],
        mapped_points=mapped_points,
        unmapped_points=unmapped_points,
    )

    investment_flow = MetricValue(
        supported=False,
        note="No funding-source (government grant / industry investment / CSR) table exists yet. "
             "This chart will populate once a Funding/Investment model is added.",
    )
    rural_urban = MetricValue(
        supported=False,
        note="No rural/urban classification field exists on Problem or Project yet, and no rule has been "
             "agreed for classifying a location_text/geometry as rural vs urban.",
    )

    # ---------- project status (real backend enum only) ----------
    status_counts = {}
    for pr in projects:
        status_counts[pr.status.value] = status_counts.get(pr.status.value, 0) + 1
    project_status = [ProjectStatusSlice(status=k, count=v) for k, v in status_counts.items()]

    # ---------- outcomes (real Project fields) ----------
    outcomes = [
        OutcomeMetric(
            label="Projects completed",
            value=sum(1 for pr in projects if pr.status == ProjectStatus.completed),
            source="projects WHERE status='completed'",
        ),
        OutcomeMetric(
            label="Patents filed",
            value=sum(1 for pr in projects if pr.patent_filed),
            source="projects WHERE patent_filed IS NOT NULL",
        ),
        OutcomeMetric(
            label="Startups incubated",
            value=sum(1 for pr in projects if pr.startup_incubated),
            source="projects WHERE startup_incubated IS NOT NULL",
        ),
        OutcomeMetric(
            label="Tech transfers recorded",
            value=sum(1 for pr in projects if pr.tech_transfer_status),
            source="projects WHERE tech_transfer_status IS NOT NULL",
        ),
    ]

    # ---------- trend by category (top 5 sectors, monthly) ----------
    top_sectors = [s.sector for s in sector_impact[:5]]
    trend_map = {}
    for p in problems:
        if p.domain in top_sectors:
            key = (_bucket(p.created_at), p.domain)
            trend_map[key] = trend_map.get(key, 0) + 1
    trend_by_category = [
        TrendByCategoryPoint(period=k[0], sector=k[1], count=v)
        for k, v in sorted(trend_map.items())
    ]

    # ---------- alerts (every one backed by a stated backend rule) ----------
    alerts: list[AlertItem] = []

    verification_cutoff = now - timedelta(days=VERIFICATION_BACKLOG_DAYS)
    pending_verification = (
        db.query(func.count(Problem.id))
        .filter(Problem.status == ProblemStatus.submitted, Problem.created_at <= verification_cutoff)
        .scalar() or 0
    )
    if pending_verification:
        alerts.append(AlertItem(
            id="verification-backlog",
            severity="medium",
            category="delay",
            title="Problems awaiting verification beyond the review SLA",
            count=pending_verification,
            rule=f"problems.status='submitted' AND created_at <= now - {VERIFICATION_BACKLOG_DAYS} days",
        ))

    clarification_pending = (
        db.query(func.count(Problem.id))
        .filter(Problem.clarification_requested == True, Problem.clarification_responded_at.is_(None))
        .scalar() or 0
    )
    if clarification_pending:
        alerts.append(AlertItem(
            id="clarification-pending",
            severity="low",
            category="engagement",
            title="Problems with an open clarification request awaiting citizen response",
            count=clarification_pending,
            rule="problems.clarification_requested=TRUE AND clarification_responded_at IS NULL",
        ))

    stalled_cutoff = now - timedelta(days=STALLED_PROJECT_DAYS)
    stalled_projects = (
        db.query(func.count(Project.id))
        .filter(Project.status == ProjectStatus.active, Project.updated_at <= stalled_cutoff)
        .scalar() or 0
    )
    if stalled_projects:
        alerts.append(AlertItem(
            id="stalled-projects",
            severity="high",
            category="delay",
            title=f"Active projects with no recorded update in {STALLED_PROJECT_DAYS}+ days",
            count=stalled_projects,
            rule=f"projects.status='active' AND updated_at <= now - {STALLED_PROJECT_DAYS} days",
        ))

    claim_cutoff = now - timedelta(days=CLAIM_STALE_DAYS)
    stale_claims = (
        db.query(func.count(Claim.id))
        .filter(Claim.status == ClaimStatus.pending, Claim.created_at <= claim_cutoff)
        .scalar() or 0
    )
    if stale_claims:
        alerts.append(AlertItem(
            id="stale-claims",
            severity="medium",
            category="engagement",
            title=f"University/industry claims pending a response for {CLAIM_STALE_DAYS}+ days",
            count=stale_claims,
            rule=f"claims.status='pending' AND created_at <= now - {CLAIM_STALE_DAYS} days",
        ))

    unverified_partners = (
        db.query(func.count(User.id))
        .filter(User.role.in_([UserRole.university, UserRole.industry]), User.is_verified == False)
        .scalar() or 0
    )
    if unverified_partners:
        alerts.append(AlertItem(
            id="unverified-partners",
            severity="low",
            category="verification",
            title="University/industry accounts awaiting admin verification",
            count=unverified_partners,
            rule="users.role IN ('university','industry') AND is_verified=FALSE",
        ))

    missing_location = db.query(func.count(Problem.id)).filter(Problem.location.is_(None)).scalar() or 0
    if missing_location:
        alerts.append(AlertItem(
            id="missing-geometry",
            severity="info",
            category="data_quality",
            title="Problems missing verified map coordinates",
            count=missing_location,
            rule="problems.location IS NULL",
        ))

    # ---------- data quality ----------
    problems_missing_location = missing_location
    problems_missing_domain = db.query(func.count(Problem.id)).filter(
        or_(Problem.domain.is_(None), Problem.domain == "")
    ).scalar() or 0
    unverified_university_accounts = db.query(func.count(User.id)).filter(
        User.role == UserRole.university, User.is_verified == False
    ).scalar() or 0
    unverified_industry_accounts = db.query(func.count(User.id)).filter(
        User.role == UserRole.industry, User.is_verified == False
    ).scalar() or 0
    projects_missing_partner_name = db.query(func.count(Project.id)).filter(
        or_(Project.partner_name.is_(None), Project.partner_name == "")
    ).scalar() or 0

    data_quality = DataQualityOut(
        problems_missing_location=problems_missing_location,
        problems_missing_domain=problems_missing_domain,
        unverified_university_accounts=unverified_university_accounts,
        unverified_industry_accounts=unverified_industry_accounts,
        projects_missing_partner_name=projects_missing_partner_name,
    )

    return ImpactAnalyticsOut(
        period={"from": date_from.date().isoformat(), "to": date_to.date().isoformat()},
        filters_applied={"state": state, "sector": sector, "status": status},
        kpis=kpis,
        overview_series=overview_series,
        sector_impact=sector_impact,
        geography=geography,
        investment_flow=investment_flow,
        rural_urban=rural_urban,
        project_status=project_status,
        outcomes=outcomes,
        trend_by_category=trend_by_category,
        alerts=alerts,
        data_quality=data_quality,
        metadata=MetadataOut(
            last_updated=now.isoformat(),
            methodology_version=METHODOLOGY_VERSION,
            generated_for_role=current_user.role.value if current_user else "admin",
        ),
    )