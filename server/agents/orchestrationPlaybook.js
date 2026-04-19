/**
 * STAGE 4 — ORCHESTRATION PLAYBOOK
 * Converts the full intelligence package into an execution-ready playbook.
 * This is the post-paywall deliverable.
 */
import { GoogleGenAI } from '@google/genai';
import {
    PLAYBOOK_PROMPT,
    buildPlaybookContext
} from './prompts.js';

const FALLBACK_PLAYBOOK = `## AI Orchestration Playbook

### 1. Orchestration Inputs Summary
Playbook generation could not be completed. Please retry.`;

export async function runOrchestrationPlaybook(apiKey, executiveSummary, enablementStrategy, validatedData) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildPlaybookContext(executiveSummary, enablementStrategy, validatedData);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: PLAYBOOK_PROMPT,
                temperature: 0.5,
                maxOutputTokens: 8192,
            },
        });

        const text = response.text.trim();
        console.log('✅ Orchestration Playbook complete');

        // Parse the two sections
        const parts = text.split('--- SOW_SPLIT ---');
        let diyPlaybook = 'Failed to generate DIY section. Please retry.';
        let sowPlaybook = 'Failed to generate SOW section. Please retry.';

        if (parts.length >= 2) {
            diyPlaybook = parts[0].trim();
            sowPlaybook = parts[1].trim();
        } else {
            console.warn('⚠️ Orchestration Playbook did not split correctly.');
            diyPlaybook = text;
            sowPlaybook = text;
        }

        return { diyPlaybook, sowPlaybook };
    } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Orchestration Playbook error:', msg);
        return { diyPlaybook: FALLBACK_PLAYBOOK, sowPlaybook: FALLBACK_PLAYBOOK };
    }
}
