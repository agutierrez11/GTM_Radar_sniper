#!/bash
# setup_vm.sh - NERV Sniper Factory Environment Setup for Ubuntu 22.04 LTS

echo "--- Iniciando configuración de NERV Sniper Factory en Ubuntu ---"

# 1. Update system
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Python 3.10 and essentials
sudo apt-get install -y python3.10 python3-pip python3-venv git curl zip unzip

# 3. Install Node.js (for frontend/dashboard)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2 for background process management
sudo npm install -g pm2

# 5. Create project structure
mkdir -p ~/nerv-sniper/logs
mkdir -p ~/nerv-sniper/dossiers

echo "--- Entorno base listo ---"
echo "Siguiente paso: Descomprimir NERV_FINAL_BACKUP.zip en ~/nerv-sniper/"
