import { GoogleGenerativeAI } from '@google/generative-ai';
import { MARKET_SCOUT_PROMPT, buildMarketScoutContext } from './prompts.js';

export async function runMarketScout(apiKey, executiveSummary, answers) {
  // Only run if competitors were named (Q19)
  const competitors = answers[19];
  if (!competitors || competitors.trim().length < 5) {
    console.log('⚡ Market Scout: skipped — no competitors named.');
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const context = buildMarketScoutContext(executiveSummary, answers);
  const prompt = `${MARKET_SCOUT_PROMPT}\n\n---\n\nDATA TO ANALYZE:\n\n${context}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(jsonText);
  } catch (err) {
    console.error('Market Scout error:', err.message);
    return null; // Non-fatal — preview continues without market intel
  }
}
