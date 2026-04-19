/**
 * THE NOISE FILTER — Operational Efficiency Agent
 * Uses Gemini 2.0 Flash (no grounding needed)
 */
import { GoogleGenAI } from '@google/genai';
import { NOISE_FILTER_PROMPT, buildNoiseFilterContext } from './prompts.js';

const FALLBACK = {
    annualHoursWasted: 0,
    effectiveHourlyRate: 0,
    annualCostOfWaste: 0,
    projectedSavings: 0,
    automationTargets: [],
    revenueLeaks: [],
    totalToolsRecommended: 0,
    monthlySoftwareCost: 0,
    netMonthlySavings: 0
};

export async function runNoiseFilter(apiKey, answers) {
    const ai = new GoogleGenAI({ apiKey });

    const userMessage = buildNoiseFilterContext(answers);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: NOISE_FILTER_PROMPT,
                temperature: 0.4,
            },
        });

        const text = response.text.trim();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const parsed = JSON.parse(jsonMatch[1].trim());

        console.log('✅ Noise Filter complete');
        return parsed;
    } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Noise Filter error:', msg);
        return { ...FALLBACK, error: msg };
    }
}
