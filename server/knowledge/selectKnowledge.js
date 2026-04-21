/**
 * KNOWLEDGE SELECTOR
 * Given a user's blueprint context, selects the relevant coaching knowledge sections.
 * Returns a formatted string injected into the coaching assistant's system prompt.
 * 
 * Design principle: only inject what is relevant — keeps prompts lean and coaching specific.
 * lastVerified: 2025-Q1
 */

import { LLM_TOOLS } from './tools/llms.js';
import { AUTOMATION_TOOLS } from './tools/automation.js';
import { CRM_TOOLS } from './tools/crm.js';
import { AVATAR_VOICE_TOOLS } from './tools/ai_avatars.js';
import { PRODUCTIVITY_TOOLS, IMPLEMENTATION_PATTERNS } from './tools/productivity.js';

// ─── Tool name aliases (what users might type vs. what we have in the KB) ────
const TOOL_ALIASES = {
  'chatgpt': 'chatgpt', 'openai': 'chatgpt', 'gpt': 'chatgpt', 'gpt4': 'chatgpt', 'gpt-4': 'chatgpt',
  'claude': 'claude', 'anthropic': 'claude',
  'gemini': 'gemini', 'google ai': 'gemini', 'bard': 'gemini', 'google gemini': 'gemini', 'gems': 'gemini',
  'perplexity': 'perplexity',
  'zapier': 'zapier',
  'make': 'make', 'integromat': 'make',
  'n8n': 'n8n',
  'hubspot': 'hubspot',
  'activecampaign': 'activecampaign', 'active campaign': 'activecampaign',
  'mailchimp': 'mailchimp',
  'convertkit': 'convertkit', 'kit': 'convertkit',
  'intercom': 'intercom',
  'tidio': 'tidio',
  'notion': 'notion',
  'clickup': 'clickup', 'click up': 'clickup',
  'airtable': 'airtable',
  'buffer': 'buffer',
  'jasper': 'jasper',
  'calendly': 'calendly',
  'quickbooks': 'quickbooks', 'qbo': 'quickbooks',
  'heygen': 'heygen', 'hey gen': 'heygen',
  'synthesia': 'synthesia',
  'd-id': 'did', 'did': 'did',
  'elevenlabs': 'elevenlabs', 'eleven labs': 'elevenlabs',
  'murf': 'murf',
  'descript': 'descript',
  'runway': 'runway', 'runwayml': 'runway',
};

// ─── All tools index ──────────────────────────────────────────────────────────
const ALL_TOOLS = {
  ...LLM_TOOLS,
  ...AUTOMATION_TOOLS,
  ...CRM_TOOLS,
  ...AVATAR_VOICE_TOOLS,
  ...PRODUCTIVITY_TOOLS,
};

// ─── System type → relevant tools mapping ────────────────────────────────────
const SYSTEM_TYPE_TOOLS = {
  'workflow automation': ['zapier', 'make', 'n8n'],
  'lead generation': ['hubspot', 'activecampaign', 'mailchimp', 'calendly'],
  'content engine': ['chatgpt', 'buffer', 'jasper', 'descript'],
  'client onboarding': ['notion', 'clickup', 'calendly', 'hubspot'],
  'customer engagement': ['hubspot', 'activecampaign', 'intercom', 'tidio'],
  'ai assistant': ['chatgpt', 'claude', 'gemini'],
  'video marketing': ['heygen', 'synthesia', 'descript', 'runway'],
  'voice ai': ['elevenlabs', 'murf', 'heygen'],
  'crm system': ['hubspot', 'activecampaign'],
  'knowledge management': ['notion', 'airtable'],
  'email marketing': ['activecampaign', 'mailchimp', 'convertkit', 'hubspot'],
  'social media': ['buffer', 'chatgpt'],
  'accounting': ['quickbooks'],
  'scheduling': ['calendly'],
};

/**
 * Normalise a tool name from user input or blueprint data to a KB key.
 */
function normaliseTool(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  return TOOL_ALIASES[lower] || lower;
}

/**
 * Select tools relevant to this user's blueprint context.
 * Combines: existingToolStack + named system types + opportunity zones.
 */
function selectRelevantToolKeys(blueprintContext) {
  const selected = new Set();

  // 1. Always include their existing tools
  const existing = blueprintContext.existingToolStack || blueprintContext.tools || [];
  for (const tool of existing) {
    const key = normaliseTool(tool);
    if (key && ALL_TOOLS[key]) selected.add(key);
  }

  // 2. Map named system names to relevant tools
  const systems = blueprintContext.namedSystems || blueprintContext.systems || [];
  for (const system of systems) {
    const systemName = (typeof system === 'string' ? system : system.name || '').toLowerCase();
    for (const [type, tools] of Object.entries(SYSTEM_TYPE_TOOLS)) {
      if (systemName.includes(type) || type.includes(systemName.split(' ')[0])) {
        tools.forEach(t => selected.add(t));
      }
    }
  }

  // 3. Map opportunity zones to relevant tools
  const zones = blueprintContext.opportunityZones || blueprintContext.goals || [];
  for (const zone of zones) {
    const z = zone.toLowerCase();
    for (const [type, tools] of Object.entries(SYSTEM_TYPE_TOOLS)) {
      if (z.includes(type.split(' ')[0]) || type.includes(z.split(' ')[0])) {
        tools.forEach(t => selected.add(t));
      }
    }
  }

  // 4. Always include at least one LLM context
  if (!['chatgpt', 'claude', 'gemini'].some(k => selected.has(k))) {
    selected.add('chatgpt');
  }

  // 5. Always include at least one automation tool
  if (!['zapier', 'make', 'n8n'].some(k => selected.has(k))) {
    selected.add('zapier');
  }

  return [...selected].slice(0, 10); // cap at 10 tools to keep prompt size manageable
}

