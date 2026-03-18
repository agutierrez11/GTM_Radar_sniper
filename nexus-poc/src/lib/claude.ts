import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generateWithClaude(brief: any) {
  try {
    const prompt = `Actúa como un experto en GTM y Ventas B2B. Analiza la siguiente empresa y producto para generar un reporte estratégico en formato JSON.

Datos:
Empresa: ${brief.empresa}
Producto/Servicio: ${brief.producto}
País: ${brief.pais}
Vertical: ${brief.vertical}
Tier: ${brief.tier}

Responde ÚNICAMENTE con un objeto JSON con la siguiente estructura:
{
  "diagnostico": "Análisis detallado de la situación actual y oportunidad",
  "plan_ataque": "Pasos concretos para penetrar la cuenta",
  "mensaje_outreach": "Propuesta de valor redactada para el buyer persona"
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Respuesta de Claude no es texto');
  } catch (error) {
    console.error('Error en Claude API:', error);
    throw error;
  }
}
