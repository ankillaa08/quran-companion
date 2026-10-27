"""
WebSocket Recitation Streaming Integration Tests
"""
import pytest
from starlette.testclient import TestClient
from app.main import app


def test_recitation_websocket_lifecycle():
    client = TestClient(app)
    session_id = "test-ws-session-123"

    with client.websocket_connect(f"/ws/recitation/{session_id}") as websocket:
        # 1. Receive connection established ack
        data = websocket.receive_json()
        assert data["type"] == "connection_established"
        assert data["session_id"] == session_id

        # 2. Send start session
        websocket.send_json({
            "type": "start_session",
            "surah_number": 1,
            "ayah_start": 1,
            "ayah_end": 7,
            "mode": "recite"
        })

        started_data = websocket.receive_json()
        assert started_data["type"] == "session_started"
        assert started_data["surah_number"] == 1
        assert len(started_data["expected_words"]) == 4  # Surah 1: Ayah 1 has 4 words

        # 3. Heartbeat test
        websocket.send_json({
            "type": "heartbeat",
            "timestamp": 1234567.89
        })
        hb_data = websocket.receive_json()
        assert hb_data["type"] == "heartbeat_ack"

        # 4. Stop session
        websocket.send_json({"type": "stop_session"})
        stop_data = websocket.receive_json()
        assert stop_data["type"] == "session_stopped"
        assert "summary" in stop_data
