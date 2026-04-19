/**
 * THE GROWTH FORECASTER — Strategic Roadmap Agent
 * Uses Gemini 2.0 Flash (no grounding needed)
 * Implements the Pivot Protocol: Functional Logic
 */
import { GoogleGenAI } from '@google/genai';
import { GROWTH_FORECASTER_PROMPT, buildGrowthForecasterContext } from './prompts.js';

const FALLBACK = {
    executiveSummary: "Analysis could not be completed.",
    projectedRevenueImpact: "$0",
    projectedTimeSaved: "0 hours",
    phases: [
        { name: "Foundation", days: "1-30", objective: "Pending analysis", milestones: [], phaseOutcome: "" },
        { name: "Systemation", days: "31-60", objective: "Pending analysis", milestones: [], phaseOutcome: "" },
        { name: "Dominance", days: "61-90", objective: "Pending analysis", milestones: [], phaseOutcome: "" }
    ],
    toolStack: [],
    competitiveEdge: ""
};

export async function runGrowthForecaster(apiKey, answers, marketScoutReport, noiseFilterReport) {
    const ai = new GoogleGenAI({ apiKey });

    const userMessage = buildGrowthForecasterContext(answers, marketScoutReport, noiseFilterReport);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: GROWTH_FORECASTER_PROMPT,
                temperature: 0.6,
                maxOutputTokens: 8192,
            },
        });

        const text = response.text.trim();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const parsed = JSON.parse(jsonMatch[1].trim());

        console.log('✅ Growth Forecaster complete');
        return parsed;
    } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Growth Forecaster error:', msg);
        return { ...FALLBACK, error: msg };
    }
}
