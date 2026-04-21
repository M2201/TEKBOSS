/**
 * COACHING KB — LLMs & AI ASSISTANTS
 * Covers: ChatGPT + Custom GPTs, Claude + Projects, Google Gemini + Gems, Perplexity
 * Layer: Semi-stable (update when major feature shifts occur)
 * lastVerified: 2025-Q1
 */

export const LLM_TOOLS = {

  chatgpt: {
    name: 'ChatGPT',
    vendor: 'OpenAI',
    category: 'LLM',
    lastVerified: '2025-Q1',
    plans: {
      free: 'GPT-4o mini access, limited GPT-4o, no custom GPTs publishing',
      plus: '$20/mo — GPT-4o, image generation, file uploads, custom GPT creation',
      team: '$25/user/mo — shared workspace, admin controls',
      enterprise: 'Custom pricing — SSO, data retention controls, higher limits',
    },
    useCases: [
      'Draft and refine client-facing copy with brand voice prompts',
      'Summarize long documents, meeting notes, and research',
      'Answer staff FAQs via a custom GPT trained on your SOPs',
      'Generate structured content calendars from a single brief',
    ],
    bestFor: 'Businesses that need a general-purpose AI writer and want to build internal tools without code',
    customGPTs: {
      what: 'Custom GPTs are pre-configured ChatGPT assistants with a custom system prompt, uploaded knowledge files, and optionally connected external tools via Actions',
      buildSteps: [
        'Open ChatGPT → Explore GPTs → Create',
        'Write a clear system prompt: role, tone, constraints, and output format',
        'Upload knowledge files (SOPs, FAQs, brand guidelines as PDF or text)',
        'Add Actions if you need it to call external APIs (Zapier, HubSpot, etc.)',
        'Set visibility: private (just you), link-only (share with team), or public',
        'Test with 10-15 representative queries before giving to team or clients',
      ],
      principles: [
        'A custom GPT is only as good as its system prompt — specificity beats brevity',
        'Upload your brand voice guide, tone examples, and do-not-say list as knowledge files',
        'Name the GPT after its function: "Proposal Writer", "Client Onboarder", "FAQ Bot"',
        'Private GPTs are free for Plus users — start there before building anything public',
      ],
      gotchas: [
        'GPT knowledge files are not searched in real-time — the model interprets them at configuration time; very large files may not be fully utilised',
        'Actions require external API configuration — if you just need workflows use Zapier ChatGPT plugin instead',
        'Free users cannot publish GPTs but can use ones shared by others',
      ],
    },
    integratesWith: ['Zapier', 'Make', 'HubSpot', 'Slack', 'Notion'],
    dfyTriggers: [
      'User needs a GPT that connects to their CRM data in real time',
      'User needs multiple custom GPTs with shared context',
      'User wants to publish a GPT as a client-facing product',
    ],
  },

  claude: {
    name: 'Claude',
    vendor: 'Anthropic',
    category: 'LLM',
    lastVerified: '2025-Q1',
    plans: {
      free: 'Claude 3 Haiku with daily limits',
      pro: '$20/mo — Claude 3.5 Sonnet, longer context, priority access',
      team: '$25/user/mo — shared Projects, admin controls',
      api: 'Pay per token — integrates into custom apps',
    },
    useCases: [
      'Long-document analysis — contracts, reports, lengthy research',
      'Complex reasoning tasks that need nuanced, cautious responses',
      'Writing that requires a more careful, conservative tone',
      'Code review and technical documentation',
    ],
    bestFor: 'Businesses with sensitive content, nuanced brand voice, or long-form document workflows',
    projects: {
      what: 'Claude Projects are persistent workspaces where you upload documents, set instructions, and maintain context across many conversations — similar to Custom GPTs but with stronger context retention',
      buildSteps: [
        'Open Claude → New Project',
        'Add a project description that defines the assistant role and context',
        'Upload relevant documents: brand guide, SOPs, FAQs, product sheets',
        'Set custom instructions at the project level',
        'All conversations in that project share the same document context',
        'Share project with team members (Team plan required)',
      ],
      principles: [
        'Projects are better than Custom GPTs for sensitive, long-form content — Claude handles 200K context tokens',
        'Upload source documents rather than summarising them — let Claude read the original',
        'Create one Project per function: "Sales Proposals", "Client Comms", "Internal Docs"',
      ],
      gotchas: [
        'Projects are not currently available on free plan',
        'Project files are read at runtime, not indexed — very large files slow responses',
        'No external tool Actions/integrations unlike ChatGPT custom GPTs',
      ],
    },
    integratesWith: ['Zapier', 'Make', 'Claude API directly'],
    dfyTriggers: [
      'User needs Claude integrated via API into a custom workflow',
      'User needs Claude connected to a database or live data source',
    ],
  },

  gemini: {
    name: 'Google Gemini & Gems',
    vendor: 'Google',
    category: 'LLM',
    lastVerified: '2025-Q1',
    plans: {
      free: 'Gemini 1.5 Flash access with limits',
      advanced: '$19.99/mo (Google One AI Premium) — Gemini 1.5 Pro, 1M token context, Gems, Workspace integration',
      workspace: 'Gemini for Google Workspace — add-on to Business/Enterprise plans',
    },
    useCases: [
      'Deep analysis of very long documents (up to 1M token context)',
      'Integration with Google Workspace: Gmail, Docs, Sheets, Drive automation',
      'Multimodal tasks: analysing images, videos, and audio alongside text',
      'Real-time web search + synthesis via Gemini Advanced',
    ],
    bestFor: 'Google Workspace businesses that want AI embedded in their existing tools without switching platforms',
    gems: {
      what: 'Gems are Gemini\'s equivalent of Custom GPTs — custom AI assistants with a defined role, instructions, and uploaded knowledge files, accessible in Gemini Advanced',
      buildSteps: [
        'Open gemini.google.com → Gem manager → New Gem',
        'Write instructions: define the role, tone, output format, and constraints',
        'Upload knowledge files (PDF, Docs, text) — up to several files',
        'Save and test with sample queries',
        'Share via link (anyone with Gemini Advanced can use a shared Gem link)',
      ],
      principles: [
        'Gems have native Google Drive access — great for businesses already using Drive for documents',
        'Best for Workspace-heavy operations: Docs drafting, Gmail composition, Sheets analysis',
        'A Gem can be set to always respond in your brand voice by including a full tone guide in instructions',
      ],
      gotchas: [
        'Gems require Gemini Advanced ($19.99/mo or Workspace add-on)',
        'Gems cannot call external APIs directly — no Actions like ChatGPT',
        'File knowledge is not live-synced — you must re-upload if source docs change',
        'Available on mobile via Google app but feature parity may lag web version',
      ],
    },
    workspaceIntegration: {
      gmail: 'Gemini can draft, summarize, and reply to emails — enable in Gmail Settings → See all settings → Gemini',
      docs: 'Gemini sidebar in Google Docs can draft sections, summarize content, and reformat — access via the Gemini icon in the toolbar',
      sheets: 'Gemini can create formulas, analyse data patterns, and generate charts from natural language',
      meet: 'Gemini can take meeting notes and generate action items automatically for Workspace Business users',
    },
    integratesWith: ['Google Workspace suite', 'Zapier', 'Make', 'AppSheet'],
    dfyTriggers: [
      'User needs Gemini API integrated into custom apps',
      'User needs Gemini connected to live database or CRM',
      'User needs Workspace AI automation beyond the built-in features',
    ],
  },

  perplexity: {
    name: 'Perplexity AI',
    vendor: 'Perplexity',
    category: 'AI Search / Research',
    lastVerified: '2025-Q1',
    plans: {
      free: 'Standard searches, limited Pro searches per day',
      pro: '$20/mo — unlimited Pro searches, file uploads, API access',
    },
    useCases: [
      'Real-time market research and competitor analysis with cited sources',
      'Quickly researching industry trends, pricing benchmarks, regulations',
      'Researching potential clients before meetings',
      'Answering specific factual questions with verifiable sources',
    ],
    bestFor: 'Businesses that need web-grounded research, not just language model output — financial services, legal, consulting, B2B sales',
    principles: [
      'Use Perplexity for facts that need sources; use ChatGPT/Claude for writing and analysis',
      'Perplexity Spaces (Pro) work like research folders — save and share searches with team',
      'Use it as a pre-meeting research tool: company background, recent news, decision-maker profiles',
    ],
    integratesWith: ['N/A — primarily standalone research tool'],
    dfyTriggers: ['User needs Perplexity API integrated into a research automation pipeline'],
  },
};
