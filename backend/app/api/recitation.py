"""
Recitation Session & Mistake Review REST Endpoints
"""
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.connection import get_db
from app.database.models import RecitationSession, PotentialMistake, User
from app.auth.security import get_current_user_optional

router = APIRouter(prefix="/recitation", tags=["Recitation Sessions"])


class CreateSessionRequest(BaseModel):
    surah_number: int
    ayah_start: int = 1
    ayah_end: int = 7
    mode: str = "recite"  # "recite" | "memorize"


class StopSessionRequest(BaseModel):
    duration_seconds: int
    words_recited: int
    total_mistakes: int
    fluency_score: float


class ReviewMistakeRequest(BaseModel):
    is_reviewed: bool = True
    is_dismissed: bool = False


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(
    req: CreateSessionRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = str(uuid.uuid4())
    session = RecitationSession(
        id=session_id,
        user_id=user.id if user else None,
        surah_number=req.surah_number,
        ayah_start=req.ayah_start,
        ayah_end=req.ayah_end,
        mode=req.mode,
        status="active"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {
        "session_id": session.id,
        "surah_number": session.surah_number,
        "ayah_start": session.ayah_start,
        "ayah_end": session.ayah_end,
        "mode": session.mode,
        "status": session.status,
        "created_at": session.created_at
    }


@router.get("/sessions")
async def list_sessions(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(RecitationSession).order_by(desc(RecitationSession.created_at)).offset(offset).limit(limit)
    if user:
        query = query.where(RecitationSession.user_id == user.id)

    res = await db.execute(query)
    sessions = res.scalars().all()

    return [
        {
            "id": s.id,
            "surah_number": s.surah_number,
            "ayah_start": s.ayah_start,
            "ayah_end": s.ayah_end,
            "mode": s.mode,
            "status": s.status,
            "duration_seconds": s.duration_seconds,
            "fluency_score": s.fluency_score,
            "total_mistakes": s.total_mistakes_count,
            "created_at": s.created_at,
            "completed_at": s.completed_at
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(RecitationSession).where(RecitationSession.id == session_id))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Recitation session not found")

    # Fetch potential mistakes for this session
    m_res = await db.execute(select(PotentialMistake).where(PotentialMistake.session_id == session_id))
    mistakes = m_res.scalars().all()

    return {
        "id": s.id,
        "surah_number": s.surah_number,
        "ayah_start": s.ayah_start,
        "ayah_end": s.ayah_end,
        "mode": s.mode,
        "status": s.status,
        "duration_seconds": s.duration_seconds,
        "total_words_recited": s.total_words_recited,
        "total_mistakes_count": s.total_mistakes_count,
        "fluency_score": s.fluency_score,
        "created_at": s.created_at,
        "completed_at": s.completed_at,
        "mistakes": [
            {
                "id": m.id,
                "surah_number": m.surah_number,
                "ayah_number": m.ayah_number,
                "position": m.position,
                "mistake_type": m.mistake_type,
                "expected_word": m.expected_word,
                "expected_word_uthmani": m.expected_word_uthmani,
                "recited_word": m.recited_word,
                "confidence": m.confidence,
                "is_reviewed": m.is_reviewed,
                "is_dismissed": m.is_dismissed
            }
            for m in mistakes
        ]
    }


@router.post("/sessions/{session_id}/stop")
async def stop_session(
    session_id: str,
    req: StopSessionRequest,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(RecitationSession).where(RecitationSession.id == session_id))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Recitation session not found")

    s.status = "completed"
    s.duration_seconds = req.duration_seconds
    s.total_words_recited = req.words_recited
    s.total_mistakes_count = req.total_mistakes
    s.fluency_score = req.fluency_score
    s.completed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(s)

    return {"message": "Session completed successfully", "session_id": s.id}


@router.get("/sessions/{session_id}/mistakes")
async def list_session_mistakes(session_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PotentialMistake).where(PotentialMistake.session_id == session_id))
    mistakes = res.scalars().all()
    return mistakes


@router.patch("/mistakes/{mistake_id}/review")
async def review_mistake(
    mistake_id: str,
    req: ReviewMistakeRequest,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(PotentialMistake).where(PotentialMistake.id == mistake_id))
    m = res.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Mistake entry not found")

    m.is_reviewed = req.is_reviewed
    m.is_dismissed = req.is_dismissed
    await db.commit()

    return {"message": "Mistake status updated", "id": m.id, "is_reviewed": m.is_reviewed, "is_dismissed": m.is_dismissed}
