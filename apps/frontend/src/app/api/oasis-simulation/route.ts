import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { generateWithGroq } from "@/lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { dossier, context } = await req.json();

    const prompt = `
Eres OASIS — El simulador de escenarios de NERV.
PROTOCOLO: MiroFish (Seed → Simulation → Report).

SEMILLA (DOSSIER):
${JSON.stringify(dossier)}

CONTEXTO DE VENTA:
${JSON.stringify(context)}

TAREA: Realizar una SIMULACIÓN DE ESCENARIO para los primeros 5 minutos de la reunión de ventas.
Predice la respuesta del prospecto, las objeciones críticas y el "Narrative Spread" (cómo se percibirá tu propuesta).

RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO:
{
  "escenario": "Resumen del entorno de la simulación",
  "simulacion": [
    { "minuto": 1, "accion": "Pitch Inicial", "reaccion_prospecto": "...", "probabilidad_exito": 85 },
    { "minuto": 3, "accion": "Manejo de Objeción", "reaccion_prospecto": "...", "probabilidad_exito": 70 },
    { "minuto": 5, "accion": "Cierre/Próximo Paso", "reaccion_prospecto": "...", "probabilidad_exito": 75 }
  ],
  "card_report": {
    "summary": "Resumen ejecutivo de la simulación",
    "narrative_spread": "Cómo se difundirá este mensaje internamente en la empresa objetivo",
    "critical_risk": "El mayor riesgo de este escenario",
    "success_score": <int 0-100>
  },
  "follow_up": "Siguiente mensaje recomendado vía WhatsApp o Correo"
}
`;

    try {
      const gResp = await generateWithFallback(prompt);
      return NextResponse.json(gResp.data);
    } catch (err) {
      const groqData = await generateWithGroq(prompt);
      return NextResponse.json(groqData);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
