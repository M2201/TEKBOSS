import React, { useState, useEffect, useRef } from 'react';
import IntelligenceEngineLoader from './IntelligenceEngineLoader';
import BlueprintLoader from './BlueprintLoader';
import PreviewReport from './PreviewReport';
import ReactMarkdown from 'react-markdown';
import {
  ChevronRight, Cpu, FileText, Lock, MessageSquare, BarChart3,
  ShieldCheck, Send, CheckCircle, AlertTriangle, Sparkles,
  ArrowRight, RefreshCw, HelpCircle, X, Zap, Target,
  TrendingUp, Layers, Bot, ExternalLink, Clock, Star,
  User, LogOut, Eye, EyeOff, ShieldAlert, Pencil,
} from 'lucide-react';

// ─── Static questions — always available, no API needed ───────────────────────
const STATIC_QUESTIONS = [
  { id: 1, phase: 'Identity', text: "What's the name of your business? And if you have a website, what's the website address?", hint: 'Include your full business name and paste your website link if you have one.', example: 'Apex Digital Media — apexdigitalmedia.co' },
  { id: 2, phase: 'Identity', text: 'What industry are you in, and what kind of work do you actually do?', hint: 'Be specific about what you actually deliver, not just your category.', example: 'Digital marketing — paid ads and SEO for e-commerce brands' },
  { id: 3, phase: 'Context', text: "In plain terms — what do clients get from working with you that they couldn't easily get elsewhere?", hint: 'Focus on the outcome or result, not the service itself.', example: 'Our clients go from 0 to 20+ qualified leads per month within 60 days' },
  { id: 4, phase: 'Context', text: 'Who is your ideal client? Describe them specifically — who they are, their situation, and what they need.', hint: 'Include industry, business size, situation, and their main pain point.', example: 'Coaches doing $10k–$30k/month who need more leads but have no time for content' },
  { id: 5, phase: 'Story', text: 'What made you start this business? Give me the real reason, not the elevator pitch version.', hint: 'Be honest — the real origin story gives us insight into your mission and values.', example: 'I spent 10 years in corporate watching small businesses get bad advice from expensive agencies and left to fix that.' },
  { id: 51, phase: 'Story', text: 'How long has this business been operating, and what is the most significant milestone you have hit so far?', hint: 'Give us the actual age of the business and one concrete achievement — a revenue milestone, a client count, a market win.', example: '3 years in business. Biggest milestone: crossed $250k in revenue last year and landed our first enterprise client.' },
  { id: 6, phase: 'Story', text: "Give me three specific numbers for the next 12 months: (1) your target revenue or monthly income goal, (2) the team size you want to be running, and (3) how many new clients or customers you want to bring on.", hint: 'All three numbers are required — revenue/income target, headcount, and new client or customer target.', example: 'Revenue: $600k/year. Team: 5 people (me + 4). New clients: 10 new retainer clients per month.' },
  { id: 7, phase: 'Operations', text: "Name your top 3 biggest recurring time drains — what the activity actually is (not just a category like 'admin') and roughly how many hours each one takes per week on average.", hint: 'Be specific about what the task is, not just the category. Give a time estimate for each one.', example: '1. Manually building client reports from 5 different dashboards — 6 hrs/week. 2. Back-and-forth scheduling emails — 3 hrs/week. 3. Re-explaining our onboarding process to every new client — 4 hrs/week.' },
  { id: 9, phase: 'Operations', text: 'At what point in your sales process do you most often lose people? Where do things go quiet?', hint: 'Trace the path — intro call, proposal, follow-up, contract, onboarding?', example: 'After the proposal — people open it but ghost us if we wait more than 48 hours to follow up.' },
  { id: 10, phase: 'Operations', text: 'Where does your client and prospect data live right now? Spreadsheet, CRM, notes app — be specific.', hint: 'Name the exact tool, even if it\'s just a Google Sheet or a notes app.', example: 'HubSpot for active clients, but a Google Sheet backup because the team doesn\'t fully use HubSpot.' },
  { id: 11, phase: 'Operations', text: "What's the most time-consuming process in your business that you think a system could handle better than you're handling it now?", hint: 'Think about any repeated sequence — onboarding, reporting, follow-ups, publishing.', example: 'Client onboarding — we manually send 6 emails and update 4 spreadsheets per new client.' },
  { id: 12, phase: 'Financial', text: 'Roughly what do you spend each month running the business — ads, tools, contractors, admin?', hint: 'A ballpark is fine — include software, freelancers or VAs, and paid marketing.', example: 'About $4,000/month — $1,500 ads, $800 software, $1,700 part-time VA.' },
  { id: 13, phase: 'Financial', text: 'If all the admin friction disappeared tomorrow, how many more clients could you realistically take on next month?', hint: 'Be realistic — not your ceiling, your actual operational capacity if the busywork was gone.', example: 'Probably 8–10 more without needing to hire.' },
  { id: 15, phase: 'AI Experience', text: 'Have you used AI tools before? If so, what worked — and where did the output fall short?', hint: 'Name the tools and be specific about what disappointed you — tone, accuracy, reliability?', example: 'ChatGPT and Jasper — output was generic, didn\'t match our voice, needed heavy editing every time.' },
  { id: 16, phase: 'AI Experience', text: "What software or platforms are completely off the table — things your team won't give up no matter what?", hint: 'These are your non-negotiables — what any recommendation needs to work around.', example: 'HubSpot, Slack, and Google Workspace — the team won\'t move off these.' },
  { id: 17, phase: 'AI Experience', text: 'Who has final say on anything AI-generated before it goes to clients or goes public?', hint: 'This tells us where the human review checkpoint needs to be in any workflow.', example: 'Me (the founder) for anything client-facing. My ops lead for internal content.' },
  { id: 18, phase: 'Differentiation', text: "What do you do genuinely better than your competitors? Not what sounds good — what's actually true?", hint: 'The thing clients would name if asked why they chose you.', example: 'Every client gets a live analytics dashboard and a monthly strategy call, not just a report.' },
  { id: 19, phase: 'Differentiation', text: 'Name 2-3 competitors you watch closely — brands doing something in your space that makes you take notice.', hint: "They don't have to be direct competitors — just players whose moves you track.", example: 'Scorpion and WebFX for their volume; Lean Labs for their thought leadership.' },
  { id: 20, phase: 'Brand', text: 'If your brand had a personality, how would it communicate? Give me three words that describe its voice and tone.', hint: 'Think about how you write emails or how clients describe your style.', example: 'Direct, sharp, confident — we don\'t soften things or use fluff.' },
  { id: 21, phase: 'Brand', text: 'What words, phrases, or communication styles would make you cringe if an AI wrote them for your brand?', hint: 'Think about jargon, passive voice, or motivational clichés you\'d never say.', example: "Synergy, ecosystem, empower — anything that sounds like a LinkedIn post from 2017." },
  { id: 25, phase: 'Brand', text: 'Do you have existing brand guidelines, a logo, or a style guide? If yes, paste a link or describe your colors, fonts, and any visual rules. If no, just say "no" — we\'ll build your brand system directly from your answers.', hint: 'Even rough notes help — hex codes, font names, a mood board link, or just a description of your look and feel.', example: 'Yes — primary color #1A1A2E (deep navy), accent #E94560 (red). Font: Inter. Logo is at brand.apexdigital.co/assets. Vibe: premium tech, not startup casual.' },
  { id: 22, phase: 'Constraints', text: 'Do you have any proprietary methods, processes, or sensitive data that should never be shared with or processed by third-party AI tools?', hint: 'Think trade secrets, client data, scoring models, or internal processes.', example: 'Yes — our lead scoring formula and all client performance data stays internal.' },
  { id: 24, phase: 'AI Capabilities', type: 'multiSelect',
    text: "Which of these AI capabilities would benefit your business? Select everything that applies.",
    hint: 'Check all that could realistically improve how you work or serve clients. You can select as many as you like.',
    options: [
      { value: 'chatbot', label: 'Chatbot / Website AI Assistant', desc: 'Answers questions, qualifies leads, handles FAQs on your site 24/7' },
      { value: 'avatar', label: 'AI Video Avatar', desc: 'A digital version of you or a brand representative for video content and training' },
      { value: 'phone_agent', label: 'AI Phone Answering Agent', desc: 'Handles inbound calls, books appointments, routes inquiries automatically' },
      { value: 'content', label: 'Content & Social Media Automation', desc: 'Generates on-brand posts, captions, newsletters, and blog drafts' },
      { value: 'lead_followup', label: 'Lead Generation & Follow-Up Automation', desc: 'Nurtures prospects, sends follow-ups, and alerts you when leads go cold' },
      { value: 'email_marketing', label: 'Email Marketing Automation', desc: 'Sequences, segmentation, and personalization at scale' },
      { value: 'scheduling', label: 'Appointment & Scheduling Automation', desc: 'Eliminates back-and-forth booking — syncs calendars and sends reminders' },
      { value: 'onboarding', label: 'Client Onboarding Automation', desc: 'Delivers welcome docs, collects info, and sets expectations without manual effort' },
      { value: 'reporting', label: 'Reporting & Analytics Automation', desc: 'Pulls data from multiple sources into a single dashboard or report automatically' },
      { value: 'documents', label: 'Document Generation', desc: 'Auto-generates proposals, contracts, SOWs, or intake forms based on templates' },
      { value: 'knowledge_base', label: 'Internal Knowledge Base / Team AI', desc: 'A searchable AI your team uses to find answers, processes, and SOPs instantly' },
      { value: 'ecommerce', label: 'E-Commerce Automation', desc: 'Product descriptions, abandoned cart flows, inventory alerts, and order follow-up' },
    ]
  },
  { id: 23, phase: 'Signal', text: "When you try to make changes in your business, what usually gets in the way — is it time, budget, knowing where to start, or getting your team on board? And are you someone who typically figures it out yourself, or do you prefer to bring in someone to handle it?", hint: 'Be honest — this shapes how we sequence your recommendations and how much hand-holding the blueprint builds in.', example: "Honestly, it's always time — I start strong then real work pulls me back. And I'm a mix: I\'ll figure out simple tools myself but for anything complex I\'d rather hire it out." },
];


