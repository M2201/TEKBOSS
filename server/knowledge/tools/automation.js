/**
 * COACHING KB — AUTOMATION TOOLS
 * Covers: Zapier, Make (Integromat), n8n, Activepieces
 * lastVerified: 2025-Q1
 */

export const AUTOMATION_TOOLS = {

  zapier: {
    name: 'Zapier',
    vendor: 'Zapier',
    category: 'Automation',
    lastVerified: '2025-Q1',
    plans: {
      free: '100 tasks/mo, 5 Zaps, single-step only',
      starter: '$19.99/mo — 750 tasks, multi-step Zaps, filters',
      professional: '$49/mo — 2000 tasks, paths (branching), custom logic',
      team: '$69/mo — 2000 tasks, shared workspace, unlimited users',
    },
    useCases: [
      'Connect CRM to email marketing — new HubSpot contact → add to ActiveCampaign sequence automatically',
      'Lead capture → CRM → notification — form submission triggers contact creation + Slack alert',
      'Calendar booking → onboarding — Calendly booking creates client folder, sends welcome email, adds to project tool',
      'Review collection — completed job → automated review request via email/SMS 24 hours later',
      'Social media scheduling — blog published → auto-post to LinkedIn, Facebook, Twitter via Buffer',
    ],
    bestFor: 'Businesses with 5-50 automations, non-technical operators, straightforward linear workflows',
    setupGuide: {
      principles: [
        'A Zap = Trigger + Action(s). One event causes one or more responses. Master this mental model first.',
        'Always test each Zap step with real data before activating — use the "Test" button at each step',
        'Name Zaps with the pattern: [TRIGGER SOURCE] → [ACTION] — e.g. "HubSpot New Contact → Add to Email Sequence"',
        'Start with the 5 workflows most worth automating: lead capture, client onboarding, review requests, invoice reminders, content posting',
        'Filters prevent unwanted triggers — add a filter step to restrict which records activate the Zap',
      ],
      coreWorkflowRecipes: [
        'Lead Capture: Website form → HubSpot contact → Slack notification to sales team',
        'Client Onboarding: Stripe payment → create Notion project page → send welcome email → add to Asana board',
        'Review Request: Acuity appointment marked complete → wait 24 hours → send review link via email',
        'Content Repurpose: New YouTube video → extract transcript → draft LinkedIn post via ChatGPT → save draft to Buffer',
        'Invoice Reminder: QuickBooks overdue invoice → email reminder → after 7 days → Slack alert to account manager',
      ],
      gotchas: [
        'Zapier counts each task execution — complex multi-step Zaps burn tasks quickly; monitor usage',
        'Free plan only allows single-step Zaps — almost nothing useful is single-step; plan for at least Starter',
        'Some apps have API rate limits that Zapier can\'t override — HubSpot allows 100 API calls/10 seconds',
        'Zapier isn\'t real-time for all triggers — some apps poll every 5-15 minutes, not instantly',
        'Error handling is limited — always set up Zapier email error notifications and check the task history weekly',
      ],
    },
    integratesWith: ['5000+ apps — HubSpot, Slack, Gmail, Sheets, Notion, Airtable, Stripe, QuickBooks, Calendly, HeyGen, ChatGPT, and more'],
    dfyTriggers: [
      'User needs branching logic (if X then Y, else Z) — point to Paths feature or suggest Make for complexity',
      'User is burning task limits with high-volume automations — consider Make\'s operation model',
      'User needs API webhooks or custom code steps — upgrade to Professional or evaluate Make/n8n',
    ],
  },

  make: {
    name: 'Make (formerly Integromat)',
    vendor: 'Make',
    category: 'Automation',
    lastVerified: '2025-Q1',
    plans: {
      free: '1000 operations/mo, unlimited scenarios, 15 min interval',
      core: '$9/mo — 10K operations, 5 min interval, data stores',
      pro: '$16/mo — 10K operations, 1 min interval, custom functions, full-text execution log',
      teams: '$29/mo — 10K operations, team collaboration, scenario locking',
    },
    useCases: [
      'Complex multi-branch workflows that Zapier Paths can\'t handle cleanly',
      'Data transformation — reformatting, parsing, aggregating before passing to next app',
      'High-volume automations (thousands of records) where Zapier costs become prohibitive',
      'Custom API integrations with detailed control over request/response handling',
      'Scheduled batch processes — pull data, process, and update at set intervals',
    ],
    bestFor: 'Businesses with complex logic, technical operators, or high automation volume; developers building custom integrations',
    setupGuide: {
      principles: [
        'Make uses a visual canvas model — you see the full data flow, which makes complex scenarios much easier to debug than Zapier',
        'Operations (Make\'s unit) = data bundle processed by a module — one trigger with 100 records = 100 operations',
        'Routers in Make = branching — direct data down different paths based on conditions',
        'Aggregators in Make = merge multiple bundles back into one — powerful for summary reports and batch sends',
        'Use data stores (Make\'s built-in database) to track state between scenario runs without an external database',
      ],
      coreWorkflowRecipes: [
        'Complex Onboarding: Payment → branch by plan type → different folder structures, welcome sequences, and project templates per plan',
        'Batch Reporting: Scheduled daily run → pull all CRM activities → aggregate → format → send summary email',
        'Multi-System Sync: Website form → update HubSpot + add to Airtable + create Asana task + send welcome via Mailchimp simultaneously',
        'Error Recovery: Webhook receives data → validate → if invalid, log to Google Sheets + send Slack alert → if valid, process normally',
      ],
      gotchas: [
        'Make has a steeper learning curve than Zapier — budget 2-3x the setup time for the same workflow',
        'The free plan runs scenarios every 15 minutes minimum — not suitable for real-time triggers',
        'Make scenarios can run for a long time if processing thousands of records — watch the execution time limits',
        'Error handling in Make is more powerful but more complex — learn the Error Handler module before going to production',
      ],
    },
    vsZapier: [
      'Use Zapier when: the workflow is linear, team is non-technical, quick setup is the priority, and you\'re connecting popular apps',
      'Use Make when: the logic is complex (multiple branches, data transformation), volume is high, or you need granular API control',
      'Many businesses use both: Zapier for simple triggers, Make for complex data pipelines',
    ],
    integratesWith: ['1000+ apps, plus HTTP/Webhook module for any REST API'],
    dfyTriggers: [
      'User needs a full custom automation architecture designed and built',
      'User needs complex data transformation between systems',
      'User is migrating from Zapier and needs scenarios rebuilt in Make',
    ],
  },

  n8n: {
    name: 'n8n',
    vendor: 'n8n GmbH',
    category: 'Automation',
    lastVerified: '2025-Q1',
    plans: {
      selfHosted: 'Free forever — unlimited workflows, unlimited executions, self-hosted on your own server',
      cloud: '$20/mo — 2500 executions/mo, hosted by n8n',
      enterprise: 'Custom — SSO, advanced permissions, dedicated support',
    },
    useCases: [
      'Unlimited automation at no per-execution cost when self-hosted — ideal for high-volume workflows',
      'Custom code nodes — run JavaScript or Python directly inside a workflow',
      'Building internal tools and automation visible only to your team',
      'AI agent workflows — n8n has native LangChain and AI agent node support',
    ],
    bestFor: 'Technical teams, developers, or businesses with high automation volume that makes SaaS pricing prohibitive; AI-powered workflow automation',
    setupGuide: {
      principles: [
        'n8n\'s value proposition is: pay once for a server, run unlimited automations forever',
        'Self-hosting requires a VPS (DigitalOcean, Railway, Render) — budget $6-12/mo for the server',
        'n8n has native AI Agent nodes — connect to OpenAI, Anthropic, or Google Gemini without custom code',
        'Use n8n for orchestration: it can call Make or Zapier webhooks as part of a larger workflow',
      ],
      gotchas: [
        'Self-hosted n8n requires DevOps comfort — server setup, SSL, backups, updates',
        'n8n Cloud executions are capped — if you need self-hosting benefits, commit to the server setup',
        'Community nodes may not be maintained — test thoroughly before relying on them in production',
        'Debugging is harder than Make or Zapier — error messages are more technical',
      ],
    },
    integratesWith: ['400+ built-in integrations plus HTTP node for any API; native AI integrations'],
    dfyTriggers: [
      'User wants n8n self-hosted — needs DevOps support for setup',
      'User wants to build AI agents with n8n — complex workflow design needed',
    ],
  },
};
