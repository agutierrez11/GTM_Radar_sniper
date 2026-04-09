import logging
import re
import requests
from typing import List, Optional, Dict, Any
from core.config import settings
from core.db import supabase

log = logging.getLogger("NERV_SERVICE")

class EnrichmentService:
    def __init__(self):
        self.slack_url = settings.SLACK_WEBHOOK_URL
        self.telegram_token = settings.TELEGRAM_BOT_TOKEN
        self.telegram_chat_id = settings.TELEGRAM_CHAT_ID

    def notify(self, message: str, channel: str = "SYSTEM"):
        """Envía notificaciones a los canales tácticos configurados."""
        full_msg = f"[{channel}] {message}"
        
        # Slack
        if self.slack_url:
            try: requests.post(self.slack_url, json={"text": full_msg}, timeout=10)
            except Exception as e: log.error(f"Slack Error: {e}")
            
        # Telegram
        if self.telegram_token:
            url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
            try: requests.post(url, json={"chat_id": self.telegram_chat_id, "text": full_msg}, timeout=10)
            except Exception as e: log.error(f"Telegram Error: {e}")
            
        log.info(f"NOTIFIED: {full_msg}")

    def calculate_radar_trajectory(self, content: str) -> Dict[str, Any]:
        """Analiza el contenido para detectar señales de crecimiento y trayectoria."""
        noise_patterns = [r"gatos", r"cats", r"laser", r"síntomas", r"salud", r"viral", r"horóscopo"]
        if any(re.search(p, content.lower()) for p in noise_patterns):
            return {"score": 0, "status": "REJECTED", "reason": "Noise detected"}

        signals = {
            "FUNDING": [r"funding", r"series [abc]", r"ronda", r"raised", r"capital"],
            "EXPANSION": [r"expansion", r"crecimiento", r"new office", r"hiring", r"vacantes"],
            "TECH": [r"stripe", r"aws", r"api", r"checkout", r"payments"],
            "IGAMING": [r"gambling", r"betting", r"casino", r"i-gaming", r"sportsbook", r"apuestas", r"juego"]
        }
        
        score = 20
        detected = []
        content_l = content.lower()
        
        for cat, patterns in signals.items():
            matches = [p for p in patterns if re.search(p, content_l)]
            if matches:
                score += 25
                detected.extend(matches)
        
        score = min(score, 100)
        trajectory = "STABLE"
        if score >= 70: trajectory = "INTERCEPCION"
        elif score >= 45: trajectory = "ASCENDENTE"

        return {
            "score": score,
            "trajectory": trajectory,
            "detected_signals": list(set(detected))
        }

    async def process_company(self, url: str):
        """Proceso orquestador para enriquecer una empresa (TBD in Phase 3)."""
        # Aquí es donde integraremos Firecrawl y Gemini
        pass

enrichment_service = EnrichmentService()