// ─── Brand Wordmark (horizontal SVG — matches new logo) ─────────────────
 const BrandWordmark = ({ height = 28, className = '' }) => (
   <svg
     viewBox="0 0 382 72"
     height={height}
     style={{ width: 'auto', display: 'block' }}
     xmlns="http://www.w3.org/2000/svg"
     aria-label="TEK BOSS.ai"
     className={className}
   >
     <text y="54" fontFamily="'Barlow', 'Arial Black', Impact, sans-serif" fontWeight="900" fontSize="62">
       {/* TEK — white, semi-transparent ghost effect */}
       <tspan fill="#FFFFFF" fillOpacity="0.38" textLength="147" lengthAdjust="spacing">TEK </tspan>
       {/* BOSS — vivid cobalt blue */}
       <tspan fill="#1818E8" textLength="160" lengthAdjust="spacing">BOSS</tspan>
       {/* .ai — medium gray, slightly lighter weight */}
       <tspan fill="#8898B0" fontSize="42" textLength="75" lengthAdjust="spacing">.ai</tspan>
     </text>
     {/* Underline — thin gray */}
     <line x1="0" y1="66" x2="382" y2="66" stroke="#6B7A8D" strokeWidth="1.5"/>
   </svg>
 );


// ─── Brand Icon Mark (compact TB monogram — for chat bubbles & tiny slots) ──
const BrandLogo = ({ size = 'md', className = '' }) => {
  const dim = { xs: 20, sm: 32, md: 44, lg: 64, xl: 80, hero: 112 }[size] || 44;
  return (
    <svg width={dim} height={dim} viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"
      className={`rounded-xl ${className}`} aria-label="TEK BOSS.ai">
      <rect width="44" height="44" rx="9" fill="#0A0F2A"/>
      <text x="22" y="30" textAnchor="middle"
        fontFamily="'Barlow', 'Arial Black', Impact, sans-serif"
        fontWeight="900" fontSize="20" fill="#1818E8">TB</text>
    </svg>
  );
};



