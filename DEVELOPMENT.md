# Quran Companion AI — Complete Engineering & Development Guide

A state-of-the-art, cross-platform AI-powered Quran memorization and recitation companion with real-time speech recognition, word-by-word alignment, mistake detection, and progress analytics.

---

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / FRONTEND LAYER                         │
│                                                                        │
│   ┌─────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│   │ Android Standalone  │  │ iOS (Expo Go /    │  │ Web PWA (React │  │
│   │ APK (EAS Build)     │  │ TestFlight)       │  │ Native Web)    │  │
│   └──────────┬──────────┘  └─────────┬─────────┘  └───────┬────────┘  │
│              └───────────────────────┼────────────────────┘           │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │ HTTPS (REST) & WSS (Audio WebSocket)
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND & AI INFERENCE SERVICE                       │
│                     (Hosted on Render Cloud)                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ FastAPI ASGI Server (Python 3.11 / Uvicorn on 0.0.0.0:$PORT)   │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ REST Endpoints:                                                │   │
│   │  • /health, /ready, /docs, /openapi.json                       │   │
│   │  • /api/v1/auth (JWT + bcrypt security)                        │   │
│   │  • /api/v1/quran (114 Surahs, Ayahs, search)                   │   │
│   │  • /api/v1/progress (Stats, fluency, mistake history)          │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Real-Time WebSocket Streaming:                                 │   │
│   │  • /ws/recitation/{session_id}                                 │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ AI & Natural Language Processing Pipeline:                     │   │
│   │  • Speech-to-Text: tarteel-ai/whisper-base-ar-quran            │   │
│   │  • Arabic Normalizer: Tashkeel stripping, character mapping    │   │
│   │  • Sequence Aligner: Dynamic Levenshtein & word alignment      │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ Connection Pool (asyncpg + SSL)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENT CLOUD DATABASE                         │
│                    (Neon Serverless PostgreSQL)                        │
│                                                                        │
│   • Auto-scaling serverless compute & storage                          │
│   • Pooler connection with keep-alive pre-pings                        │
│   • Tables: users, recitation_sessions, mistake_logs, progress         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Live Cloud Resources & Production Endpoints

