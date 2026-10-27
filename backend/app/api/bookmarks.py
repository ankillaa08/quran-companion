"""
Quran Bookmarks API Endpoints
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.connection import get_db
from app.database.models import Bookmark, User
from app.auth.security import get_current_user_optional

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


class CreateBookmarkRequest(BaseModel):
    surah_number: int
    ayah_number: int
    note: Optional[str] = None


@router.get("")
async def list_bookmarks(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(Bookmark)
    if user:
        query = query.where(Bookmark.user_id == user.id)

    res = await db.execute(query)
    bookmarks = res.scalars().all()
    return bookmarks


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    req: CreateBookmarkRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = user.id if user else "guest-user"
    bookmark = Bookmark(
        id=str(uuid.uuid4()),
        user_id=user_id,
        surah_number=req.surah_number,
        ayah_number=req.ayah_number,
        note=req.note
    )
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)
    return bookmark


@router.delete("/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Bookmark).where(Bookmark.id == bookmark_id))
    b = res.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    await db.delete(b)
    await db.commit()
    return {"message": "Bookmark removed successfully"}
