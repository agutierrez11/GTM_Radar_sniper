@echo off
title NERV TACTICAL LAUNCHER
echo 🚀 Launching NERV Intelligence Platform...

:: Start FastAPI Backend
echo 📡 Starting FastAPI Backend (apps/backend)...
start "NERV Backend" /d "apps\backend" uvicorn main:app --reload --port 8000

:: Start Next.js Frontend
echo 💻 Starting Next.js Frontend (apps/frontend)...
start "NERV Frontend" /d "apps\frontend" pnpm dev

echo ✅ NERV is online. Close the windows to stop services.
pause