// ─── Markdown renderer ─────────────────────────────────────────────────────────
const MarkdownContent = ({ content }) => (
  <div style={{ lineHeight: 1.7, color: '#cbd5e1' }}>
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', marginTop: '2rem', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>{children}</h1>,
        h2: ({ children }) => <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{children}</h2>,
        h3: ({ children }) => <h3 style={{ color: '#60a5fa', fontWeight: 800, fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.4rem' }}>{children}</h3>,
        h4: ({ children }) => <h4 style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.95rem', marginTop: '1rem', marginBottom: '0.3rem' }}>{children}</h4>,
        p: ({ children }) => <p style={{ marginBottom: '0.75rem', color: '#cbd5e1' }}>{children}</p>,
        ul: ({ children }) => <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>{children}</ul>,
        li: ({ children }) => <li style={{ marginBottom: '0.25rem', color: '#cbd5e1' }}>{children}</li>,
        strong: ({ children }) => <strong style={{ color: '#fff', fontWeight: 700 }}>{children}</strong>,
        em: ({ children }) => <em style={{ color: '#94a3b8' }}>{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

// ─── Help Panel ───────────────────────────────────────────────────────────────
const HelpPanel = ({ question, onClose }) => (
  <div
    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2 text-blue-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Example Answer</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
          <X size={16} />
        </button>
      </div>
      <p className="text-sm text-slate-400 mb-5 leading-relaxed">{question.hint}</p>
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-5 py-4">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Example</p>
        <p className="text-sm text-slate-200 font-medium leading-relaxed italic">&ldquo;{question.example}&rdquo;</p>
      </div>
    </div>
  </div>
);

// ─── Unlock Section Card ──────────────────────────────────────────────────────
const LockedSection = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 hover:scale-[1.02] transition-all cursor-pointer">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative flex items-start gap-4">
      <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 transition-colors">
        <Icon size={18} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-black text-white text-sm uppercase tracking-tight">{title}</h4>
          <Sparkles size={12} className="text-blue-500/60 group-hover:text-blue-400 transition-colors" />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ stage, onStartFresh }) => {
  const [confirmReset, setConfirmReset] = React.useState(false);
  const navItems = [
    { id: 1, label: 'Discovery Interview', icon: MessageSquare },
    { id: 2, label: 'Processing', icon: Cpu },
    { id: 3, label: 'Preview Report', icon: BarChart3 },
    { id: 4, label: 'Full Blueprint', icon: FileText, locked: stage < 4 },
    { id: 5, label: 'Build-Out Coach', icon: Bot, locked: stage < 5 },
  ];
  return (
    <div className="w-72 bg-slate-950 text-slate-400 p-6 flex flex-col h-full border-r border-slate-800/50 flex-shrink-0">
      <div className="flex flex-col gap-1 mb-12">
        <BrandWordmark height={28} />
        <p className="text-[9px] font-bold tracking-[0.25em] text-blue-400/70 mt-1 uppercase">AI Blueprint</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <div key={item.id} className={`flex items-center justify-between p-3.5 rounded-xl transition-all
            ${stage === item.id
              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
              : stage > item.id ? 'text-slate-500' : 'text-slate-700'
            }`}>
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              <span className="text-sm font-bold">{item.label}</span>
            </div>
            {item.locked && <Lock size={12} className="opacity-30" />}
            {stage > item.id && <CheckCircle size={12} className="text-emerald-600/60" />}
          </div>
        ))}
      </nav>

      {/* ── Start Fresh — visible before paywall ── */}
      {onStartFresh && (
        <div className="mt-auto pt-4 border-t border-slate-800/40">
          {confirmReset ? (
            <div className="bg-rose-950/30 border border-rose-800/30 rounded-xl p-3 space-y-2">
              <p className="text-[10px] text-rose-300 font-bold leading-snug">
                Clear all answers and start over from Question 1?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmReset(false); onStartFresh(); }}
                  className="flex-1 text-[10px] bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-1.5 rounded-lg transition-colors"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest py-1.5 rounded-lg border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              id="sidebar-start-fresh-btn"
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center gap-2 p-3 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 transition-all group"
            >
              <span className="text-base leading-none">&#8635;</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-rose-400 transition-colors">
                Start Fresh
              </span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};

// ─── Chat message bubble ──────────────────────────────────────────────────────
const AgentBubble = ({ msg }) => (
  <div className="flex items-start gap-3 max-w-2xl">
    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-1
      ${msg.isCheckpoint ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/20'
        : msg.isCompletion ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
          : 'bg-slate-800 text-blue-400 border border-slate-700'}`}>
      {msg.isCheckpoint ? <CheckCircle size={15} /> : msg.isCompletion ? <Sparkles size={15} /> : (
        <BrandLogo size="xs" />
      )}
    </div>
    <div>
      {msg.qNumber && (
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1">
          {msg.phase} · Q{msg.qNumber}/{msg.total}
        </p>
      )}
      {msg.isFollowUp && (
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400/60 mb-1">Follow-up</p>
      )}
      <div className={`rounded-2xl rounded-tl-sm px-5 py-4 text-sm font-medium leading-relaxed
        ${msg.isCheckpoint ? 'bg-emerald-950/40 border border-emerald-800/30 text-emerald-200'
          : msg.isCompletion ? 'bg-blue-950/40 border border-blue-800/30 text-blue-200'
            : 'bg-slate-900 border border-slate-800 text-slate-200'}`}>
        {msg.isMarkdown ? <MarkdownContent content={msg.text} /> : msg.text}
      </div>
    </div>
  </div>
);

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [stage, setStage] = useState(1);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [multiSelectedOptions, setMultiSelectedOptions] = useState([]);
  const [waitingForFollowUp, setWaitingForFollowUp] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [activeHelpId, setActiveHelpId] = useState(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  // Implementation Assistant state
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantTyping, setAssistantTyping] = useState(false);
  // DISC personality inference — accumulates silently across coaching interactions
  const [discAccumulator, setDiscAccumulator] = useState({ D: 0, I: 0, S: 0, C: 0 });
  // DFY state
  const [dfySubmitted, setDfySubmitted] = useState(false);
  const [dfyEmail, setDfyEmail] = useState('');
  const [driveLink, setDriveLink] = useState(null);
  const [driveLoading, setDriveLoading] = useState(false);
  // Blueprint-stage Drive folder link (polled after Stage 4 unlocks)
  const [blueprintDriveLink, setBlueprintDriveLink] = useState(null);
  const [blueprintDrivePending, setBlueprintDrivePending] = useState(false);

  // ─── Auth state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ─── PDF Download ────────────────────────────────────────────────────────────
  const downloadPdf = async (sourceData = null) => {
    const data = sourceData || blueprint || previewData;
    if (!data?.previewReport && !data?.previewData?.previewReport) {
      alert('No report data available to download yet.');
      return;
    }
    setPdfDownloading(true);
    try {
      const payload = {
        businessName: businessName || answers?.[1]?.split(/[,—–]/)[0]?.trim() || 'TekBoss',
        previewReport: data.previewReport || data.previewData?.previewReport,
        diyPlaybook:  data.diyPlaybook  || null,
        brandDna:     data.brandDna     || previewData?._internal?.brandDna     || null,
        marketIntel:  data.marketIntel  || previewData?._internal?.marketIntel  || null,
        roiData:      data.roiData      || previewData?._internal?.roiData      || null,
        generatedAt:  data.generatedAt  || new Date().toISOString(),
      };
      const res = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `TekBoss_Blueprint_${(businessName || 'Report').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 2000);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setPdfDownloading(false);
    }
  };

  const [specDownloading, setSpecDownloading] = useState(false);
  const downloadSpec = async () => {
    setSpecDownloading(true);
    try {
      const vd = previewData?._internal?.validatedData;
      if (!vd) { alert('Blueprint data not available yet.'); return; }
      const res = await fetch('/api/download-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ businessName, validatedData: vd }),
      });
      if (!res.ok) throw new Error('Spec generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="(.+?)"/);
      a.download = match ? match[1] : `TekBoss_AIBuildSpec_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Spec download error:', err);
    } finally { setSpecDownloading(false); }
  };

  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Subscription state ───────────────────────────────────────────────────────
  const [subscription, setSubscription] = useState({ active: false, status: 'none', daysRemaining: 0, isWarningPeriod: false });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const assistantBottomRef = useRef(null);
  const assistantInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');     // reset per-question, no need to stop recognition
  const resultBoundaryRef = useRef(0);       // cumulative results index — ignore anything before this
  const lastResultsLengthRef = useRef(0);    // tracks latest event.results.length for boundary updates
  const landingScrollRef = useRef(null);

  // ─── Voice input state ───────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Detect speech support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) setVoiceSupported(true);
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;       // Stay open across pauses AND question advances
    recognition.interimResults = true;   // Stream text in real-time
    recognition.lang = 'en-US';

    // Use a ref so we can reset between questions without killing the session
    finalTranscriptRef.current = '';
    setInputValue('');

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        stopListening();
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      lastResultsLengthRef.current = event.results.length;

      // Start from whichever is newer: the event's first new result, or our question boundary
      // This ensures pending final results from the PREVIOUS answer are silently skipped
      const startIdx = Math.max(event.resultIndex, resultBoundaryRef.current);

      for (let i = startIdx; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setInputValue((finalTranscriptRef.current + interimTranscript).trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };
  // ──────────────────────────────────────────────────

  const questions = STATIC_QUESTIONS;
  const currentQuestion = questions[currentQIndex] || null;
  // Use the full business name from Q1 — strip URLs, domains, and trailing noise
  const cleanBusinessName = (raw) => {
    if (!raw) return null;
    return raw
      .replace(/https?:\/\/[^\s,()[\]]+/gi, '')   // strip http(s) URLs
      .replace(/\bwww\.[^\s,()[\]]+/gi, '')         // strip www. domains
      .replace(/\([^)]*\)/g, '')                    // strip parenthetical content
      .split(/[,—–\-|]/)[0]                         // take first part before separator
      .trim()
      .replace(/\s+/g, ' ')                         // normalise whitespace
      || null;
  };
  const businessName = cleanBusinessName(answers[1]);
  const industry = answers[2] || null;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    assistantBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantMessages, assistantTyping]);

  // ─── Check auth on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch { /* not logged in */ }
    })();
  }, []);

  // First question after disclaimer dismissed
  useEffect(() => {
    if (!showDisclaimer && messages.length === 0) {
      setMessages([{
        role: 'agent',
        text: questions[0].text,
        phase: questions[0].phase,
        qNumber: 1,
        total: questions.length,
      }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showDisclaimer]);

  // ─── Fetch subscription status when user is set or payment verified ───
  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch('/api/subscription-status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (user) fetchSubscriptionStatus();
  }, [user, paymentVerified]);

  // ─── Restore state after Stripe redirect ─────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success' || payment === 'cancelled') {
      // User is returning from Stripe — restore saved preview data
      const saved = sessionStorage.getItem('tekboss_preview');
      if (saved) {
        try {
          const restored = JSON.parse(saved);
          setPreviewData(restored);
          setShowDisclaimer(false);
          setStage(3); // Put them back on the preview/pricing stage
          if (payment === 'cancelled') {
            setError('Payment was cancelled. You can try again anytime.');
          }
        } catch {
          // Bad data — ignore
        }
      }
    }
  }, []);

  // ─── Detect Stripe payment return ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId && previewData?._internal) {
      // Verify payment, then auto-generate blueprint
      (async () => {
        try {
          const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (data.paid) {
            setPaymentVerified(true);
            // Clean URL
            window.history.replaceState({}, '', '/');
            // Auto-generate blueprint
            generateBlueprint();
          } else {
            setError('Payment was not completed. Please try again.');
            window.history.replaceState({}, '', '/');
          }
        } catch {
          setError('Could not verify payment. Please contact support.');
          window.history.replaceState({}, '', '/');
        }
      })();
    } else if (payment === 'cancelled') {
      window.history.replaceState({}, '', '/');
    }
  }, [previewData]);

  // Auto-save preview to Google Drive when previewData is first received
  useEffect(() => {
    if (!previewData?.previewReport || driveLink || driveLoading) return;
    const autoSaveToDrive = async () => {
      setDriveLoading(true);
      try {
        const res = await fetch('/api/save-to-drive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName,
            previewReport: JSON.stringify(previewData.previewReport),
            brandDna: previewData._internal?.brandDna || null,
            marketIntel: previewData._internal?.marketIntel || null,
            roiData: previewData._internal?.roiData || null,
            generatedAt: previewData.generatedAt,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.driveLink) setDriveLink(data.driveLink);
        }
      } catch (e) {
        console.warn('Drive auto-save skipped:', e.message);
      } finally {
        setDriveLoading(false);
      }
    };
    autoSaveToDrive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewData]);

  const fetchFollowUp = async (question, answer) => {
    try {
      const res = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuestion: question.text, userAnswer: answer, businessName, industry }),
      });
      const data = await res.json();
      return data.followUp || null;
    } catch { return null; }
  };

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !currentQuestion) return;

    // Reset transcript state for the next question — mic stays open
    finalTranscriptRef.current = '';
    resultBoundaryRef.current = lastResultsLengthRef.current; // ignore anything before now

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInputValue('');
    setIsTyping(true);

    if (waitingForFollowUp) {
      setWaitingForFollowUp(false);
      await new Promise(r => setTimeout(r, 500));
      setIsTyping(false);
      advanceQuestion(answers);
      return;
    }

    const newAnswers = { ...answers, [currentQuestion.id]: trimmed };
    setAnswers(newAnswers);

    // Halfway checkpoint at Q12
    if (currentQuestion.id === 12) {
      await new Promise(r => setTimeout(r, 600));
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'agent',
        text: "You're officially halfway through. Taking the time to reflect this deeply on your business is a meaningful step toward improvement and scale. Keep going — you're building the kind of clarity most businesses never pause to create.",
        isCheckpoint: true,
      }]);
      await new Promise(r => setTimeout(r, 800));
      setIsTyping(true);
    }

    const followUp = await fetchFollowUp(currentQuestion, trimmed);
    setIsTyping(false);

    if (followUp) {
      setWaitingForFollowUp(true);
      setMessages(prev => [...prev, { role: 'agent', text: followUp, isFollowUp: true }]);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    advanceQuestion(newAnswers);
  };

  const handleMultiSelectSubmit = async () => {
    if (!currentQuestion || multiSelectedOptions.length === 0) return;
    finalTranscriptRef.current = ''; // reset transcript ref
    const selectedLabels = currentQuestion.options
      .filter(o => multiSelectedOptions.includes(o.value))
      .map(o => o.label)
      .join(', ');
    const answerText = `Selected: ${selectedLabels}`;
    setMessages(prev => [...prev, { role: 'user', text: answerText }]);
    const newAnswers = { ...answers, [currentQuestion.id]: answerText };
    setAnswers(newAnswers);
    advanceQuestion(newAnswers);
  };

  const advanceQuestion = (latestAnswers) => {
    const nextIndex = currentQIndex + 1;
    if (nextIndex >= questions.length) {
      generatePreview(latestAnswers);
      return;
    }
    setCurrentQIndex(nextIndex);
    setMultiSelectedOptions([]); // reset any multi-select state
    const nextQ = questions[nextIndex];
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'agent',
        text: nextQ.text,
        phase: nextQ.phase,
        qNumber: nextIndex + 1,
        total: questions.length,
      }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 700);
  };

  // ─── Edit Last Answer ─────────────────────────────────────────────────────
  const editLastAnswer = () => {
    if (isTyping || waitingForFollowUp) return;

    // Find the last user message
    let lastUserMsgIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { lastUserMsgIdx = i; break; }
    }
    if (lastUserMsgIdx === -1 || currentQIndex === 0) return;

    const lastAnswer = messages[lastUserMsgIdx].text;
    const prevQIndex = currentQIndex - 1;
    const questionId = questions[prevQIndex]?.id;

    // Remove user message + everything after it (agent follow-up / next question)
    setMessages(prev => prev.slice(0, lastUserMsgIdx));
    setCurrentQIndex(prevQIndex);
    if (questionId) setAnswers(prev => { const a = { ...prev }; delete a[questionId]; return a; });
    // Don't restore 'Selected: ...' multiselect answers as text
    setInputValue(lastAnswer.startsWith('Selected:') ? '' : lastAnswer);
    setWaitingForFollowUp(false);
    // Reset transcript boundary so mic starts fresh for re-answer
    finalTranscriptRef.current = '';
    resultBoundaryRef.current = lastResultsLengthRef.current;
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ─── Generate Preview Report (FREE) ─────────────────────────────────────────
  const generatePreview = async (finalAnswers) => {
    setMessages(prev => [...prev, {
      role: 'agent',
      text: "You've completed the full discovery interview. That alone places you ahead of most businesses — clarity always precedes leverage. Generating your Preview Report now...",
      isCompletion: true,
    }]);
    setStage(2);
    setError(null);
    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setPreviewData(data);
      setStage(3);
    } catch (err) {
      setError(err.message);
      setStage(3);
    }
  };

  // ─── Generate Full Blueprint (PAID — $599) ─────────────────────────────────
  const generateBlueprint = async () => {
    if (!previewData?._internal) return;
    setBlueprintLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executiveSummary: previewData._internal.executiveSummary,
          enablementStrategy: previewData._internal.enablementStrategy,
          validatedData: previewData._internal.validatedData,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setBlueprint(data);
      setStage(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setBlueprintLoading(false);
    }
  };

  // ─── Stripe Checkout Redirect ──────────────────────────────────────────────
  const handleCheckout = async () => {
    setError(null);
    setBlueprintLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName }),
      });
      const data = await res.json();
      if (data.url) {
        // Save preview data to sessionStorage so it survives the redirect
        sessionStorage.setItem('tekboss_preview', JSON.stringify(previewData));
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError(err.message);
      setBlueprintLoading(false);
    }
  };

  // ─── Poll for blueprint Drive folder link once Stage 4 is active ───────────
  useEffect(() => {
    if (stage !== 4 || blueprintDriveLink) return;
    setBlueprintDrivePending(true);
    let attempts = 0;
    let timerId;
    const poll = async () => {
      try {
        const res = await fetch('/api/blueprint/drive-link', { credentials: 'include' });
        if (res.ok) {
          const { driveLink: link, ready } = await res.json();
          if (ready && link) {
            setBlueprintDriveLink(link);
            setBlueprintDrivePending(false);
            return; // stop
          }
        }
      } catch { /* non-fatal */ }
      attempts++;
      if (attempts < 24) timerId = setTimeout(poll, 10_000);
      else setBlueprintDrivePending(false);
    };
    timerId = setTimeout(poll, 8_000); // first check after 8s
    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ─── Frustration / DFY Detection ──────────────────────────────────────────
  const detectFrustration = (message, history = []) => {
    const signals = [
      "can't", "cant", "confused", "don't understand", "dont understand",
      "too complex", "too complicated", "lost", "stuck", "overwhelmed",
      "don't know how", "dont know how", "not working", "frustrated",
      "struggling", "not sure", "don't get", "dont get", "too hard",
      "difficult", "how do i even", "what do i do", "i give up",
      "this is hard", "i need help", "can someone", "can you do it for me",
      "do it for me", "build this for me", "make this for me",
    ];
    const lower = message.toLowerCase();
    const hasSignal = signals.some(s => lower.includes(s));
    // Also trigger if user has sent 5+ messages (sustained engagement = potential struggle)
    const userMsgCount = history.filter(m => m.role === 'user').length;
    return hasSignal || userMsgCount >= 5;
  };

  // ─── Implementation Assistant ───────────────────────────────────────────────

  // Auto-fire opening coaching message when Stage 4 first loads
  useEffect(() => {
    if (stage === 4 && assistantMessages.length === 0 && (blueprint || previewData)) {
      sendAssistantKickoff();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const sendAssistantKickoff = async () => {
    setAssistantTyping(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: 'Start the coaching session. Open by identifying the highest-leverage system from the blueprint and establish the Week 1 implementation agenda.',
          conversationHistory: [],
          blueprintContext: {
            businessName: businessName || 'Your Business',
            systems: previewData?._internal?.validatedData?.namedSystems || [],
            goals: previewData?._internal?.validatedData?.opportunityZones || [],
            brandVoice: previewData?._internal?.validatedData?.brandFoundation?.emotionalTone?.join(', ') || '',
            constraints: previewData?._internal?.validatedData?.brandFoundation?.doNotSayLanguage || [],
            fullBlueprint: blueprint?.diyPlaybook || '',
            isKickoff: true,
          },
        }),
      });
      const data = await res.json();
      setAssistantMessages([{ role: 'assistant', content: data.response, timestamp: new Date().toISOString() }]);
    } catch {
      setAssistantMessages([{ role: 'assistant', content: `Let's build your blueprint out. I'll lead — you execute. What system should we start with?`, timestamp: new Date().toISOString() }]);
    } finally {
      setAssistantTyping(false);
    }
  };

  // Score a message for DISC signals (client-side accumulation)
  const scoreMessageForDISC = (msg) => {
    const lower = msg.toLowerCase();
    const words = msg.trim().split(/\s+/).length;
    const D = ['fast','quick','now','asap','result','win','goal','direct','decide','action','move','drive','done','deadline','control','just do','bottom line','roi','execute'].filter(k => lower.includes(k)).length
             + (words < 20 ? 1.5 : 0) + (/\b(just|simply|straight up)\b/.test(lower) ? 0.5 : 0);
    const I = ['team','people','together','excited','love','feel','share','community','connect','vision','everyone','culture','inspire','energy','fun','relationship','partner','awesome','amazing'].filter(k => lower.includes(k)).length
             + (/!/.test(msg) ? 1 : 0);
    const S = ['careful','step','slow','stable','consistent','plan','process','wait','secure','safe','steady','worried','concerned','risk','buy-in'].filter(k => lower.includes(k)).length
             + (/\b(i think|maybe|kind of|not sure|i guess|sort of)\b/.test(lower) ? 1 : 0);
    const C = ['data','analytics','accurate','measure','detail','research','proven','track','understand','specific','exactly','evidence','compare','precisely','technically','why does','how does'].filter(k => lower.includes(k)).length
             + (words > 90 ? 1.5 : 0) + (/\b(specifically|exactly|precisely)\b/.test(lower) ? 1 : 0);
    return { D, I, S, C };
  };

  const handleAssistantSubmit = async () => {
    const trimmed = assistantInput.trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };

    // Score this message and update the DISC accumulator
    const delta = scoreMessageForDISC(trimmed);
    const newAccumulator = {
      D: discAccumulator.D + delta.D,
      I: discAccumulator.I + delta.I,
      S: discAccumulator.S + delta.S,
      C: discAccumulator.C + delta.C,
    };
    setDiscAccumulator(newAccumulator);
    const coachInteractionCount = assistantMessages.filter(m => m.role === 'user').length + 1;

    setAssistantMessages(prev => [...prev, userMsg]);
    setAssistantInput('');
    setAssistantTyping(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: assistantMessages,
          blueprintContext: {
            businessName: businessName || 'Your Business',
            systems: previewData?._internal?.validatedData?.namedSystems || [],
            goals: previewData?._internal?.validatedData?.opportunityZones || [],
            brandVoice: previewData?._internal?.validatedData?.brandFoundation?.emotionalTone?.join(', ') || '',
            constraints: previewData?._internal?.validatedData?.brandFoundation?.doNotSayLanguage || [],
            fullBlueprint: blueprint?.diyPlaybook || '',
            existingToolStack: previewData?._internal?.validatedData?.existingToolStack || [],
            // DISC personality signals (invisible to user)
            discAccumulator: newAccumulator,
            coachInteractionCount,
          },
        }),
      });
      const data = await res.json();
      const isFrustrated = detectFrustration(trimmed, assistantMessages);
      setAssistantMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        suggestDfy: isFrustrated,
      }]);
    } catch (err) {
      setAssistantMessages(prev => [...prev, { role: 'assistant', content: 'I was unable to process your request. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setAssistantTyping(false);
      setTimeout(() => assistantInputRef.current?.focus(), 100);
    }
  };

  // ─── DFY Request ───────────────────────────────────────────────────────────
  const handleDfyRequest = async () => {
    try {
      await fetch('/api/request-dfy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          contactEmail: dfyEmail,
          systemContext: JSON.stringify({
            systems: previewData?._internal?.validatedData?.namedSystems || [],
            goals: previewData?._internal?.validatedData?.opportunityZones || [],
          }),
        }),
      });
      setDfySubmitted(true);
    } catch {
      setDfySubmitted(true); // Show success even on error — we'll follow up
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAssistantKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAssistantSubmit();
    }
  };

  // ─── Auth handlers ──────────────────────────────────────────────────────
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        if (authForm.password !== authForm.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (authForm.password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }
        // Execute reCAPTCHA v3 — invisible to user, runs in background
        let recaptchaToken = '';
        try {
          recaptchaToken = await new Promise((resolve, reject) => {
            if (!window.grecaptcha) return resolve('');
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute('6LcPWMEsAAAAAMEVz0X14p4kWdl6uvx9tFNTXaFx', { action: 'register' })
                .then(resolve)
                .catch(() => resolve(''));
            });
          });
        } catch (_) { /* non-fatal */ }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
            fullName: authForm.fullName,
            recaptchaToken,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');
        setUser(data.user);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed.');
        setUser(data.user);
      }
      setShowAuthModal(false);
      setShowDisclaimer(false);
      setAuthForm({ fullName: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    setUser(null);
    setShowDisclaimer(true);
    setStage(1);
    setMessages([]);
    setAnswers({});
    setCurrentQIndex(0);
    setPreviewData(null);
    setBlueprint(null);
  };

  // ─── Auto-save progress ─────────────────────────────────────────────────
  useEffect(() => {
    if (user && Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(`tekboss_progress_${user.id}`, JSON.stringify({
          answers,
          currentQIndex,
          messages: messages.slice(-20), // keep last 20 to avoid bloat
          savedAt: new Date().toISOString(),
        }));
      } catch { /* storage full — ignore */ }
    }
  }, [answers, currentQIndex, user]);

  // ─── Restore progress on login ──────────────────────────────────────────
  useEffect(() => {
    if (user && Object.keys(answers).length === 0) {
      try {
        const saved = localStorage.getItem(`tekboss_progress_${user.id}`);
        if (saved) {
          const { answers: savedAnswers, currentQIndex: savedIdx, messages: savedMsgs } = JSON.parse(saved);
          if (savedAnswers && Object.keys(savedAnswers).length > 0) {
            setAnswers(savedAnswers);
            setCurrentQIndex(savedIdx || 0);
            if (savedMsgs) setMessages(savedMsgs);
          }
        }
      } catch { /* bad data — ignore */ }
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* ── Landing Page Hero ── */}
      {showDisclaimer && (
        <div ref={landingScrollRef} className="fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-y-auto">
          {/* Nav Bar */}
          <nav className="flex items-center justify-between px-6 md:px-12 py-4 flex-shrink-0">
            <div className="flex items-center">
              <BrandWordmark height={24} />
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">{user.email}</span>
                  <button
                    onClick={() => setShowDisclaimer(false)}
                    className="bg-blue-600 text-white font-black px-6 py-2.5 rounded-xl hover:bg-blue-500 uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-900/30"
                  >
                    Continue →
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); setAuthError(null); }}
                    className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setShowAuthModal(true); setAuthError(null); }}
                    className="bg-blue-600 text-white font-black px-6 py-2.5 rounded-xl hover:bg-blue-500 uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-900/30"
                  >
                    Start Free →
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Hero Section */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 pb-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-8">
                Stop Guessing<br />
                How to Use AI<br />
                <span className="text-blue-400/80">in Your Business.</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                In minutes, see exactly what to automate, where time is being lost, and a clear path for how your business can operate over the next 90 days.
              </p>

              {/* Video Button + Modal */}
              {videoModalOpen && (
                <div
                  className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                  onClick={() => setVideoModalOpen(false)}
                >
                  <div
                    className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <video
                      src="/tekboss-explainer.mp4"
                      controls
                      autoPlay
                      className="w-full h-full rounded-2xl"
                      style={{ background: '#000' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <button
                      onClick={() => setVideoModalOpen(false)}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-4 bg-slate-900/80 border border-green-500/30 rounded-2xl px-8 py-5 mb-6 hover:border-green-400/60 hover:bg-slate-900 transition-all group cursor-pointer"
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />
                  <div className="relative w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-green-400 ml-1" />
                  </div>
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Watch the Explainer Video</span>
              </button>

              {/* Primary CTA */}
              <div>
                <button
                  id="begin-interview-btn"
                  onClick={() => {
                    if (user) {
                      setShowDisclaimer(false);
                    } else {
                      setAuthMode('register');
                      setShowAuthModal(true);
                      setAuthError(null);
                    }
                  }}
                  className="bg-white text-slate-950 font-black px-12 py-5 rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 transition-all mx-auto"
                >
                  {user ? `Continue Session →` : <>Start Your Free Analysis <ArrowRight size={16} /></>}
                </button>
                {user && (
                  <p className="text-slate-500 text-[11px] mt-3 text-center">
                    Signed in as <span className="text-slate-300">{user.email}</span>
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Learn More — Expanded Section */}
          <div className="max-w-3xl mx-auto px-6 pb-14 space-y-8">

            {/* How It Works */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 sm:p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8">How It Works</p>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {[
                  { step: '01', title: '24-Question Interview', body: 'Answer one question at a time in a conversational format. No forms, no jargon — just a direct dialogue designed to surface how your business actually operates.' },
                  { step: '02', title: 'Free Preview Report', body: 'Before you pay anything, our AI produces a business health analysis — opportunity zones, risk flags, and a read on where AI can move the needle fastest for you.' },
                  { step: '03', title: 'Your Full AI Blueprint', body: 'After unlocking, you receive a complete package: named AI systems, tool decisions, workflow designs, a Scope of Work, and a 90-day execution roadmap.' },
                ].map(({ step, title, body }) => (
                  <div key={step} className="flex flex-col gap-4">
                    <span className="text-xs font-black text-blue-400 tracking-widest">{step}</span>
                    <h3 className="text-white font-black text-base uppercase tracking-tight leading-snug">{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Delivered */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 sm:p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8">What's Delivered</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  { icon: '📋', label: 'Intake Summary', desc: 'A structured record of your goals, constraints, tool stack, and brand voice — the source document for everything else.' },
                  { icon: '📄', label: 'Scope of Work (SOW)', desc: 'A professional SOW ready to hand to a developer or AI agency. Defines what gets built, how, and to what standard.' },
                  { icon: '⚙️', label: 'AI Build Spec', desc: 'A machine-readable file with your named AI systems, integration priorities, and phased rollout — built for technical handoff.' },
                  { icon: '🗺️', label: '90-Day Playbook', desc: 'Your step-by-step roadmap with named systems, specific tools, and sequenced actions.' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex gap-4 p-5 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <span className="text-2xl shrink-0">{icon}</span>
                    <div>
                      <p className="text-white text-sm font-black uppercase tracking-tight mb-2">{label}</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-6 leading-relaxed">
                All four files are automatically delivered to a private Google Drive folder — no manual downloads required.
              </p>
            </div>

            {/* Who It's For */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 sm:p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8">Who This Is For</p>
              <div className="space-y-4">
                {[
                  "Founders and operators who know AI is important but don't know where to start",
                  "Service businesses tired of generic advice that doesn't account for how they actually work",
                  "Teams evaluating AI tools who need a structured decision framework — not more demos",
                  "Anyone who has tried AI tools and found the output too generic to use professionally",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-slate-600 text-xs leading-relaxed italic text-center max-w-lg mx-auto pb-2">
              Strategic projections are algorithmic estimates based on provided data. Final authority rests with the User.
            </p>

          </div>

          {/* Footer */}
          <footer className="text-center py-6 text-slate-600 text-xs flex-shrink-0">
            © 2026 TEK BOSS.ai
          </footer>
        </div>
      )}

      <Sidebar
        stage={stage}
        onStartFresh={stage < 4 ? () => {
          setMessages([{ role: 'agent', text: questions[0].text, phase: questions[0].phase, qNumber: 1, total: questions.length }]);
          setAnswers({});
          setCurrentQIndex(0);
          setMultiSelectedOptions([]);
          setInputValue('');
          setWaitingForFollowUp(false);
          setPreviewData(null);
          setError(null);
          setStage(1);
          if (user) localStorage.removeItem(`tekboss_progress_${user.id}`);
        } : null}
      />

      <main className="flex-1 relative z-10 overflow-hidden flex flex-col">

        {/* ── STAGE 1: Interview ── */}
        {stage === 1 && (
          <div className="flex flex-col h-full">
            {/* Pipeline Stage Nav Bar */}
            <div className="flex-shrink-0 px-4 md:px-8 pt-5 pb-4 border-b border-slate-800/40">
              <div className="flex items-center justify-between mb-3 max-w-2xl mx-auto w-full">
                {[
                  { id: 1, label: 'Interview',   stageNum: 1 },
                  { id: 2, label: 'Processing',  stageNum: 2 },
                  { id: 3, label: 'Preview',     stageNum: 3 },
                  { id: 4, label: 'Blueprint',   stageNum: 4 },
                ].map((s, idx) => {
                  const isActive   = stage === s.stageNum;
                  const isComplete = stage > s.stageNum;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-500
                          ${ isComplete ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/40'
                            : isActive  ? 'bg-[#3A5F8A] text-white ring-2 ring-blue-400/40 shadow-lg shadow-[#3A5F8A]/40'
                            : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
                          {isComplete ? <CheckCircle size={12} /> : s.id}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-500
                          ${ isActive ? 'text-blue-400' : isComplete ? 'text-slate-400' : 'text-slate-700'}`}>
                          {s.label}
                        </span>
                      </div>
                      {idx < 3 && (
                        <div className={`flex-1 h-[2px] mx-1 rounded-full transition-all duration-700 ${ isComplete ? 'bg-blue-500' : 'bg-slate-800'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {/* Progress within interview */}
              <div className="flex justify-between items-center mb-1.5 max-w-2xl mx-auto">
                <span className="text-[9px] font-black text-blue-600/80 uppercase tracking-[0.3em]">Discovery Interview</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-500 font-bold">{currentQIndex + 1} / {questions.length}</span>
                  <button
                    id="start-over-btn"
                    onClick={() => {
                      if (currentQIndex === 0 || window.confirm('Start over? This will clear all your answers and take you back to Question 1.')) {
                        setMessages([{ role: 'agent', text: questions[0].text, phase: questions[0].phase, qNumber: 1, total: questions.length }]);
                        setAnswers({});
                        setCurrentQIndex(0);
                        setMultiSelectedOptions([]);
                        setInputValue('');
                        setWaitingForFollowUp(false);
                        setError(null);
                        if (user) localStorage.removeItem(`tekboss_progress_${user.id}`);
                      }
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-1"
                  >
                    <span style={{ fontSize: '11px' }}>&#8635;</span> Start Over
                  </button>
                </div>
              </div>
              <div className="h-[2px] w-full max-w-2xl mx-auto bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
                  style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'agent' && (
                    <div className="flex flex-col items-start">
                      <AgentBubble msg={msg} />
                      {msg.qNumber && questions.find(q => q.id === msg.qNumber)?.hint && (
                        <button
                          onClick={() => setActiveHelpId(msg.qNumber)}
                          className="ml-11 mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-blue-400 transition-colors font-bold uppercase tracking-[0.2em]"
                        >
                          <HelpCircle size={11} /> Example answer
                        </button>
                      )}
                    </div>
                  )}
                  {msg.role === 'user' && (() => {
                    // Only last user message gets the edit button
                    const isLastUser = !messages.slice(i + 1).some(m => m.role === 'user');
                    return (
                      <div className="flex flex-col items-end gap-1">
                        <div className="max-w-xl bg-[#3A5F8A] text-white rounded-2xl rounded-tr-sm px-5 py-4 text-sm font-medium leading-relaxed shadow-lg">
                          {msg.text}
                        </div>
                        {isLastUser && !isTyping && (
                          <button
                            onClick={editLastAnswer}
                            className="flex items-center gap-1 text-[9px] text-slate-600 hover:text-blue-400 font-bold uppercase tracking-[0.2em] transition-colors"
                          >
                            <Pencil size={9} /> Edit answer
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mt-1 overflow-hidden">
                      <BrandLogo size="sm" className="rounded-lg" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input — normal textarea OR multi-select panel */}
            <div className="flex-shrink-0 px-8 py-6 border-t border-slate-800/50 bg-slate-950/80">
              {currentQuestion?.type === 'multiSelect' ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-4">Select all that apply</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-72 overflow-y-auto pr-1">
                    {currentQuestion.options?.map(opt => {
                      const selected = multiSelectedOptions.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setMultiSelectedOptions(prev =>
                            prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value]
                          )}
                          className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all border ${
                            selected
                              ? 'bg-blue-600/15 border-blue-500/50 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 mt-0.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            selected ? 'bg-blue-600 border-blue-600' : 'border-slate-600'
                          }`}>
                            {selected && (
                              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-tight">{opt.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    id="multiselect-continue-btn"
                    onClick={handleMultiSelectSubmit}
                    disabled={multiSelectedOptions.length === 0}
                    className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    Continue ({multiSelectedOptions.length} selected) <ArrowRight size={14} />
                  </button>
                  {multiSelectedOptions.length === 0 && (
                    <p className="text-center text-[10px] text-slate-600 mt-2">Select at least one option to continue</p>
                  )}
                </div>
              ) : (
                // Normal textarea input
                <>
                  {isListening && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-mic-pulse" />
                      <span className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em]">Listening… tap mic to stop</span>
                    </div>
                  )}
                  <div className="flex gap-3 items-end">
                    <textarea
                      ref={inputRef}
                      id="answer-input"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-600 resize-none font-medium leading-relaxed"
                      placeholder={isListening ? 'Listening… tap mic or start typing to stop' : waitingForFollowUp ? 'Clarify your answer…' : 'Type or speak your response…'}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={e => {
                        // Stop mic the moment the user starts typing — prevents transcript
                        // from overwriting manual corrections
                        if (isListening && !e.metaKey && !e.ctrlKey && !e.altKey) {
                          stopListening();
                        }
                        handleKeyDown(e);
                      }}
                      onMouseDown={() => { if (isListening) stopListening(); }}
                      rows={2}
                    />
                    {voiceSupported && (
                      <button
                        id="mic-btn"
                        onClick={toggleListening}
                        title={isListening ? 'Stop recording' : 'Speak your answer'}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                          isListening
                            ? 'bg-red-600 text-white animate-mic-pulse shadow-lg shadow-red-900/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </button>
                    )}
                    <button
                      id="send-btn"
                      onClick={handleSubmit}
                      disabled={!inputValue.trim() || isTyping}
                      className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-lg"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-slate-700 mt-3">Enter to send · Shift+Enter for new line{voiceSupported ? ' · Mic to speak' : ''}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── STAGE 2: Processing ── */}
        {stage === 2 && (
          <IntelligenceEngineLoader
            isCompleting={false}
            headline="Synthesizing Blueprint"
            subLabels={[
              "Building Executive Summary...",
              "Mapping Named Systems...",
              "Analyzing Competitor Landscape...",
              "Assessing Business Health...",
              "Scanning Digital Footprint...",
              "Calculating Revenue Leakage...",
              "Drafting Orchestration Logic...",
              "Generating Preview Report..."
            ]}
            activeText="Intelligence Engine Active — Do Not Close Window"
            completionText="Synthesis Operations Complete"
          />
        )}

        {/* ── STAGE 3: Preview Report (or Blueprint Generation in progress) ── */}
        {stage === 3 && (
          blueprintLoading ? (
            <BlueprintLoader businessName={businessName} />
          ) : (
            <PreviewReport
              previewData={previewData}
              businessName={businessName}
              onDownload={downloadPdf}
              onCheckout={handleCheckout}
              pdfDownloading={pdfDownloading}
              blueprintLoading={blueprintLoading}
              driveLink={driveLink}
              driveLoading={driveLoading}
              error={error}
              onRetry={() => generatePreview(answers)}
            />
          )
        )}


        {/* ── STAGE 4: Full Blueprint ── */}
        {stage === 4 && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-16 px-8">
              <header className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-emerald-600/20">
                  <CheckCircle size={14} /> Blueprint Unlocked
                </div>
                <h2 className="text-5xl font-black text-white mb-4 tracking-tighter leading-none">Your AI Blueprint</h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                  Your complete AI Business Operating System — named systems, tool decisions, automation workflows, and your 90-day implementation roadmap.
                </p>
              </header>

              {/* DIY Blueprint */}
              {blueprint?.diyPlaybook && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center border border-blue-500/20"><FileText size={16} /></span>
                      Your Implementation Blueprint
                    </h3>

                    {/* Drive folder card — replaces download buttons */}
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
                      blueprintDriveLink
                        ? 'bg-slate-900 border-slate-700'
                        : 'bg-slate-900/50 border-slate-800'
                    }`}>
                      {/* Drive icon (Google Drive wordmark colors) */}
                      <svg width="18" height="16" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                      </svg>

                      {blueprintDriveLink ? (
                        <a
                          href={blueprintDriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          id="blueprint-drive-folder-link"
                          className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
                        >
                          View your files in Google Drive →
                        </a>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Preparing your files…
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-10 shadow-xl">
                    <MarkdownContent content={blueprint.diyPlaybook} />
                  </div>
                </div>
              )}

              {/* SOW */}
              {blueprint?.sowPlaybook && (
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20"><ShieldCheck size={16} /></span>
                    Custom Scope of Work (SOW)
                  </h3>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-10 shadow-xl">
                    <MarkdownContent content={blueprint.sowPlaybook} />
                  </div>
                </div>
              )}

              {/* Implementation Assistant CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl mb-12">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center mb-6">
                    <Bot size={28} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-3">Included with your blueprint</p>
                  <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase">90-Day Build-Out Coach</h3>
                  <p className="text-blue-100 text-sm mb-8 max-w-lg leading-relaxed">
                    Your blueprint-grounded AI guide. It walks you through every system, every integration, every automation — step by step. Every response is built around YOUR business, YOUR systems, YOUR 90-day roadmap.
                  </p>
                  <button
                    onClick={() => setStage(5)}
                    className="bg-white text-blue-700 font-black px-10 py-4 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    Launch Build-Out Coach <ArrowRight size={14} />
                  </button>
                  <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-widest mt-4">
                    90 days included · then $34.99/mo · cancel anytime
                  </p>
                </div>
              </div>

              {/* DFY Upsell */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 shadow-xl">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={18} className="text-amber-400" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Done-For-You Option</p>
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Prefer Not to Build It Yourself?</h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                      Our team can implement your entire AI Blueprint for you — full system setup, automation workflows, integrations, and testing. Each engagement is custom-scoped based on your blueprint.
                    </p>
                    {!dfySubmitted ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          placeholder="Your email for the quote"
                          value={dfyEmail}
                          onChange={(e) => setDfyEmail(e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-600"
                        />
                        <button
                          onClick={handleDfyRequest}
                          disabled={!dfyEmail.includes('@')}
                          className="bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-amber-400 disabled:opacity-50 transition-all flex-shrink-0"
                        >
                          Request Implementation
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl px-5 py-4 flex items-center gap-3">
                        <CheckCircle size={18} className="text-emerald-400" />
                        <p className="text-sm text-emerald-200 font-medium">
                          Your request has been received. Our team will evaluate your blueprint and provide a custom scope and quote.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 5: Build-Out Coach ── */}
        {stage === 5 && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b border-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm uppercase tracking-tight">90-Day Build-Out Coach</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                      Grounded in {businessName ? `${businessName}'s` : 'your'} blueprint
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* DFY Consultation — persistent offering */}
                  <a
                    href="mailto:hello@tekboss.ai?subject=Done-For-You Blueprint Build&body=I'm interested in having my AI systems built out for me."
                    className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Zap size={11} /> Done For You
                  </a>
                  {subscription.daysRemaining > 0 && (
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${
                      subscription.isWarningPeriod
                        ? 'text-amber-400 bg-amber-950/40 border-amber-800/30'
                        : 'text-slate-500 bg-slate-900 border-slate-800'
                    }`}>
                      {subscription.isWarningPeriod
                        ? `⚠ Auto-renewal in ${subscription.daysRemaining}d — $34.99/mo`
                        : `${subscription.daysRemaining} days remaining`}
                    </span>
                  )}
                  {subscription.active && subscription.status !== 'cancelled' && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-slate-600 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => setStage(4)}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <FileText size={12} /> View Blueprint
                  </button>
                </div>
              </div>

              {/* Cancel Confirmation */}
              {showCancelConfirm && (
                <div className="mt-4 bg-red-950/30 border border-red-800/20 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-200 font-medium">Cancel your Build-Out Coach subscription?</p>
                    <p className="text-[10px] text-red-400/60 font-medium mt-1">Your blueprint is yours forever. You’ll keep access until the end of your current period.</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-white transition-colors px-3 py-2"
                    >Keep</button>
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/cancel-subscription', { method: 'POST', credentials: 'include' });
                          await fetchSubscriptionStatus();
                          setShowCancelConfirm(false);
                        } catch { /* ignore */ }
                      }}
                      className="text-xs text-red-400 font-bold uppercase tracking-widest hover:text-red-300 transition-colors bg-red-950/30 border border-red-800/20 rounded-lg px-3 py-2"
                    >Confirm Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Assistant Chat */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {assistantMessages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <Bot size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Your Build-Out Coach</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
                    I'll walk you through every system in your blueprint — from setup to launch. Each answer is built around your specific business, tools, and 90-day roadmap.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    {['Where do I start with Week 1?', 'Walk me through my first automation', 'What should I set up first?', 'How do I connect my systems?'].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setAssistantInput(q); setTimeout(() => assistantInputRef.current?.focus(), 100); }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 font-medium hover:border-blue-500/50 hover:text-blue-400 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {assistantMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <>
                      <div className="flex items-start gap-3 max-w-2xl">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mt-1 flex-shrink-0">
                          <Bot size={15} />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-5 py-4">
                          <MarkdownContent content={msg.content} />
                        </div>
                      </div>
                      {msg.suggestDfy && (
                        <div className="max-w-xl ml-11 mt-2 rounded-2xl border border-amber-500/30 bg-amber-950/20 px-5 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1 flex items-center gap-1.5">
                            <Zap size={10} /> Want this built for you?
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            Our implementation partners specialize in building these exact AI systems — done for you, in weeks, not months. Skip the DIY learning curve.
                          </p>
                          <a
                            href={`mailto:hello@tekboss.ai?subject=Done-For-You Build Request — ${businessName || 'Blueprint'}&body=Hi, I'd like to skip the DIY route and have my AI systems built out. My business is ${businessName || '[Business Name]'}.`}
                            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
                          >
                            <Zap size={10} /> Schedule a Free Strategy Call
                          </a>
                          <p className="text-[9px] text-slate-600 mt-2">No obligation — get a build plan and timeline in one session.</p>
                        </div>
                      )}
                    </>
                  )}
                  {msg.role === 'user' && (
                    <div className="max-w-xl bg-[#3A5F8A] text-white rounded-2xl rounded-tr-sm px-5 py-4 text-sm font-medium leading-relaxed shadow-lg">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}

              {assistantTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mt-1">
                      <Bot size={15} />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={assistantBottomRef} />
            </div>

            {/* Assistant Input */}
            <div className="flex-shrink-0 px-8 py-6 border-t border-slate-800/50 bg-slate-950/80">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={assistantInputRef}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-600 resize-none font-medium leading-relaxed"
                  placeholder="Ask about your blueprint, systems, or next steps..."
                  value={assistantInput}
                  onChange={e => setAssistantInput(e.target.value)}
                  onKeyDown={handleAssistantKeyDown}
                  rows={2}
                />
                <button
                  onClick={handleAssistantSubmit}
                  disabled={!assistantInput.trim() || assistantTyping}
                  className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-lg"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-slate-700">Enter to send · Shift+Enter for new line</p>
                <button
                  onClick={() => setStage(4)}
                  className="text-[10px] text-slate-600 hover:text-amber-400 font-bold uppercase tracking-[0.2em] transition-colors"
                >
                  Need this built for you? →
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Help Panel ── */}
      {activeHelpId && (
        <HelpPanel
          question={questions.find(q => q.id === activeHelpId)}
          onClose={() => setActiveHelpId(null)}
        />
      )}

      {/* ── Auth Modal ── */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Logo + Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <BrandWordmark height={32} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                {authMode === 'register' ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-slate-500 text-xs mt-2 font-medium">
                {authMode === 'register'
                  ? 'Save your progress, secure your blueprint, and access it anytime.'
                  : 'Sign in to resume your analysis or view your blueprint.'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.fullName}
                    onChange={e => setAuthForm(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-600 transition-colors"
                    placeholder="John Smith"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-600 transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1.5">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={authForm.password}
                  onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-600 transition-colors"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-[34px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={authForm.confirmPassword}
                    onChange={e => setAuthForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-600 transition-colors"
                    placeholder="Re-enter password"
                  />
                </div>
              )}

              {authError && (
                <div className="bg-red-950/50 border border-red-800/30 rounded-xl px-4 py-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300 font-medium">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-500 uppercase tracking-widest text-xs shadow-lg shadow-blue-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <><RefreshCw size={14} className="animate-spin" /> {authMode === 'register' ? 'Creating Account...' : 'Signing In...'}</>
                ) : (
                  <>{authMode === 'register' ? 'Create Account & Start' : 'Sign In'} <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setAuthMode(m => m === 'register' ? 'login' : 'register'); setAuthError(null); }}
                className="text-xs text-slate-500 hover:text-blue-400 font-medium transition-colors"
              >
                {authMode === 'register' ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>

            {/* Trust Signals */}
            {authMode === 'register' && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                  <ShieldAlert size={12} className="text-emerald-600" />
                  Your data is encrypted and secured
                </div>
                <ul className="mt-3 space-y-1.5 text-[10px] text-slate-500 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle size={10} className="text-emerald-700" /> Save your progress — resume anytime</li>
                  <li className="flex items-center gap-2"><CheckCircle size={10} className="text-emerald-700" /> Blueprint secured to your account</li>
                  <li className="flex items-center gap-2"><CheckCircle size={10} className="text-emerald-700" /> Access your documents from any device</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}