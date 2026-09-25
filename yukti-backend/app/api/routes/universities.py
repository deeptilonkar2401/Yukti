import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database import get_db
from app.models.user import User, UserRole
from app.models.university import University, UniversityCapability, Faculty
from app.schemas.university import (
    UniversityCreate,
    UniversityRead,
    CapabilityCreate,
    CapabilityRead,
    FacultyCreate,
    FacultyRead,
)

router = APIRouter(prefix="/api/universities", tags=["universities"])


def _get_own_university(current_user: User, db: Session) -> University:
    university = db.query(University).filter(University.user_id == current_user.id).first()
    if university is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No university profile yet — create one first with POST /api/universities/me",
        )
    return university


@router.post("/me", response_model=UniversityRead, status_code=status.HTTP_201_CREATED)
def create_my_university(
    payload: UniversityCreate,
    current_user: User = Depends(require_roles(UserRole.university)),
    db: Session = Depends(get_db),
):
    existing = db.query(University).filter(University.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="University profile already exists")

    university = University(user_id=current_user.id, **payload.model_dump())
    db.add(university)
    db.commit()
    db.refresh(university)
    return university


@router.get("/me", response_model=UniversityRead)
def get_my_university(
    current_user: User = Depends(require_roles(UserRole.university)),
    db: Session = Depends(get_db),
):
    return _get_own_university(current_user, db)


@router.post("/me/capabilities", response_model=CapabilityRead, status_code=status.HTTP_201_CREATED)
def add_capability(
    payload: CapabilityCreate,
    current_user: User = Depends(require_roles(UserRole.university)),
    db: Session = Depends(get_db),
):
    university = _get_own_university(current_user, db)
    capability = UniversityCapability(university_id=university.id, **payload.model_dump())
    db.add(capability)
    db.commit()
    db.refresh(capability)
    return capability


@router.post("/me/faculty", response_model=FacultyRead, status_code=status.HTTP_201_CREATED)
def add_faculty(
    payload: FacultyCreate,
    current_user: User = Depends(require_roles(UserRole.university)),
    db: Session = Depends(get_db),
):
    university = _get_own_university(current_user, db)
    faculty = Faculty(university_id=university.id, **payload.model_dump())
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty


@router.get("", response_model=list[UniversityRead])
def list_universities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Any authenticated user can browse universities — e.g. admin picking a match."""
    return db.query(University).all()


@router.get("/{university_id}", response_model=UniversityRead)
def get_university(
    university_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    university = db.query(University).filter(University.id == university_id).first()
    if not university:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")
    return university
