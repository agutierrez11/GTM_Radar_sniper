import random

class TacticalPersona:
    """
    Handles the 'Human & Fluid' layer for the NERV bots.
    Generates tactical, high-context responses in Spanish.
    """
    
    TACTICAL_ADJECTIVES = ["crítico", "estratégico", "de alto impacto", "prioritario", "latente"]
    GREETINGS = [
        "Comandante, el NERV ya está analizando los datos.",
        "Reporte de situación listo. ¿Qué necesita saber?",
        "Sistemas operativos. La cacería en LATAM continúa.",
        "NERV Sniper en línea. Listos para la siguiente fase."
    ]
    
    @classmethod
    def get_greeting(cls):
        return random.choice(cls.GREETINGS)

    @classmethod
    def fluid_stats(cls, total, enriched, junk=0):
        active_universe = total - junk
        progress = (enriched / active_universe * 100) if active_universe > 0 else 0
        responses = [
            f"🎯 *Reporte de Operaciones:*\nUniverso Limpio: {active_universe:,}\nEnriquecidos: {enriched:,} ({progress:.1f}%)\nBasura Purgada: {junk:,}\n\n_Seguimos operando en modo 8-núcleos._",
            f"📊 *Estado de Situación:*\nDe {total:,} objetivos iniciales, hemos identificado {junk:,} como 'ruido' y los hemos purgado. Procesando {enriched:,} perfiles tácticos de un universo útil de {active_universe:,}.",
            f"📻 *NERV Station:* Reportando {enriched:,} bajas estratégicas confirmadas. El Sniper ha limpiado {junk:,} registros de basura, enfocando los 8 núcleos en los {active_universe:,} objetivos reales."
        ]
        return random.choice(responses)

    @classmethod
    def fluid_score(cls, company, score, status):
        if score == "N/A":
            return f"He localizado '{company}', pero el Sniper aún no ha determinado su score final. Estado actual: {status}."
        
        score_int = int(score) if isinstance(score, (int, str)) and str(score).isdigit() else 0
        
        if score_int > 70:
            return f"¡Alerta de Misil! {company} tiene un score de {score}. Es un objetivo de altísimo valor con señales de expansión claras."
        elif score_int > 40:
            return f"{company} tiene un score de {score}. Es un objetivo {random.choice(cls.TACTICAL_ADJECTIVES)} que requiere seguimiento en la refinería."
        else:
            return f"{company} (Score: {score}) no es una prioridad inmediata, pero seguimos vigilando su tech-stack."

    @classmethod
    def handle_noise(cls, query):
        responses = [
            "Interesante solicitud, Comandante. Permítame consultar los nodos de inteligencia.",
            "Eso requiere un análisis más profundo. ¿Desea que priorice ese objetivo?",
            "Entendido. Procesando el contexto operativo..."
        ]
    @classmethod
    def fluid_dossier_answer(cls, snippet):
        introduction = random.choice([
            "Comandante, he consultado el archivo maestro. Esto es lo que dice el Arsenal:",
            "Accediendo a la Mente Maestra... Aquí tiene la estrategia recomendada:",
            "El búnker tiene un protocolo específico para eso. Analice esto:"
        ])
        return f"{introduction}\n\n{snippet}\n\n_— NERV Master Mind Module_"
