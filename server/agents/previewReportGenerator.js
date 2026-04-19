/**
 * PREVIEW REPORT GENERATOR
 * Generates a conversion-focused preview report using the validated data.
 * This is the FREE deliverable — designed to create trust, curiosity, and tension.
 */
import { GoogleGenAI } from '@google/genai';
import {
    PREVIEW_REPORT_PROMPT,
    buildPreviewContext
} from './prompts.js';

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

        const text = response.text.trim();
        console.log('✅ Preview Report complete');
        return text;
    } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Preview Report error:', msg);
        return 'Preview report could not be generated. Please retry.';
    }
}
