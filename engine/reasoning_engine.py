import json
import re

# NERV_STRATEGIC_RULESET: The "Master Mind" logic
STRATEGIC_RULES = [
    {
        "id": "AWS_LATENCY_FLANK",
        "keywords": ["aws", "amazon web services", "brazil", "brasil"],
        "target_keywords": ["mexico", "mex", "méxico"],
        "pain": "Latencia Transaccional Crítica: Datos viajan AWS-BR -> MX.",
        "attack": "Vi que operan sobre AWS Brasil para su wallet; nosotros tenemos nodos locales en México que reducen el tiempo de respuesta del checkout en un 40%.",
        "victory": "Aumentar conversión bajando abandono por timeout."
    },
    {
        "id": "KUSHKI_REPLACEMENT",
        "keywords": ["kushki", "stripe", "dlocal", "checkout legacy"],
        "target_keywords": ["expansion", "colombia", "latam", "est expansión"],
        "pain": "Costos de Rieles Fragmentados: Uso de agregadores globales con fees altos.",
        "attack": "Detectamos su expansión regional; los rieles locales de nuestra plataforma eliminan el 'FX markup' y las comisiones de intermediarios.",
        "victory": "Mejorar margen neto en un 15% inmediato."
    }
]

def analyze_strategic_fit(company_data, target_market="México"):
    """
    Automated Strategic Inference Engine with Regex support.
    """
    content = str(company_data).lower()
    target = target_market.lower()
    
    analysis = {
        "kill_shot": "ATAQUE DE FLANQUEO: Infiltración via Optimización Ops.",
        "pain_points": [],
        "strategic_moves": [],
        "confidence": 0.5
    }
    
    for rule in STRATEGIC_RULES:
        # Check logic: if any keyword in content AND target matches
        has_keywords = any(re.search(fr"\b{k}\b", content) for k in rule["keywords"])
        target_matches = any(re.search(fr"\b{k}\b", target) for k in rule["target_keywords"])
        
        if has_keywords and target_matches:
            analysis["pain_points"].append(rule["pain"])
            analysis["strategic_moves"].append(rule["victory"])
            analysis["kill_shot"] = rule["attack"]
            analysis["confidence"] = 0.9
            break # Take the first high-confidence match
            
    if not analysis["pain_points"]:
        analysis["pain_points"].append("Fricción operativa en procesamiento de pagos regionales.")
        analysis["strategic_moves"].append("Reducción de costos via rieles directos.")
        
    return analysis

if __name__ == "__main__":
    # Test DNA: Vtex México using AWS Brazil
    test_data = "Vtex is a global retail platform using AWS in Brazil Region. Expanding Mexico."
    res = analyze_strategic_fit(test_data, "México")
    print(json.dumps(res, indent=2, ensure_ascii=False))
