from typing import Optional, Union
"""
Password hashing and JWT helpers.

Kept separate from app.api.deps so it has zero FastAPI dependency —
easy to unit test and easy to reuse in scripts (e.g. seeding an admin user).
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt, JWTError
import bcrypt

from app.core.config import settings

def hash_password(plain_password: str) -> str:
    password_bytes = plain_password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(subject: str, role: str, expires_minutes:Optional[ int] = None) -> str:
    """
    subject = user id (as string). role is embedded so protected routes
    can check permissions without hitting the DB on every request.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    to_encode: dict[str, Any] = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) ->Optional[ dict[str, Any]]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