| Resource | Service / Provider | URL / Identifier | Status |
| :--- | :--- | :--- | :---: |
| **Backend API (Live)** | Render Cloud | `https://quran-companion-m9zk.onrender.com` | **Online (Healthy)** |
| **Interactive API Docs** | Render (Swagger) | `https://quran-companion-m9zk.onrender.com/docs` | **Online** |
| **Health Probe** | Render | `https://quran-companion-m9zk.onrender.com/health` | **HTTP 200** |
| **WebSocket Stream** | Render (WSS) | `wss://quran-companion-m9zk.onrender.com/ws/recitation/{session_id}` | **Active** |
| **Database** | Neon PostgreSQL | `ep-noisy-glitter-b4vswxbc-pooler.c-6.us-east-2.aws.neon.tech` | **Active** |
| **Git Repository** | GitHub | `https://github.com/ankillaa08/quran-companion` | **Synced (`main`)** |
| **EAS Mobile Project** | Expo Application Services | `@ankillaa/quran-companion-ai` (ID: `6cbc4aaa-1b22-4237-a903-d26995b045f6`) | **Active** |
| **Android APK (Cloud)** | Expo EAS Build | [EAS Build e8de7351](https://expo.dev/accounts/ankillaa/projects/quran-companion-ai/builds/e8de7351-f2fb-495a-ac86-186df016cae2) | **Built (59.5 MB)** |
| **Android APK (Local)** | Local Workspace | `c:\Users\sampa\OneDrive\Desktop\Quran\QuranCompanion.apk` | **Available** |

---

## 3. Frontend Architecture (Web & Mobile)

The client application is built with **Expo 58** and **React Native 0.88**, utilizing **Expo Router** to provide universal code execution across Android, iOS, and Web.

### Key Technologies
- **Core Framework**: React 19.3.0, React Native 0.88.0, Expo 58.0.19
- **Navigation & Routing**: Expo Router (`expo-router/entry`) with file-based routing and deep linking
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
  - `useAuthStore`: JWT token persistence via `@react-native-async-storage/async-storage`
  - `useRecitationStore`: Audio chunk buffer, active Ayah, word alignment states, and mistake markers
  - `useSettingsStore`: Audio thresholds, transliteration, theme, and recitation mode settings
- **Audio & Microphone**: `expo-audio` configured for 16kHz linear PCM audio capture
- **Icons & Styling**: `lucide-react-native` with curated dark-theme tokens (`#081510`, `#10B981`, `#047857`)

### Route Hierarchy (`mobile/app/`)
```
mobile/app/
├── _layout.tsx                     # Global Root Provider & Font Loader
├── index.tsx                       # Landing / Redirect Gate
├── (auth)/
│   ├── login.tsx                   # JWT Authentication Screen
│   └── register.tsx                # Account Registration Screen
├── (tabs)/
│   ├── _layout.tsx                 # Tab Navigation Shell with animated active indicators
│   ├── reader.tsx                  # Quran Mushaf / Reading Screen
│   ├── recite.tsx                  # Real-Time AI Recitation & Voice Streaming Screen
│   ├── hifz.tsx                    # Memorization & Revision Schedule Screen
│   └── progress.tsx                # Analytics, Fluency Trends & Heatmaps Screen
├── recitation/
│   ├── history.tsx                 # Past Recitation Logs
│   ├── summary.tsx                 # Session Scorecard & Fluency Breakdown
│   └── mistakes.tsx                # Phonetic & Word Mistake Review
├── settings/
│   ├── index.tsx                   # User Preferences & Audio Settings
│   ├── status.tsx                  # Cloud & Engine Connectivity Diagnostics
│   └── privacy.tsx                 # Zero-Retention Audio Privacy Policy
└── quran/
    └── bookmarks.tsx               # Saved Verses & Daily Targets
```

### Critical Custom Components (`mobile/src/components/`)
1. **`WordHighlighter.tsx`**:
   - Renders Quranic text with word-level state tracking.
   - Highlights words in real-time as the user recites:
     - 🟢 **Recited Correctly**: `#10B981` (Emerald green)
     - 🟡 **Current Target Word**: `#F59E0B` (Amber pulse)
     - 🔴 **Mistake / Skipped Word**: `#EF4444` (Ruby red highlight with correction tooltip)
2. **`AudioVisualizer.tsx`**:
   - Real-time animated waveform canvas reflecting microphone decibel levels and speech activity.
3. **`SurahHeader.tsx` & `VerseCard.tsx`**:
   - Elegant Hafs typography rendering with Tajweed-friendly line breaking and Ayah end glyphs.

---

## 4. Backend Architecture (FastAPI & AI Inference Engine)

The backend is an asynchronous, high-throughput Python 3.11 service designed for non-blocking speech recognition and WebSocket processing.

### Key Technologies
- **Web Framework**: FastAPI 0.110+ with Uvicorn ASGI server
- **Database Layer**: SQLAlchemy 2.0 Async + `asyncpg` + Neon PostgreSQL
- **Dependency Isolation**: `greenlet>=3.0.0`, `pydantic[email]`, `python-jose`, `bcrypt`
- **Audio Processing**: `numpy`, `scipy`, `soundfile`, `ffmpeg`
- **AI Model**: `tarteel-ai/whisper-base-ar-quran` loaded via Hugging Face `transformers` and PyTorch CPU

### Backend Directory Structure (`backend/app/`)
```
backend/app/
├── main.py                         # Application Lifespan, CORS, Middleware & Probes
├── api/
│   ├── router.py                   # Central API v1 router mounting all sub-routes
│   ├── auth.py                     # /api/v1/auth (Register, Login, Token Refresh)
│   ├── quran.py                    # /api/v1/quran (Surahs, Ayahs, Full-text Search)
│   └── progress.py                 # /api/v1/progress (User Sessions & Stats)
├── ai/
│   └── model_service.py            # Whisper Model Singleton (CPU-optimized with Fallback)
├── alignment/
│   ├── aligner.py                  # Sequence Matcher, Levenshtein Distance & Word Mapper
│   └── normalizer.py               # Arabic Diacritics & Tashkeel Normalization
├── database/
│   ├── connection.py               # Async Engine Provider, Pooler & Health Checker
│   └── models.py                   # SQLAlchemy ORM Models (User, Session, Mistakes)
├── streaming/
│   └── recitation_ws.py            # Bidirectional WebSocket Handler for Live Audio
└── data/
    └── verses.py                   # Embedded Quran Metadata (114 Surahs & Ayah counts)
```

### Real-Time Recitation Pipeline
1. **Audio Streaming**: Mobile client captures 16kHz audio chunks and transmits them via WebSocket (`/ws/recitation/{session_id}`).
2. **Non-blocking Inference**: `asyncio.to_thread` runs Whisper speech-to-text inference without blocking the ASGI event loop.
3. **Arabic Text Normalization**:
   - Removes non-semantic diacritics (Harakat / Tashkeel: Fatha, Damma, Kasra, Sukun, Tanween).
   - Standardizes Alif forms (`إ`, `أ`, `آ` → `ا`), Yaa (`ى` → `ي`), and Taa Marbuta (`ة` → `ه`).
4. **Sequence Alignment**:
   - Employs dynamic Levenshtein token alignment to compare the transcribed speech against the target Quranic verse.
   - Detects omitted words, substituted words, and mispronunciations.
5. **Real-Time Feedback Push**: Emits JSON messages back over the WebSocket containing:
   ```json
   {
     "type": "alignment_update",
     "active_ayah": 1,
     "current_word_index": 3,
     "fluency_score": 96.5,
     "words_matched": [0, 1, 2],
     "mistakes": []
   }
   ```

---

## 5. Database Schema & Models (`backend/app/database/models.py`)

1. **`User`**:
   - `id` (UUID), `email` (unique index), `hashed_password`, `full_name`, `created_at`
2. **`RecitationSession`**:
   - `id` (String primary key), `user_id` (Foreign Key), `surah_number`, `ayah_start`, `ayah_end`
   - `duration_seconds`, `total_words_recited`, `total_mistakes_count`, `fluency_score`, `created_at`
3. **`MistakeLog`**:
   - `id`, `session_id` (Foreign Key), `surah_number`, `ayah_number`, `word_index`
   - `expected_word`, `recited_word`, `mistake_type` (`omission`, `substitution`, `pronunciation`)
4. **`UserProgress`**:
   - Tracks memorized Ayahs, daily recitation streaks, and mastery confidence levels.

---

## 6. Local Development & Setup Instructions

### Prerequisites
- **Node.js**: v20.x or higher
- **Python**: v3.11
- **Package Managers**: `npm`, `pip` / `uv`
- **Git**: Installed and configured

### Step 1: Clone the Repository
```powershell
git clone https://github.com/ankillaa08/quran-companion.git
cd quran-companion
```

### Step 2: Set Up and Run the Backend Locally

```powershell
# Create Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Start backend server with auto-reload
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- Open Swagger Docs: `http://127.0.0.1:8000/docs`
- Health Probe: `http://127.0.0.1:8000/health`

### Step 3: Run Automated Backend Tests
```powershell
# Run the 23-test validation suite
$env:DATABASE_URL="sqlite+aiosqlite:///./test.db"
$env:USE_MOCK_ASR="true"
pytest backend/tests -v
```

### Step 4: Run the Frontend (Web or Mobile)

```powershell
cd mobile

# Install dependencies (respects React 19 legacy peer deps)
npm install --legacy-peer-deps

# Option A: Start Web Version in your browser
npx expo start --web

# Option B: Start Mobile Expo Go Dev Server (scan QR code on your phone)
npx expo start
```

---

## 7. Cloud Deployment & CI/CD Pipelines

### Backend (Render Cloud via Docker)
- **Configuration File**: [render.yaml](file:///c:/Users/sampa/OneDrive/Desktop/Quran/render.yaml)
- **Container Build**: Multi-stage [Dockerfile](file:///c:/Users/sampa/OneDrive/Desktop/Quran/Dockerfile) with `--torch-backend cpu` for minimal image size and fast deployment.
- **Environment Variables**:
  - `DATABASE_URL`: Neon PostgreSQL connection string.
  - `JWT_SECRET`: 32-character secret key.
  - `USE_MOCK_ASR`: `false` (or `true` if keeping memory strictly within free 512MB limits).
  - `CORS_ORIGINS`: `*`
  - `PORT`: `8000`

### Mobile Build (EAS Cloud Build)
- **Configuration File**: [mobile/eas.json](file:///c:/Users/sampa/OneDrive/Desktop/Quran/mobile/eas.json)
- **Build Command**:
  ```powershell
  cd mobile
  eas build --platform android --profile preview
  ```
- **Output**: Generates a signed, standalone Android APK installable on any Android hardware without Expo Go.

### Automated GitHub CI/CD
- **Workflow**: [.github/workflows/ci-cd.yml](file:///c:/Users/sampa/OneDrive/Desktop/Quran/.github/workflows/ci-cd.yml)
- **Automated Steps on Push to `main`**:
  1. Installs Python 3.11 & system audio libraries (`libsndfile1`, `ffmpeg`).
  2. Executes full pytest suite (23 integration tests).
  3. Validates TypeScript types across mobile (`npx tsc --noEmit`).
  4. Tests static web bundle export (`npx expo export --platform web`).

---

## 8. Verified Milestones & Test Record

- [x] **Backend Integration**: 23/23 Pytest tests passing.
- [x] **Database Connectivity**: Neon PostgreSQL end-to-end verified with live SSL connection pooling.
- [x] **Cloud Backend**: Live at `https://quran-companion-m9zk.onrender.com` with healthy `/health` probe.
- [x] **Mobile Standalone Build**: Android APK successfully compiled via EAS Cloud (`QuranCompanion.apk`).
- [x] **Web Bundler**: All 24 static routes exported successfully to `mobile/dist/`.
- [x] **TypeScript Validation**: Zero type errors across all application components.
