/**
 * THE NOISE FILTER — Operational Efficiency & ROI Calculator Agent
 * Runs the NOISE_FILTER_PROMPT to quantify time/revenue opportunity.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NOISE_FILTER_PROMPT, buildNoiseFilterContext } from './prompts.js';

export async function runNoiseFilter(apiKey, executiveSummary, validatedData, answers) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const context = buildNoiseFilterContext(executiveSummary, validatedData, answers);
  const prompt = `${NOISE_FILTER_PROMPT}\n\n---\n\nDATA TO ANALYZE:\n\n${context}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonText);
    console.log('✅ Noise Filter complete');
    return parsed;
  } catch (err) {
    console.error('❌ Noise Filter error:', err.message);
    return null; // Non-fatal — pipeline continues without ROI data
  }
}
