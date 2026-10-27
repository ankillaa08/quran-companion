"""
WebSocket Connection Manager for Live Recitation Sessions
Tracks active connections, session buffers, and handles broadcasting.
"""
import logging
from typing import Dict, Any, Optional
from fastapi import WebSocket
from app.ai.audio_buffer import AudioBuffer
from app.alignment.aligner import QuranWordAligner
from app.alignment.verse_matcher import VerseMatcher
from app.data.verses import get_ayah, get_surah_ayahs

logger = logging.getLogger("quran_companion.streaming")


class ActiveRecitationSession:
    def __init__(self, session_id: str, websocket: WebSocket):
        self.session_id = session_id
        self.websocket = websocket
        self.surah_number: int = 1
        self.current_ayah_number: int = 1
        self.ayah_start: int = 1
        self.ayah_end: int = 7
        self.mode: str = "recite"  # "recite" | "memorize"
        self.is_paused: bool = False
        self.audio_buffer = AudioBuffer()
        self.aligner = QuranWordAligner()
        self.verse_matcher = VerseMatcher()
        self.sequence_counter: int = 0
        self.words_matched_total: int = 0
        self.mistakes_accumulated: list = []
        self.accumulated_text: str = ""
        self.start_timestamp: float = 0.0

    def get_current_expected_words(self) -> list:
        ayah_data = get_ayah(self.surah_number, self.current_ayah_number)
        if ayah_data and "words" in ayah_data:
            return ayah_data["words"]
        return []


class ConnectionManager:
    def __init__(self):
        self.active_sessions: Dict[str, ActiveRecitationSession] = {}

    async def connect(self, session_id: str, websocket: WebSocket) -> ActiveRecitationSession:
        await websocket.accept()
        session = ActiveRecitationSession(session_id, websocket)
        self.active_sessions[session_id] = session
        logger.info(f"WebSocket connected for recitation session: {session_id}")
        return session

    def disconnect(self, session_id: str):
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            logger.info(f"WebSocket session disconnected: {session_id}")

    def get_session(self, session_id: str) -> Optional[ActiveRecitationSession]:
        return self.active_sessions.get(session_id)


ws_manager = ConnectionManager()
