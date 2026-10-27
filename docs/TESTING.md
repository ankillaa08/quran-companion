# Quran Companion AI — Testing & Verification Strategy

## 1. Test Suite Architecture
The test suite validates every critical layer of the stack:

1. **Arabic Normalization (`backend/tests/test_normalizer.py`)**:
   - Diacritic stripping (fatha, damma, kasra, sukun, shaddah, tanween).
   - Quranic pause marks removal (`ۖ`, `ۗ`, `ۚ`, `ۛ`, `ۜ`, `۞`).
   - Alif variants normalization (`[أ, إ, آ, ٱ]` $\rightarrow$ `ا`).
   - Arabic tokenization and whitespace compaction.

2. **Word Alignment & Mistakes (`backend/tests/test_aligner.py`)**:
   - Exact recitation word match ($100\%$ confidence).
   - Streaming partial alignment (first $N$ words of verse).
   - Omission detection (identifies skipped word position).
   - Substitution detection (identifies replaced word).
   - Repetition detection (identifies re-read word).

3. **REST API Endpoints (`backend/tests/test_api.py`)**:
   - Health check and model readiness reporting.
   - 114 Surahs catalog and verse detail retrieval.
   - Full-text Arabic and English translation search.
   - Recitation session lifecycle (create, retrieve, stop).

4. **WebSocket Recitation Protocol (`backend/tests/test_websocket.py`)**:
   - Client connection and handshake ack.
   - `start_session` configuration frame.
   - Heartbeat ping-pong.
   - `stop_session` summary event.

---

## 2. Running Automated Tests

Run backend tests using pytest:
```bash
# Run all tests
.venv/bin/pytest backend/tests -v

# Run with coverage report
.venv/bin/pytest backend/tests --cov=app --cov-report=term-missing
```
