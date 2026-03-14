@echo off
echo [NERV TACTICAL SYNC] Iniciando respaldo global en GitHub...

:: 1. Add everything, including submodule content changes
git add --all

:: 2. Commit with timestamp
set datestamp=%date% %time%
git commit -m "NERV Tactical Sync: %datestamp% - Full backup"

:: 3. Push to main
echo [NERV] Subiendo a la nube...
git push origin main

echo [NERV] RESPALDO COMPLETADO.
pause

