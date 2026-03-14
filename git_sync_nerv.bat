@echo off
echo [NERV TACTICAL SYNC] Iniciando respaldo global en GitHub...

:: 1. Add all changes (including untracked files)
git add .

:: 2. Commit with timestamp
set datestamp=%date% %time%
git commit -m "NERV Tactical Sync: %datestamp% - Auto-backup before migration"

:: 3. Push to main
echo [NERV] Subiendo a la nube...
git push origin main

echo [NERV] >>> RESPALDO COMPLETADO. La VM puede ser eliminada de forma segura.
pause
