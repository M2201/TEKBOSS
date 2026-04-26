/**
 * THE GROWTH FORECASTER — Strategic Roadmap Agent
 * Synthesizes all pipeline data into a phased 90-day roadmap with revenue projections.
 * Runs AFTER Stage 3.5 (brandDna, marketIntel, roiData) so it can consume their outputs.
 */
import { GoogleGenAI } from '@google/genai';
import { GROWTH_FORECASTER_PROMPT, buildGrowthForecasterContext } from './prompts.js';

const FALLBACK = {
    executiveSummary: "Growth roadmap analysis could not be completed.",
    projectedRevenueImpact: { conservative: "Analysis pending", optimistic: "Analysis pending", keyAssumption: "" },
    projectedTimeSaved: "Analysis pending",
    phases: [
        { phase: 1, name: "Foundation", duration: "Days 1-30", focus: "Pending analysis", keyActions: [], successMetric: "", namedSystem: "" },
        { phase: 2, name: "Activation", duration: "Days 31-60", focus: "Pending analysis", keyActions: [], successMetric: "", namedSystem: "" },
        { phase: 3, name: "Optimization", duration: "Days 61-90", focus: "Pending analysis", keyActions: [], successMetric: "", namedSystem: "" }
    ],
    toolStack: [],
    competitiveEdge: "",
    criticalRisk: ""
};

export async function runGrowthForecaster(apiKey, executiveSummary, enablementStrategy, validatedData, marketIntel, noiseFilterData) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildGrowthForecasterContext(executiveSummary, enablementStrategy, validatedData, marketIntel, noiseFilterData);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: GROWTH_FORECASTER_PROMPT,
                temperature: 0.5,
                maxOutputTokens: 8192,
            },
        });

        const text = response.text.trim();
        const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        const parsed = JSON.parse(jsonText);

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