/**
 * Select relevant implementation patterns based on available systems.
 */
function selectRelevantPatterns(blueprintContext) {
  const zones = (blueprintContext.opportunityZones || blueprintContext.goals || []).join(' ').toLowerCase();
  const systems = (blueprintContext.namedSystems || blueprintContext.systems || [])
    .map(s => typeof s === 'string' ? s : s.name || '')
    .join(' ')
    .toLowerCase();
  const context = zones + ' ' + systems;

  const patterns = [];
  if (context.match(/lead|prospect|acqui|generat/)) patterns.push('leadCaptureToCRM');
  if (context.match(/onboard|client.*welcome|welcome.*client/)) patterns.push('onboardingAutomation');
  if (context.match(/content|social|repurpos|publish/)) patterns.push('contentRepurposing');
  if (context.match(/review|testimonial|reputation/)) patterns.push('reviewCollection');

  return patterns.slice(0, 2); // max 2 patterns to keep prompt tight
}

/**
 * Format a tool entry for injection into the system prompt.
 * Keeps it tight — principles, use cases, and gotchas only.
 */
function formatToolForPrompt(key) {
  const tool = ALL_TOOLS[key];
  if (!tool) return null;

  let out = `\n### ${tool.name} (${tool.category})\n`;
  out += `**Best for:** ${tool.bestFor || ''}\n`;

  if (tool.useCases?.length) {
    out += `**Key use cases:**\n${tool.useCases.slice(0, 3).map(u => `- ${u}`).join('\n')}\n`;
  }

  // Add setup principles if present
  const principles = tool.setupGuide?.principles
    || tool.customGPTs?.principles
    || tool.projects?.principles
    || tool.gems?.buildSteps
    || tool.principles
    || [];
  if (principles.length) {
    out += `**Implementation principles:**\n${principles.slice(0, 3).map(p => `- ${p}`).join('\n')}\n`;
  }

  // Add gotchas
  const gotchas = tool.setupGuide?.gotchas
    || tool.customGPTs?.gotchas
    || tool.projects?.gotchas
    || tool.gotchas
    || [];
  if (gotchas.length) {
    out += `**Watch out for:**\n${gotchas.slice(0, 2).map(g => `- ${g}`).join('\n')}\n`;
  }

  // Add DFY triggers
  if (tool.dfyTriggers?.length) {
    out += `**Suggest DFY consultation when:** ${tool.dfyTriggers[0]}\n`;
  }

  out += `**lastVerified:** ${tool.lastVerified || 'N/A'} — advise user to verify current UI/pricing.\n`;
  return out;
}

/**
 * Format an implementation pattern for injection.
 */
function formatPatternForPrompt(key) {
  const p = IMPLEMENTATION_PATTERNS[key];
  if (!p) return null;

  let out = `\n### Implementation Pattern: ${p.name}\n`;
  out += `${p.description}\n`;
  out += `**Steps:** ${p.steps.slice(0, 4).join(' → ')}\n`;
  out += `**Tools needed:** ${p.tools.join(', ')}\n`;
  out += `**Est. time:** ${p.timeToImplement} | **ROI:** ${p.roi}\n`;
  return out;
}

/**
 * Main export: builds the coaching knowledge block for the assistant system prompt.
 * Call this at request time in implementationAssistant.js.
 */
export function buildCoachingKnowledgeBlock(blueprintContext) {
  if (!blueprintContext) return '';

  const toolKeys = selectRelevantToolKeys(blueprintContext);
  const patternKeys = selectRelevantPatterns(blueprintContext);

  let block = '\n\n---\n## COACHING KNOWLEDGE BASE\n';
  block += '_Relevant tools and patterns selected for this business. AI landscape changes fast — always note lastVerified dates and advise users to check current documentation._\n';

  block += '\n### RELEVANT TOOLS FOR THIS BLUEPRINT\n';
  for (const key of toolKeys) {
    const formatted = formatToolForPrompt(key);
    if (formatted) block += formatted;
  }

  if (patternKeys.length > 0) {
    block += '\n### IMPLEMENTATION PATTERNS TO LEAD WITH\n';
    for (const key of patternKeys) {
      const formatted = formatPatternForPrompt(key);
      if (formatted) block += formatted;
    }
  }

  block += '\n---\n';
  block += '**USAGE RULES:** Use this knowledge to give specific, actionable guidance. When referencing tool features, note the lastVerified date and state that the user should verify current UI and pricing. Never present tool-specific instructions as guaranteed — interfaces change.\n';

  return block;
}
