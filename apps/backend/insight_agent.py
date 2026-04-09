import os
import requests
import json
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv('engine/.env')

# Placeholder for Insight Inference Logic
# Goal: Scrape News -> Detect Entities -> Update DB

def monitor_news_feed():
    print("--- MONITORING INDUSTRY INSIGHTS (Latam Fintech Hub) ---")
    url = "https://www.latamfintech.co/news"
    r = requests.get(url)
    
    if r.status_code != 200:
        print(f"Access error: {r.status_code}")
        return
        
    soup = BeautifulSoup(r.text, 'html.parser')
    # This is a sample extraction - in production we'd jump to profile detail
    articles = soup.find_all('a', href=True)
    
    signals = []
    for a in articles:
        text = a.text.lower()
        if any(kw in text for kw in ["levanta", "lanza", "expande", "acuerdo", "funding", "round"]):
            signals.append({"title": a.text, "url": a['href']})
            print(f"Potential Signal Found: {a.text}")
            
    print(f"--- DETECTED {len(signals)} OPPORTUNITIES ---")
    return signals

if __name__ == "__main__":
    monitor_news_feed()
