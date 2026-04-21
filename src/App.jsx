import React, { useState, useEffect, useRef } from 'react';
import IntelligenceEngineLoader from './IntelligenceEngineLoader';
import PreviewReport from './PreviewReport';
import ReactMarkdown from 'react-markdown';
import {
  ChevronRight, Cpu, FileText, Lock, MessageSquare, BarChart3,
  ShieldCheck, Send, CheckCircle, AlertTriangle, Sparkles,
  ArrowRight, RefreshCw, HelpCircle, X, Zap, Target,
  TrendingUp, Layers, Bot, ExternalLink, Clock, Star,
  User, LogOut, Eye, EyeOff, ShieldAlert,
} from 'lucide-react';

// ─── Static questions — always available, no API needed ───────────────────────
const STATIC_QUESTIONS = [
  { id: 1, phase: 'Identity', text: "What's the name of your business? And if you have a website, what's the website address?", hint: 'Include your full business name and paste your website link if you have one.', example: 'Apex Digital Media — apexdigitalmedia.co' },
  { id: 2, phase: 'Identity', text: 'What industry are you in, and what kind of work do you actually do?', hint: 'Be specific about what you actually deliver, not just your category.', example: 'Digital marketing — paid ads and SEO for e-commerce brands' },
  { id: 3, phase: 'Context', text: "In plain terms — what do clients get from working with you that they couldn't easily get elsewhere?", hint: 'Focus on the outcome or result, not the service itself.', example: 'Our clients go from 0 to 20+ qualified leads per month within 60 days' },
  { id: 4, phase: 'Context', text: 'Who is your ideal client? Describe them specifically — who they are, their situation, and what they need.', hint: 'Include industry, business size, situation, and their main pain point.', example: 'Coaches doing $10k–$30k/month who need more leads but have no time for content' },
  { id: 5, phase: 'Story', text: 'What made you start this business? Give me the real reason, not the elevator pitch version.', hint: 'Be honest — the real origin story gives us insight into your mission and values.', example: 'I spent 10 years in corporate watching small businesses get bad advice from expensive agencies and left to fix that.' },
  { id: 51, phase: 'Story', text: 'How long has this business been operating, and what is the most significant milestone you have hit so far?', hint: 'Give us the actual age of the business and one concrete achievement — a revenue milestone, a client count, a market win.', example: '3 years in business. Biggest milestone: crossed $250k in revenue last year and landed our first enterprise client.' },
  { id: 6, phase: 'Story', text: "Give me three specific numbers for the next 12 months: (1) your target revenue or monthly income goal, (2) the team size you want to be running, and (3) the number of active clients or customers you want to be serving.", hint: 'All three numbers are required — revenue/income target, headcount, and active client or customer count.', example: 'Revenue: $600k/year. Team: 5 people (me + 4). Clients: 40 active retainer clients.' },
  { id: 7, phase: 'Operations', text: "Name your top 3 biggest time drains this week — what the activity actually is (not just a category like 'admin') and roughly how many hours it takes each week.", hint: 'Be specific about what the task is, not just the category. Give a time estimate for each one.', example: '1. Manually building client reports from 5 different dashboards — 6 hrs/week. 2. Back-and-forth scheduling emails — 3 hrs/week. 3. Re-explaining our onboarding process to every new client — 4 hrs/week.' },
  { id: 9, phase: 'Operations', text: 'At what point in your sales process do you most often lose people? Where do things go quiet?', hint: 'Trace the path — intro call, proposal, follow-up, contract, onboarding?', example: 'After the proposal — people open it but ghost us if we wait more than 48 hours to follow up.' },
  { id: 10, phase: 'Operations', text: 'Where does your client and prospect data live right now? Spreadsheet, CRM, notes app — be specific.', hint: 'Name the exact tool, even if it\'s just a Google Sheet or a notes app.', example: 'HubSpot for active clients, but a Google Sheet backup because the team doesn\'t fully use HubSpot.' },
  { id: 11, phase: 'Operations', text: "What's the most time-consuming process in your business that you think a system could handle better than you're handling it now?", hint: 'Think about any repeated sequence — onboarding, reporting, follow-ups, publishing.', example: 'Client onboarding — we manually send 6 emails and update 4 spreadsheets per new client.' },
  { id: 12, phase: 'Financial', text: 'Roughly what do you spend each month running the business — ads, tools, contractors, admin?', hint: 'A ballpark is fine — include software, freelancers or VAs, and paid marketing.', example: 'About $4,000/month — $1,500 ads, $800 software, $1,700 part-time VA.' },
  { id: 13, phase: 'Financial', text: 'If all the admin friction disappeared tomorrow, how many more clients could you realistically take on next month?', hint: 'Be realistic — not your ceiling, your actual operational capacity if the busywork was gone.', example: 'Probably 8–10 more without needing to hire.' },
  { id: 14, phase: 'Financial', text: "What's your revenue goal for the next 12 months?", hint: 'A specific number helps the AI calibrate scale and urgency.', example: '$500,000 in annual recurring revenue.' },
  { id: 15, phase: 'AI Experience', text: 'Have you used AI tools before? If so, what worked — and where did the output fall short?', hint: 'Name the tools and be specific about what disappointed you — tone, accuracy, reliability?', example: 'ChatGPT and Jasper — output was generic, didn\'t match our voice, needed heavy editing every time.' },
  { id: 16, phase: 'AI Experience', text: "What software or platforms are completely off the table — things your team won't give up no matter what?", hint: 'These are your non-negotiables — what any recommendation needs to work around.', example: 'HubSpot, Slack, and Google Workspace — the team won\'t move off these.' },
  { id: 17, phase: 'AI Experience', text: 'Who has final say on anything AI-generated before it goes to clients or goes public?', hint: 'This tells us where the human review checkpoint needs to be in any workflow.', example: 'Me (the founder) for anything client-facing. My ops lead for internal content.' },
  { id: 18, phase: 'Differentiation', text: "What do you do genuinely better than your competitors? Not what sounds good — what's actually true?", hint: 'The thing clients would name if asked why they chose you.', example: 'Every client gets a live analytics dashboard and a monthly strategy call, not just a report.' },
  { id: 19, phase: 'Differentiation', text: 'Name 2-3 competitors you watch closely — brands doing something in your space that makes you take notice.', hint: "They don't have to be direct competitors — just players whose moves you track.", example: 'Scorpion and WebFX for their volume; Lean Labs for their thought leadership.' },
  { id: 20, phase: 'Brand', text: 'If your brand had a personality, how would it communicate? Give me three words that describe its voice and tone.', hint: 'Think about how you write emails or how clients describe your style.', example: 'Direct, sharp, confident — we don\'t soften things or use fluff.' },
  { id: 21, phase: 'Brand', text: 'What words, phrases, or communication styles would make you cringe if an AI wrote them for your brand?', hint: 'Think about jargon, passive voice, or motivational clichés you\'d never say.', example: "Synergy, ecosystem, empower — anything that sounds like a LinkedIn post from 2017." },
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
  { id: 23, phase: 'Signal', text: 'Last one — is there anything about your business, your situation, or your goals that would help us build a sharper blueprint for you?', hint: "Anything that doesn't fit earlier questions — an upcoming launch, a partnership, a constraint we should know.", example: 'We\'re launching a second service line in Q3, so the blueprint should account for that expansion.' },
];

