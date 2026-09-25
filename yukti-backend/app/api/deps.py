from typing import Optional, Union
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User, UserRole

# tokenUrl is just for the interactive Swagger UI "Authorize" button —
# the actual route is registered in app/api/routes/auth.py
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token:Optional[ str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_error

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_error

    try:
        user_id = uuid.UUID(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_active:
            return user
    except (ValueError, TypeError):
        raise credentials_error


def get_current_user_optional(
    token:Optional[ str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) ->Optional[ User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = uuid.UUID(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_active:
            return user
    except (ValueError, TypeError):
        pass
    return None


def require_roles(*allowed_roles: UserRole):
    """
    Usage: @router.get(..., dependencies=[Depends(require_roles(UserRole.admin))])
    or as a param: current_user: User = Depends(require_roles(UserRole.admin, UserRole.university))
    """

    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if allowed_roles and current_user.role not in allowed_roles:
            # Admin role override if needed, otherwise strict check
            if current_user.role == UserRole.admin or current_user.role.value in ['admin', 'administrator', 'government']:
                return current_user
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of these roles: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return _checker


