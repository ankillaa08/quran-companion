# Quran Companion AI — Production & Free-Tier Cloud Deployment Guide

This guide details how to deploy the entire Quran Companion AI stack to publicly accessible, free-tier hosting for the backend API, managed PostgreSQL, real-time WebSockets, mobile builds, and static web app.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             CLIENT LAYER               │
                      │  - Android Standalone APK (EAS Build)  │
                      │  - iOS (Expo Go / TestFlight)          │
                      │  - Web PWA (Vercel / Cloudflare Pages) │
                      └───────────────────┬────────────────────┘
                                          │
                     HTTPS (REST) & WSS (Audio WebSocket)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │         BACKEND & AI INFERENCE         │
                      │   (Render Free / Hugging Face Spaces)   │
                      │  - FastAPI on 0.0.0.0:$PORT            │
                      │  - Endpoints: /health, /ready, /docs   │
                      │  - Uvicorn ASGI Server                 │
                      │  - Whisper Speech Recognition          │
                      └───────────────────┬────────────────────┘
                                          │
                                     SSL Connection
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          PERSISTENT DATABASE           │
                      │        (Neon Serverless Postgres)       │
                      │  - 0.5 GB Free Tier                    │
                      │  - Auto-scaling connection pool        │
                      └────────────────────────────────────────┘
```

---

## 1. Database Provisioning (Neon PostgreSQL Free Tier)

**Neon** provides an always-free serverless PostgreSQL tier with 0.5 GB storage and automatic SSL.

1. Go to [https://neon.tech](https://neon.tech) and sign up (free, no credit card required).
2. Click **Create Project**, name it `quran-companion`, and choose a region close to your target users (e.g., `us-east-2` or `eu-central-1`).
3. Under **Dashboard > Connection Details**, copy the connection string:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. This URL will be set as your `DATABASE_URL` environment variable in your cloud backend hosting provider.

> [!NOTE]
> The backend automatically detects Neon's `sslmode=require` query parameter, normalizes the dialect to `postgresql+asyncpg://`, and configures connection pooling with `pool_pre_ping=True` to handle Neon's idle serverless hibernation gracefully.

---

## 2. Backend Cloud Deployment

### Option A: Render Free Web Service (Recommended for Standard API)

Render offers a free web service with automated HTTPS, custom domain support, and continuous Git integration.

