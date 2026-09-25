from typing import Optional, Union
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database import get_db
from app.models.user import User, UserRole
from app.models.industry import Industry
from app.schemas.industry import IndustryCreate, IndustryRead

router = APIRouter(prefix="/api/industries", tags=["industries"])


@router.post("/me", response_model=IndustryRead, status_code=status.HTTP_201_CREATED)
def create_my_industry(
    payload: IndustryCreate,
    current_user: User = Depends(require_roles(UserRole.industry)),
    db: Session = Depends(get_db),
):
    existing = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Industry profile already exists")

    industry = Industry(user_id=current_user.id, **payload.model_dump())
    db.add(industry)
    db.commit()
    db.refresh(industry)
    return industry


@router.get("/me", response_model=IndustryRead)
def get_my_industry(
    current_user: User = Depends(require_roles(UserRole.industry)),
    db: Session = Depends(get_db),
):
    industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    if industry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No industry profile yet — create one first with POST /api/industries/me",
        )
    return industry


@router.get("", response_model=list[IndustryRead])
def list_industries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Industry).all()


@router.get("/{industry_id}", response_model=IndustryRead)
def get_industry(
    industry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    industry = db.query(Industry).filter(Industry.id == industry_id).first()
    if not industry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found")
    return industry


from pydantic import BaseModel

class SupportOfferPayload(BaseModel):
    problem_id: uuid.UUID
    support_type: str  # Mentorship, CSR Funding, Technology Stack, Equipment, Field Pilot, Tech Transfer
    commitment_details: str
    contact_email:Optional[ str] = None

@router.post("/offers", response_model=dict, status_code=status.HTTP_201_CREATED)
def submit_support_offer(
    payload: SupportOfferPayload,
    current_user: User = Depends(require_roles(UserRole.industry)),
    db: Session = Depends(get_db),
):
    """Industry partner submits offer for mentorship, funding, equipment, or pilot implementation."""
    industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    company_name = industry.company_name if industry else current_user.full_name or "Industry Partner"

    from app.services.notifications import notify_user
    # Send confirmation notification
    notify_user(
        db,
        current_user.id,
        title="Support Offer Submitted",
        body=f"Your {payload.support_type} support offer for problem ID {payload.problem_id} has been submitted for review.",
        data={"type": "support_offer_submitted", "problem_id": str(payload.problem_id)},
    )

    return {
        "status": "success",
        "message": f"Support offer ({payload.support_type}) submitted by {company_name}.",
        "problem_id": str(payload.problem_id),
    }

