import subprocess
import time
import os

def run_bunker():
    print("--- [NERV BUNKER] Sistema de Vigilancia Activo ---")
    script_path = os.path.join(os.path.dirname(__file__), "v6_stable.py")
    
    while True:
        print(f"--- [NERV] Lanzando Obrero Cosechador: {script_path}")
        # Lanzamos el motor y esperamos a que termine o falle
        process = subprocess.Popen(["python", script_path])
        process.wait()
        
        # Si llegamos aquí, es que el proceso se cerró (por error o crash)
        print("!!! [ALERTA] NERV Engine se ha detenido. Reiniciando en 10 segundos...")
        time.sleep(10)

if __name__ == "__main__":
    run_bunker()
