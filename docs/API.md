# Quran Companion AI — API & WebSocket Protocol Contract

## 1. Base URL
- **REST API**: `http://localhost:8000/api/v1`
- **WebSocket Gateway**: `ws://localhost:8000/ws/recitation/{session_id}`

---

## 2. REST Endpoints

### Health & Diagnostics
#### `GET /health`
Returns database connectivity and server uptime.
```json
{
  "status": "online",
  "database": "healthy",
  "uptime_seconds": 120,
  "service": "Quran Companion AI Backend",
  "version": "1.0.0"
}
```

#### `GET /model/readiness`
Reports speech recognition engine and hardware status.
```json
{
  "status": "ready",
  "device": "cpu",
  "model_name": "tarteel-ai/whisper-base-ar-quran",
  "use_mock": false,
  "load_duration_seconds": 2.14
}
```

---

### Quran Reader
#### `GET /quran/surahs?q={optional_query}`
Returns catalog of 114 Surahs with metadata.

#### `GET /quran/surahs/{surah_number}`
Returns full Surah metadata and all authentic Uthmani verses.

#### `GET /quran/search?q={query}`
Full-text search across Quran Arabic text and English translations.

---

### Recitation Sessions & Mistakes
#### `POST /recitation/sessions`
Initializes a new recitation tracking session.
```json
// Request Body
{
  "surah_number": 1,
  "ayah_start": 1,
  "ayah_end": 7,
  "mode": "recite"
}

// Response (201 Created)
{
  "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "surah_number": 1,
  "ayah_start": 1,
  "ayah_end": 7,
  "mode": "recite",
  "status": "active"
}
```

#### `GET /recitation/sessions/{session_id}`
Retrieves session summary and all flagged mistakes.

#### `POST /recitation/sessions/{session_id}/stop`
Marks session completed and updates fluency statistics.

#### `PATCH /recitation/mistakes/{mistake_id}/review`
Marks mistake as reviewed or dismissed.

---

## 3. Real-Time WebSocket Protocol (`/ws/recitation/{session_id}`)

### Client-to-Server Messages

#### 1. Start Session
```json
{
  "type": "start_session",
  "surah_number": 1,
  "ayah_start": 1,
  "ayah_end": 7,
  "mode": "recite"
}
```

#### 2. Stream Audio Chunk (Base64 or Binary PCM)
```json
{
  "type": "audio_chunk",
  "sequence": 12,
  "data": "<base64_encoded_pcm_bytes>"
}
```
*Note: Direct binary WebSocket frames are automatically decoded as 16kHz 16-bit mono PCM.*

#### 3. Session Controls
- Pause: `{"type": "pause_session"}`
- Resume: `{"type": "resume_session"}`
- Stop: `{"type": "stop_session"}`
- Heartbeat: `{"type": "heartbeat", "timestamp": 1729000000}`

---

### Server-to-Client Messages

#### 1. Session Started Ack
```json
{
  "type": "session_started",
  "session_id": "...",
  "surah_number": 1,
  "current_ayah": 1,
  "expected_words": [
    { "position": 1, "text_uthmani": "بِسْمِ", "text_clean": "بسم" },
    { "position": 2, "text_uthmani": "ٱللَّهِ", "text_clean": "الله" }
  ]
}
```

#### 2. Word Alignment Event
Emitted in real-time as words are recognized and matched:
```json
{
  "type": "word_alignment",
  "surah_number": 1,
  "ayah_number": 1,
  "matched_positions": [1, 2],
  "current_word_index": 2,
  "confidence": 0.94,
  "is_verse_completed": false,
  "aligned_words": [
    { "position": 1, "text_uthmani": "بِسْمِ", "status": "matched", "similarity": 1.0 },
    { "position": 2, "text_uthmani": "ٱللَّهِ", "status": "matched", "similarity": 1.0 },
    { "position": 3, "text_uthmani": "ٱلرَّحْمَـٰنِ", "status": "pending", "similarity": 0.0 }
  ]
}
```

#### 3. Potential Mistake Event
```json
{
  "type": "possible_mistake",
  "surah_number": 1,
  "ayah_number": 2,
  "position": 3,
  "mistake_type": "omission",
  "expected_word": "رب",
  "expected_word_uthmani": "رَبِّ",
  "confidence": 0.85
}
```
