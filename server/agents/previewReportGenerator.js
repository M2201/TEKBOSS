/**
 * PREVIEW REPORT GENERATOR
 * Returns a parsed JSON object for structured visual rendering.
 * Falls back to a markdown-safe shape if the AI returns bad JSON.
 */
import { GoogleGenAI } from '@google/genai';
import {
    PREVIEW_REPORT_PROMPT,
    buildPreviewContext
} from './prompts.js';

function extractJson(raw) {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned);
}

export async function runPreviewReportGenerator(apiKey, executiveSummary, enablementStrategy, validatedData) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildPreviewContext(executiveSummary, enablementStrategy, validatedData);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: PREVIEW_REPORT_PROMPT,
                temperature: 0.6,
                maxOutputTokens: 4096,
            },
        });

        const raw = response.text.trim();

        try {
            const parsed = extractJson(raw);
            console.log('✅ Preview Report complete (structured JSON)');
            return parsed;
        } catch (parseErr) {
            // If JSON parse fails, return a fallback shape so the UI doesn't crash
            console.warn('⚠️ Preview Report: JSON parse failed — wrapping as fallback:', parseErr.message);
            return {
                stat: { value: '—', context: 'analysis complete' },
                business_snapshot: raw.slice(0, 600),
                health_assessment: [
                    { category: 'Foundation', score: 70, tier: 'green', insight: 'See full blueprint for details.' },
                    { category: 'Operations Efficiency', score: 55, tier: 'amber', insight: 'See full blueprint for details.' },
                    { category: 'Growth Readiness', score: 60, tier: 'amber', insight: 'See full blueprint for details.' },
                    { category: 'Scale Potential', score: 78, tier: 'green', insight: 'See full blueprint for details.' },
                ],
                whats_working: ['See your full blueprint for a detailed strengths analysis.'],
                constraints: ['See your full blueprint for a detailed growth opportunity analysis.'],
                named_systems: [],
                highest_leverage_move: 'Your highest-leverage move is detailed in your full blueprint.',
                execution_gap: 'The gap is not effort — it\'s system design.',
                cta_line: 'Your full blueprint is ready to unlock.',
                _raw: raw,
            };
        }
    } catch (err) {
        const msg = err.message || '';
        console.error('❌ Preview Report error:', msg);
        throw err;
    }
}
