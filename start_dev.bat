@echo off
TITLE Quran Companion AI Launcher
echo ====================================================
echo        Launching Quran Companion AI Stack
echo ====================================================
echo.

echo [1/2] Starting Backend FastAPI Server (Port 8000)...
start "Quran Backend (FastAPI)" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe backend\run.py"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo [2/2] Starting Mobile Expo App (Metro Bundler)...
start "Quran Mobile (Expo)" cmd /k "cd /d %~dp0mobile && npx expo start"

echo.
echo ====================================================
echo Stack is booting up!
echo - Backend API:  http://localhost:8000
echo - Swagger Docs: http://localhost:8000/docs
echo - Mobile Metro: Follow instructions in the Expo window
echo                 Press 'w' for Web, or scan QR with Expo Go app
echo ====================================================
pause
