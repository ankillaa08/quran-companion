# Quran Companion AI — Deployment & Infrastructure Guide

## 1. System Requirements

### Backend API & Inference
- **Operating System**: Linux (Ubuntu 22.04 LTS recommended) / Docker
- **Python**: 3.10 or 3.11
- **Hardware (CPU Mode)**: 4+ vCPU, 8 GB RAM (Inference latency ~800ms)
- **Hardware (GPU Mode - Recommended)**: NVIDIA T4 / A10G / RTX 3060+, 16 GB RAM (Inference latency ~180-250ms)
- **Database**: PostgreSQL 15+ (Production) or SQLite (Local Dev)
- **Cache**: Redis 7+ (Optional, for multi-node connection coordination)

### Mobile Application
- **Node.js**: v18.x - v22.x LTS
- **Package Manager**: npm or yarn
- **Expo CLI**: 51+
- **Android**: Android Studio & SDK Platform 34 (or physical Android phone)
- **iOS**: macOS with Xcode 15+ & CocoaPods

---

## 2. Docker Deployment (Recommended for Production)

Run the full stack (FastAPI Backend + PostgreSQL + Redis):
```bash
cd infra
docker compose up -d --build
```

Verify service health:
```bash
curl http://localhost:8000/api/v1/health
```

---

## 3. Local Development Setup

### Backend
```bash
# 1. Create and activate virtual environment
uv venv .venv --python 3.11
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# 2. Install dependencies
uv pip install -r backend/requirements.txt

# 3. Start development server
python backend/run.py
```

### Mobile Application (Expo)
```bash
cd mobile

# 1. Install dependencies
npm install

# 2. Start Expo development server
npx expo start
```
To run on Android emulator or physical device:
- Press `a` in the Expo terminal to open in Android emulator.
- Scan the QR code using the **Expo Go** app on your physical Android or iPhone.

---

## 4. Production Security Hardening
- Set a strong random secret: `JWT_SECRET=$(openssl rand -hex 32)`
- Enforce HTTPS and WSS (secure WebSockets) using Nginx, Caddy, or Cloudflare.
- Restrict `allow_origins` in CORS middleware to authorized domains.
- Monitor model memory and worker concurrency using Prometheus / Grafana.
