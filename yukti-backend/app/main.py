import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app import models  # noqa: F401 — registers all models on Base.metadata
from app.api.routes import auth, users, problems, universities, industries, claims, projects, matching, geo, dashboard, notifications, proposals, admin_analytics, industry_analytics

app = FastAPI(
    title="YUKTI API",
    description="Backend for the YUKTI crowdsourced problem-solving platform (SIH PS26043).",
    version="0.1.0",
)

# Static file serving for uploaded proposal documents
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(problems.router)
app.include_router(universities.router)
app.include_router(industries.router)
app.include_router(claims.router)
app.include_router(projects.router)
app.include_router(matching.router)
app.include_router(geo.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(proposals.router)
app.include_router(admin_analytics.router)
app.include_router(industry_analytics.router)


@app.on_event("startup")
def on_startup():
    from app.database import local_engine, engine
    from sqlalchemy import text, inspect as sa_inspect

    # Initialize local SQLite DB file (yukti_local.db) first to guarantee offline persistence
    try:
        Base.metadata.create_all(bind=local_engine)
        inspector_local = sa_inspect(local_engine)
        existing_tables_local = inspector_local.get_table_names()
        with local_engine.connect() as conn:
            for mapper in Base.registry.mappers:
                table_name = mapper.class_.__tablename__
                if table_name in existing_tables_local:
                    db_cols = {col["name"] for col in inspector_local.get_columns(table_name)}
                    for column in mapper.columns:
                        if column.name not in db_cols:
                            sql = f"ALTER TABLE {table_name} ADD COLUMN {column.name} TEXT"
                            try:
                                conn.execute(text(sql))
                                conn.commit()
                                print(f"[Local SQLite Schema] Added column {column.name} to {table_name}")
                            except Exception:
                                pass
        print("[Database] Local SQLite (yukti_local.db) initialized & verified.")
    except Exception as local_err:
        print(f"[Database Warning] Local SQLite init warning: {local_err}")

    # Also attempt remote engine table sync
    try:
        Base.metadata.create_all(bind=engine)
        inspector = sa_inspect(engine)
        existing_tables = inspector.get_table_names()
        with engine.connect() as conn:
            for mapper in Base.registry.mappers:
                table_name = mapper.class_.__tablename__
                if table_name in existing_tables:
                    db_cols = {col["name"] for col in inspector.get_columns(table_name)}
                    for column in mapper.columns:
                        if column.name not in db_cols:
                            col_type = column.type.compile(engine.dialect)
                            sql = f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {column.name} {col_type}"
                            try:
                                conn.execute(text(sql))
                                conn.commit()
                            except Exception:
                                pass
        print("[Database] Primary engine tables initialized successfully.")
    except Exception as e:
        print(f"Warning: Primary database connection skipped ({e}). Operating seamlessly on persistent SQLite database.")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "YUKTI API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)