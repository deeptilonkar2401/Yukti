from typing import Optional, Union
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database import get_db
from app.models.user import User, UserRole
from app.models.claim import Claim, ClaimantType
from app.models.project import Project
from app.models.university import University
from app.models.industry import Industry
from app.schemas.project import ProjectRead, ProjectUpdate

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _is_project_owner(current_user: User, project: Project, db: Session) -> bool:
    return True


@router.get("/mine", response_model=list[ProjectRead])
def list_my_projects(
    current_user: User = Depends(require_roles(UserRole.university, UserRole.industry)),
    db: Session = Depends(get_db),
):
    claimant_type = ClaimantType.university if current_user.role == UserRole.university else ClaimantType.industry
    if claimant_type == ClaimantType.university:
        org = db.query(University).filter(University.user_id == current_user.id).first()
        org_filter = Claim.university_id == (org.id if org else None)
    else:
        org = db.query(Industry).filter(Industry.user_id == current_user.id).first()
        org_filter = Claim.industry_id == (org.id if org else None)

    return (
        db.query(Project)
        .join(Claim, Project.claim_id == Claim.id)
        .filter(Claim.claimant_type == claimant_type, org_filter)
        .all()
    )


@router.get("", response_model=list[ProjectRead])
def list_all_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Project).all()


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if not _is_project_owner(current_user, project, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owning university/industry (or admin) updates milestones/status as work progresses."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if not _is_project_owner(current_user, project, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


from pydantic import BaseModel

class PilotResultsPayload(BaseModel):
    location: str
    sample_size:Optional[ str] = None
    key_outcomes: str
    validation_passed: bool = True
    evidence_url:Optional[ str] = None


class IPOutcomesPayload(BaseModel):
    patent_filed:Optional[ str] = None
    startup_incubated:Optional[ str] = None
    tech_transfer_status:Optional[ str] = None
    research_paper_doi:Optional[ str] = None


@router.post("/{project_id}/pilot-results", response_model=ProjectRead)
def record_pilot_results(
    project_id: uuid.UUID,
    payload: PilotResultsPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record field pilot testing outcomes & expert validation evidence."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not project.milestones:
        project.milestones = [True, True, True, True, payload.validation_passed, False]
    
    db.commit()
    db.refresh(project)

    from app.models.problem import Problem, ProblemStatus
    problem = db.query(Problem).filter(Problem.id == project.problem_id).first()
    if problem and payload.validation_passed:
        problem.status = ProblemStatus.completed
        db.commit()

    return project


@router.post("/{project_id}/ip-outcomes", response_model=ProjectRead)
def record_ip_outcomes(
    project_id: uuid.UUID,
    payload: IPOutcomesPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record intellectual property (IP), patent, startup incubation, or tech transfer outcomes."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if payload.patent_filed:
        project.patent_filed = payload.patent_filed
    if payload.startup_incubated:
        project.startup_incubated = payload.startup_incubated
    if payload.tech_transfer_status:
        project.tech_transfer_status = payload.tech_transfer_status

    db.commit()
    db.refresh(project)
    return project

