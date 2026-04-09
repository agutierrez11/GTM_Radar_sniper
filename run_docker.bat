@echo off
title NERV DOCKER TACTICAL LAUNCHER
echo 🐳 Launching NERV in Containers...

:: Check for .env
if not exist .env (
    echo ⚠️ Error: .env file not found. Copying .env.example...
    copy .env.example .env
    echo 📝 Please fill in your keys in the .env file before continuing.
    pause
    exit /b 1
)

:: Build and Start
echo 🏗️ Building and starting NERV Swarm...
docker compose up --build -d

echo ✅ NERV is online in Docker mode.
echo 📡 Backend: http://localhost:8000
echo 💻 Frontend: http://localhost:3000
echo 📜 To see logs: docker compose logs -f
pause
