import json
from reasoning_engine import analyze_strategic_fit

# ESCENARIOS DE PRUEBA PARA DEMOSTRAR AUTONOMÍA
escenarios = [
    {
        "nombre": "ESCENARIO LATENCIA (AWS)",
        "data": "Wallet digital 'X' operando infra en AWS Brazil (sa-east-1). Mercado principal: México.",
        "mercado": "México"
    },
    {
        "nombre": "ESCENARIO EXPANSIÓN (KUSHKI/STRIPE)",
        "data": "Procesador de pagos 'Y' integrado con Kushki. Señales de expansión proactiva en Colombia y Perú.",
        "mercado": "Colombia"
    },
    {
        "nombre": "ESCENARIO GENÉRICO (SIN SEÑAL CLARA)",
        "data": "Empresa de software contable buscando eficiencias operativas.",
        "mercado": "Chile"
    }
]

print("="*60)
print("NERV STRATEGIC INFERENCE - PRUEBA DE AUTONOMÍA")
print("="*60)

for esc in escenarios:
    print(f"\n[+] PROCESANDO: {esc['nombre']}")
    print(f"    INPUT DE TAVILY: {esc['data']}")
    
    # Aquí es donde NERV piensa solo
    resultado = analyze_strategic_fit(esc['data'], esc['mercado'])
    
    print(f"    PUNTO DE DOLOR DETECTADO: {resultado['pain_points'][0]}")
    print(f"    KILL SHOT GENERADO: {resultado['kill_shot']}")
    print(f"    CONFIANZA DEL MOTOR: {resultado['confidence']}")
    print("-" * 30)

print("\nVeredicto: NERV razona solo basado en el Ruleset estratégico de reasoning_engine.py")
