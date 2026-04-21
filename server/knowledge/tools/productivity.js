/**
 * COACHING KB — PROJECT MANAGEMENT, CONTENT & SCHEDULING TOOLS
 * Covers: Notion, ClickUp, Airtable, Buffer, Jasper, Calendly, QuickBooks
 * lastVerified: 2025-Q1
 */

export const PRODUCTIVITY_TOOLS = {

  notion: {
    name: 'Notion',
    vendor: 'Notion',
    category: 'Project Management / Knowledge Base',
    lastVerified: '2025-Q1',
    plans: {
      free: 'Unlimited pages, unlimited blocks, limited AI, 1 week history',
      plus: '$10/user/mo — unlimited history, unlimited file uploads, 100 guest collaborators',
      business: '$15/user/mo — advanced permissions, audit log, SAML SSO',
    },
    useCases: [
      'Company operating system — SOPs, processes, meeting notes, and project tracking in one place',
      'Client portals — share a Notion page with clients as their project dashboard (no login required)',
      'Content calendar — plan, write, and track all content in a database with status, publish dates, and channels',
      'Team wiki and knowledge base — searchable documentation that replaces scattered Google Docs',
      'CRM lite — simple contact and deal tracking before graduating to HubSpot',
    ],
    bestFor: 'Small teams and solo operators who need a flexible, affordable operational hub; knowledge workers; creative agencies',
    setupGuide: {
      principles: [
        'Notion is a blank canvas — start with a template, don\'t build from scratch',
        'The database view (Table, Board, Calendar, Gallery) is the power feature — use databases over plain pages for anything you track repeatedly',
        'Build Notion as your SOP library first — documented processes are the foundation that all automation depends on',
        'Use Notion AI to summarise meeting notes, draft SOPs, and generate first drafts — it\'s built into the editor',
      ],
      coreSetupWorkflow: [
        '1. Start with the "Team Wiki" or "Project Management" template',
        '2. Create a Company Database with your core databases: Projects, Tasks, Clients, Content, SOPs',
        '3. Link databases together — a Project has Tasks, a Client has Projects, a Content piece has a Status',
        '4. Add the "Content Calendar" view to your Content database',
        '5. Set up client portals: duplicate a project template for each new client, share via public link',
      ],
      notionAI: [
        'Ask AI in any page: highlight text and ask Notion AI to summarise, improve, or expand',
        'Generate meeting summaries from raw notes',
        'Draft SOPs from bullet points',
        'Create action items from meeting transcripts',
      ],
      gotchas: [
        'Notion is not a substitute for a real CRM — use it to bridge the gap until HubSpot is set up',
        'Mobile app is slower than the web app for complex databases',
        'Permissions can get complex in large workspaces — keep it simple until you need advanced controls',
        'Notion AI requires a paid plan and incurs additional charges on lower tiers',
      ],
    },
    integratesWith: ['Zapier', 'Make', 'Slack (native)', 'GitHub', 'Jira', 'Google Calendar', 'HubSpot (via Zapier)'],
    dfyTriggers: [
      'User needs a full Notion operating system built for their business',
      'User needs Notion connected to CRM, project tools, or client portals',
    ],
  },

  clickup: {
    name: 'ClickUp',
    vendor: 'ClickUp',
    category: 'Project Management',
    lastVerified: '2025-Q1',
    plans: {
      free: 'Unlimited tasks, 100MB storage, basic features, 5 workspaces',
      unlimited: '$7/user/mo — unlimited storage, integrations, goals, dashboards',
      business: '$12/user/mo — custom fields, workload management, timeline view',
    },
    useCases: [
      'Full project management for client delivery teams — task assignment, deadlines, time tracking',
      'Sprint planning for product or development teams',
      'Resource management — who is working on what and when',
      'Client reporting — dashboards that show project status without giving full access',
    ],
    bestFor: 'Service businesses with multiple concurrent client projects; teams that need granular task management and time tracking',
    principles: [
      'ClickUp is more powerful than Notion for project execution but worse for knowledge storage — use both if you have the capacity',
      'Start with one Space per major area of your business (Client Work, Internal, Marketing)',
      'ClickUp AI can create task lists from a brief, summarise task comments, and generate first drafts',
      'The "Everything" view shows all tasks across all workspaces — useful for daily standup',
    ],
    integratesWith: ['Zapier', 'Make', 'Slack', 'GitHub', 'HubSpot', 'Time tracking tools'],
    dfyTriggers: ['User needs a full ClickUp workspace architecture and template library built'],
  },

  airtable: {
    name: 'Airtable',
    vendor: 'Airtable',
    category: 'Database / Project Management',
    lastVerified: '2025-Q1',
    plans: {
      free: '1000 records/base, 1GB storage, 2 weeks revision history',
      plus: '$10/user/mo — 5000 records, 3-year revision history',
      pro: '$20/user/mo — 50K records, Gantt/timeline, custom branded forms',
      business: '$45/user/mo — 100K records, admin tools',
    },
    useCases: [
      'Content operations database — manage content pipeline with custom fields and workflow views',
      'Client/project tracking with custom views per stakeholder',
      'Product catalogue management for e-commerce businesses',
      'Data collection and form management with Airtable Forms',
    ],
    bestFor: 'Businesses with complex structured data needs; marketing and content teams; product teams managing feature bac klogs',
    principles: [
      'Airtable is a spreadsheet-database hybrid — if you live in Excel/Google Sheets for tracking, Airtable is the upgrade',
      'Airtable AI (Cobuilder) can generate base structures from a natural language description',
      'The automation feature inside Airtable can trigger Make/Zapier or run scripts directly',
    ],
    integratesWith: ['Zapier', 'Make', 'Slack', 'HubSpot', 'Salesforce'],
    dfyTriggers: ['User needs a full Airtable operating system or data architecture built'],
  },

  buffer: {
    name: 'Buffer',
    vendor: 'Buffer',
    category: 'Social Media Management',
    lastVerified: '2025-Q1',
    plans: {
      free: '3 channels, 10 scheduled posts per channel',
      essentials: '$6/channel/mo — unlimited posts, analytics, first comment',
      team: '$12/channel/mo — unlimited users, draft approvals',
    },
    useCases: [
      'Schedule all social media posts across LinkedIn, Facebook, Instagram, TikTok, Pinterest, and X from a single queue',
      'Repurpose content — one piece of content posted to all channels at optimal times',
      'AI Assistant in Buffer generates post variations from a central idea across formats',
      'Analytics: which posts perform best and what time drives most engagement',
    ],
    bestFor: 'Small businesses and solopreneurs who post to 2-5 social channels; content teams that need approval workflows',
    setupGuide: {
      principles: [
        'Set up a content queue for the week every Monday — never post in the moment',
        'Use Buffer\'s AI Alternative Text generator and hashtag suggestions within the composer',
        'Connect Buffer to Zapier — new blog post published → auto-create draft social posts in Buffer for review',
      ],
      gotchas: [
        'Buffer does not manage TikTok posting for all account types — verify eligibility',
        'LinkedIn personal profile posting requires specific API access — connect carefully',
        'Video upload limits vary by channel — check per-platform limits before scheduling large files',
      ],
    },
    integratesWith: ['Zapier', 'Make', 'RSS feeds', 'IFTTT'],
    dfyTriggers: ['User wants a fully automated content repurposing pipeline built (blog → social → newsletter)'],
  },

  jasper: {
    name: 'Jasper AI',
    vendor: 'Jasper',
    category: 'AI Content Creation',
    lastVerified: '2025-Q1',
    plans: {
      creator: '$39/mo — 1 user, 1 brand voice, unlimited words',
      pro: '$59/mo — 1-5 users, 3 brand voices, campaigns',
      business: 'Custom — unlimited brand voices, team seats, SSO',
    },
    useCases: [
      'Generate brand-voice-consistent long-form content at scale — blogs, emails, landing pages, ads',
      'Marketing campaigns across multiple formats from a single brief',
      'Repurposing existing documents into new content types',
    ],
    bestFor: 'Marketing teams and content agencies that produce high volumes of written content; businesses where brand voice consistency across writers is a challenge',
    principles: [
      'Jasper\'s value is brand voice consistency, not just volume — upload your style guide and train the voice',
      'For most small businesses, ChatGPT or Claude with a well-crafted system prompt achieves 80% of what Jasper does at lower cost',
      'Jasper makes sense when you have multiple writers who need to produce consistent brand voice without individual prompting expertise',
    ],
    integratesWith: ['Zapier', 'HubSpot', 'Google Docs', 'Webflow'],
    dfyTriggers: ['User needs a full content production workflow and brand voice system built in Jasper'],
  },

  calendly: {
    name: 'Calendly',
    vendor: 'Calendly',
    category: 'Scheduling / Appointment Booking',
    lastVerified: '2025-Q1',
    plans: {
      free: '1 event type, unlimited bookings, basic integrations',
      standard: '$10/user/mo — unlimited event types, workflows, payments',
      teams: '$16/user/mo — round-robin, collective scheduling, routing forms',
    },
    useCases: [
      'Eliminate email back-and-forth to schedule meetings — share a link, prospect picks a time',
      'Discovery call booking from website, email signature, or social media',
      'Client onboarding calls — automated scheduling after contract signing',
      'Team round-robin — route inbound leads to the first available sales rep',
    ],
    bestFor: 'Any business where scheduling is a pain point; high-volume discovery call businesses; sales teams',
    setupGuide: {
      principles: [
        'Set up buffer time between meetings — Calendly will prevent back-to-back bookings',
        'Configure pre-booking questions to qualify leads and prepare for the call',
        'Connect to HubSpot or CRM via Zapier — every booking creates a contact and deal automatically',
        'Use the Calendly embed on your website contact page instead of a contact form at every stage',
      ],
      automationAfterBooking: [
        'Booking created → CRM contact created/updated → deal added to pipeline',
        'Booking created → send confirmation email with call prep questions',
        'Booking cancelled (Rescheduled) → notify sales rep via Slack',
        'Meeting completed (no show) → trigger follow-up sequence in email tool',
      ],
      gotchas: [
        'Free plan only has 1 event type — nearly every business needs multiple; budget for Standard',
        'Payment collection (Stripe) requires Standard+ plan',
        'Routing forms (directing different booking types to different team members) requires Teams plan',
      ],
    },
    integratesWith: ['HubSpot', 'Salesforce', 'Zapier', 'Make', 'Zoom', 'Google Meet', 'Stripe'],
    dfyTriggers: ['User needs a full booking-to-CRM automation pipeline built'],
  },

  quickbooks: {
    name: 'QuickBooks',
    vendor: 'Intuit',
    category: 'Accounting / Finance',
    lastVerified: '2025-Q1',
    plans: {
      simpleStart: '$15/mo — 1 user, invoicing, expense tracking, bank sync',
      essentials: '$30/mo — 3 users, bill management, time tracking',
      plus: '$45/mo — 5 users, inventory, project profitability',
      advanced: '$100/mo — 25 users, custom reporting, dedicated account team',
    },
    useCases: [
      'Invoicing and payment collection — create, send, and track invoices with online payment links',
      'Expense categorisation — connect bank and credit card accounts for automatic transaction import',
      'Payroll (QB Payroll add-on) — run payroll with automatic tax calculation and filing',
      'Profit and loss reporting — real-time financial health with minimal manual data entry',
    ],
    bestFor: 'Service businesses, freelancers, and small companies under 25 employees that need professional bookkeeping without a full accounting team',
    principles: [
      'Connect bank accounts on day one — automated transaction import is the core time savings',
      'Create recurring invoices for retainer clients — never manually invoice a retainer client again',
      'Use QuickBooks + HubSpot or Stripe integration to close the sales → invoice loop automatically',
      'Send invoices from QuickBooks with Stripe payment link embedded — gets paid in hours, not weeks',
    ],
    integratesWith: ['Shopify', 'PayPal', 'Stripe', 'HubSpot (via Zapier)', 'Calendly (via Zapier)', 'Zapier', 'Make'],
    dfyTriggers: [
      'User needs QuickBooks connected to their CRM and payment processor',
      'User needs a bookkeeping + automation system set up end-to-end',
    ],
  },
};

