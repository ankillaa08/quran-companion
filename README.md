# Quran Companion AI — Real-Time Quran Recitation & Progress App

> An open-architecture, production-grade mobile application inspired by Tarteel AI, combining real-time speech recognition for Quranic Arabic with word-by-word dynamic highlighting, memorization mistake detection, and spaced repetition revision planning.

---

## 🌟 Key Features

1. **Arabic Quran Reader (RTL)**
   - Complete directory of 114 Surahs with authentic Tanzil Medina Mushaf text.
   - Elegant Arabic typography with full diacritics (harakat/tashkeel), verse markers, and English translations.
   - Dynamic Arabic font-size slider and offline reading support.

2. **Real-Time AI Recitation Following**
   - Live microphone streaming via native `expo-av` and WebSockets (`/ws/recitation/{session_id}`).
   - Quran-adapted Whisper model (`tarteel-ai/whisper-base-ar-quran`) running with rolling audio buffers.
   - Dynamic word highlighting in emerald green as the reciter speaks, with a gold focus halo for active words.

3. **Memorization (Hifz) Mistake Detection**
   - Sequence-based phonetic alignment detecting omissions (skipped words), substitutions, repetitions, and insertions.
   - Interactive mistake review screen for self-correction.
   - **Hifz Mode**: Masks upcoming words so you can test your memory, revealing them upon correct recitation.

4. **Learning Analytics & Revision Planner**
   - Daily practice streak counter, total minutes recited, and fluency accuracy metrics.
   - Spaced repetition revision planner displaying due-today and upcoming Surah targets.

5. **Sacred Audio Privacy**
   - Zero raw audio retention by default: voice audio is processed exclusively in transient RAM buffers and purged immediately.

---

## 🏗️ Project Architecture

```
Quran/
├── mobile/                  # React Native + Expo TypeScript Mobile Application
│   ├── app/                 # Expo Router file-based screens
│   │   ├── (tabs)/          # Home, Reader, Recite, Hifz, Progress tabs
│   │   ├── recitation/      # Summary & Mistake review screens
│   │   └── settings/        # Privacy & System diagnostics
│   └── src/                 # WordHighlighter, AudioVisualizer, WebSocket client, Stores
│
├── backend/                 # Python 3.10+ FastAPI AI Service
│   ├── app/
│   │   ├── ai/              # AudioBuffer, VAD, Whisper Speech Service
│   │   ├── alignment/       # ArabicNormalizer, WordAligner, VerseMatcher
│   │   ├── api/             # REST Endpoints (Auth, Quran, Recitation, Progress)
│   │   ├── streaming/       # WebSocket recitation endpoint
│   │   └── database/        # Async SQLAlchemy 2.x models & engine
│   └── tests/               # Pytest suite (Normalization, Aligner, API, WS)
│
├── infra/                   # Dockerfile.backend & docker-compose.yml
├── docs/                    # ARCHITECTURE, API, DATASETS, MODEL_CARD, PRIVACY, TESTING, DEPLOYMENT
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: 3.10 or 3.11 with `uv` or `venv`
- **Node.js**: v18+ or v22+ LTS with `npm`

### 2. Backend Setup
```bash
# Initialize virtual environment
uv venv .venv --python 3.11
# Or on Windows:
.venv\Scripts\activate

# Install dependencies
uv pip install -r backend/requirements.txt

# Run backend development server
python backend/run.py
```
Backend will start on `http://localhost:8000` (OpenAPI Swagger docs at `http://localhost:8000/docs`).

### 3. Run Automated Tests
```bash
.venv/bin/pytest backend/tests -v
```

### 4. Mobile App Setup (Expo)
```bash
cd mobile

# Install mobile dependencies
npm install

# Start Expo development server
npx expo start
```
- Open on Android: Press `a` in the terminal to launch the Android emulator.
- Open on Physical Device: Scan the QR code using the **Expo Go** app.

---

## 📜 Documentation Links
- [Architecture Blueprint](file:///c:/Users/sampa/OneDrive/Desktop/Quran/docs/ARCHITECTURE.md)
- [API & WebSocket Protocol](file:///c:/Users/sampa/OneDrive/Desktop/Quran/docs/API.md)
- [Datasets & Provenance](file:///c:/Users/sampa/OneDrive/Desktop/Quran/docs/DATASETS.md)
- [Model Card](file:///c:/Users/sampa/OneDrive/Desktop/Quran/docs/MODEL_CARD.md)
- [Privacy Policy](file:///c:/Users/sampa/OneDrive/Desktop/Quran/docs/PRIVACY.md)
- [Testing Guide](file:///c:/Users/sampa/OneDrive/Desktop/Quran/docs/TESTING.md)
- [Deployment Guide](file:///c:/Users/sampa/OneDrive/Desktop/Quran/docs/DEPLOYMENT.md)
- [Development Status](file:///c:/Users/sampa/OneDrive/Desktop/Quran/DEVELOPMENT_STATUS.md)
