/**
 * THE MARKET SCOUT — Competitive Intelligence Agent
 * Uses Gemini 2.0 Flash with Google Search Grounding
 */
import { GoogleGenAI } from '@google/genai';
import { MARKET_SCOUT_PROMPT, buildMarketScoutContext } from './prompts.js';

const FALLBACK = {
    competitors: [],
    clientAdvantages: ["Unable to analyze — please verify API key and try again"],
    marketGaps: [],
    strategicInsight: "Market Scout analysis could not be completed."
};

export async function runMarketScout(apiKey, answers) {
    const ai = new GoogleGenAI({ apiKey });

    const userMessage = buildMarketScoutContext(answers);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: MARKET_SCOUT_PROMPT,
                temperature: 0.7,
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text.trim();
        // Extract JSON from possible markdown fencing
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const parsed = JSON.parse(jsonMatch[1].trim());

        console.log('✅ Market Scout complete');
        return parsed;
    } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Market Scout error:', msg);
        return { ...FALLBACK, error: msg };
    }
}
