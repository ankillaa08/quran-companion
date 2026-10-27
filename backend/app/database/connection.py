"""
Database engine and async session provider.
Supports SQLite (zero-config local development) and PostgreSQL (Neon/Render/AWS in production).
"""
import os
import re
import logging
from typing import AsyncGenerator, Dict, Any
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.database.models import Base

logger = logging.getLogger("quran_companion.database")

RAW_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./quran_companion.db")

def normalize_database_url(url: str) -> tuple[str, dict]:
    """
    Normalizes database connection string for SQLAlchemy + asyncpg.
    Converts postgres:// or postgresql:// to postgresql+asyncpg:// and handles SSL.
    """
    connect_args = {}
    
    if url.startswith("sqlite"):
        return url, {"check_same_thread": False}
        
    # Standardize postgres scheme to asyncpg
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Handle SSL mode for managed clouds (e.g. Neon, Render, Supabase)
    if "sslmode=" in url or os.getenv("DB_SSL_REQUIRE", "false").lower() in ("true", "1", "yes"):
        connect_args["ssl"] = "require"
        # Strip sslmode parameter from query string to avoid asyncpg argument conflicts
        url = re.sub(r"[?&]sslmode=[^&]+", "", url)
        # Fix query string if leading ? was removed
        if "?" not in url and "&" in url:
            url = url.replace("&", "?", 1)

    return url, connect_args

NORMALIZED_URL, CONNECT_ARGS = normalize_database_url(RAW_DATABASE_URL)

is_sqlite = NORMALIZED_URL.startswith("sqlite")

if is_sqlite:
    engine = create_async_engine(
        NORMALIZED_URL,
        echo=False,
        connect_args=CONNECT_ARGS
    )
else:
    engine = create_async_engine(
        NORMALIZED_URL,
        echo=False,
        pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
        pool_recycle=int(os.getenv("DB_POOL_RECYCLE", "300")),
        pool_pre_ping=True,
        connect_args=CONNECT_ARGS
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def init_db():
    """Initializes database schema tables."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema synchronized successfully.")
    except Exception as e:
        logger.error(f"Failed to synchronize database schema: {e}")
        raise


async def check_db_health() -> Dict[str, Any]:
    """Tests connectivity to the active database engine."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "type": "sqlite" if is_sqlite else "postgresql"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "type": "sqlite" if is_sqlite else "postgresql",
            "error": str(e)
        }


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for yielding database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
