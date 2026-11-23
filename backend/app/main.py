import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.api.v1.api import api_router
from app.db.seed import seed_database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("lablink")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist, apply schema patches, and seed demo database
    logger.info("Initializing LabLink database schemas...")
    try:
        # 1. Create any missing tables
        Base.metadata.create_all(bind=engine)

        # 2. Defensive schema migration: ensure project_id column exists on bookings
        with engine.begin() as conn:
            if conn.dialect.name == "postgresql":
                conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS project_id VARCHAR(36);"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_bookings_project_id ON bookings (project_id);"))
            elif conn.dialect.name == "sqlite":
                cols = [row[1] for row in conn.execute(text("PRAGMA table_info(bookings);")).fetchall()]
                if "project_id" not in cols:
                    conn.execute(text("ALTER TABLE bookings ADD COLUMN project_id VARCHAR(36);"))

        # 3. Seed initial records if not in testing
        if (settings.ENVIRONMENT != "production" or settings.DEMO_ADMIN_ENABLED) and \
                not os.environ.get("TESTING"):
            seed_database()
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    yield
    # Shutdown
    logger.info("Shutting down LabLink application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS
# Use allow_origin_regex to universally permit all onrender.com domains and local environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# High-efficiency GZip compression for payloads > 1KB
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint providing system status and documentation links.
    """
    return {
        "service": settings.PROJECT_NAME,
        "tagline": "Making College Laboratories More Accessible",
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR,
    }


@app.api_route("/seed", methods=["GET", "POST"], tags=["Database"])
@app.api_route(f"{settings.API_V1_STR}/seed", methods=["GET", "POST"], tags=["Database"])
@app.api_route(f"{settings.API_V1_STR}/auth/seed", methods=["GET", "POST"], tags=["Database"])
def global_seed_trigger():
    """
    Convenience endpoint to seed all 28 equipment items, laboratories, and demo accounts.
    Accessible from browser at /seed, /api/v1/seed, or /api/v1/auth/seed.
    """
    seed_database()
    return {
        "status": "success",
        "message": "Database successfully seeded with 28 equipment items, laboratories, and demo accounts.",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Service health probe. Verifies database connectivity without leaking credentials.
    """
    db_status = "unhealthy"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Health check database failure: {e}")
        db_status = f"unhealthy"

    return {
        "status": "online" if db_status == "healthy" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
    }


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator."},
    )
