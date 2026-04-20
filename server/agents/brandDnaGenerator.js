import { GoogleGenerativeAI } from '@google/generative-ai';
import { BRAND_DNA_GENERATOR_PROMPT, buildBrandIntelligenceContext } from './prompts.js';

export async function runBrandDnaGenerator(apiKey, executiveSummary, answers) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const context = buildBrandIntelligenceContext(executiveSummary, answers);
  const prompt = `${BRAND_DNA_GENERATOR_PROMPT}\n\n---\n\nDATA TO ANALYZE:\n\n${context}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(jsonText);
  } catch (err) {
    console.error('Brand DNA generator error:', err.message);
    // Return a minimal fallback so the pipeline doesn't break
    return {
      brandEssence: { corePromise: '[Pending brand analysis]', positioningStatement: '', uniqueValueProposition: '' },
      brandPersonality: { archetypes: [], personalityTraits: [], antiPersonality: [] },
      voiceAndTone: { primaryVoice: '', toneByContext: {}, forbiddenWords: [], preferredPhrasing: [] },
      visualAesthetic: { colorDescription: '', typographyFeel: '', imageryStyle: '' },
      brandKeywords: [],
      elevatorStatement: '',
    };
  }
}
