@echo off
title PayPilot AI - Startup Launcher
echo ====================================================================
echo                 PAYPILOT AI - SYSTEM LAUNCHER
echo     Agentic AI Payment Safety & Decision Assistant
echo                PayPal AI Hackathon 2026
echo ====================================================================
echo.
echo [1/3] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "PayPilot AI - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Launching React + Vite Frontend on http://localhost:5173 ...
start "PayPilot AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Opening PayPilot AI in your default browser...
start http://localhost:5173

echo.
echo ====================================================================
echo   PayPilot AI is running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://127.0.0.1:8000
echo   API Docs : http://127.0.0.1:8000/docs
echo ====================================================================
pause
