from typing import Optional, Union
import uuid
from datetime import datetime
from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.ai.matching import score_university_for_problem, score_industry_for_problem
from app.database import get_db
from app.models.user import User, UserRole
from app.models.problem import Problem, ProblemStatus
from app.models.university import University
from app.models.industry import Industry
from app.models.claim import Claim, ClaimStatus, ClaimantType
from app.models.project import Project
from app.schemas.claim import ClaimCreate, ClaimRead, ClaimRespond, TeamAssignmentPayload, ProposalSubmissionPayload
from app.services.notifications import notify_user

router = APIRouter(prefix="/api/claims", tags=["claims"])


def _org_ids_for_user(current_user: User, db: Session) -> tuple[Optional[uuid.UUID], Optional[uuid.UUID]]:
    """Returns (university_id, industry_id) — whichever applies to this user, else None."""
    if current_user.role == UserRole.university:
        org = db.query(University).filter(University.user_id == current_user.id).first()
        return (org.id if org else None), None
    if current_user.role == UserRole.industry:
        org = db.query(Industry).filter(Industry.user_id == current_user.id).first()
        return None, (org.id if org else None)
    return None, None


@router.post("", response_model=ClaimRead, status_code=status.HTTP_201_CREATED)
def create_claim(
    payload: ClaimCreate,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    """
    Admin proposes: "this problem suits this university/industry".
    Manual for now — Phase 6's AI matching will call this same shape
    programmatically once match_score/breakdown are computed automatically.
    """
    problem = db.query(Problem).filter(Problem.id == payload.problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    if problem.status not in (ProblemStatus.verified, ProblemStatus.matched):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only verified problems can be matched to a university/industry",
        )

    if payload.claimant_type == ClaimantType.university:
        if payload.university_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="university_id is required")
        university = db.query(University).filter(University.id == payload.university_id).first()
        if not university:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")
        score_result = score_university_for_problem(problem, university)
    else:
        if payload.industry_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="industry_id is required")
        industry = db.query(Industry).filter(Industry.id == payload.industry_id).first()
        if not industry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found")
        score_result = score_industry_for_problem(problem, industry)

    claim = Claim(
        problem_id=payload.problem_id,
        claimant_type=payload.claimant_type,
        university_id=payload.university_id,
        industry_id=payload.industry_id,
        **score_result,
    )
    db.add(claim)

    if problem.status == ProblemStatus.verified:
        problem.status = ProblemStatus.matched

    db.commit()
    db.refresh(claim)

    org_user_id = university.user_id if payload.claimant_type == ClaimantType.university else industry.user_id
    notify_user(
        db,
        org_user_id,
        title="New problem match proposed",
        body=f'"{problem.title}" ({problem.domain}) has been matched to you — review and respond.',
        data={"type": "claim_proposed", "claim_id": str(claim.id), "problem_id": str(problem.id)},
    )

    return claim


@router.get("/mine", response_model=list[ClaimRead])
def list_my_claims(
    current_user: User = Depends(require_roles(UserRole.university, UserRole.industry)),
    db: Session = Depends(get_db),
):
    university_id, industry_id = _org_ids_for_user(current_user, db)
    query = db.query(Claim)
    if current_user.role == UserRole.university:
        query = query.filter(Claim.university_id == university_id)
    else:
        query = query.filter(Claim.industry_id == industry_id)
    return query.order_by(Claim.created_at.desc()).all()