// ─── Brand Logo ────────────────────────────────────────────────────────────────
const BrandLogo = ({ size = 'md', className = '' }) => {
  const sizeMap = { xs: 'w-5 h-5', sm: 'w-8 h-8', md: 'w-11 h-11', lg: 'w-16 h-16', xl: 'w-20 h-20', hero: 'w-28 h-28' };
  return (
    <img
      src="/tekboss-logo.jpg"
      alt="TEK BOSS.ai"
      className={`${sizeMap[size] || sizeMap.md} rounded-xl object-cover ${className}`}
    />
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
const Sidebar = ({ stage }) => {
  const navItems = [
    { id: 1, label: 'Discovery Interview', icon: MessageSquare },
    { id: 2, label: 'Processing', icon: Cpu },
    { id: 3, label: 'Preview Report', icon: BarChart3 },
    { id: 4, label: 'Full Blueprint', icon: FileText, locked: stage < 4 },
    { id: 5, label: 'Build-Out Coach', icon: Bot, locked: stage < 5 },
  ];
  return (
    <div className="w-72 bg-slate-950 text-slate-400 p-6 flex flex-col h-full border-r border-slate-800/50 flex-shrink-0">
      <div className="flex items-center gap-3 mb-12">
        <BrandLogo size="md" className="shadow-lg shadow-blue-500/20" />
        <div>
          <h1 className="font-black text-lg tracking-tighter text-white leading-none uppercase">TEK BOSS</h1>
          <p className="text-[9px] font-bold tracking-[0.25em] text-blue-500/80 mt-0.5 uppercase">AI Blueprint</p>
        </div>
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
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/60 mb-1">Follow-up</p>
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
  // DFY state
  const [dfySubmitted, setDfySubmitted] = useState(false);
  const [dfyEmail, setDfyEmail] = useState('');
  const [driveLink, setDriveLink] = useState(null);
  const [driveLoading, setDriveLoading] = useState(false);

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
    recognition.continuous = true;       // Keep listening through pauses
    recognition.interimResults = true;   // Stream text in real-time as you speak
    recognition.lang = 'en-US';

    let finalTranscript = '';            // Accumulated confirmed words — reset fresh each session

    // Clear any residual text so the new session starts blank
    setInputValue('');

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Keep whatever was typed — don't clear it
    };

    recognition.onerror = (event) => {
      // 'no-speech' is normal (user paused) — don't stop for it
      if (event.error !== 'no-speech') {
        stopListening();
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show final words + live preview of current phrase being spoken
      setInputValue((finalTranscript + interimTranscript).trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };
  // ──────────────────────────────────────────────────

  const questions = STATIC_QUESTIONS;
  const currentQuestion = questions[currentQIndex] || null;
  // Use the full business name from Q1 — never truncate to first word
  const businessName = answers[1] ? answers[1].split(/[,—–]/)[0].trim() : null;
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

    // Stop mic immediately — prevents old transcript bleeding into next question
    stopListening();

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
    stopListening(); // safety — stop any open mic session
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

  // ─── Implementation Assistant ───────────────────────────────────────────────
  const handleAssistantSubmit = async () => {
    const trimmed = assistantInput.trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setAssistantMessages(prev => [...prev, userMsg]);
    setAssistantInput('');
    setAssistantTyping(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          },
        }),
      });
      const data = await res.json();
      setAssistantMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      setAssistantMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I was unable to process your request. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
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
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" className="shadow-lg shadow-blue-500/20" />
              <span className="font-black text-white text-sm tracking-tight uppercase">TEK BOSS</span>
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
                className="inline-flex items-center gap-4 bg-slate-900/80 border border-green-500/30 rounded-2xl px-8 py-5 mb-6 hover:border-green-400/50 hover:bg-slate-900 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-green-400 ml-1" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Watch the Explainer Video</span>
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

              {/* Read More Toggle */}
              <button
                onClick={() => {
                  const el = document.getElementById('learn-more');
                  if (el && landingScrollRef.current) {
                    landingScrollRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
                  } else {
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="mt-8 text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors flex items-center gap-2 mx-auto"
              >
                Learn more below
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          {/* Collapsible Info Section */}
          <div id="learn-more" className="max-w-2xl mx-auto px-6 pb-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">What to expect</p>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li className="flex items-start gap-3"><CheckCircle size={14} className="text-blue-500 shrink-0 mt-0.5" /> <span><strong className="text-white">23 questions</strong> asked one at a time, conversational format</span></li>
                <li className="flex items-start gap-3"><CheckCircle size={14} className="text-blue-500 shrink-0 mt-0.5" /> <span><strong className="text-white">Free Preview Report</strong> with business health & opportunity analysis</span></li>
                <li className="flex items-start gap-3"><CheckCircle size={14} className="text-blue-500 shrink-0 mt-0.5" /> <span><strong className="text-white">Full AI Blueprint</strong> with named systems, tools, and 90-day plan</span></li>
              </ul>
              <p className="text-slate-600 text-[10px] mt-5 leading-relaxed italic">
                Strategic projections are algorithmic estimates based on provided data. Final authority rests with the User.
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-6 text-slate-600 text-xs flex-shrink-0">
            © 2026 TEK BOSS · privacy@thetekboss.com
          </footer>
        </div>
      )}

      <Sidebar stage={stage} />

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
                            : isActive  ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-lg shadow-blue-900/40'
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
                      if (currentQIndex === 0 || window.confirm('Start over? Your progress will be cleared.')) {
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
                    className="text-[9px] text-slate-600 hover:text-rose-400 font-bold uppercase tracking-[0.2em] transition-colors"
                  >
                    ↺ Start Over
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
                  {msg.role === 'user' && (
                    <div className="max-w-xl bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-4 text-sm font-medium leading-relaxed shadow-lg">
                      {msg.text}
                    </div>
                  )}
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
                      placeholder={isListening ? 'Listening…' : waitingForFollowUp ? 'Clarify your answer…' : 'Type or speak your response…'}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
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

        {/* ── STAGE 3: Preview Report ── */}
        {stage === 3 && (
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
                    <button
                      id="download-pdf-blueprint"
                      onClick={() => downloadPdf(blueprint)}
                      disabled={pdfDownloading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {pdfDownloading ? 'Generating…' : 'Download PDF'}
                    </button>
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
                    <div className="flex items-start gap-3 max-w-2xl">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mt-1 flex-shrink-0">
                        <Bot size={15} />
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-5 py-4">
                        <MarkdownContent content={msg.content} />
                      </div>
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="max-w-xl bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-4 text-sm font-medium leading-relaxed shadow-lg">
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
              <div className="w-14 h-14 mx-auto mb-4">
                <BrandLogo size="md" />
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