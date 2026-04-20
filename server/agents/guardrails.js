/**
 * STAGE 3 — GUARDRAILS & VALIDATION
 * Validates and structures the outputs of Stage 1 + 2 into the canonical
 * JSON data block that feeds the Stage 4 Playbook.
 */
import { GoogleGenAI } from '@google/genai';
import {
    GUARDRAILS_PROMPT,
    buildGuardrailsContext
} from './prompts.js';

const FALLBACK_VALIDATED = {
    brandFoundation: {
        missionStatement: "",
        emotionalTone: [],
        doNotSayLanguage: [],
        culturalGuardrails: ""
    },
    opportunityZones: [],
    requiredCapabilities: [],
    toolCategories: [],
    humanControlPoints: [],
    topRisks: [],
    pricingTier: "TIER_2",
    validationFlags: ["Validation could not be completed — using defaults"]
};

export async function runGuardrails(apiKey, executiveSummary, enablementStrategy) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildGuardrailsContext(executiveSummary, enablementStrategy);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: GUARDRAILS_PROMPT,
                temperature: 0.1,
            },
        });

        const text = response.text.trim();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const parsed = JSON.parse(jsonMatch[1].trim());

        console.log('✅ Guardrails complete');
        return parsed;
    } catch (err) {
        const msg = err.message || '';
        console.error('❌ Guardrails error:', msg);
        console.error('❌ Guardrails full error:', JSON.stringify({
            message: err.message,
            status: err.status,
            code: err.code,
            stack: err.stack?.substring(0, 500),
        }));
        throw err;
    }
}
