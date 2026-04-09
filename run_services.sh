#!/bin/bash
# NERV — TACTICAL LAUNCHER (FastAPI + Next.js)

echo "🚀 Launching NERV Intelligence Platform..."

# Launch FastAPI Backend (Background)
echo "📡 Starting FastAPI Backend (apps/backend)..."
cd apps/backend && uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Launch Next.js Frontend
echo "💻 Starting Next.js Frontend (apps/frontend)..."
cd ../frontend && pnpm dev &
FRONTEND_PID=$!

# Trap signals to kill both processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo "✅ NERV is online. Press Ctrl+C to stop all services."
wait
