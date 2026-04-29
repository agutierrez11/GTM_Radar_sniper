from duckduckgo_search import DDGS
import traceback
try:
    r = list(DDGS().text("Deuna fintech", max_results=2))
    print("OK", r)
except Exception as e:
    traceback.print_exc()
