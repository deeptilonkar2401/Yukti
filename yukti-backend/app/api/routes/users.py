import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRead

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get(
    "/pending-verification",
    response_model=list[UserRead],
)
def list_pending_verification(db: Session = Depends(get_db)):
    """University/industry accounts waiting on admin approval."""
    return (
        db.query(User)
        .filter(User.is_verified.is_(False))
        .filter(User.role.in_([UserRole.university, UserRole.industry]))
        .order_by(User.created_at.desc())
        .all()
    )


@router.patch(
    "/{user_id}/verify",
    response_model=UserRead,
)
def verify_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_verified = True
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.patch(
    "/{user_id}/reject",
    response_model=UserRead,
)
def reject_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_verified = False
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(require_roles(*list(UserRole)))):
    """Any authenticated role — sanity-check route to confirm the token/role flow works."""
    return current_user

