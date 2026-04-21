import React, { useState, useEffect, useMemo } from 'react';

// ─── Quotes: Black American Inventors, Theologians, Poets, Billionaires, Presidents ───
const QUOTES = [
  {
    text: "Let gratitude be the pillow upon which you kneel to say your nightly prayer.",
    author: "Maya Angelou",
    title: "Poet · Author · Presidential Medal of Freedom",
    category: "GRATITUDE",
  },
  {
    text: "Don't sit down and wait for the opportunities to come. Get up and make them.",
    author: "Madam C.J. Walker",
    title: "Inventor · America's First Female Self-Made Millionaire",
    category: "ACTION",
  },
  {
    text: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
    title: "Theologian · Civil Rights Leader",
    category: "VISION",
  },
  {
    text: "Excellence is to do a common thing in an uncommon way.",
    author: "Booker T. Washington",
    title: "Educator · Author · Founder, Tuskegee University",
    category: "EXCELLENCE",
  },
  {
    text: "We create our future by well improving present opportunities.",
    author: "Lewis Howard Latimer",
    title: "Inventor · Carbon Filament Lamp · 50+ Patents",
    category: "INNOVATION",
  },
  {
    text: "Like what you do, and then you will do your best.",
    author: "Katherine Johnson",
    title: "NASA Mathematician · Presidential Medal of Freedom",
    category: "MASTERY",
  },
  {
    text: "If there is no struggle, there is no progress.",
    author: "Frederick Douglass",
    title: "Abolitionist · Statesman · Author",
    category: "PROGRESS",
  },
  {
    text: "The biggest adventure you can take is to live the life of your dreams.",
    author: "Oprah Winfrey",
    title: "Media Executive · Billionaire · Philanthropist",
    category: "AMBITION",
  },
  {
    text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.",
    author: "James Baldwin",
    title: "Author · Playwright · Activist",
    category: "COURAGE",
  },
  {
    text: "If they don't give you a seat at the table, bring a folding chair.",
    author: "Shirley Chisholm",
    title: "First Black U.S. Congresswoman · Presidential Candidate",
    category: "LEADERSHIP",
  },
  {
    text: "Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.",
    author: "Langston Hughes",
    title: "Poet · Author · Harlem Renaissance",
    category: "DREAMS",
  },
  {
    text: "Change will not come if we wait for some other person or some other time. We are the ones we've been waiting for.",
    author: "Barack Obama",
    title: "44th President of the United States",
    category: "LEADERSHIP",
  },
];

// ─── What's happening at each synthesis phase ───
const STAGE_LABELS = [
  "Analyzing Your Business DNA",
  "Mapping AI Opportunity Zones",
  "Designing Your Core Intelligence",      // was: "Designing Your Named Systems"
  "Calibrating Brand Intelligence",
  "Engineering Automation Workflows",
  "Drafting Your 90-Day Roadmap",
  "Generating Implementation Playbook",
  "Assembling Your Complete Blueprint",
  "Final Synthesis & Quality Review",
];

// Every stage is followed by a quote — true alternation
function buildSequence() {
  const seq = [];
  for (let i = 0; i < STAGE_LABELS.length; i++) {
    seq.push({ type: 'stage', label: STAGE_LABELS[i], duration: 4200 });
    seq.push({ type: 'quote', duration: 7000, ...QUOTES[i % QUOTES.length] });
  }
  return seq;
}
const SEQUENCE = buildSequence();
const TOTAL_STAGES = STAGE_LABELS.length;

