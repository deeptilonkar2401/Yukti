import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User, UserRole
from app.models.problem import Problem, ProblemStatus
from app.models.proposal import Proposal
from app.models.university import University

router = APIRouter(prefix="/api/proposals", tags=["proposals"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class StatusUpdatePayload(BaseModel):
    status: str  # approved, rejected


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_proposal(
    problem_id: str = Form(...),
    title: str = Form(...),
    tech_stack: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    university_name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """University submits a technical proposal document for a claimed problem."""
    try:
        prob_uuid = uuid.UUID(problem_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid problem ID format")

    problem = db.query(Problem).filter(Problem.id == prob_uuid).first()
    if not problem:
        raise HTTPException(status_code=44, detail="Problem not found")

    univ = db.query(University).filter(University.user_id == current_user.id).first()
    univ_name = university_name or (univ.name if univ else current_user.name) or "University Partner"

    doc_url = None
    doc_filename = None

    if file:
        filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)
        doc_url = f"/static/uploads/{filename}"
        doc_filename = file.filename

    proposal = Proposal(
        problem_id=prob_uuid,
        university_id=univ.id if univ else None,
        university_name=univ_name,
        title=title,
        tech_stack=tech_stack or "Full Stack Tech Proposal",
        description=description or "Technical proposal for societal problem resolution",
        document_url=doc_url or "/static/uploads/proposal_document.pdf",
        document_filename=doc_filename or (file.filename if file else "proposal_document.pdf"),
        status="pending"
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return {
        "status": "success",
        "message": f"Proposal '{title}' submitted successfully and sent to Admin Verification Queue.",
        "proposal_id": str(proposal.id)
    }


from app.api.deps import get_current_user, get_current_user_optional

@router.get("")
def list_proposals(
    problem_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Lists proposals for Admin verification queue ('Approve Proposals')."""
    query = db.query(Proposal)
    if problem_id:
        try:
            query = query.filter(Proposal.problem_id == uuid.UUID(problem_id))
        except ValueError:
            pass
    proposals = query.order_by(Proposal.created_at.desc()).all()

    result = []
    for p in proposals:
        prob = db.query(Problem).filter(Problem.id == p.problem_id).first()
        result.append({
            "id": str(p.id),
            "problem_id": str(p.problem_id),
            "problem_title": prob.title if prob else "Societal Problem",
            "problem_domain": prob.domain if prob else "General",
            "problem_location": prob.location_text if prob else "Jharkhand",
            "university_name": p.university_name,
            "title": p.title,
            "tech_stack": p.tech_stack,
            "description": p.description,
            "document_url": p.document_url,
            "document_filename": p.document_filename,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return result


@router.patch("/{proposal_id}/status")
def update_proposal_status(
    proposal_id: str,
    payload: StatusUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Admin approves or rejects a university proposal."""
    try:
        prop_uuid = uuid.UUID(proposal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid proposal ID")

    proposal = db.query(Proposal).filter(Proposal.id == prop_uuid).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal.status = payload.status
    if payload.status == "approved":
        prob = db.query(Problem).filter(Problem.id == proposal.problem_id).first()
        if prob:
            prob.status = ProblemStatus.in_progress

    db.commit()
    db.refresh(proposal)

    return {
        "status": "success",
        "message": f"Proposal status updated to '{payload.status}'",
        "proposal_id": str(proposal.id)
    }
