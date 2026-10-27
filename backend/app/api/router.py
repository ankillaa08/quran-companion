"""
API Router Aggregation (v1)
"""
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.quran import router as quran_router
from app.api.recitation import router as recitation_router
from app.api.progress import router as progress_router
from app.api.health import router as health_router
from app.api.bookmarks import router as bookmarks_router
from app.api.goals import router as goals_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(quran_router)
api_v1_router.include_router(recitation_router)
api_v1_router.include_router(progress_router)
api_v1_router.include_router(bookmarks_router)
api_v1_router.include_router(goals_router)