// ─── Building layout ──────────────────────────────────────────────────────────
const BUILDINGS = [
  { x: 0,   w: 30,  h: 55  },
  { x: 38,  w: 20,  h: 85  },
  { x: 66,  w: 45,  h: 105 },
  { x: 119, w: 18,  h: 45  },
  { x: 145, w: 52,  h: 128 },
  { x: 205, w: 28,  h: 78  },
  { x: 241, w: 38,  h: 148 }, // central tower
  { x: 287, w: 24,  h: 92  },
  { x: 319, w: 48,  h: 112 },
  { x: 375, w: 28,  h: 65  },
  { x: 411, w: 50,  h: 88  },
  { x: 469, w: 22,  h: 72  },
  { x: 499, w: 38,  h: 58  },
  { x: 545, w: 25,  h: 42  },
];
const SVG_W  = 575;
const GROUND = 155;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BlueprintLoader({ businessName = 'Your Business' }) {
  const [seqIndex, setSeqIndex]       = useState(0);
  const [visible, setVisible]         = useState(true);
  const [scanX, setScanX]             = useState(0);
  const [stagesDone, setStagesDone]   = useState(0);

  const item      = SEQUENCE[seqIndex % SEQUENCE.length];
  const progress  = Math.min((stagesDone / TOTAL_STAGES) * 100, 98);

  // Advance through sequence with fade transitions
  useEffect(() => {
    const FADE = 550;
    const t1 = setTimeout(() => setVisible(false), item.duration - FADE);
    const t2 = setTimeout(() => {
      if (item.type === 'stage') setStagesDone(n => Math.min(n + 1, TOTAL_STAGES));
      setSeqIndex(i => i + 1);
      setVisible(true);
    }, item.duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [seqIndex, item.duration, item.type]);

  // Continuous scanning beam (rAF-driven)
  useEffect(() => {
    let start = null;
    let raf;
    const PERIOD = 5500;
    const step = (ts) => {
      if (!start) start = ts;
      setScanX(((ts - start) % PERIOD) / PERIOD * SVG_W);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Window dots — generated once on mount
  const windows = useMemo(() => {
    const arr = [];
    BUILDINGS.forEach(b => {
      const cols = Math.max(1, Math.floor((b.w - 8) / 10));
      const rows = Math.max(1, Math.floor((b.h - 8) / 18));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.28) {
            arr.push({
              id:    `${b.x}-${r}-${c}`,
              x:     b.x + 5 + c * 10,
              y:     GROUND - b.h + 7 + r * 18,
              delay: `${(Math.random() * 5).toFixed(2)}s`,
              dur:   `${(1.8 + Math.random() * 3.5).toFixed(2)}s`,
            });
          }
        }
      }
    });
    return arr;
  }, []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#030712',
      minHeight: '100vh',
      padding: '2rem 2rem 5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Ambient glow ── */}
      <div style={{
        position: 'absolute',
        top: '28%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '700px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Headline ── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', zIndex: 10 }}>
        <p style={{
          fontSize: '9px', fontWeight: 800, letterSpacing: '0.32em',
          color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.4rem',
        }}>
          Blueprint Generation
        </p>
        <h2 style={{
          color: 'white',
          fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Building {businessName}
        </h2>
      </div>

      {/* ── City SVG ── */}
      <div style={{ width: '100%', maxWidth: '660px', zIndex: 10, marginBottom: '0.5rem' }}>
        <svg viewBox={`0 -10 ${SVG_W} 165`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="bpBldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(30,58,138,0.85)" />
              <stop offset="100%" stopColor="rgba(7,15,36,0.98)" />
            </linearGradient>
            <linearGradient id="bpScanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(96,165,250,0)" />
              <stop offset="35%"  stopColor="rgba(96,165,250,0.5)" />
              <stop offset="65%"  stopColor="rgba(96,165,250,0.5)" />
              <stop offset="100%" stopColor="rgba(96,165,250,0)" />
            </linearGradient>
            <style>{`
              @keyframes bpWin {
                0%,100% { opacity:0.22; }
                50%     { opacity:0.95; }
              }
              .bpw { animation: bpWin ease-in-out infinite; }
              @keyframes bpBar {
                0%,100% { opacity:0.35; transform:scaleX(0.4); }
                50%     { opacity:1;    transform:scaleX(1);   }
              }
              .bpbar { animation: bpBar 1.4s ease-in-out infinite; transform-origin: center; }
            `}</style>
          </defs>

          {/* Ground line */}
          <line x1="0" y1={GROUND} x2={SVG_W} y2={GROUND} stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />

          {/* Buildings */}
          {BUILDINGS.map((b, i) => (
            <rect key={i} x={b.x} y={GROUND - b.h} width={b.w} height={b.h}
              fill="url(#bpBldGrad)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" rx="1" />
          ))}

          {/* Windows */}
          {windows.map(w => (
            <rect key={w.id} x={w.x} y={w.y} width="4" height="4" fill="#60a5fa" rx="0.5"
              className="bpw"
              style={{ animationDelay: w.delay, animationDuration: w.dur, filter: 'drop-shadow(0 0 3px rgba(96,165,250,0.9))' }}
            />
          ))}

          {/* Scanning beam */}
          <rect x={scanX - 3} y={0} width={6} height={GROUND} fill="url(#bpScanGrad)" style={{ opacity: 0.5 }} />
        </svg>
      </div>

      {/* ── Stage label OR Quote ── */}
      <div style={{
        transition: 'opacity 0.55s ease, transform 0.55s ease',
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-14px)',
        width: '100%',
        maxWidth: '620px',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        padding: '0 0.5rem',
      }}>

        {item.type === 'stage' ? (

          // ── Stage label ──────────────────────────────────────────────────────
          <div style={{ textAlign: 'center', width: '100%' }}>
            {/* Progress pills */}
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '1.4rem' }}>
              {STAGE_LABELS.map((_, i) => (
                <div key={i} style={{
                  width:      i < stagesDone ? '20px' : '6px',
                  height:     '6px',
                  borderRadius: '3px',
                  background: i < stagesDone ? '#3b82f6' : 'rgba(71,85,105,0.45)',
                  transition: 'all 0.5s ease',
                  boxShadow:  i < stagesDone ? '0 0 6px rgba(59,130,246,0.55)' : 'none',
                }} />
              ))}
            </div>
            <p style={{
              color: '#e2e8f0',
              fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              {item.label}...
            </p>
            <div className="bpbar" style={{
              width: '34px', height: '3px',
              background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
              borderRadius: '2px', margin: '0 auto',
              boxShadow: '0 0 10px rgba(59,130,246,0.5)',
            }} />
          </div>

        ) : (

          // ── Quote — editorial/book style ─────────────────────────────────────
          <div style={{ width: '100%', position: 'relative' }}>
            {/* Decorative large quotation mark */}
            <div style={{
              position: 'absolute',
              top: '-24px',
              left: '-4px',
              fontSize: '9rem',
              lineHeight: 1,
              color: 'rgba(59,130,246,0.1)',
              fontFamily: 'Georgia, "Times New Roman", serif',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              &ldquo;
            </div>

            {/* PROMINENT quote text */}
            <p style={{
              position: 'relative',
              color: 'rgba(255,255,255,0.95)',
              fontSize: 'clamp(1.15rem, 3vw, 1.65rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.6,
              letterSpacing: '-0.015em',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}>
              &ldquo;{item.text}&rdquo;
            </p>

            {/* Attribution — small, bottom right, book-style */}
            <div style={{ textAlign: 'right', paddingRight: '0.25rem' }}>
              <p style={{
                color: '#60a5fa',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: '0.15rem',
              }}>
                — {item.author}
              </p>
              <p style={{
                color: '#334155',
                fontSize: '0.62rem',
                letterSpacing: '0.03em',
              }}>
                {item.title}
              </p>
            </div>
          </div>

        )}
      </div>

      {/* ── Progress bar ── */}
      <div style={{
        position: 'absolute',
        bottom: '3.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '180px',
        zIndex: 10,
      }}>
        <div style={{
          width: '100%', height: '2px',
          background: 'rgba(71,85,105,0.25)',
          borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
            borderRadius: '2px',
            transition: 'width 4s ease',
            boxShadow: '0 0 8px rgba(96,165,250,0.45)',
          }} />
        </div>
      </div>

      {/* ── Footer ── */}
      <p style={{
        position: 'absolute', bottom: '1.75rem',
        color: '#1e293b', fontSize: '9px',
        letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
        zIndex: 10,
      }}>
        Intelligence Engine Active — Do Not Close Window
      </p>
    </div>
  );
}
