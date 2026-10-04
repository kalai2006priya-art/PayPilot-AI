@echo off
title PayPilot AI - Frontend Application
echo ========================================================
echo   Starting PayPilot AI React Frontend (Port 5173)...
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