export const IMPLEMENTATION_PATTERNS = {

  onboardingAutomation: {
    name: 'Client Onboarding Automation',
    description: 'The highest-leverage automation for service businesses — automate everything between "contract signed" and "first deliverable starts"',
    trigger: 'Payment received / Contract signed',
    steps: [
      '1. Payment (Stripe) or contract (DocuSign/PandaDoc) → webhook fires',
      '2. Create client record in CRM (HubSpot) with deal linked',
      '3. Create project workspace (Notion/ClickUp/Asana) from template',
      '4. Send welcome email with onboarding questionnaire link (Typeform/Google Form)',
      '5. Schedule kickoff meeting using Calendly link (auto-attached to welcome email)',
      '6. Assign internal team tasks: "complete intake", "schedule kickoff", "set up project tools"',
      '7. Add client to onboarding Slack channel (if applicable)',
    ],
    tools: ['Stripe/Zapier', 'HubSpot', 'Notion or ClickUp', 'Typeform', 'Calendly', 'Slack'],
    timeToImplement: '4-8 hours with Zapier/Make; 1-2 days for custom code',
    roi: 'Typically saves 2-4 hours per new client in manual admin work',
  },

  contentRepurposing: {
    name: 'Content Repurposing Pipeline',
    description: 'Turn one piece of long-form content into a week of social and email content automatically',
    trigger: 'Blog post published or podcast episode uploaded',
    steps: [
      '1. Long-form content published (blog via WordPress/Webflow, podcast via RSS)',
      '2. Zapier/Make detects new content via webhook or RSS',
      '3. Content sent to ChatGPT API with repurposing prompt → generates 5 social posts, 3 LinkedIn angles, 1 email newsletter draft',
      '4. Drafts sent to Buffer queue (pending approval) and Google Docs/Notion for review',
      '5. Human reviews and approves or edits',
      '6. Approved posts scheduled in Buffer for optimal posting times',
    ],
    tools: ['WordPress/Webflow', 'Zapier/Make', 'ChatGPT API', 'Buffer', 'Google Docs/Notion'],
    timeToImplement: '3-6 hours with Zapier; 1 day with Make for full customisation',
    roi: 'Turns 1 content piece into 5-8 published pieces with 30-60 minutes human review time',
  },

  leadCaptureToCRM: {
    name: 'Lead Capture → CRM → Outreach',
    description: 'Every new lead automatically enters the pipeline, gets notified to sales, and starts a follow-up sequence',
    trigger: 'Website form submission or ad lead form',
    steps: [
      '1. Form submitted (Typeform, HubSpot form, or website contact form)',
      '2. Contact created/updated in HubSpot with lead source tag',
      '3. Slack notification to sales rep with lead details and 1-click "book a call" link',
      '4. Automated email sequence starts: intro email + value → follow-up day 3 → case study day 7',
      '5. If call booked via Calendly → sequence pauses + deal moves to "discovery call scheduled"',
      '6. If no response after day 14 → lead scored as cold → moved to long-term nurture list',
    ],
    tools: ['Typeform or website form', 'HubSpot', 'Zapier/Make', 'Slack', 'ActiveCampaign or HubSpot Sequences', 'Calendly'],
    timeToImplement: '4-6 hours',
    roi: 'No lead falls through the cracks; 30-90-day follow-up runs automatically',
  },

  reviewCollection: {
    name: 'Automated Review Collection',
    description: 'Request reviews at the optimal moment — service complete, sentiment high',
    trigger: 'Project marked complete or invoice paid',
    steps: [
      '1. Project marked complete in ClickUp/Notion OR invoice status = paid in QuickBooks',
      '2. 24-48 hour wait (let service sink in)',
      '3. Personalised email sent: "How did we do?" with 1-question sentiment check',
      '4. If positive response → immediate follow-up with Google Review / Trustpilot link',
      '5. If negative response → escalate to account manager, do NOT send public review link',
      '6. Track review request status in Airtable or CRM',
    ],
    tools: ['QuickBooks or ClickUp', 'Zapier/Make', 'Email tool', 'Airtable for tracking'],
    timeToImplement: '2-3 hours',
    roi: '3-5x increase in review volume; negative experiences caught before they go public',
  },
};
