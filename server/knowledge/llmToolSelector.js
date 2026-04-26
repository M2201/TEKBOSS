/**
 * LLM TOOL SELECTOR — Option C (80/20)
 *
 * Replaces the brittle keyword regex in selectKnowledge.js with a single
 * Gemini call that reads the business context and picks the most relevant
 * tools by name. Much more accurate for edge cases and unusual business types.
 *
 * The full tool catalog is passed as a list of names + one-line descriptions.
 * Gemini picks the top 8 and returns a JSON array of tool keys.
 */
import { GoogleGenAI } from '@google/genai';

const TOOL_CATALOG = `
chatgpt - OpenAI's GPT-4o: general AI assistant, content generation, custom GPTs
claude - Anthropic Claude: long-form reasoning, document analysis, detailed writing
gemini - Google Gemini: multimodal AI, workspace integration, deep research
perplexity - AI-powered web search with citations, real-time research
zapier - No-code automation connecting 6,000+ apps, trigger-based workflows
make - Visual automation builder (formerly Integromat), complex multi-step flows
n8n - Open-source automation, self-hostable, developer-friendly workflows
hubspot - CRM, email marketing, sales pipeline, contact management
activecampaign - Email automation, CRM, customer journey builder
mailchimp - Email marketing, audience segmentation, basic automation
convertkit - Creator-focused email marketing, landing pages, paid newsletters
intercom - Customer messaging, live chat, AI-powered support bot
tidio - Live chat + AI chatbot for e-commerce and service businesses
notion - All-in-one workspace: docs, databases, wikis, project management
clickup - Project management, task tracking, team collaboration
airtable - Flexible database/spreadsheet hybrid, automation, app building
buffer - Social media scheduling, analytics, team content workflows
jasper - AI copywriting for ads, blogs, emails, and marketing content
calendly - Meeting scheduling automation, calendar sync, booking pages
quickbooks - Accounting, invoicing, payroll, financial reporting
heygen - AI video avatars, talking-head videos from text scripts
synthesia - AI video generation with realistic avatars, multilingual
did - AI video from photos, animated presentations
elevenlabs - Ultra-realistic AI voice cloning and text-to-speech
murf - AI voiceover for videos, presentations, podcasts
descript - Video/podcast editing with AI transcription and overdub
runway - AI video generation, editing, and visual effects
`;

/**
 * Select relevant tools using Gemini judgment instead of keyword regex.
 *
 * @param {string} apiKey         - Gemini API key
 * @param {object} businessContext - { executiveSummary, validatedData }
 * @returns {string[]}             - Array of tool keys (e.g. ['zapier', 'hubspot', 'chatgpt'])
 */
export async function selectToolsWithLlm(apiKey, businessContext) {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are selecting the most relevant AI tools for a specific business.

BUSINESS CONTEXT:
${businessContext.executiveSummary || ''}

VALIDATED BUSINESS DATA:
- Industry: ${businessContext.validatedData?.brandFoundation?.industry || 'Unknown'}
- Opportunity Zones: ${JSON.stringify(businessContext.validatedData?.opportunityZones || [])}
- Existing Tools: ${JSON.stringify(businessContext.validatedData?.existingToolStack || [])}
- Named Systems: ${JSON.stringify((businessContext.validatedData?.namedSystems || []).map(s => s.name || s))}
- Required Capabilities: ${JSON.stringify(businessContext.validatedData?.requiredCapabilities || [])}

AVAILABLE TOOLS:
${TOOL_CATALOG}

Select the 8 most relevant tools for this specific business. Prioritize:
1. Tools that integrate with their existing stack
2. Tools that directly support their named systems
3. Tools that address their specific opportunity zones
4. Always include at least one LLM and one automation tool

Return ONLY a JSON array of tool keys from the list above. Example: ["zapier", "hubspot", "chatgpt", "calendly", "notion", "activecampaign", "heygen", "buffer"]
Return nothing else — just the JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text.trim();
    const parsed = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, ''));
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log(`🔧 LLM Tool Selector: picked [${parsed.join(', ')}]`);
      return parsed.slice(0, 10);
    }
  } catch (err) {
    console.warn('⚠️  LLM Tool Selector failed, falling back to keyword selection:', err.message);
  }

  // Fallback: always return the basics if LLM call fails
  return ['chatgpt', 'zapier', 'hubspot', 'notion', 'calendly'];
}
