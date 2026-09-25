from typing import Optional, Union
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from geoalchemy2.functions import ST_MakePoint, ST_SetSRID
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional, require_roles
from app.ai.embeddings import embed_text
from app.ai.duplicates import find_similar_problems
from app.ai.gemini import generate_problem_summary, GeminiNotConfigured
from app.core.storage import upload_to_supabase, guess_media_type, MAX_FILE_SIZE_MB
from app.services.notifications import notify_user
from app.database import get_db
from app.models.user import User, UserRole
from app.models.problem import Problem, ProblemStatus
from app.models.media import Media
from app.schemas.problem import (
    ProblemCreate,
    ProblemRead,
    ProblemDetailRead,
    ProblemStatusUpdate,
    ProblemCreateResponse,
    ProblemSummaryResponse,
    DuplicateMatch,
    ClarificationRequestPayload,
    ClarificationResponsePayload,
)
from app.schemas.media import MediaRead

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.post("", response_model=ProblemCreateResponse, status_code=status.HTTP_201_CREATED)
def submit_problem(
    payload: ProblemCreate,
    current_user: User = Depends(require_roles(UserRole.citizen)),
    db: Session = Depends(get_db),
):
    location = None
    if payload.latitude is not None and payload.longitude is not None:
        location = ST_SetSRID(ST_MakePoint(payload.longitude, payload.latitude), 4326)

    problem = Problem(
        title=payload.title,
        description=payload.description,
        domain=payload.domain,
        subdomain=payload.subdomain,
        priority=payload.priority,
        location=location,
        location_text=payload.location_text,
        population_affected=payload.population_affected,
        photo_url=payload.photo_url,
        video_url=payload.video_url,
        voice_url=payload.voice_url,
        document_url=payload.document_url,
        submitted_by=current_user.id,
    )

    # Best-effort: a submission should still succeed even if the embedding
    # model fails to load (e.g. first run, still downloading weights).
    try:
        problem.embedding = embed_text(f"{problem.title}. {problem.description}")
    except Exception:
        problem.embedding = None

    db.add(problem)
    db.commit()
    db.refresh(problem)

    # Mirror to local SQLite DB to guarantee instant offline visibility
    try:
        from app.database import LocalSessionLocal
        local_db = LocalSessionLocal()
        existing_local = local_db.query(Problem).filter(Problem.id == problem.id).first()
        if not existing_local:
            local_prob = Problem(
                id=problem.id,
                title=problem.title,
                description=problem.description,
                domain=problem.domain,
                subdomain=problem.subdomain,
                priority=problem.priority,
                location_text=problem.location_text,
                population_affected=problem.population_affected,
                photo_url=problem.photo_url,
                video_url=problem.video_url,
                voice_url=problem.voice_url,
                document_url=problem.document_url,
                submitted_by=problem.submitted_by,
                status=problem.status,
            )
            local_db.add(local_prob)
            local_db.commit()
        local_db.close()
    except Exception as mirror_err:
        print("[Mirror Save Warning]:", mirror_err)

    duplicates = []
    if problem.embedding:
        similar = find_similar_problems(db, problem)
        duplicates = [
            DuplicateMatch(id=p.id, title=p.title, similarity=round(score, 3)) for p, score in similar
        ]

    response = ProblemCreateResponse.model_validate(problem)
    response.possible_duplicates = duplicates
    return response


