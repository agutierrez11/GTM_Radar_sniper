import json
import re

def analyze_strategic_fit(technical_intel, market_focus="México"):
    """
    NERV STRATEGIC INFERENCE ENGINE V3.0 (Heuristica Edition)
    Transforms raw intel into a 4-card Battle Deck.
    """
    content = str(technical_intel).lower()
    target = str(market_focus).lower()

    # Defaults base cards
    cards = [
        {
            "id": "CARTA 01",
            "type": "Schwerpunkt",
            "title": "La verdad técnica",
            "quote": "Todo tu peso de fuego va aquí.",
            "description": "Fricción operativa en procesamiento de pagos regionales.",
            "example": "Infraestructura fragmentada detectada."
        },
        {
            "id": "CARTA 02",
            "type": "Flanking Attack",
            "title": "El guion de infiltración",
            "quote": "No entres por donde están blindados.",
            "description": "El stakeholder correcto, el dolor real, la puerta trasera que la competencia no vio.",
            "example": "Entrada por Producto/Ops vs Finanzas."
        },
        {
            "id": "CARTA 03",
            "type": "Blue Ocean",
            "title": "Ventaja competitiva brutal",
            "quote": "Donde la competencia es ciega.",
            "description": "NERV identifica mercados donde el incumbente local no está atendiendo.",
            "example": "Expansión regional sin fricción de FX."
        },
        {
            "id": "CARTA 04",
            "type": "MEDDIC",
            "title": "Métrica de destino",
            "quote": "¿Ingreso predecible o solo ruido?",
            "description": "MEDDIC Status, Potential ACV y señales de up-selling.",
            "example": "Lead calificado: High Intent / Med Conf."
        }
    ]
    
    confidence = 0.5

    # RULE 1: AWS Latency (Schwerpunkt)
    if re.search(r"aws.*brazil|aws.*sa-east-1", content, re.I) and "méxico" in target:
        cards[0]["description"] = "Latencia Transaccional Crítica: Datos viajan AWS-BR -> MX."
        cards[0]["example"] = "Checkout latency > 2s detectado en nodos remotos."
        cards[1]["description"] = "Flanco desprotegido en VP de Producto sufriendo abandono por timeout."
        cards[1]["example"] = "Pitch: 'Nodos locales en MX bajando abandono 40%'"
        confidence = 0.9

    # RULE 2: Regional Expansion (Blue Ocean)
    if re.search(r"expansion|expanding.*colombia|peru|chile", content, re.I):
        cards[2]["description"] = "Cruce de fronteras sin fricción de FX Markups gracias a rieles locales."
        cards[2]["example"] = "Ahorro del 15% en comisiones transfronterizas."
        cards[3]["description"] = "High Potential Upsell: Volumen Cross-border verificado."
        cards[3]["example"] = "Ingreso Predecible: Strategic Tier 1 para Q4."
        confidence = 0.85

    return {
        "cards": cards,
        "confidence": confidence
    }

if __name__ == "__main__":
    # Test DNA: Vtex México using AWS Brazil
    test_data = "Vtex is a global retail platform using AWS in Brazil Region (sa-east-1). Expanding Colombia."
    res = analyze_strategic_fit(test_data, "México")
    print(json.dumps(res, indent=2, ensure_ascii=False))
