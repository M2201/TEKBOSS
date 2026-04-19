/**
 * IMPLEMENTATION ASSISTANT
 * Blueprint-grounded AI support system that guides execution.
 * Maintains conversation context and references the user's saved blueprint.
 */
import { GoogleGenAI } from '@google/genai';
import {
    IMPLEMENTATION_ASSISTANT_PROMPT,
    buildAssistantContext
} from './prompts.js';

export async function runImplementationAssistant(apiKey, blueprint, userMessage, conversationHistory = []) {
    const ai = new GoogleGenAI({ apiKey });
    const contextMessage = buildAssistantContext(blueprint, userMessage);

    // Build conversation with history
    const contents = [];

    // Add conversation history (up to last 10 exchanges)
    const recentHistory = conversationHistory.slice(-20);
    for (const msg of recentHistory) {
        contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        });
    }

    // Add the current message with blueprint context
    contents.push({
        role: 'user',
        parts: [{ text: contextMessage }]
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: IMPLEMENTATION_ASSISTANT_PROMPT,
                temperature: 0.4,
                maxOutputTokens: 2048,
            },
        });

        const text = response.text.trim();
        console.log('✅ Implementation Assistant response generated');
        return text;
    } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            throw err;
        }
        console.error('❌ Implementation Assistant error:', msg);
        return 'I was unable to process your request. Please try rephrasing your question, or contact support if this persists.';
    }
}
