/**
 * COACHING KB — AI AVATARS, VIDEO & VOICE AI
 * Covers: HeyGen, Synthesia, D-ID, ElevenLabs, Murf, Descript, Runway
 * lastVerified: 2025-Q1
 */

export const AVATAR_VOICE_TOOLS = {

  heygen: {
    name: 'HeyGen',
    vendor: 'HeyGen',
    category: 'AI Avatar / Video',
    lastVerified: '2025-Q1',
    plans: {
      free: '1 seat, 3 videos/mo, 1 min max, watermark',
      creator: '$24/mo — 15 videos/mo, 5 min max, no watermark, 1 avatar',
      business: '$72/mo — unlimited videos, 20 min max, custom avatars, brand kit',
      enterprise: 'Custom — instant avatar cloning, API access, team management',
    },
    useCases: [
      'Personalised client onboarding videos at scale — one script, individual name/company personalised via API or CSV',
      'Sales outreach videos that feel human — 80% higher reply rates than plain email',
      'Product explainer videos without hiring a production crew',
      'Team training and onboarding content with a consistent presenter',
      'Social media content at scale — repurpose one shoot into dozens of clips',
    ],
    bestFor: 'B2B businesses with high-touch sales cycles, coaches, consultants, online educators — anyone who needs to appear on camera without the production overhead',
    setupGuide: {
      principles: [
        'Create a custom avatar from a 2-5 minute video recording of yourself (Business plan) — this becomes your on-demand presenter',
        'Write scripts in plain conversational language — AI voice performs better with natural speech patterns than formal prose',
        'Use HeyGen templates to establish brand consistency across all video types',
        'Integrate with HubSpot or your CRM via Zapier to trigger personalised video sends automatically when a lead hits a pipeline stage',
      ],
      primaryWorkflow: [
        '1. Create your instant avatar (record 2-min reference video in good lighting)',
        '2. Write script template with [FIRST_NAME] and [COMPANY] variables',
        '3. Upload CSV of contacts with variable values',
        '4. HeyGen renders personalised videos in bulk',
        '5. Distribute via email via your CRM or via HeyGen\'s share link',
      ],
      gotchas: [
        'Instant avatars require good lighting and clear audio in the source recording — poor source = poor avatar quality',
        'Videos over 5 minutes may have inconsistent lip sync — keep content concise',
        'Free plan watermark makes it unusable for client delivery — budget for at least Creator plan',
        'Rendering time increases with volume — batch personalised videos well before send date',
      ],
    },
    integratesWith: ['Zapier', 'HubSpot', 'ActiveCampaign', 'Salesforce (via Zapier)', 'Slack'],
    dfyTriggers: [
      'User wants HeyGen connected to CRM for automatic trigger-based video sending',
      'User wants a full personalised video outreach system built end-to-end',
      'User needs API integration for high-volume video personalisation',
    ],
  },

  synthesia: {
    name: 'Synthesia',
    vendor: 'Synthesia',
    category: 'AI Avatar / Video',
    lastVerified: '2025-Q1',
    plans: {
      starter: '$22/mo — 10 videos/mo, 120 stock avatars, no custom avatar',
      creator: '$67/mo — 30 videos/mo, custom personal avatar, brand kit',
      enterprise: 'Custom — unlimited, API, SSO, team management',
    },
    useCases: [
      'Corporate training and L&D content — consistent, multilingual delivery at scale',
      'Internal communication videos from leadership without scheduling studio time',
      'Product tutorials embedded in documentation or help centres',
      'Multilingual content — Synthesia supports 140+ languages with one avatar',
    ],
    bestFor: 'Mid-market and enterprise businesses with significant training and internal communications needs; multilingual organisations',
    principles: [
      'Synthesia\'s stock avatars are higher quality than HeyGen\'s for custom-avatar-free use cases',
      'Use for longer training content (up to 30 min) — better rendering stability than HeyGen for long-form',
      'Ideal when you need multilingual versions of the same content — change language, same avatar, same visuals',
    ],
    integratesWith: ['LMS platforms (via SCORM export)', 'SharePoint', 'Confluence'],
    dfyTriggers: [
      'User needs a complete L&D video library built',
      'User needs multilingual video at scale with consistent brand presentation',
    ],
  },

  did: {
    name: 'D-ID',
    vendor: 'D-ID',
    category: 'AI Avatar / Video',
    lastVerified: '2025-Q1',
    plans: {
      lite: '$5.9/mo — 10 minuites/mo',
      pro: '$49/mo — 100 minutes/mo, API access',
      advanced: '$299/mo — 400 minutes, full API, custom avatars',
    },
    useCases: [
      'Animate a still photo into a talking person — great for bringing brand mascots or historical figures to life',
      'Lightweight video messages without full video production',
      'API-driven video generation embedded in apps',
    ],
    bestFor: 'Developers and agencies building custom video into apps; businesses wanting photo-based avatar animation at low cost',
    principles: [
      'D-ID is the most API-accessible avatar tool — ideal when you need to embed video generation in a custom workflow or app',
      'For face-animated photos (not full video), D-ID outperforms HeyGen at lower cost',
    ],
    integratesWith: ['API-first — integrates with any stack'],
    dfyTriggers: ['User needs D-ID embedded in a custom application or website'],
  },

  elevenlabs: {
    name: 'ElevenLabs',
    vendor: 'ElevenLabs',
    category: 'Voice AI',
    lastVerified: '2025-Q1',
    plans: {
      free: '10K characters/mo, limited voices',
      starter: '$5/mo — 30K characters, voice cloning',
      creator: '$22/mo — 100K characters, professional cloning, API',
      pro: '$99/mo — 500K characters, high-priority processing',
    },
    useCases: [
      'Clone your voice for automated client calls, voicemail drops, and training narration',
      'Generate voiceovers for HeyGen or Synthesia videos with your own voice clone',
      'Create audio versions of newsletters, blog posts, or course content',
      'Power phone-based AI agents with realistic voice output',
    ],
    bestFor: 'Coaches, consultants, and service businesses that want to maintain personal voice presence at scale — client calls, training, outreach',
    setupGuide: {
      principles: [
        'Voice cloning requires a clean audio recording — minimal background noise, natural conversational tone',
        'Pair with HeyGen: use ElevenLabs for voice, HeyGen for avatar lip-sync for maximum realism',
        'Use for outbound voicemail drops via tools like Slydial or via direct phone integrations',
      ],
      cloneWorkflow: [
        '1. Record 5-30 minutes of clean audio (conversational, not reading)',
        '2. Upload to ElevenLabs → Voice Library → Add Voice → Instant Clone',
        '3. Test with a sample script — adjust similarity and stability sliders',
        '4. Use via API or the ElevenLabs interface to generate any audio at any time',
      ],
      gotchas: [
        'Short training audio (under 1 minute) produces lower fidelity clones',
        'Emotional range of cloned voices is limited — very excited or very quiet speech may not transfer well',
        'Check local laws on AI voice use for outbound calls — regulations vary by region',
      ],
    },
    integratesWith: ['HeyGen (for lip-sync)', 'Zapier', 'Make', 'Twilio', 'Vapi.ai (for phone agents)'],
    dfyTriggers: [
      'User needs an AI phone agent built with their voice',
      'User wants automated outbound calling system with personalised voice messages',
    ],
  },

  murf: {
    name: 'Murf AI',
    vendor: 'Murf',
    category: 'Voice AI / Voiceover',
    lastVerified: '2025-Q1',
    plans: {
      free: '10 minutes voiceover, no download',
      creator: '$19/mo — 2 hrs/mo, 120+ voices, full download',
      business: '$26/mo — 4 hrs/mo, voice cloning, team sharing',
    },
    useCases: [
      'Professional voiceovers for training videos, explainers, and presentations',
      'Podcast episode production from written content',
      'Voice for Synthesia/HeyGen videos when you don\'t want to use your own voice',
    ],
    bestFor: 'Teams that need consistent, high-quality voice narration without a personal voice clone — content teams, training departments',
    principles: [
      'Murf\'s studio voices are higher quality than ElevenLabs\' stock voices for formal narration',
      'Use when brand voice requires a specific accent, gender, or tone not matching the business owner\'s natural voice',
    ],
    integratesWith: ['Google Slides (direct Murf plugin)', 'Canva (via Murf plugin)'],
    dfyTriggers: ['User needs a full podcast or video production pipeline built'],
  },

  descript: {
    name: 'Descript',
    vendor: 'Descript',
    category: 'AI Video & Podcast Editor',
    lastVerified: '2025-Q1',
    plans: {
      free: '1 hr transcription, basic editing',
      creator: '$12/mo — 10 hrs/mo transcription, overdub voice clone, AI editing',
      pro: '$24/mo — unlimited transcription, full AI features',
    },
    useCases: [
      'Edit video by editing the transcript — delete words in the doc, they\'re removed from video',
      'Remove filler words (um, uh, like) automatically across entire recordings',
      'Overdub: re-record any word in your video using your voice clone — fix mistakes without reshooting',
      'Create social clips from long-form content with AI highlight detection',
    ],
    bestFor: 'Coaches, podcasters, educators, and consultants who produce regular video or audio content and need to edit efficiently without technical expertise',
    principles: [
      'Descript is the fastest way to go from raw interview/meeting recording to polished, shareable content',
      'Overdub (voice clone) is the killer feature — fix any sentence after the fact',
      'Use the "Remove filler words" action before any client-facing video is published',
    ],
    integratesWith: ['Zapier', 'YouTube (direct publish)', 'Slack', 'Notion'],
    dfyTriggers: [
      'User needs a full content repurposing pipeline (podcast → clips → blog → newsletter)',
    ],
  },

  runway: {
    name: 'Runway ML',
    vendor: 'Runway',
    category: 'AI Video Generation',
    lastVerified: '2025-Q1',
    plans: {
      free: '125 credits',
      standard: '$12/mo — 625 credits/mo',
      pro: '$28/mo — 2250 credits/mo',
    },
    useCases: [
      'Generate short video clips from text prompts for social content and ads',
      'Apply cinematic effects and style transfers to existing footage',
      'Create b-roll footage to supplement talking-head videos',
      'Product visualisation and concept video without a physical shoot',
    ],
    bestFor: 'Creative agencies, brands with strong visual identity, content teams producing social and ad content regularly',
    principles: [
      'Runway is not yet reliable for realistic human portrayals — use HeyGen/Synthesia for avatar videos',
      'Best use: atmospheric b-roll, concept visualisation, brand aesthetic content',
      'Combine with Descript for end-to-end AI video production workflow',
    ],
    integratesWith: ['API available for studio plans — integrable with custom workflows'],
    dfyTriggers: ['User needs a full AI creative production pipeline built'],
  },
};
