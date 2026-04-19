/**
 * STAGE 2 — ENABLEMENT STRATEGY
 * Converts the Executive Summary into Named Systems + AI opportunity map.
 * Flat pricing at $599 — no dynamic tier calculation.
 */
import { GoogleGenAI } from '@google/genai';
import {
    ENABLEMENT_STRATEGY_PROMPT,
    buildStrategyContext
} from './prompts.js';

export async function runEnablementStrategy(apiKey, executiveSummary) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildStrategyContext(executiveSummary);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: ENABLEMENT_STRATEGY_PROMPT,
                temperature: 0.5,
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text.trim();
        console.log('✅ Enablement Strategy complete');
        return {
            strategyText: text,
        };
    } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Enablement Strategy error:', msg);
        return {
            strategyText: 'Strategy analysis could not be completed. Please retry.',
            error: msg,
        };
    }
}
