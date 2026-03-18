@echo off
cd "C:\Users\antonio\.gemini\antigravity\scratch\sniper-factory-master"
echo Checking for running engines...
tasklist /fi "imagename eq python.exe" | find ":" > nul
if errorlevel 1 (
    echo Engine already running. Skipping restart to maintain stability.
) else (
    echo Launching NERV RADAR Engine...
    start /b python engine\v6_stable.py > new_engine.log 2>&1
    start /b python engine\slack_listener.py > slack_bot.log 2>&1
    echo Radar Online.
)