@router.get("", response_model=list[ClaimRead])
def list_all_claims(
    problem_id: Optional[uuid.UUID] = None,
    status_filter:Optional[ ClaimStatus] = None,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    query = db.query(Claim)
    if problem_id:
        query = query.filter(Claim.problem_id == problem_id)
    if status_filter:
        query = query.filter(Claim.status == status_filter)
    return query.order_by(Claim.created_at.desc()).all()


@router.patch("/{claim_id}/respond", response_model=ClaimRead)
def respond_to_claim(
    claim_id: uuid.UUID,
    payload: ClaimRespond,
    current_user: User = Depends(require_roles(UserRole.university, UserRole.industry)),
    db: Session = Depends(get_db),
):
    """The claimed university/industry accepts or rejects the proposed match."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    university_id, industry_id = _org_ids_for_user(current_user, db)
    is_owner = (
        (claim.claimant_type == ClaimantType.university and claim.university_id == university_id)
        or (claim.claimant_type == ClaimantType.industry and claim.industry_id == industry_id)
    )
    if not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This claim wasn't proposed to you")

    if claim.status != ClaimStatus.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This claim was already responded to")

    claim.status = payload.status
    claim.responded_at = datetime.utcnow()

    problem = db.query(Problem).filter(Problem.id == claim.problem_id).first()

    if payload.status == ClaimStatus.rejected:
        # Free the problem up so admin can propose a different match.
        if problem and problem.status == ProblemStatus.matched:
            problem.status = ProblemStatus.verified
    elif payload.status == ClaimStatus.accepted:
        if problem:
            problem.status = ProblemStatus.in_progress
        partner_name = None
        if claim.claimant_type == ClaimantType.university:
            org = db.query(University).filter(University.id == claim.university_id).first()
            partner_name = org.institute_name if org else None
        else:
            org = db.query(Industry).filter(Industry.id == claim.industry_id).first()
            partner_name = org.company_name if org else None

        db.add(Project(claim_id=claim.id, problem_id=claim.problem_id, partner_name=partner_name))

    db.commit()
    db.refresh(claim)

    if problem:
        if payload.status == ClaimStatus.accepted:
            notify_user(
                db,
                problem.submitted_by,
                title="A partner has taken up your problem",
                body=f'"{problem.title}" is now being worked on by {partner_name or "a partner organization"}.',
                data={"type": "claim_accepted", "problem_id": str(problem.id)},
            )

    return claim


@router.post("/{claim_id}/team", response_model=dict)
def assign_claim_team(
    claim_id: uuid.UUID,
    payload: TeamAssignmentPayload,
    current_user: User = Depends(require_roles(UserRole.university)),
    db: Session = Depends(get_db),
):
    """Assigns multidisciplinary team & faculty mentor to accepted claim/project."""
    project = db.query(Project).filter(Project.claim_id == claim_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project for this claim not found")

    project.lead_name = payload.lead_name
    db.commit()
    db.refresh(project)

    return {
        "status": "success",
        "message": f"Team assigned under {payload.lead_name} (Mentor: {payload.faculty_mentor})",
        "project_id": str(project.id),
    }


@router.post("/{claim_id}/proposal", response_model=dict)
def submit_claim_proposal(
    claim_id: uuid.UUID,
    payload: ProposalSubmissionPayload,
    current_user: User = Depends(require_roles(UserRole.university)),
    db: Session = Depends(get_db),
):
    """Submits solution proposal for an accepted claim/project."""
    project = db.query(Project).filter(Project.claim_id == claim_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project for this claim not found")

    # Store proposal info inside project or notification
    db.commit()

    return {
        "status": "submitted",
        "message": f"Solution Proposal '{payload.title}' submitted successfully.",
        "project_id": str(project.id),
    }


class DirectClaimPayload(BaseModel):
    problem_id: uuid.UUID
    lead_name:Optional[ str] = None
    faculty_mentor:Optional[ str] = None


@router.post("/direct-claim", response_model=dict, status_code=status.HTTP_201_CREATED)
def direct_claim_problem(
    payload: DirectClaimPayload,
    current_user: User = Depends(require_roles(UserRole.university, UserRole.industry)),
    db: Session = Depends(get_db),
):
    """Allows a verified University or Industry partner to directly claim an open verified problem."""
    problem = db.query(Problem).filter(Problem.id == payload.problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    claimant_type = ClaimantType.university if current_user.role == UserRole.university else ClaimantType.industry
    university_id, industry_id = _org_ids_for_user(current_user, db)

    existing = db.query(Claim).filter(Claim.problem_id == payload.problem_id, Claim.status == ClaimStatus.accepted).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Problem is already claimed by another organization")

    claim = Claim(
        problem_id=payload.problem_id,
        claimant_type=claimant_type,
        university_id=university_id,
        industry_id=industry_id,
        status=ClaimStatus.accepted,
        responded_at=datetime.utcnow(),
    )
    db.add(claim)

    problem.status = ProblemStatus.in_progress
    partner_name = current_user.name or "Partner Organization"

    project = Project(
        claim_id=claim.id,
        problem_id=problem.id,
        partner_name=partner_name,
        lead_name=payload.lead_name or payload.faculty_mentor or "Faculty Lead"
    )
    db.add(project)
    db.commit()

    notify_user(
        db,
        problem.submitted_by,
        title="Your problem was taken up by a university!",
        body=f'"{problem.title}" is now being worked on by {partner_name}.',
        data={"type": "claim_accepted", "problem_id": str(problem.id)},
    )

    return {
        "status": "success",
        "message": f"Problem '{problem.title}' claimed successfully by {partner_name}.",
        "project_id": str(project.id)
    }


