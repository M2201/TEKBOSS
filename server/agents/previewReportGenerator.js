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

export async function runPreviewReportGenerator(apiKey, executiveSummary, enablementStrategy, validatedData, roiData = null) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildPreviewContext(executiveSummary, enablementStrategy, validatedData, roiData);

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
            // If JSON parse fails, return a fallback shape so the UI doesn't crash.
            // Scores are labeled "estimated" to prevent false precision.
            console.warn('⚠️ Preview Report: JSON parse failed — wrapping as fallback:', parseErr.message);
            return {
                stat: { value: '—', context: 'analysis complete' },
                business_snapshot: raw.slice(0, 600),
                health_assessment: [
                    { category: 'Foundation', score: null, tier: 'amber', insight: 'See full blueprint for your detailed Foundation score.', estimated: true },
                    { category: 'Operations Efficiency', score: null, tier: 'amber', insight: 'See full blueprint for your detailed Operations score.', estimated: true },
                    { category: 'Growth Readiness', score: null, tier: 'amber', insight: 'See full blueprint for your detailed Growth Readiness score.', estimated: true },
                    { category: 'Scale Potential', score: null, tier: 'amber', insight: 'See full blueprint for your detailed Scale Potential score.', estimated: true },
                ],
                whats_working: ['See your full blueprint for a detailed strengths analysis.'],
                constraints: ['See your full blueprint for a detailed growth opportunity analysis.'],
                named_systems: [],
                highest_leverage_move: 'Your highest-leverage move is detailed in your full blueprint.',
                no_ai_zones: [],
                execution_gap: 'The gap is not effort — it\'s system design.',
                cta_line: 'Your full blueprint is ready to unlock.',
                _raw: raw,
                _parseError: true,
            };
        }
    } catch (err) {
        const msg = err.message || '';
        console.error('❌ Preview Report error:', msg);
        throw err;
    }
}
