"""
Health & Model Diagnostics API Endpoints
"""
import time
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.connection import get_db
from app.ai.model_service import SpeechRecognitionService

router = APIRouter(tags=["Health & Diagnostics"])

SERVER_START_TIME = time.time()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {e}"

    return {
        "status": "online",
        "database": db_status,
        "uptime_seconds": int(time.time() - SERVER_START_TIME),
        "service": "Quran Companion AI Backend",
        "version": "1.0.0"
    }


@router.get("/model/readiness")
def model_readiness():
    service = SpeechRecognitionService.get_instance()
    info = service.get_readiness_info()
    return {
        "status": "ready" if info["is_ready"] else "initializing",
        **info
    }
