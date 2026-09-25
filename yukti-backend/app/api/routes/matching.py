import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.matching import score_university_for_problem, score_industry_for_problem
from app.api.deps import require_roles
from app.database import get_db
from app.models.user import UserRole
from app.models.problem import Problem
from app.models.university import University
from app.models.industry import Industry

router = APIRouter(prefix="/api/matching", tags=["matching"])


class SuggestionItem(BaseModel):
    claimant_type: str  # "university" | "industry"
    id: uuid.UUID
    name: str
    match_score: int
    match_breakdown: dict
    matched_skills: list[str]
    why_matched: list[str]


@router.get(
    "/suggestions/{problem_id}",
    response_model=list[SuggestionItem],
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def get_match_suggestions(problem_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Ranks every university/industry against this problem so admin can pick
    who to propose a claim to. This is the AI half of Phase 5's manual
    POST /api/claims — admin still makes the final call, the score just
    orders the options.
    """
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    suggestions: list[SuggestionItem] = []

    for uni in db.query(University).all():
        result = score_university_for_problem(problem, uni)
        suggestions.append(SuggestionItem(claimant_type="university", id=uni.id, name=uni.institute_name, **result))

    for ind in db.query(Industry).all():
        result = score_industry_for_problem(problem, ind)
        suggestions.append(SuggestionItem(claimant_type="industry", id=ind.id, name=ind.company_name, **result))

    suggestions.sort(key=lambda s: s.match_score, reverse=True)
    return suggestions
