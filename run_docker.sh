#!/bin/bash
# NERV — DOCKER TACTICAL LAUNCHER (FastAPI + Next.js)

echo "🐳 Launching NERV in Containers..."

# Verificar si existe el .env
if [ ! -f .env ]; then
    echo "⚠️ Error: .env file not found. Copying .env.example..."
    cp .env.example .env
    echo "📝 Please fill in your keys in the .env file before continuing."
    exit 1
fi

# Build and Start
echo "🏗️ Building and starting NERV Swarm..."
docker compose up --build -d

echo "✅ NERV is online in Docker mode."
echo "📡 Backend: http://localhost:8000"
echo "💻 Frontend: http://localhost:3000"
echo "📜 To see logs: docker compose logs -f"
