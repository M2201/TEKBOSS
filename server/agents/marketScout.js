/**
 * MARKET SCOUT AGENT
 * Competitive intelligence based on named competitors + industry data.
 */
import { GoogleGenAI } from '@google/genai';
import { MARKET_SCOUT_PROMPT, buildMarketScoutContext } from './prompts.js';

export async function runMarketScout(apiKey, executiveSummary, answers) {
  // Only run if competitors were named (Q19)
  const competitors = answers[19];
  if (!competitors || competitors.trim().length < 5) {
    console.log('⚡ Market Scout: skipped — no competitors named.');
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const context = buildMarketScoutContext(executiveSummary, answers);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: context }] }],
      config: {
        systemInstruction: MARKET_SCOUT_PROMPT,
        temperature: 0.4,
      },
    });

    const text = response.text.trim();
    const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonText);
    console.log('✅ Market Scout complete');
    return parsed;
  } catch (err) {
    console.error('❌ Market Scout error:', err.message);
    return null; // Non-fatal
  }
}
