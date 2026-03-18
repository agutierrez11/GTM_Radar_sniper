#!/bash
# run_services.sh - Orchestrate NERV services on Linux using PM2

echo "--- Iniciando servicios NERV Sniper ---"

# Ensure we are in the engine directory
cd "$(dirname "$0")/engine"

# Start the main Sniper Engine
# We use PM2 to keep it running and manage logs efficiently
pm2 start v6_stable.py --name "sniper-engine" --interpreter python3

# Start other supportive services if needed
# pm2 start telegram_bot.py --name "nerv-bot" --interpreter python3

echo "--- Servicios en ejecución. Usa 'pm2 status' para monitorear ---"