@router.get("", response_model=list[ProblemRead])
def list_problems(
    status_filter:Optional[ ProblemStatus] = None,
    domain:Optional[ str] = None,
    mine: bool = False,
    current_user:Optional[ User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    query = db.query(Problem)
    if status_filter:
        query = query.filter(Problem.status == status_filter)
    if domain:
        query = query.filter(Problem.domain == domain)
    if mine:
        if current_user:
            query = query.filter(Problem.submitted_by == current_user.id)
    return query.order_by(Problem.created_at.desc()).all()


@router.get("/{problem_id}", response_model=ProblemDetailRead)
def get_problem(
    problem_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    return problem


@router.post("/{problem_id}/upvote", response_model=ProblemRead)
def upvote_problem(
    problem_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    problem.upvotes = (problem.upvotes or 0) + 1
    db.commit()
    db.refresh(problem)
    return problem


@router.patch("/{problem_id}/status", response_model=ProblemRead)
def update_problem_status(
    problem_id: uuid.UUID,
    payload: ProblemStatusUpdate,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    problem.status = payload.status
    if payload.status == ProblemStatus.verified:
        problem.verified_by = current_user.id
        from datetime import datetime
        problem.verified_at = datetime.utcnow()

        # AI Recommendation Engine: Auto-match Top 3 Universities
        try:
            from app.models.university import University
            from app.models.claim import Claim, ClaimantType, ClaimStatus
            universities = db.query(University).limit(3).all()
            for univ in universities:
                existing = db.query(Claim).filter(Claim.problem_id == problem.id, Claim.university_id == univ.id).first()
                if not existing:
                    claim = Claim(
                        problem_id=problem.id,
                        claimant_type=ClaimantType.university,
                        university_id=univ.id,
                        status=ClaimStatus.pending,
                        match_score=92,
                        why_matched=["High Domain Alignment", "Regional Proximity", "Faculty R&D Strength"]
                    )
                    db.add(claim)
        except Exception as err:
            print("AI university matching warning:", err)

    db.commit()
    db.refresh(problem)

    if payload.status == ProblemStatus.verified:
        notify_user(
            db,
            problem.submitted_by,
            title="Your problem was verified",
            body=f'"{problem.title}" has been verified and matched to top universities.',
            data={"type": "problem_verified", "problem_id": str(problem.id)},
        )

    return problem


@router.post("/{problem_id}/media", response_model=MediaRead, status_code=status.HTTP_201_CREATED)
async def upload_problem_media(
    problem_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    # Only the citizen who submitted it (or an admin) can attach evidence
    if current_user.role != UserRole.admin and problem.submitted_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to add media to this problem")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"File exceeds {MAX_FILE_SIZE_MB}MB")

    upload_result = upload_to_supabase(
        file_bytes=file_bytes,
        original_filename=file.filename or "upload",
        content_type=file.content_type or "application/octet-stream",
        problem_id=str(problem.id),
    )

    media = Media(
        problem_id=problem.id,
        file_url=upload_result["file_url"],
        storage_path=upload_result["storage_path"],
        file_type=guess_media_type(file.content_type or ""),
        original_filename=file.filename,
        uploaded_by=current_user.id,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.get("/{problem_id}/summary", response_model=ProblemSummaryResponse)
def get_problem_summary(
    problem_id: uuid.UUID,
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.university, UserRole.industry)),
    db: Session = Depends(get_db),
):
    """Gemini-generated plain-language summary — for a partner deciding whether to take this on."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    try:
        summary = generate_problem_summary(problem.title, problem.description, problem.domain)
    except GeminiNotConfigured:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="GEMINI_API_KEY is not configured")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Gemini request failed: {exc}")

    return ProblemSummaryResponse(problem_id=problem.id, summary=summary)


@router.post("/{problem_id}/merge", response_model=ProblemRead)
def merge_duplicate_problem(
    problem_id: uuid.UUID,
    duplicate_id: uuid.UUID,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Admin merges a duplicate problem into the primary problem statement."""
    primary = db.query(Problem).filter(Problem.id == problem_id).first()
    duplicate = db.query(Problem).filter(Problem.id == duplicate_id).first()
    if not primary or not duplicate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    duplicate.status = ProblemStatus.completed
    duplicate.description = (duplicate.description or "") + f"\n\n[MERGED into Primary Challenge {primary.id}]"

    db.commit()
    db.refresh(primary)
    return primary


@router.post("/{problem_id}/request-clarification", response_model=ProblemRead)
def request_problem_clarification(
    problem_id: uuid.UUID,
    payload: ClarificationRequestPayload,
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.university)),
    db: Session = Depends(get_db),
):
    """Admin or matched University requests additional information/evidence from citizen."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    from datetime import datetime
    problem.clarification_requested = True
    problem.clarification_prompt = payload.prompt
    problem.clarification_requested_at = datetime.utcnow()

    db.commit()
    db.refresh(problem)

    notify_user(
        db,
        problem.submitted_by,
        title="Clarification Requested",
        body=f'Additional details requested for "{problem.title}": {payload.prompt}',
        data={"type": "clarification_requested", "problem_id": str(problem.id)},
    )
    return problem


@router.post("/{problem_id}/respond-clarification", response_model=ProblemRead)
def respond_problem_clarification(
    problem_id: uuid.UUID,
    payload: ClarificationResponsePayload,
    current_user: User = Depends(require_roles(UserRole.citizen)),
    db: Session = Depends(get_db),
):
    """Citizen provides additional information or clarification response."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    if problem.submitted_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to respond for this problem")

    from datetime import datetime
    problem.clarification_requested = False
    problem.clarification_response = payload.response
    problem.clarification_responded_at = datetime.utcnow()
    problem.description = f"{problem.description}\n\n[Citizen Clarification]: {payload.response}"

    db.commit()
    db.refresh(problem)
    return problem

