/**
 * COACHING KB — CRM & CUSTOMER ENGAGEMENT
 * Covers: HubSpot, ActiveCampaign, Mailchimp, ConvertKit/Kit, Salesforce, Intercom, Tidio
 * lastVerified: 2025-Q1
 */

export const CRM_TOOLS = {

  hubspot: {
    name: 'HubSpot',
    vendor: 'HubSpot',
    category: 'CRM / Marketing Automation',
    lastVerified: '2025-Q1',
    plans: {
      free: 'Full CRM, contact management, deal pipeline, basic email (2000 sends/mo), forms, live chat',
      starterMarketing: '$15/mo — removes HubSpot branding, 1000 marketing contacts, simple automation',
      professionalMarketing: '$800/mo — full marketing automation, custom reporting, smart content',
      enterpriseMarketing: '$3600/mo — advanced teams, custom objects, predictive scoring',
      starterSales: '$15/mo — sequences, meeting links, deal tracking',
      professionalSales: '$450/mo — full automation, custom reports, playbooks',
    },
    useCases: [
      'Central contact database — every interaction (email, call, form, meeting) logged automatically',
      'Deal pipeline — track every prospect from first touch to closed client with probability scoring',
      'Email sequences — automated multi-touch follow-up sequences that pause when prospect replies',
      'Meeting booking — HubSpot meeting links sync with calendar, create contact records automatically',
      'Client onboarding — automated task assignments and email sequences triggered by deal closure',
    ],
    bestFor: 'Service businesses, B2B companies, and coaches/consultants who need a scalable CRM with built-in marketing automation; businesses that want all sales and marketing in one platform',
    setupGuide: {
      principles: [
        'Start with the free CRM — it\'s genuinely powerful and most small businesses never need to leave it',
        'Define your deal stages before adding contacts — the pipeline stages should match your actual sales process',
        'Use HubSpot as the system of record — all other tools should push data to HubSpot, not replace it',
        'Sequences (in Sales Hub) are the highest-leverage feature — automated follow-ups that feel personal',
        'Set up email tracking from day one — knowing when prospects open emails changes how you follow up',
      ],
      coreSetupWorkflow: [
        '1. Import existing contacts from CSV or CRM migration (Contacts → Import)',
        '2. Define your deal stages: e.g. New Lead → Qualified → Proposal Sent → Negotiation → Closed Won',
        '3. Create email templates for the 5 most common responses you write manually',
        '4. Set up a meeting booking link (Sales → Meetings) and embed on website',
        '5. Create a basic contact form on your website connected to HubSpot',
        '6. Set up a welcome sequence: new lead → email 1 immediately → email 2 (day 3) → email 3 (day 7)',
      ],
      automationRecipes: [
        'New contact → auto-enroll in welcome sequence → notify sales rep via Slack',
        'Deal moves to Proposal Sent → create task "follow up in 3 days" → send proposal template email',
        'Deal closes → add to client onboarding list → trigger Zapier/Make to create project in Notion/Asana',
        'Contact opens email 3+ times → notify sales rep → create task "high intent — call now"',
      ],
      gotchas: [
        'Marketing Hub Professional ($800/mo) is a significant jump — evaluate if you actually need advanced automation before committing',
        'Contact limits on Marketing Hub are per marketing contact, not total contacts — plan your segmentation',
        'HubSpot workflows only trigger on NEW data by default — re-enrollment must be explicitly enabled',
        'Email deliverability requires domain authentication (SPF, DKIM) — set this up before sending campaigns',
        'The HubSpot free CRM lacks sequences — you need Sales Hub Starter ($15/mo) for automated follow-ups',
      ],
    },
    aiFeatures: {
      contentAssistant: 'AI writing assistant inside email, blog, and page editors — generates drafts from prompts',
      chatspot: 'ChatGPT-style interface to query and update your HubSpot data in natural language',
      forecastingAI: 'AI deal score predicts close probability based on engagement signals',
    },
    integratesWith: ['Zapier', 'Make', 'Slack', 'Zoom', 'Calendly', 'Stripe', 'QuickBooks', 'Gmail', 'Outlook', 'ChatGPT (via Zapier)', 'HeyGen (via Zapier)'],
    dfyTriggers: [
      'User needs a full HubSpot setup with custom pipelines, workflows, and integrations',
      'User is migrating from Salesforce or another CRM',
      'User needs HubSpot connected to multiple other tools in a complex data flow',
    ],
  },

  activecampaign: {
    name: 'ActiveCampaign',
    vendor: 'ActiveCampaign',
    category: 'Email Marketing / CRM',
    lastVerified: '2025-Q1',
    plans: {
      starter: 'From $15/mo — 1000 contacts, basic automation, email marketing',
      plus: 'From $49/mo — CRM, landing pages, SMS, custom domain',
      professional: 'From $79/mo — predictive sending, split automation, site messages',
    },
    useCases: [
      'Advanced email automation sequences with branching logic based on behaviour',
      'Tagging and segmentation — send the right message based on what contacts click, buy, or do',
      'Lead scoring — automatically prioritise who sales should call based on engagement points',
      'E-commerce automation — abandoned cart, post-purchase follow-up, re-engagement',
    ],
    bestFor: 'Businesses where email marketing is the primary revenue driver; e-commerce; online educators and course sellers; businesses with complex lead nurturing sequences',
    setupGuide: {
      principles: [
        'ActiveCampaign excels at conditional logic — "if they clicked this, send that; if they didn\'t, send something else"',
        'Tag everything: every action, interest, purchase, opt-in should apply a tag — tags drive automation',
        'Use Goals in automations to jump contacts forward when they complete a desired action (e.g. book a call)',
        'ActiveCampaign is more powerful but more complex than Mailchimp — plan for 2x setup time',
      ],
      automationRecipes: [
        'Free resource download → 5-email nurture sequence → if no call booked after day 14 → offer DFY service',
        'Purchase → 3-email welcome/onboarding → 2-week wait → check-in → 30-day satisfaction survey',
        'Lead score reaches 50 → notify sales rep → add to hot leads list → send personal email from rep',
        'Email not opened after 14 days → send re-engagement email with different subject line',
      ],
      gotchas: [
        'ActiveCampaign pricing scales by contact count — audit and clean list quarterly to avoid overpaying',
        'The CRM (Plus+) is basic compared to HubSpot — use for simple deal tracking only',
        'Automation reporting is limited on Starter — upgrade to Professional for performance insights',
      ],
    },
    integratesWith: ['Zapier', 'Make', 'Shopify', 'WooCommerce', 'Stripe', 'Calendly', 'Typeform'],
    dfyTriggers: [
      'User needs a complete email automation strategy and implementation',
      'User needs to migrate from Mailchimp with automation intact',
    ],
  },

  mailchimp: {
    name: 'Mailchimp',
    vendor: 'Intuit',
    category: 'Email Marketing',
    lastVerified: '2025-Q1',
    plans: {
      free: '500 contacts, 1000 sends/mo, basic templates, 1 audience',
      essentials: 'From $13/mo — 500 contacts, 5000 sends, A/B testing, 3 audiences',
      standard: 'From $20/mo — 500 contacts, 6000 sends, automation, behavioural targeting',
    },
    useCases: [
      'Newsletter and regular email communication to an engaged list',
      'Basic welcome and follow-up sequences for new subscribers',
      'E-commerce product announcements and promotional emails',
    ],
    bestFor: 'Businesses just starting with email marketing; non-profits; local businesses with simple communication needs',
    principles: [
      'Mailchimp is the easy entry point — if outgrowing it, migrate to ActiveCampaign or HubSpot',
      'Don\'t build complex automation in Mailchimp — it\'s not designed for it; move to AC or HubSpot',
      'Mailchimp\'s analytics are sufficient for basic list performance but limited for revenue attribution',
    ],
    integratesWith: ['Zapier', 'Shopify', 'WooCommerce', 'Squarespace'],
    dfyTriggers: ['User is ready to graduate from Mailchimp — help select and migrate to a more powerful platform'],
  },

  convertkit: {
    name: 'Kit (ConvertKit)',
    vendor: 'ConvertKit',
    category: 'Email Marketing / Creator CRM',
    lastVerified: '2025-Q1',
    plans: {
      free: '10K subscribers, unlimited broadcasts, basic automation',
      creator: '$25/mo — automations, sequences, integrations, free migration',
      creatorPro: '$50/mo — subscriber scoring, advanced reporting, newsletter referral system',
    },
    useCases: [
      'Building and monetising a newsletter audience',
      'Course and digital product launch email sequences',
      'Community-based business email marketing',
      'Creator economy businesses: coaches, writers, artists, educators',
    ],
    bestFor: 'Creators, coaches, educators, authors, and newsletter operators who sell digital products or courses',
    principles: [
      'Kit excels at list-based monetisation — if your revenue comes from email, this is the platform',
      'The free plan is genuinely usable for early-stage creators — rare in email marketing',
      'Kit\'s landing page and form builder is strong — use it to grow the list, not just email the list',
    ],
    integratesWith: ['Zapier', 'Teachable', 'Podia', 'Gumroad', 'Shopify'],
    dfyTriggers: ['User wants a full creator monetisation funnel built (lead magnet → sequence → product launch)'],
  },

  intercom: {
    name: 'Intercom',
    vendor: 'Intercom',
    category: 'Customer Support / AI Chat',
    lastVerified: '2025-Q1',
    plans: {
      starter: '$39/mo — live chat, basic bots, inbox',
      pro: 'Custom pricing — AI agent (Fin), full automation, multiple inboxes',
      premium: 'Custom — enterprise features, SLA management, advanced AI',
    },
    useCases: [
      'AI-powered customer support — Fin AI agent resolves up to 50% of queries without human involvement',
      'Onboarding chat sequences — guide new users through setup with automated in-app messages',
      'Product-led sales — identify power users based on behaviour and trigger upgrade conversations',
      'Customer success — proactively reach out when behaviour signals churn risk',
    ],
    bestFor: 'SaaS products, online businesses with a significant support volume, businesses that want AI-first customer support',
    principles: [
      'Intercom\'s Fin AI agent is one of the best-in-class support AI tools — train it on your help articles and product documentation',
      'Set up the resolution bot before hiring a support person — it may resolve enough queries to delay the hire',
      'Use outbound messaging (in-app) for onboarding, not just reactive support',
    ],
    integratesWith: ['HubSpot', 'Salesforce', 'Zapier', 'Stripe', 'Jira', 'Slack'],
    dfyTriggers: ['User needs full Intercom + Fin AI setup and knowledge base built'],
  },

  tidio: {
    name: 'Tidio',
    vendor: 'Tidio',
    category: 'Live Chat / AI Customer Service',
    lastVerified: '2025-Q1',
    plans: {
      free: '50 live chat conversations/mo, Lyro AI 50 conversations',
      starter: '$29/mo — 100 live chat, Lyro AI unlimited',
      growth: '$59/mo — unlimited live chat, advanced automation',
    },
    useCases: [
      'Website visitor chat and lead capture without a dedicated support team',
      'Lyro AI chatbot for e-commerce — answers product questions, tracks orders, handles returns',
      'Automated chat flows to qualify leads before connecting to sales',
    ],
    bestFor: 'Small to mid-size e-commerce and service businesses that need a customer-facing chatbot without Intercom\'s enterprise pricing',
    principles: [
      'Tidio\'s Lyro AI is the affordable alternative to Intercom Fin — strong ROI for businesses under $10M revenue',
      'Set up Lyro before going live — configure it with your top 20 FAQs and product details',
      'Use the live chat escalation trigger to hand off to a human when Lyro can\'t resolve',
    ],
    integratesWith: ['Shopify', 'WordPress', 'Wix', 'BigCommerce', 'Zapier', 'HubSpot'],
    dfyTriggers: ['User wants a full chatbot + live chat system configured for their website'],
  },
};
