# Quran Companion AI - PowerShell Launcher
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       Launching Quran Companion AI Stack           " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in new process
Write-Host "[1/2] Starting Backend FastAPI Server on http://localhost:8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir'; .venv\Scripts\python.exe backend\run.py"

Start-Sleep -Seconds 3

# 2. Start Expo in new process
Write-Host "[2/2] Starting Mobile Expo App (Metro Bundler)..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\mobile'; npx expo start"

Write-Host ""
Write-Host "Both processes launched in separate windows!" -ForegroundColor Yellow
Write-Host "- Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "- Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "- Mobile Metro: Follow instructions in Expo window (Press 'w' for web or scan QR with Expo Go)" -ForegroundColor White
