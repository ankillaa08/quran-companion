"""
SQLAlchemy 2.x Declarative Models for Quran Companion AI
"""
from datetime import datetime
from typing import Optional, List
import uuid
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    sessions: Mapped[List["RecitationSession"]] = relationship("RecitationSession", back_populates="user", cascade="all, delete-orphan")
    preferences: Mapped[Optional["UserPreference"]] = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookmarks: Mapped[List["Bookmark"]] = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    goals: Mapped[Optional["PracticeGoal"]] = relationship("PracticeGoal", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True)
    arabic_font_size: Mapped[int] = mapped_column(Integer, default=26)
    show_translation: Mapped[bool] = mapped_column(Boolean, default=True)
    retain_audio_snippets: Mapped[bool] = mapped_column(Boolean, default=False)  # Privacy default
    theme: Mapped[str] = mapped_column(String(20), default="dark")  # "dark" or "light"
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="preferences")


class RecitationSession(Base):
    __tablename__ = "recitation_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    surah_number: Mapped[int] = mapped_column(Integer, nullable=False)
    ayah_start: Mapped[int] = mapped_column(Integer, default=1)
    ayah_end: Mapped[int] = mapped_column(Integer, default=1)
    mode: Mapped[str] = mapped_column(String(30), default="recite")  # "recite" | "memorize" | "review"
    status: Mapped[str] = mapped_column(String(30), default="active")  # "active" | "paused" | "completed"
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    total_words_recited: Mapped[int] = mapped_column(Integer, default=0)
    total_mistakes_count: Mapped[int] = mapped_column(Integer, default=0)
    fluency_score: Mapped[float] = mapped_column(Float, default=100.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="sessions")
    mistakes: Mapped[List["PotentialMistake"]] = relationship("PotentialMistake", back_populates="session", cascade="all, delete-orphan")
    results: Mapped[List["RecognitionResult"]] = relationship("RecognitionResult", back_populates="session", cascade="all, delete-orphan")


class PotentialMistake(Base):
    __tablename__ = "potential_mistakes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("recitation_sessions.id"))
    surah_number: Mapped[int] = mapped_column(Integer, nullable=False)
    ayah_number: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=1)
    mistake_type: Mapped[str] = mapped_column(String(30), nullable=False)  # omission, substitution, repetition, insertion
    expected_word: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    expected_word_uthmani: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    recited_word: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.8)
    is_reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["RecitationSession"] = relationship("RecitationSession", back_populates="mistakes")


class RecognitionResult(Base):
    __tablename__ = "recognition_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("recitation_sessions.id"))
    sequence_num: Mapped[int] = mapped_column(Integer, default=1)
    transcript_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["RecitationSession"] = relationship("RecitationSession", back_populates="results")


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    surah_number: Mapped[int] = mapped_column(Integer, nullable=False)
    ayah_number: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="bookmarks")


class PracticeGoal(Base):
    __tablename__ = "practice_goals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True)
    daily_target_minutes: Mapped[int] = mapped_column(Integer, default=15)
    weekly_target_surahs: Mapped[int] = mapped_column(Integer, default=3)
    current_streak_days: Mapped[int] = mapped_column(Integer, default=1)
    last_practice_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="goals")


class RevisionSchedule(Base):
    __tablename__ = "revision_schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    surah_number: Mapped[int] = mapped_column(Integer, nullable=False)
    interval_days: Mapped[int] = mapped_column(Integer, default=3)
    next_review_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
