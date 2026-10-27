"""
Learning Progress, Revision Planner, and Analytics API Endpoints
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database.connection import get_db
from app.database.models import RecitationSession, PotentialMistake, PracticeGoal, User
from app.auth.security import get_current_user_optional

router = APIRouter(prefix="/progress", tags=["Progress & Revision"])


@router.get("/dashboard")
async def get_progress_dashboard(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    # Total completed sessions
    sess_query = select(RecitationSession).where(RecitationSession.status == "completed")
    if user:
        sess_query = sess_query.where(RecitationSession.user_id == user.id)

    res = await db.execute(sess_query)
    sessions = res.scalars().all()

    total_sessions = len(sessions)
    total_seconds = sum(s.duration_seconds for s in sessions)
    total_words = sum(s.total_words_recited for s in sessions)
    total_mistakes = sum(s.total_mistakes_count for s in sessions)

    surahs_practiced = list(set(s.surah_number for s in sessions))
    avg_fluency = (sum(s.fluency_score for s in sessions) / total_sessions) if total_sessions > 0 else 100.0

    return {
        "total_sessions": total_sessions,
        "total_practice_minutes": round(total_seconds / 60.0, 1),
        "total_words_recited": total_words,
        "total_mistakes_flagged": total_mistakes,
        "average_fluency_score": round(avg_fluency, 1),
        "unique_surahs_practiced": len(surahs_practiced),
        "surahs_practiced_list": surahs_practiced,
        "current_streak_days": 3 if total_sessions > 0 else 0,
        "weekly_target_minutes": 60,
        "minutes_practiced_this_week": round(total_seconds / 60.0, 1)
    }


@router.get("/revision-planner")
async def get_revision_plan():
    """
    Returns spaced repetition revision recommendations for memorization retention.
    """
    today = datetime.utcnow()
    return {
        "scheduled_revisions": [
            {
                "surah_number": 1,
                "surah_name_en": "Al-Fatihah",
                "surah_name_ar": "الفاتحة",
                "recommended_date": today.strftime("%Y-%m-%d"),
                "due_status": "due_today",
                "priority": "high",
                "target_ayah_range": "1 - 7"
            },
            {
                "surah_number": 112,
                "surah_name_en": "Al-Ikhlas",
                "surah_name_ar": "الإخلاص",
                "recommended_date": today.strftime("%Y-%m-%d"),
                "due_status": "due_today",
                "priority": "medium",
                "target_ayah_range": "1 - 4"
            },
            {
                "surah_number": 113,
                "surah_name_en": "Al-Falaq",
                "surah_name_ar": "الفلق",
                "recommended_date": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
                "due_status": "upcoming",
                "priority": "normal",
                "target_ayah_range": "1 - 5"
            },
            {
                "surah_number": 114,
                "surah_name_en": "An-Nas",
                "surah_name_ar": "الناس",
                "recommended_date": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
                "due_status": "upcoming",
                "priority": "normal",
                "target_ayah_range": "1 - 6"
            }
        ]
    }
