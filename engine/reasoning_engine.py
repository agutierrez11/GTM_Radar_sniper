import json
import re

def analyze_strategic_fit(company_data, competitor_data=None):
    """
    Simulates a 'DeepSeek' style reasoning engine that infers strategic 
    moves based on raw intelligence.
    """
    # This is a heuristic-driven inference engine to move beyond scraping
    content = str(company_data).lower()
    
    analysis = {
        "strategic_inference": [],
        "gtm_signals": [],
        "ml_weights": {
            "market_urgency": 0.5,
            "tech_friction": 0.4,
            "expansion_probability": 0.3
        }
    }
    
    # SEÑAL 1: Expansión
    if any(k in content for k in ["expansión", "lanzamiento", "nuevo mercado", "opening", "crecimiento regional"]):
        analysis["strategic_inference"].append("ALTA PROBABILIDAD DE EXPANSIÓN: La empresa muestra señales activas de apertura de mercados. EBANX puede actuar como el partner de rieles de pago inmediato.")
        analysis["ml_weights"]["expansion_probability"] = 0.9
        analysis["gtm_signals"].append("MARKET_BREAKER")

    # SEÑAL 2: Legacy / Mejora Técnica
    if any(k in content for k in ["optimización", "reemplazo", "modernización", "legacy", "costos operativos"]):
        analysis["strategic_inference"].append("DETECCIÓN DE FRICCIÓN TÉCNICA: Buscan optimizar costos. La propuesta de 'Blindaje' y reducción del 50% de costos operativos de EBANX es clave.")
        analysis["ml_weights"]["tech_friction"] = 0.8
        analysis["gtm_signals"].append("COST_OPTIMIZER")

    # SEÑAL 3: Competencia (si hay data de competidor)
    if competitor_data:
        analysis["strategic_inference"].append(f"CONFLUENCIA COMPETITIVA: Se detectan movimientos tácticos similares a {competitor_data}. Riesgo de pérdida de mercado si no se actúa en < 30 días.")
        analysis["ml_weights"]["market_urgency"] = 0.95

    return analysis

if __name__ == "__main__":
    # Test with mockup data
    test_content = "Vtex está buscando expansión en Paraguay y modernización de su checkout legacy."
    result = analyze_strategic_fit(test_content)
    print(json.dumps(result, indent=2, ensure_ascii=False))
