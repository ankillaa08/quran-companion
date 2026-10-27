"""
End-to-End Neon PostgreSQL Verification Script
Tests schema creation, connectivity, and transactional CRUD on Neon.
"""
import sys
import os
import asyncio

# Ensure project root and backend are in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
sys.path.insert(0, os.path.join(root_dir, "backend"))

from app.database.connection import init_db, check_db_health, AsyncSessionLocal, NORMALIZED_URL
from app.database.models import User, RecitationSession
from sqlalchemy import select, delete

async def main():
    print("==================================================")
    print("      Neon PostgreSQL End-to-End Verification     ")
    print("==================================================")
    
    # 1. Health check
    health = await check_db_health()
    print(f"[1/4] Checking Database Health: {health}")
    if health["status"] != "healthy":
        print(f"FAILED: DB is unhealthy: {health.get('error')}")
        sys.exit(1)
        
    # 2. Schema Synchronization
    print("[2/4] Synchronizing SQLAlchemy schema tables on Neon...")
    await init_db()
    print("SUCCESS: Tables verified/created on Neon.")

    # 3. Transactional Write Test
    print("[3/4] Testing transactional write to Neon...")
    test_email = "neon_test_user@qurancompanion.ai"
    async with AsyncSessionLocal() as session:
        # Clean existing test user if present
        await session.execute(delete(User).where(User.email == test_email))
        await session.commit()

        # Insert test user
        user = User(
            email=test_email,
            hashed_password="test_hashed_password_for_verification",
            full_name="Neon Test Runner",
            is_active=True
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"SUCCESS: Inserted User record with ID: {user.id}")

        # Insert test recitation session
        rec_session = RecitationSession(
            id=f"neon-test-{user.id[:8]}",
            user_id=user.id,
            surah_number=1,
            ayah_start=1,
            ayah_end=7,
            mode="recite",
            status="completed",
            duration_seconds=45,
            total_words_recited=29,
            total_mistakes_count=0,
            fluency_score=100.0
        )
        session.add(rec_session)
        await session.commit()
        print(f"SUCCESS: Inserted RecitationSession record with ID: {rec_session.id}")

    # 4. Transactional Read & Verification Test
    print("[4/4] Testing transactional read and cleanup from Neon...")
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.email == test_email))
        fetched_user = res.scalar_one_or_none()
        assert fetched_user is not None, "User could not be retrieved from Neon!"
        print(f"SUCCESS: Retrieved user {fetched_user.email} (name: {fetched_user.full_name}) from Neon!")

        res_sess = await session.execute(select(RecitationSession).where(RecitationSession.user_id == fetched_user.id))
        fetched_sess = res_sess.scalar_one_or_none()
        assert fetched_sess is not None, "Recitation session could not be retrieved from Neon!"
        print(f"SUCCESS: Retrieved session {fetched_sess.id} (Surah {fetched_sess.surah_number}, Fluency {fetched_sess.fluency_score}%) from Neon!")

        # Clean up test rows
        await session.execute(delete(RecitationSession).where(RecitationSession.id == fetched_sess.id))
        await session.execute(delete(User).where(User.id == fetched_user.id))
        await session.commit()
        print("SUCCESS: Test records cleaned up successfully.")

    print("\n==================================================")
    print("  ALL NEON POSTGRESQL END-TO-END TESTS PASSED!   ")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
