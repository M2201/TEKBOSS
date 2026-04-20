/**
 * NOISE FILTER AGENT — Operational Efficiency & ROI Calculator
 * Quantifies recoverable hours/year and dollar value of automation.
 */
import { GoogleGenAI } from '@google/genai';
import { NOISE_FILTER_PROMPT, buildNoiseFilterContext } from './prompts.js';

export async function runNoiseFilter(apiKey, executiveSummary, validatedData, answers) {
  const ai = new GoogleGenAI({ apiKey });
  const context = buildNoiseFilterContext(executiveSummary, validatedData, answers);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: context }] }],
      config: {
        systemInstruction: NOISE_FILTER_PROMPT,
        temperature: 0.4,
      },
    });

    const text = response.text.trim();
    const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonText);
    console.log('✅ Noise Filter complete');
    return parsed;
  } catch (err) {
    console.error('❌ Noise Filter error:', err.message);
    return null; // Non-fatal — pipeline continues without ROI data
  }
}
