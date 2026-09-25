"""
Bootstrap the first admin account (there's no signup flow for admins on purpose —
citizens/university/industry self-register, admin is provisioned by the team).

Run from the yukti-backend/ folder:
    python -m scripts.create_admin
"""
import getpass
import sys

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.user import User, UserRole


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    email = input("Admin email: ").strip()
    if db.query(User).filter(User.email == email).first():
        print(f"A user with email {email} already exists.")
        sys.exit(1)

    name = input("Admin name: ").strip()
    password = getpass.getpass("Admin password: ")

    admin = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
        role=UserRole.admin,
        is_verified=True,
    )
    db.add(admin)
    db.commit()
    print(f"Admin account created: {email}")


if __name__ == "__main__":
    main()
