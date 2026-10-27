"""
WebSocket Endpoint & Real-Time Recitation Pipeline
Handles /ws/recitation/{session_id} for streaming audio, speech recognition,
live word alignment, mistake detection, and verse advancement.
"""
import time
import base64
import json
import logging
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.streaming.ws_manager import ws_manager, ActiveRecitationSession
from app.ai.model_service import SpeechRecognitionService
from app.database.connection import AsyncSessionLocal
from app.database.models import RecitationSession, PotentialMistake, RecognitionResult
from sqlalchemy import select, update

logger = logging.getLogger("quran_companion.streaming")
router = APIRouter()


@router.websocket("/ws/recitation/{session_id}")
async def recitation_websocket_endpoint(websocket: WebSocket, session_id: str):
    session = await ws_manager.connect(session_id, websocket)
    speech_service = SpeechRecognitionService.get_instance()
    session.start_timestamp = time.time()

    try:
        # Acknowledge connection
        await websocket.send_json({
            "type": "connection_established",
            "session_id": session_id,
            "timestamp": time.time(),
            "protocol_version": "1.0"
        })

        while True:
            # Receive text or binary message
            message = await websocket.receive()

            if "bytes" in message and message["bytes"]:
                # Binary audio chunk (16kHz 16-bit PCM)
                if not session.is_paused:
                    await handle_audio_bytes(session, speech_service, message["bytes"])
                continue

            if "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                except Exception:
                    await websocket.send_json({"type": "error", "message": "Invalid JSON payload"})
                    continue

                msg_type = payload.get("type")

                if msg_type == "start_session":
                    session.surah_number = int(payload.get("surah_number", 1))
                    session.ayah_start = int(payload.get("ayah_start", 1))
                    session.ayah_end = int(payload.get("ayah_end", 7))
                    session.current_ayah_number = session.ayah_start
                    session.mode = payload.get("mode", "recite")
                    session.is_paused = False
                    session.audio_buffer.clear()
                    session.words_matched_total = 0
                    session.mistakes_accumulated.clear()
                    session.accumulated_text = ""

                    await websocket.send_json({
                        "type": "session_started",
                        "session_id": session_id,
                        "surah_number": session.surah_number,
                        "current_ayah": session.current_ayah_number,
                        "ayah_start": session.ayah_start,
                        "ayah_end": session.ayah_end,
                        "mode": session.mode,
                        "expected_words": session.get_current_expected_words()
                    })

                elif msg_type == "audio_chunk":
                    if not session.is_paused:
                        # Base64 audio payload
                        raw_b64 = payload.get("data", "")
                        seq = payload.get("sequence", 0)
                        session.sequence_counter = seq
                        try:
                            pcm_bytes = base64.b64decode(raw_b64)
                            await handle_audio_bytes(session, speech_service, pcm_bytes)
                        except Exception as e:
                            logger.error(f"Error decoding base64 audio: {e}")

                elif msg_type == "pause_session":
                    session.is_paused = True
                    await websocket.send_json({"type": "session_paused", "session_id": session_id})

                elif msg_type == "resume_session":
                    session.is_paused = False
                    await websocket.send_json({"type": "session_resumed", "session_id": session_id})

                elif msg_type == "set_ayah":
                    new_ayah = int(payload.get("ayah_number", session.current_ayah_number))
                    session.current_ayah_number = new_ayah
                    await websocket.send_json({
                        "type": "ayah_changed",
                        "surah_number": session.surah_number,
                        "current_ayah": session.current_ayah_number,
                        "expected_words": session.get_current_expected_words()
                    })

                elif msg_type == "stop_session":
                    summary = await finalize_session(session)
                    await websocket.send_json({
                        "type": "session_stopped",
                        "session_id": session_id,
                        "summary": summary
                    })
                    break

                elif msg_type == "heartbeat":
                    await websocket.send_json({
                        "type": "heartbeat_ack",
                        "client_timestamp": payload.get("timestamp"),
                        "server_timestamp": time.time()
                    })

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for session: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket session error: {e}", exc_info=True)
    finally:
        ws_manager.disconnect(session_id)


