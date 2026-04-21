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
    text: "I got my start by giving myself a start.",
    author: "Madam C.J. Walker",
    title: "Inventor · America's First Female Self-Made Millionaire",
    category: "ENTREPRENEURSHIP",
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
    title: "Educator · Author · Founder of Tuskegee University",
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
    title: "NASA Mathematician · Hidden Figure · Presidential Medal of Freedom",
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
    text: "Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.",
    author: "Langston Hughes",
    title: "Poet · Author · Harlem Renaissance",
    category: "DREAMS",
  },
  {
    text: "Change will not come if we wait for some other person or some other time. We are the ones we've been waiting for.",
    author: "Barack Obama",
    title: "44th President of the United States",
    category: "ACTION",
  },
];

// ─── What's happening at each synthesis phase ───
const STAGE_LABELS = [
  "Analyzing Your Business DNA",
  "Mapping AI Opportunity Zones",
  "Designing Your Named Systems",
  "Calibrating Brand Intelligence",
  "Engineering Automation Workflows",
  "Drafting Your 90-Day Roadmap",
  "Generating Implementation Playbook",
  "Assembling Your Complete Blueprint",
  "Final Synthesis & Quality Review",
];

// Interleaved: stage, stage, quote, stage, stage, quote...
function buildSequence() {
  const seq = [];
  let qi = 0;
  for (let i = 0; i < STAGE_LABELS.length; i++) {
    seq.push({ type: 'stage', label: STAGE_LABELS[i], duration: 4200 });
    if ((i + 1) % 2 === 0 && qi < QUOTES.length) {
      seq.push({ type: 'quote', duration: 7000, ...QUOTES[qi++] });
    }
  }
  return seq;
}
const SEQUENCE = buildSequence();
const TOTAL_STAGES = STAGE_LABELS.length;

