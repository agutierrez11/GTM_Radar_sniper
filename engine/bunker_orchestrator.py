import subprocess
import time
import logging
import os
import json
from datetime import datetime

# ── CONFIGURATION ──────────────────────────────────────────────────────────
# Force UTF-8 encoding for Windows compatibility with Spanish characters
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [BUNKER_ORCHESTRATOR] %(message)s",
    handlers=[
        logging.FileHandler("bunker_orchestrator.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("ORCHESTRATOR")

LAST_REPORT_DATE = None

SCRIPTS = [
    {"name": "ACTIVATOR", "path": "engine/auto_url_finder.py"},
    {"name": "SNIPER", "path": "engine/v6_stable.py"},
    {"name": "BLACK_OPS", "path": "engine/black_ops_reddit.py"},
    {"name": "FOOTPRINT", "path": "engine/footprint_hunter.py"}
]

BACKGROUND_SERVICES = [
    {"name": "SLACK_BOT", "path": "engine/slack_listener.py"},
    {"name": "TELEGRAM_BOT", "path": "engine/telegram_listener.py"}
]

REPORT_PATH = r"C:\Users\antonio\.gemini\antigravity\brain\2d3db774-f69e-4471-94f7-e0bd6b0c83fc\morning_report.md"

def start_background_services():
    """Launches persistent listeners like Slack/Telegram bots."""
    processes = []
    for service in BACKGROUND_SERVICES:
        log.info(f"SVC: Starting background service: {service['name']}...")
        try:
            # Redirect stdout/stderr to service-specific logs
            out_file = open(f"{service['name'].lower()}.log", "a", encoding='utf-8')
            p = subprocess.Popen(["python", service["path"]], stdout=out_file, stderr=out_file)
            processes.append(p)
        except Exception as e:
            log.error(f"ERR: Failed to start service {service['name']}: {e}")
    return processes

def update_morning_report():
    """Generates a scannable status report for Antonio's return."""
    global LAST_REPORT_DATE
    log.info("REPORT_SYNC: Updating Morning Report status...")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Trigger 9 AM Cancun Report (14:00 UTC)
    utc_now = datetime.utcnow()
    if utc_now.hour == 14 and LAST_REPORT_DATE != today:
        log.info("TIME_TRIGGER: Executing Scheduled Slack Report (9 AM Cancun)...")
        try:
            subprocess.run(["python", "engine/slack_reporter.py"], check=True)
            LAST_REPORT_DATE = today
            log.info("OK: Scheduled Slack report delivered.")
        except Exception as e:
            log.error(f"ERR: Slack Report delivery failed: {e}")

    try:
        if not os.path.exists(REPORT_PATH):
             with open(REPORT_PATH, "w", encoding='utf-8') as f:
                f.write(f"# Morning Intelligence Report\n\nGenerated: {today}\n\n## Log\n")
        with open(REPORT_PATH, "a", encoding='utf-8') as f:
            f.write(f"\n- OK: Intelligence Cycle completed at {timestamp}")
    except Exception as e:
        log.error(f"ERR: Failed to write report: {e}")

def run_cycle():
    """Runs a full intelligence cycle across all modules."""
    log.info("RUN: Starting new Intelligence Cycle...")
    
    for script in SCRIPTS:
        log.info(f"JOB: Launching {script['name']}...")
        try:
            # Redirect stdout/stderr to job-specific logs
            with open(f"{script['name'].lower()}.log", "a", encoding='utf-8') as out_f:
                result = subprocess.run(["python", script["path"]], stdout=out_f, stderr=out_f, check=True)
            log.info(f"OK: {script['name']} finished.")
        except subprocess.CalledProcessError as e:
            log.error(f"ERR: {script['name']} failed. Check {script['name'].lower()}.log")
        except Exception as e:
            log.error(f"ERR: {script['name']} unexpected error: {e}")
            
    update_morning_report()
    log.info("SLEEP: Cycle complete. Waiting 1 minute...")
    time.sleep(60)

if __name__ == "__main__":
    log.info("BUNKER: ONLINE. Entering Autonomous Mode (UTF-8 SECURE).")
    
    # Start background bots (Slack/Telegram)
    bg_processes = start_background_services()
    
    if not os.path.exists(REPORT_PATH):
        with open(REPORT_PATH, "w", encoding='utf-8') as f:
            f.write(f"# Morning Intelligence Report\n\nGenerated: {datetime.now().strftime('%Y-%m-%d')}\n\n## Log\n")
        
    try:
        while True:
            run_cycle()
    except KeyboardInterrupt:
        log.info("STOP: Orchestrator stopped. Terminating services...")
        for p in bg_processes:
            p.terminate()
