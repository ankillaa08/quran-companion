"""
Practice Goals & Habits API Endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.connection import get_db
from app.database.models import PracticeGoal, User
from app.auth.security import get_current_user_optional

router = APIRouter(prefix="/goals", tags=["Practice Goals"])


class UpdateGoalRequest(BaseModel):
    daily_target_minutes: int
    weekly_target_surahs: int


@router.get("")
async def get_practice_goals(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = user.id if user else "guest-user"
    res = await db.execute(select(PracticeGoal).where(PracticeGoal.user_id == user_id))
    goal = res.scalar_one_or_none()

    if not goal:
        return {
            "daily_target_minutes": 15,
            "weekly_target_surahs": 3,
            "current_streak_days": 3,
            "user_id": user_id
        }

    return {
        "daily_target_minutes": goal.daily_target_minutes,
        "weekly_target_surahs": goal.weekly_target_surahs,
        "current_streak_days": goal.current_streak_days,
        "user_id": goal.user_id
    }


@router.put("")
async def update_practice_goals(
    req: UpdateGoalRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = user.id if user else "guest-user"
    res = await db.execute(select(PracticeGoal).where(PracticeGoal.user_id == user_id))
    goal = res.scalar_one_or_none()

    if not goal:
        goal = PracticeGoal(
            user_id=user_id,
            daily_target_minutes=req.daily_target_minutes,
            weekly_target_surahs=req.weekly_target_surahs
        )
        db.add(goal)
    else:
        goal.daily_target_minutes = req.daily_target_minutes
        goal.weekly_target_surahs = req.weekly_target_surahs

    await db.commit()
    return {"message": "Practice goals updated", "daily_target_minutes": goal.daily_target_minutes}
