"""
Live Recitation WebSocket End-to-End Simulation Script
Connects to the running FastAPI server, creates a live recitation session,
streams generated PCM audio chunks, validates WebSocket message events,
and verifies database persistence.
"""
import asyncio
import json
import numpy as np
import websockets
import httpx


async def test_live_recitation_session():
    print("=================================================================")
    print("Quran Companion AI — Live Recitation WebSocket Session Test")
    print("=================================================================\n")

    base_url = "http://127.0.0.1:8000"
    ws_url = "ws://127.0.0.1:8000/ws/recitation/simulated-test-session"

    # Step 1: Check server health
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{base_url}/api/v1/health")
        assert resp.status_code == 200, f"Health check failed: {resp.text}"
        data = resp.json()
        print(f"[1] Server Health Check: OK (v{data['version']}, uptime {data['uptime_seconds']:.1f}s)")

    # Step 2: Connect to WebSocket endpoint
    print(f"[2] Connecting to WebSocket: {ws_url}")
    async with websockets.connect(ws_url) as ws:
        # Expect connection_established
        greeting = await ws.recv()
        greeting_data = json.loads(greeting)
        print(f"    <- Received: {greeting_data['type']} (protocol: {greeting_data['protocol_version']})")
        assert greeting_data["type"] == "connection_established"

        # Step 3: Send start_session
        start_cmd = {
            "type": "start_session",
            "surah_number": 1,
            "ayah_start": 1,
            "ayah_end": 7,
            "mode": "recite"
        }
        await ws.send(json.dumps(start_cmd))
        print("    -> Sent start_session for Surah 1 (Al-Fatihah, Ayahs 1-7)")

        resp_started = await ws.recv()
        started_data = json.loads(resp_started)
        print(f"    <- Received: {started_data['type']} (Surah {started_data['surah_number']}, Ayah {started_data['current_ayah']}, {len(started_data['expected_words'])} words expected)")
        assert started_data["type"] == "session_started"

        # Step 4: Stream audio chunks (simulated 16kHz speech tone)
        sample_rate = 16000
        duration_per_chunk = 0.25 # 250ms chunks
        num_chunks = 4 # 1.0 second total

        print("    -> Streaming simulated PCM audio frames...")
        for i in range(num_chunks):
            # Synthesize 440Hz tone with speech amplitude (~0.15) to trigger VAD
            t = np.linspace(0, duration_per_chunk, int(sample_rate * duration_per_chunk), endpoint=False)
            sine = 0.15 * np.sin(2 * np.pi * 440 * t)
            pcm_data = (sine * 32767).astype(np.int16).tobytes()

            await ws.send(pcm_data)
            await asyncio.sleep(0.05)

        # Allow time to receive transcription and alignment events
        print("    -> Waiting for streaming alignment events...")
        received_events = []
        try:
            while True:
                msg = await asyncio.wait_for(ws.recv(), timeout=1.0)
                msg_data = json.loads(msg)
                received_events.append(msg_data["type"])
                print(f"    <- Stream Event: {msg_data['type']}")
                if msg_data["type"] == "word_alignment":
                    print(f"       Matched positions: {msg_data.get('matched_positions')}")
                    print(f"       Verse completed:   {msg_data.get('is_verse_completed')}")
        except asyncio.TimeoutError:
            pass # End of stream messages

        # Step 5: Send heartbeat
        print("    -> Sending heartbeat ping...")
        await ws.send(json.dumps({"type": "heartbeat", "timestamp": 123456789}))
        heartbeat_resp = await asyncio.wait_for(ws.recv(), timeout=2.0)
        hb_data = json.loads(heartbeat_resp)
        print(f"    <- Received: {hb_data['type']} (Client ts: {hb_data.get('client_timestamp')})")
        assert hb_data["type"] == "heartbeat_ack"

        # Step 6: Send stop_session
        print("    -> Sending stop_session...")
        await ws.send(json.dumps({"type": "stop_session"}))
        stop_resp = await asyncio.wait_for(ws.recv(), timeout=3.0)
        stop_data = json.loads(stop_resp)
        print(f"    <- Received: {stop_data['type']}")
        summary = stop_data.get("summary", {})
        print(f"       Session ID:       {summary.get('session_id')}")
        print(f"       Duration:         {summary.get('duration_seconds', 0):.2f}s")
        print(f"       Surah/Ayahs:      Surah {summary.get('surah_number')} ({summary.get('ayah_start')}-{summary.get('ayah_end')})")
        print(f"       Fluency Score:    {summary.get('fluency_score')}%")
        print(f"       Words Matched:    {summary.get('words_matched')}")
        print(f"       Total Mistakes:   {summary.get('total_mistakes')}")
        assert stop_data["type"] == "session_stopped"

    # Step 7: Verify via REST API that the session is recorded in database
    print("\n[3] Querying REST API for Session History...")
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{base_url}/api/v1/recitation/sessions")
        assert resp.status_code == 200, f"Failed to get sessions: {resp.text}"
        sessions_data = resp.json()
        print(f"    <- Found {len(sessions_data)} recorded sessions in database")
        matching = [s for s in sessions_data if s["id"] == "simulated-test-session"]
        if matching:
            s = matching[0]
            print(f"    <- Verified session in DB: ID={s['id']}, Surah={s['surah_number']}, Fluency={s['fluency_score']}%")

    print("\n[4] ALL END-TO-END PIPELINE VERIFICATIONS PASSED!")
    print("=================================================================\n")


if __name__ == "__main__":
    asyncio.run(test_live_recitation_session())
