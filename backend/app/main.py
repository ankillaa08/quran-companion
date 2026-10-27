"""
Quran Companion AI — Real-Time Recitation & Progress Backend
"""
import os
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.router import api_v1_router
from app.streaming.recitation_ws import router as ws_router
from app.database.connection import init_db, check_db_health
from app.ai.model_service import SpeechRecognitionService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("quran_companion")

SERVER_START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing database tables...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}. Will retry on request.")
    
    # Warm up / check speech recognition service status without blocking web server boot
    speech_service = SpeechRecognitionService.get_instance()
    logger.info(f"Speech recognition service status: {speech_service.get_readiness_info()}")
    
    yield
    
    # Shutdown actions
    logger.info("Shutting down Quran Companion AI Backend gracefully...")


app = FastAPI(
    title="Quran Companion AI API",
    description="Real-Time Quran Recitation, Word Alignment, Memorization Mistake Detection & Progress Tracking",
    version="1.0.0",
    lifespan=lifespan
)

# Configurable CORS Middleware for mobile apps (Expo/React Native) and web frontends
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env.strip() == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_timing_middleware(request: Request, call_next):
    """Logs non-sensitive request timing without logging headers, auth tokens, or audio chunks."""
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = round((time.time() - start_time) * 1000, 2)
        if request.url.path not in ("/health", "/ready", "/api/v1/health"):
            logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
        return response
    except Exception as e:
        logger.error(f"Unhandled error processing {request.method} {request.url.path}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "An internal server error occurred. Please try again later."}
        )


# Root-level health & readiness endpoints for cloud orchestrators (Render, K8s, Cloud Run)
@app.get("/health", tags=["Health & Diagnostics"])
async def root_health():
    """Quick liveness probe checking API responsiveness and database connectivity."""
    db_status = await check_db_health()
    uptime = int(time.time() - SERVER_START_TIME)
    is_live = db_status["status"] == "healthy"
    
    return JSONResponse(
        status_code=200 if is_live else 503,
        content={
            "status": "healthy" if is_live else "degraded",
            "uptime_seconds": uptime,
            "database": db_status,
            "version": "1.0.0"
        }
    )


@app.get("/ready", tags=["Health & Diagnostics"])
async def root_ready():
    """Deep readiness probe checking database readiness and AI model service status."""
    db_status = await check_db_health()
    service = SpeechRecognitionService.get_instance()
    model_info = service.get_readiness_info()
    
    is_ready = db_status["status"] == "healthy"
    
    return JSONResponse(
        status_code=200 if is_ready else 503,
        content={
            "status": "ready" if is_ready else "not_ready",
            "database": db_status,
            "ai_model": model_info,
            "timestamp": time.time()
        }
    )


# Mount Application Routers
app.include_router(api_v1_router)
app.include_router(ws_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "service": "Quran Companion AI API",
        "status": "online",
        "documentation": "/docs",
        "openapi_spec": "/openapi.json",
        "endpoints": {
            "health": "/health",
            "ready": "/ready",
            "surahs": "/api/v1/quran/surahs",
            "search": "/api/v1/quran/search",
            "recitation_websocket": "/ws/recitation/{session_id}"
        }
    }
