/**
 * IMPLEMENTATION ASSISTANT
 * Blueprint-grounded AI coaching system with dynamic knowledge injection
 * and invisible DISC personality adaptation.
 */
import { GoogleGenAI } from '@google/genai';
import {
    IMPLEMENTATION_ASSISTANT_PROMPT,
    buildAssistantContext
} from './prompts.js';
import { buildCoachingKnowledgeBlock } from '../knowledge/selectKnowledge.js';
import {
    buildProfile,
    getProbeInstruction,
    getCoachingStyleInstruction,
} from '../knowledge/personalityEngine.js';

export async function runImplementationAssistant(apiKey, blueprint, userMessage, conversationHistory = []) {
    const ai = new GoogleGenAI({ apiKey });
    const contextMessage = buildAssistantContext(blueprint, userMessage);

    // ── Personality adaptation ───────────────────────────────────────────────
    const discAccumulator = blueprint?.discAccumulator || { D: 0, I: 0, S: 0, C: 0 };
    const interactionCount = blueprint?.coachInteractionCount || 0;
    const personalityProfile = buildProfile(discAccumulator, interactionCount);

    const coachingStyleBlock = getCoachingStyleInstruction(personalityProfile);
    const probeInstruction    = getProbeInstruction(interactionCount);

    // ── System instruction ───────────────────────────────────────────────────
    // Base prompt + coaching knowledge (tool-specific) + personality style + probe
    const knowledgeBlock   = buildCoachingKnowledgeBlock(blueprint);
    const taskBlock        = blueprint.taskProgressContext || '';
    let systemInstruction  = IMPLEMENTATION_ASSISTANT_PROMPT + knowledgeBlock + taskBlock + coachingStyleBlock;
    if (probeInstruction) {
        systemInstruction += `\n\n---\nPROBE INJECTION INSTRUCTION (for this response only):\n${probeInstruction}\n---\n`;
    }


    // ── Conversation ─────────────────────────────────────────────────────────
    const contents = [];
    const recentHistory = conversationHistory.slice(-20);
    for (const msg of recentHistory) {
        contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        });
    }
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
        console.log(`✅ Coach response | turn=${interactionCount} | DISC=${personalityProfile.primary || 'inferring'}`);
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

