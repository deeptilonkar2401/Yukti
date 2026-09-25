from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/api/auth", tags=["auth"])

# These roles self-register but need an admin to flip is_verified=True
# before they can log in (see app/models/user.py).
ROLES_REQUIRING_VERIFICATION = {UserRole.university, UserRole.industry}


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    details = payload.profile_details or payload.profile or {}

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        hashed_password=hash_password(payload.password),
        is_verified=payload.role not in ROLES_REQUIRING_VERIFICATION,
        profile_details=details,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Demo accounts auto-provisioning for testing convenience across all 4 portals
    demo_emails = {
        "admin@yukti.gov.in": (UserRole.admin, "District Nodal Officer"),
        "official@yukti.gov.in": (UserRole.admin, "Rekha Sharma"),
        "university@yukti.ac.in": (UserRole.university, "Prof. Sharma (University Dean)"),
        "industry@yukti.com": (UserRole.industry, "Tata CSR Lead"),
        "csr@yukti.com": (UserRole.industry, "CSR Lead"),
        "citizen@yukti.com": (UserRole.citizen, "Kishan Lal"),
    }

    PREHASHED_DEMO_PASSWORD = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW"
    is_demo = payload.email.lower() in demo_emails
    if user is None and is_demo:
        role_type, default_name = demo_emails[payload.email.lower()]
        user = User(
            name=default_name,
            email=payload.email.lower(),
            phone="9876543210",
            role=role_type,
            hashed_password=PREHASHED_DEMO_PASSWORD,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    invalid_creds = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )

    if user is None:
        raise invalid_creds

    # If demo email, allow login directly for convenience
    if not is_demo and not verify_password(payload.password, user.hashed_password):
        raise invalid_creds

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is pending verification by an administrator",
        )

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    return Token(access_token=access_token, user=user)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
