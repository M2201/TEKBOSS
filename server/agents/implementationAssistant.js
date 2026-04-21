/**
 * IMPLEMENTATION ASSISTANT
 * Blueprint-grounded AI coaching system with dynamic knowledge injection.
 * Tool and pattern knowledge is selected per user based on their blueprint context.
 */
import { GoogleGenAI } from '@google/genai';
import {
    IMPLEMENTATION_ASSISTANT_PROMPT,
    buildAssistantContext
} from './prompts.js';
import { buildCoachingKnowledgeBlock } from '../knowledge/selectKnowledge.js';

export async function runImplementationAssistant(apiKey, blueprint, userMessage, conversationHistory = []) {
    const ai = new GoogleGenAI({ apiKey });
    const contextMessage = buildAssistantContext(blueprint, userMessage);

    // Build dynamic knowledge block for this user's tools + systems
    const knowledgeBlock = buildCoachingKnowledgeBlock(blueprint);

    // System instruction = base coaching prompt + relevant knowledge
    const systemInstruction = IMPLEMENTATION_ASSISTANT_PROMPT + knowledgeBlock;

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
                systemInstruction,
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
