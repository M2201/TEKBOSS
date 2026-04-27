/**
 * STAGE 1 — INTAKE SYNTHESIZER
 * Converts raw 23-question answers into a structured Executive Summary.
 * Uses Gemini for now; drop in Claude SDK when API key is ready.
 */
import { GoogleGenAI } from '@google/genai';
import {
    INTAKE_SYNTHESIZER_PROMPT,
    buildIntakeContext
} from './prompts.js';

const FALLBACK_SUMMARY = `## Executive Summary

### Business Description
[Could not generate summary — please verify API configuration and retry.]

### Primary Goals
- Analysis incomplete

### Core Challenges  
- Analysis incomplete

### Differentiators & Unfair Advantages
- Analysis incomplete

### Constraints & Non-Negotiables
- Analysis incomplete

### Desired Outcomes
- Analysis incomplete`;

export async function runIntakeSynthesizer(apiKey, answers, websiteContent = null) {
    const ai = new GoogleGenAI({ apiKey });
    const userMessage = buildIntakeContext(answers, websiteContent);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: INTAKE_SYNTHESIZER_PROMPT,
                temperature: 0.3,
            },
        });

        const text = response.text.trim();
        console.log('✅ Intake Synthesizer complete');
        return text;
    } catch (err) {
        const msg = err.message || '';
        console.error('❌ Intake Synthesizer error:', msg);
        console.error('❌ Intake Synthesizer full error:', JSON.stringify({
            message: err.message,
            status: err.status,
            code: err.code,
            stack: err.stack?.substring(0, 500),
        }));
        throw err;
    }
}
