import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generateWithClaude(prompt: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const responseText = content.text;
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
        
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn("Claude response couldn't be parsed directly to JSON, returning as object:", parseError);
        return { text: cleanedText };
      }
    }
    throw new Error('Respuesta de Claude no es texto');
  } catch (error) {
    console.error('Error en Claude API:', error);
    throw error;
  }
}
