/**
 * STAGE 5 — ORCHESTRATION PLAYBOOK
 * Converts the full intelligence package into an execution-ready playbook.
 * This is the post-paywall deliverable.
 */
import { GoogleGenAI } from '@google/genai';
import {
    PLAYBOOK_PROMPT,
    buildPlaybookContext
} from './prompts.js';
import { logAiCall } from './aiLogger.js';


const FALLBACK_PLAYBOOK = `## AI Orchestration Playbook\n\n### 1. Orchestration Inputs Summary\nPlaybook generation could not be completed. Please retry.`;

export async function runOrchestrationPlaybook(apiKey, executiveSummary, enablementStrategy, validatedData, marketIntel, roiData, growthData, logContext = {}) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildPlaybookContext(executiveSummary, enablementStrategy, validatedData, marketIntel, roiData, growthData);
    const startTime = Date.now();

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: PLAYBOOK_PROMPT,
                temperature: 0.5,
                maxOutputTokens: 65536,
            },
        });

        const text = response.text.trim();
        const hasSowSplit = text.includes('--- SOW_SPLIT ---');

        // Parse the two sections
        const parts = text.split('--- SOW_SPLIT ---');
        let diyPlaybook = 'Failed to generate DIY section. Please retry.';
        let sowPlaybook = '';
        let _warning = null;

        if (parts.length >= 2) {
            diyPlaybook = parts[0].trim();
            sowPlaybook = parts[1].trim();
            console.log('✅ Orchestration Playbook complete');
        } else {
            // Token limit likely hit — SOW was truncated off
            _warning = 'sow_truncated';
            diyPlaybook = text;
            sowPlaybook = '';
            console.warn('⚠️  Orchestration Playbook SOW_SPLIT marker not found — token limit likely hit. DIY playbook returned; SOW omitted.');
        }

        logAiCall({
            stage: 'orchestration_playbook',
            userId: logContext.userId,
            blueprintId: logContext.blueprintId,
            tokensUsed: response.usageMetadata?.totalTokenCount,
            latencyMs: Date.now() - startTime,
            outputLength: text.length,
            hasSowSplit,
            metadata: { wordCount: text.split(/\s+/).length, sowTruncated: !hasSowSplit },
        });

        return { diyPlaybook, sowPlaybook, _warning };
    } catch (err) {
        logAiCall({
            stage: 'orchestration_playbook',
            userId: logContext.userId,
            blueprintId: logContext.blueprintId,
            latencyMs: Date.now() - startTime,
            error: err.message,
        });
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Orchestration Playbook error:', msg);
        return { diyPlaybook: FALLBACK_PLAYBOOK, sowPlaybook: '', _warning: 'generation_failed' };
    }
}