// ─── Building layout ──────────────────────────────────────────────────────────
const BUILDINGS = [
  { x: 0,   w: 30, h: 55  },
  { x: 38,  w: 20, h: 85  },
  { x: 66,  w: 45, h: 105 },
  { x: 119, w: 18, h: 45  },
  { x: 145, w: 52, h: 128 },
  { x: 205, w: 28, h: 78  },
  { x: 241, w: 38, h: 148 }, // central tower
  { x: 287, w: 24, h: 92  },
  { x: 319, w: 48, h: 112 },
  { x: 375, w: 28, h: 65  },
  { x: 411, w: 50, h: 88  },
  { x: 469, w: 22, h: 72  },
  { x: 499, w: 38, h: 58  },
  { x: 545, w: 25, h: 42  },
];
const SVG_W   = 575;
const SVG_H   = 200;
const GROUND  = 155;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BlueprintLoader({ businessName = 'Your Business' }) {
  const [seqIndex, setSeqIndex]   = useState(0);
  const [visible, setVisible]     = useState(true);
  const [scanX, setScanX]         = useState(0);
  const [stagesDone, setStagesDone] = useState(0);

  const item = SEQUENCE[seqIndex % SEQUENCE.length];
  const progress = Math.min((stagesDone / TOTAL_STAGES) * 100, 98);

  // Advance through the sequence with fade transitions
  useEffect(() => {
    const FADE = 550;
    const t1 = setTimeout(() => setVisible(false), item.duration - FADE);
    const t2 = setTimeout(() => {
      if (item.type === 'stage') {
        setStagesDone(n => Math.min(n + 1, TOTAL_STAGES));
      }
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
              id: `${b.x}-${r}-${c}`,
              x: b.x + 5 + c * 10,
              y: GROUND - b.h + 7 + r * 18,
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
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Ambient background glow ── */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '700px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Headline ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', zIndex: 10 }}>
        <p style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.3em',
          color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.5rem',
        }}>
          Blueprint Generation
        </p>
        <h2 style={{
          color: 'white',
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Building {businessName}
        </h2>
      </div>

      {/* ── City SVG ── */}
      <div style={{ width: '100%', maxWidth: '680px', zIndex: 10, marginBottom: '0.5rem' }}>
        <svg viewBox={`0 -10 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="bpBldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(30,58,138,0.85)" />
              <stop offset="100%" stopColor="rgba(7,15,36,0.98)" />
            </linearGradient>
            <linearGradient id="bpScanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(96,165,250,0)" />
              <stop offset="35%"  stopColor="rgba(96,165,250,0.55)" />
              <stop offset="65%"  stopColor="rgba(96,165,250,0.55)" />
              <stop offset="100%" stopColor="rgba(96,165,250,0)" />
            </linearGradient>
            <style>{`
              @keyframes bpWin {
                0%,100% { opacity:0.25; }
                50%      { opacity:0.95; }
              }
              .bpw { animation: bpWin ease-in-out infinite; }
              @keyframes bpPulse {
                0%,100% { opacity:0.35; transform:scaleX(0.4); }
                50%     { opacity:1;    transform:scaleX(1); }
              }
              .bpbar { animation: bpPulse 1.4s ease-in-out infinite; transform-origin: center; }
            `}</style>
          </defs>

          {/* Ground */}
          <line x1="0" y1={GROUND} x2={SVG_W} y2={GROUND} stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" />

          {/* Buildings */}
          {BUILDINGS.map((b, i) => (
            <rect key={i} x={b.x} y={GROUND - b.h} width={b.w} height={b.h}
              fill="url(#bpBldGrad)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5" rx="1" />
          ))}

          {/* Windows */}
          {windows.map(w => (
            <rect key={w.id} x={w.x} y={w.y} width="4" height="4"
              fill="#60a5fa" rx="0.5"
              className="bpw"
              style={{
                animationDelay: w.delay,
                animationDuration: w.dur,
                filter: 'drop-shadow(0 0 3px rgba(96,165,250,0.9))',
              }}
            />
          ))}

          {/* Scanning beam */}
          <rect x={scanX - 3} y={0} width={6} height={GROUND} fill="url(#bpScanGrad)" style={{ opacity: 0.55 }} />
        </svg>
      </div>

      {/* ── Stage label OR Quote ── */}
      <div style={{
        transition: 'opacity 0.55s ease, transform 0.55s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        width: '100%',
        maxWidth: '600px',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: item.type === 'stage' ? 'center' : 'flex-start',
        justifyContent: 'center',
        zIndex: 10,
        padding: '0 1rem',
      }}>

        {item.type === 'stage' ? (
          <div style={{ textAlign: 'center' }}>
            {/* Stage indicator dots */}
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '1.25rem' }}>
              {STAGE_LABELS.map((_, i) => (
                <div key={i} style={{
                  width: i < stagesDone ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i < stagesDone ? '#3b82f6' : 'rgba(71,85,105,0.5)',
                  transition: 'all 0.5s ease',
                  boxShadow: i < stagesDone ? '0 0 6px rgba(59,130,246,0.6)' : 'none',
                }} />
              ))}
            </div>
            <p style={{
              color: '#e2e8f0',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              {item.label}...
            </p>
            <div className="bpbar" style={{
              width: '36px',
              height: '3px',
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              borderRadius: '2px',
              margin: '0 auto',
              boxShadow: '0 0 10px rgba(59,130,246,0.5)',
            }} />
          </div>
        ) : (
          // ── Quote panel ──
          <div style={{
            borderLeft: '3px solid rgba(251,191,36,0.65)',
            paddingLeft: '1.75rem',
            width: '100%',
          }}>
            <p style={{
              fontSize: '9px',
              fontWeight: 800,
              letterSpacing: '0.35em',
              color: 'rgba(251,191,36,0.75)',
              textTransform: 'uppercase',
              marginBottom: '0.9rem',
            }}>
              {item.category}
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.65,
              marginBottom: '1.1rem',
              letterSpacing: '-0.01em',
            }}>
              &ldquo;{item.text}&rdquo;
            </p>
            <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
              — {item.author}
            </p>
            <p style={{ color: '#475569', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              {item.title}
            </p>
          </div>
        )}
      </div>

      {/* ── Progress bar ── */}
      <div style={{
        position: 'absolute',
        bottom: '3.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        zIndex: 10,
      }}>
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(71,85,105,0.3)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
            borderRadius: '2px',
            transition: 'width 4s ease',
            boxShadow: '0 0 8px rgba(96,165,250,0.5)',
          }} />
        </div>
      </div>

      {/* ── Footer status ── */}
      <p style={{
        position: 'absolute',
        bottom: '2rem',
        color: '#334155',
        fontSize: '10px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        fontWeight: 700,
        zIndex: 10,
      }}>
        Intelligence Engine Active — Do Not Close Window
      </p>
    </div>
  );
}
