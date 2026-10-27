"""
Integration Tests for REST API Endpoints
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.connection import init_db


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "database" in data


@pytest.mark.asyncio
async def test_root_health_and_ready():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test /health
        res_h = await client.get("/health")
        assert res_h.status_code == 200
        data_h = res_h.json()
        assert data_h["status"] == "healthy"
        assert "database" in data_h

        # Test /ready
        res_r = await client.get("/ready")
        assert res_r.status_code == 200
        data_r = res_r.json()
        assert data_r["status"] == "ready"
        assert "ai_model" in data_r



@pytest.mark.asyncio
async def test_model_readiness_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/model/readiness")
        assert response.status_code == 200
        data = response.json()
        assert "is_ready" in data
        assert "device" in data


@pytest.mark.asyncio
async def test_surahs_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/quran/surahs")
        assert response.status_code == 200
        surahs = response.json()
        assert len(surahs) == 114
        assert surahs[0]["name_en"] == "Al-Fatihah"
        assert surahs[113]["name_en"] == "An-Nas"


@pytest.mark.asyncio
async def test_surah_detail():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/quran/surahs/1")
        assert response.status_code == 200
        data = response.json()
        assert data["metadata"]["number"] == 1
        assert len(data["ayahs"]) == 7


@pytest.mark.asyncio
async def test_quran_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/quran/search?q=الرحمن")
        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 1


@pytest.mark.asyncio
async def test_session_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Create recitation session
        create_res = await client.post(
            "/api/v1/recitation/sessions",
            json={"surah_number": 1, "ayah_start": 1, "ayah_end": 7, "mode": "recite"}
        )
        assert create_res.status_code == 201
        sess_data = create_res.json()
        session_id = sess_data["session_id"]
        assert session_id is not None

        # 2. Retrieve session
        get_res = await client.get(f"/api/v1/recitation/sessions/{session_id}")
        assert get_res.status_code == 200
        assert get_res.json()["surah_number"] == 1

        # 3. Stop session
        stop_res = await client.post(
            f"/api/v1/recitation/sessions/{session_id}/stop",
            json={
                "duration_seconds": 45,
                "words_recited": 29,
                "total_mistakes": 1,
                "fluency_score": 95.0
            }
        )
        assert stop_res.status_code == 200

        # 4. Check completed session
        completed_res = await client.get(f"/api/v1/recitation/sessions/{session_id}")
        assert completed_res.json()["status"] == "completed"
        assert completed_res.json()["duration_seconds"] == 45
