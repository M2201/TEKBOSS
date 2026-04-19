/**
 * DYNAMIC FOLLOW-UP GENERATOR
 * Evaluates a user's answer to a discovery question and, if needed,
 * generates a single contextual follow-up question.
 */
import { GoogleGenAI } from '@google/genai';
import {
    DYNAMIC_FOLLOWUP_PROMPT,
    buildFollowUpContext
} from './prompts.js';

export async function runFollowUpGenerator(apiKey, originalQuestion, userAnswer, businessName, industry) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildFollowUpContext(originalQuestion, userAnswer, businessName, industry);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: DYNAMIC_FOLLOWUP_PROMPT,
                temperature: 0.6,
                maxOutputTokens: 100,
            },
        });

        const text = response.text.trim().replace(/^"|"$/g, '').trim();

        // Gate 1: NO_FOLLOWUP signal
        if (!text || text.includes('NO_FOLLOWUP')) return null;

        // Gate 2: Must end with a question mark — incomplete sentences are dropped
        if (!text.endsWith('?')) return null;

        // Gate 3: Must be meaningful length (not a truncated fragment like "Can you tell?")
        if (text.length < 20) return null;

        // Gate 4: Must be at least 5 words
        if (text.split(/\s+/).length < 5) return null;

        return text;
    } catch (err) {
        console.error('❌ Follow-up generator error:', err.message);
        return null; // gracefully skip on error — never block the interview
    }
}