1. Push your repository to your GitHub account (see Git Setup below).
2. Sign in to [https://render.com](https://render.com).
3. Click **New +** > **Blueprint**, and select your GitHub repository. Render will automatically read [render.yaml](file:///c:/Users/sampa/OneDrive/Desktop/Quran/render.yaml).
   *(Alternatively, click **New +** > **Web Service**, connect your repo, and select Environment: **Docker**).*
4. Set the following Environment Variables in the Render dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string from Step 1.
   - `JWT_SECRET`: A secure 32-byte secret (e.g., run `openssl rand -hex 32` locally).
   - `USE_MOCK_ASR`: `false` (or `true` if keeping RAM strictly under 512MB).
   - `CORS_ORIGINS`: `*`
5. Click **Deploy**. Render builds the multi-stage [Dockerfile](file:///c:/Users/sampa/OneDrive/Desktop/Quran/Dockerfile) and provisions:
   - **Public URL**: `https://<your-service-name>.onrender.com`
   - **Interactive API Docs**: `https://<your-service-name>.onrender.com/docs`
   - **Health Probe**: `https://<your-service-name>.onrender.com/health`
   - **Readiness Probe**: `https://<your-service-name>.onrender.com/ready`
   - **WebSocket Endpoint**: `wss://<your-service-name>.onrender.com/ws/recitation/{session_id}`

---

### Option B: Hugging Face Spaces (Recommended for Full PyTorch AI Model)

If you wish to run the full `tarteel-ai/whisper-base-ar-quran` speech recognition model on free CPU hardware without memory throttling:
- Hugging Face Spaces provides **2 vCPU + 16 GB RAM + 50 GB disk 100% free forever**!

1. Go to [https://huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Name your space (e.g. `quran-companion-ai`), choose **Docker** SDK (Blank).
3. Set your Space to Public.
4. Under Space Settings > Repository secrets, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: Random 32-byte string.
5. Push this repository's code to the Hugging Face Space git remote.
   Hugging Face automatically builds the root `Dockerfile` and serves on port 8000 with public HTTPS and WSS!

---

## 3. GitHub Source Control & Automated CI/CD

To connect your local workspace to your GitHub account:

1. **Authenticate GitHub CLI or Git**:
   ```powershell
   # If you use GitHub CLI:
   gh auth login
   # Or create a new repository directly at https://github.com/new
   ```
2. **Add Remote & Push**:
   ```powershell
   git remote add origin https://github.com/ankillaa08/quran-companion.git
   git branch -M main
   git push -u origin main
   ```
3. Once pushed, the included GitHub Actions workflow [.github/workflows/ci-cd.yml](file:///c:/Users/sampa/OneDrive/Desktop/Quran/.github/workflows/ci-cd.yml) will automatically run:
   - Backend unit tests (`pytest backend/tests`).
   - Mobile TypeScript validation (`npx tsc --noEmit`).
   - Static Web bundle build test (`npx expo export -p web`).

---

## 4. Mobile Application Build & Distribution

### A. Point Mobile App to Production Backend
Create or edit [mobile/.env](file:///c:/Users/sampa/OneDrive/Desktop/Quran/mobile/.env):
```bash
EXPO_PUBLIC_API_URL=https://<your-backend-url>/api/v1
EXPO_PUBLIC_WS_URL=wss://<your-backend-url>/ws/recitation
```

### B. Build Standalone Android APK (Free EAS Build)
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Login to your free Expo account:
   ```bash
   eas login
   ```
3. Generate a direct-installable Android APK file:
   ```bash
   cd mobile
   eas build --platform android --profile preview
   ```
   *EAS will build the APK on Expo's free cloud infrastructure and output a download link for the `.apk` file that can be installed directly on any Android device.*

### C. Build for Google Play Store (Production AAB)
```bash
cd mobile
eas build --platform android --profile production
```

### D. iOS Testing
- Physical iPhone users can install the **Expo Go** app from the App Store and scan the QR code from `npx expo start`.
- To create a TestFlight IPA, an Apple Developer account is required:
  ```bash
  cd mobile
  eas build --platform ios --profile production
  ```

---

## 5. Web Demonstration Deployment (Vercel / Netlify / Cloudflare Pages)

The mobile application is fully compiled for Web static hosting:
1. Export the production static web bundle:
   ```bash
   cd mobile
   npx expo export --platform web
   ```
   *Static output is generated in `mobile/dist`.*
2. Deploy `mobile/dist` to **Vercel** or **Cloudflare Pages**:
   - Install Vercel CLI: `npm install -g vercel`
   - Run `cd mobile && vercel deploy --prebuilt` (or drag and drop `mobile/dist` into Netlify / Cloudflare Pages dashboard).

---

## 6. Verification Checklist

| Endpoint / Component | Test Command / URL | Expected Result |
| :--- | :--- | :--- |
| **API Health** | `GET /health` | HTTP 200, `{"status": "healthy", "database": {"status": "healthy"}}` |
| **Model Readiness** | `GET /ready` | HTTP 200, `{"status": "ready", "ai_model": {"is_ready": true}}` |
| **Surah Catalog** | `GET /api/v1/quran/surahs` | HTTP 200, Array of 114 Surahs |
| **Live Recitation WS** | `WSS /ws/recitation/{id}` | Status 101 Switching Protocols, `connection_established` |
| **PostgreSQL Persistence** | Create session & query | Session stored permanently across reboots |
| **Mobile Client** | Open APK / Web | Connects to remote API without localhost errors |
