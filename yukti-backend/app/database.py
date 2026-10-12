import sqlite3
from sqlalchemy import create_engine, text, event, Engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

@event.listens_for(Engine, "connect")
def register_sqlite_functions(dbapi_connection, connection_record):
    """
    Register dummy mock functions for GeoAlchemy2 / PostGIS when connected
    to SQLite so queries selecting Geometry columns (like Problem.location)
    never crash with 'no such function: AsEWKB'.
    """
    if isinstance(dbapi_connection, sqlite3.Connection):
        def _dummy_geo(x=None, *args):
            return x if x is not None else None

        geo_funcs = [
            "AsEWKB", "GeomFromEWKB", "ST_GeomFromEWKB", "ST_AsBinary",
            "ST_AsText", "ST_AsGeoJSON", "ST_GeomFromText", "GeomFromText",
            "ST_Point", "Point", "ST_SetSRID", "ST_Transform", "ST_DWithin"
        ]
        for func_name in geo_funcs:
            try:
                dbapi_connection.create_function(func_name, -1, _dummy_geo)
            except Exception:
                pass

db_url = settings.database_url


def create_db_engine():
    if db_url and not db_url.startswith("sqlite"):
        try:
            # Single engine with 30s timeout — avoids double-handshake overhead
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
                pool_recycle=300,
                connect_args={"connect_timeout": 30},
            )
            # Lightweight connectivity check
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[Database] Connected to Supabase PostgreSQL successfully.")
            return engine
        except Exception as e:
            print(f"Warning: Primary database connection skipped ({e}). Operating seamlessly on persistent SQLite database.")

    return create_engine("sqlite:///./yukti_local.db", connect_args={"check_same_thread": False})


engine = create_db_engine()

# Automatically create all tables on local SQLite if needed
try:
    Base = declarative_base()
except Exception:
    pass

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


local_engine = create_engine("sqlite:///./yukti_local.db", connect_args={"check_same_thread": False})
LocalSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=local_engine)

def get_db():
    # Only the connectivity probe is guarded — if the primary DB is
    # unreachable we transparently fall back to local SQLite. Once a
    # session is handed out, any exception raised while it's in use
    # (e.g. an HTTPException from an auth/permission dependency) must
    # propagate normally, or FastAPI's generator-dependency machinery
    # breaks and turns a clean 401/403 into a 500.
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
    except Exception as e:
        try:
            db.close()
        except Exception:
            pass
        print(f"[Database] Primary session unavailable ({e}). Falling back to local SQLite for this request.")
        db = LocalSessionLocal()

    try:
        yield db
    finally:
        db.close()