async def handle_audio_bytes(
    session: ActiveRecitationSession,
    speech_service: SpeechRecognitionService,
    pcm_bytes: bytes
):
    """Processes an audio chunk, runs VAD, and performs speech recognition + alignment."""
    # Enforce reasonable chunk limit (max 512KB per incoming packet) to guard memory
    if len(pcm_bytes) > 512 * 1024:
        logger.warning(f"Audio chunk exceeded size limit ({len(pcm_bytes)} bytes). Dropping.")
        return

    session.audio_buffer.append_pcm_bytes(pcm_bytes)

    # Check if buffered audio is sufficient for inference (at least 0.8 seconds)
    if session.audio_buffer.get_duration_seconds() < 0.8:
        return

    # Check Voice Activity Detection
    if not session.audio_buffer.is_speech_active():
        return

    # Extract audio window for inference (3.0s window)
    audio_data = session.audio_buffer.get_recent_audio(duration_seconds=3.0)
    
    # Run CPU-bound speech recognition in a separate worker thread
    res = await asyncio.to_thread(speech_service.transcribe, audio_data)
    recognized_text = res.get("text", "").strip()

    if not recognized_text:
        return

    # Send partial transcript update
    await session.websocket.send_json({
        "type": "partial_transcript",
        "sequence": session.sequence_counter,
        "text": recognized_text,
        "confidence": res.get("confidence", 0.0)
    })

    # Run Quran text alignment in worker thread against current expected verse
    expected_words = session.get_current_expected_words()
    alignment = await asyncio.to_thread(
        session.aligner.align_verse,
        expected_words=expected_words,
        recognized_text=recognized_text
    )

    # Send word alignment update
    await session.websocket.send_json({
        "type": "word_alignment",
        "surah_number": session.surah_number,
        "ayah_number": session.current_ayah_number,
        "matched_positions": alignment["matched_positions"],
        "current_word_index": alignment["current_word_index"],
        "aligned_words": alignment["aligned_words"],
        "confidence": alignment["confidence"],
        "is_verse_completed": alignment["is_verse_completed"]
    })

    # Emit mistakes if newly detected
    for mistake in alignment["mistakes"]:
        mistake_entry = {
            "session_id": session.session_id,
            "surah_number": session.surah_number,
            "ayah_number": session.current_ayah_number,
            "position": mistake.get("position", 1),
            "mistake_type": mistake["type"],
            "expected_word": mistake.get("expected_word"),
            "expected_word_uthmani": mistake.get("expected_word_uthmani"),
            "recited_word": mistake.get("recited_word"),
            "confidence": mistake["confidence"]
        }
        session.mistakes_accumulated.append(mistake_entry)
        await session.websocket.send_json({
            "type": "possible_mistake",
            **mistake_entry
        })

    # Check if verse is completed or reciter transitioned to next ayah
    if alignment["is_verse_completed"]:
        session.words_matched_total += len(alignment["matched_positions"])
        if session.current_ayah_number < session.ayah_end:
            session.current_ayah_number += 1
            session.audio_buffer.clear()
            await session.websocket.send_json({
                "type": "verse_transitioned",
                "surah_number": session.surah_number,
                "current_ayah": session.current_ayah_number,
                "expected_words": session.get_current_expected_words()
            })
    else:
        # Check if user recited next ayah directly
        transitioned_ayah = session.verse_matcher.check_next_ayah_transition(
            current_surah=session.surah_number,
            current_ayah=session.current_ayah_number,
            recognized_text=recognized_text
        )
        if transitioned_ayah and transitioned_ayah <= session.ayah_end:
            session.current_ayah_number = transitioned_ayah
            session.audio_buffer.clear()
            await session.websocket.send_json({
                "type": "verse_transitioned",
                "surah_number": session.surah_number,
                "current_ayah": session.current_ayah_number,
                "expected_words": session.get_current_expected_words()
            })


async def finalize_session(session: ActiveRecitationSession) -> dict:
    """Calculates session duration, fluency score, and records results into database."""
    duration = int(time.time() - session.start_timestamp) if session.start_timestamp > 0 else 0
    mistakes_count = len(session.mistakes_accumulated)
    total_words = max(session.words_matched_total, 1)
    
    # Calculate fluency score (penalizes mistakes proportionally to words)
    fluency = max(0.0, min(100.0, 100.0 - (mistakes_count * 5.0)))

    summary = {
        "session_id": session.session_id,
        "surah_number": session.surah_number,
        "ayah_start": session.ayah_start,
        "ayah_end": session.current_ayah_number,
        "duration_seconds": duration,
        "words_matched": total_words,
        "total_mistakes": mistakes_count,
        "fluency_score": round(fluency, 1)
    }

    try:
        async with AsyncSessionLocal() as db:
            # Check if session exists in DB, update or create
            res = await db.execute(select(RecitationSession).where(RecitationSession.id == session.session_id))
            db_session = res.scalar_one_or_none()
            if db_session:
                db_session.status = "completed"
                db_session.duration_seconds = duration
                db_session.total_words_recited = total_words
                db_session.total_mistakes_count = mistakes_count
                db_session.fluency_score = fluency
            else:
                db_session = RecitationSession(
                    id=session.session_id,
                    surah_number=session.surah_number,
                    ayah_start=session.ayah_start,
                    ayah_end=session.current_ayah_number,
                    mode=session.mode,
                    status="completed",
                    duration_seconds=duration,
                    total_words_recited=total_words,
                    total_mistakes_count=mistakes_count,
                    fluency_score=fluency
                )
                db.add(db_session)

            # Record potential mistakes
            for m in session.mistakes_accumulated:
                pm = PotentialMistake(
                    session_id=session.session_id,
                    surah_number=m["surah_number"],
                    ayah_number=m["ayah_number"],
                    position=m.get("position", 1),
                    mistake_type=m["mistake_type"],
                    expected_word=m.get("expected_word"),
                    expected_word_uthmani=m.get("expected_word_uthmani"),
                    recited_word=m.get("recited_word"),
                    confidence=m.get("confidence", 0.8)
                )
                db.add(pm)

            await db.commit()
    except Exception as e:
        logger.error(f"Error persisting session to DB: {e}")

    return summary
