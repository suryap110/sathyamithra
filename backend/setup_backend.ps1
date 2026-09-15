# ============================================================
# Sathyamithra — Backend Setup Script (Windows PowerShell)
# Run from: sathyamithra\backend\  (or any folder)
# ============================================================

param(
    [switch]$ResetVenv,
    [switch]$Start
)

$ErrorActionPreference = "Stop"

$backendDir = "C:\Users\surya\.gemini\antigravity\scratch\sathyamithra\backend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sathyamithra — Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Python check
Write-Host "[1/5] Checking Python..." -ForegroundColor Yellow
$pyVer = python --version 2>&1
Write-Host "      Found: $pyVer" -ForegroundColor Green

# Step 2: Virtual environment
$venvPath = "$backendDir\venv"
if ($ResetVenv -and (Test-Path $venvPath)) {
    Write-Host "[2/5] Removing old venv..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $venvPath
}
if (-not (Test-Path $venvPath)) {
    Write-Host "[2/5] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv "$venvPath"
    Write-Host "      Done." -ForegroundColor Green
} else {
    Write-Host "[2/5] Venv already exists, skipping." -ForegroundColor Green
}

# Step 3: Dependencies
Write-Host "[3/5] Installing packages..." -ForegroundColor Yellow
& "$venvPath\Scripts\pip.exe" install --upgrade pip -q
& "$venvPath\Scripts\pip.exe" install -r "$backendDir\requirements.txt" -q
Write-Host "      Packages installed." -ForegroundColor Green

# Step 4: .env file
$envFile = "$backendDir\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "[4/5] Creating .env..." -ForegroundColor Yellow
    @"
DATABASE_URL=sqlite+aiosqlite:///./sathyamithra.db
JWT_SECRET=sathyamithra_super_secret_jwt_key_2026_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REDIS_URL=redis://localhost:6379/0
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "      .env created." -ForegroundColor Green
} else {
    Write-Host "[4/5] .env already exists." -ForegroundColor Green
}

Write-Host "[5/5] SQLite DB auto-created on first run. No migrations needed." -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Start the server:" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Yellow
Write-Host '  .\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000' -ForegroundColor Yellow
Write-Host ""
Write-Host "Health check:  http://localhost:8000/api/health" -ForegroundColor Cyan
Write-Host "API docs:      http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

if ($Start) {
    Set-Location $backendDir
    & "$venvPath\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
}
