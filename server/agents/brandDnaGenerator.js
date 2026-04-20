/**
 * BRAND DNA GENERATOR AGENT
 * Constructs a full brand identity profile from intake answers.
 */
import { GoogleGenAI } from '@google/genai';
import { BRAND_DNA_GENERATOR_PROMPT, buildBrandIntelligenceContext } from './prompts.js';

export async function runBrandDnaGenerator(apiKey, executiveSummary, answers) {
  const ai = new GoogleGenAI({ apiKey });

  const context = buildBrandIntelligenceContext(executiveSummary, answers);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: context }] }],
      config: {
        systemInstruction: BRAND_DNA_GENERATOR_PROMPT,
        temperature: 0.4,
      },
    });

    const text = response.text.trim();
    const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonText);
    console.log('✅ Brand DNA Generator complete');
    return parsed;
  } catch (err) {
    console.error('❌ Brand DNA Generator error:', err.message);
    // Return minimal fallback so downstream doesn't break
    return {
      brandEssence: { corePromise: '', positioningStatement: '', uniqueValueProposition: '' },
      brandPersonality: { archetypes: [], personalityTraits: [], antiPersonality: [] },
      voiceAndTone: { primaryVoice: '', toneByContext: {}, forbiddenWords: [], preferredPhrasing: [] },
      visualAesthetic: { colorDescription: '', typographyFeel: '', imageryStyle: '' },
      brandKeywords: [],
      elevatorStatement: '',
    };
  }
}
