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
  "Designing Your Core Intelligence",
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

// ─── Original city profile — identical to IntelligenceEngineLoader ────────────
const CITY_COLUMNS = [
  {w: 10, h: 0}, {w: 30, h: 40}, {w: 20, h: 80}, {w: 30, h: 40}, {w: 15, h: 0},
  {w: 20, h: 70}, {w: 5, h: 120}, {w: 20, h: 70}, {w: 15, h: 0},
  {w: 60, h: 30}, {w: 15, h: 0},
  {w: 25, h: 90}, {w: 30, h: 110}, {w: 25, h: 90}, {w: 15, h: 0},
  {w: 30, h: 60}, {w: 15, h: 80}, {w: 30, h: 60}, {w: 15, h: 0},
  {w: 40, h: 40}, {w: 15, h: 0},
  {w: 20, h: 90}, {w: 5, h: 140}, {w: 20, h: 90}, {w: 15, h: 0},
  {w: 30, h: 65}, {w: 15, h: 0},
  {w: 15, h: 50}, {w: 20, h: 80}, {w: 15, h: 50}, {w: 15, h: 0},
  {w: 35, h: 100}, {w: 10, h: 120}, {w: 35, h: 100}, {w: 15, h: 0},
  {w: 40, h: 55}, {w: 15, h: 0},
  {w: 25, h: 70}, {w: 25, h: 100}, {w: 25, h: 70}, {w: 15, h: 0},
  {w: 30, h: 30}, {w: 20, h: 0},
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BlueprintLoader({ businessName = 'Your Business' }) {
  const [seqIndex, setSeqIndex]     = useState(0);
  const [visible, setVisible]       = useState(true);
  const [scanX, setScanX]           = useState(0);
  const [stagesDone, setStagesDone] = useState(0);

  const item     = SEQUENCE[seqIndex % SEQUENCE.length];
  const progress = Math.min((stagesDone / TOTAL_STAGES) * 100, 98);

  // ── Compute the original skyline path + windows (same algorithm as IntelligenceEngineLoader)
  const { pathD, totalLength, totalWidth, windows } = useMemo(() => {
    let d    = 'M 0 150 ';
    let curX = 0;
    let curY = 150;
    let length = 0;
    const windowsArr = [];

    CITY_COLUMNS.forEach(col => {
      const targetY = 150 - col.h;
      if (targetY !== curY) {
        d += `L ${curX} ${targetY} `;
        length += Math.abs(curY - targetY);
        curY = targetY;
      }
      if (col.h > 15 && col.w > 15) {
        const numWindows = Math.floor((col.w * col.h) / 300);
        for (let i = 0; i < numWindows; i++) {
          const wx = curX + 3 + Math.random() * (col.w - 6);
          const wy = 150 - (3 + Math.random() * (col.h - 6));
          windowsArr.push({ id: Math.random(), x: wx, y: wy, delay: `${(Math.random() * 5).toFixed(2)}s`, dur: `${(1.8 + Math.random() * 3).toFixed(2)}s` });
        }
      }
      curX += col.w;
      length += col.w;
      d += `L ${curX} ${curY} `;
    });

    d += `L ${curX} 150 Z`;
    length += Math.abs(150 - curY) + curX;

    return { pathD: d, totalLength: length, totalWidth: curX, windows: windowsArr };
  }, []);

  // ── Advance through sequence with fade transitions
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

  // ── Continuous scanning beam (rAF-driven)
  useEffect(() => {
    let start = null;
    let raf;
    const PERIOD = 5500;
    const step = (ts) => {
      if (!start) start = ts;
      setScanX(((ts - start) % PERIOD) / PERIOD * totalWidth);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [totalWidth]);

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

      {/* ── Original city SVG (same as IntelligenceEngineLoader) ── */}
      <div style={{ width: '100%', maxWidth: '800px', zIndex: 10, marginBottom: '0.5rem' }}>
        <svg viewBox={`0 -20 ${totalWidth} 180`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="blScanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(96,165,250,0)" />
              <stop offset="40%"  stopColor="rgba(96,165,250,0.6)" />
              <stop offset="60%"  stopColor="rgba(96,165,250,0.6)" />
              <stop offset="100%" stopColor="rgba(96,165,250,0)" />
            </linearGradient>
            <style>{`
              @keyframes blWin {
                0%,100% { opacity:0.25; }
                50%     { opacity:0.9; }
              }
              .blw { animation: blWin ease-in-out infinite; }
            `}</style>
          </defs>

          {/* Ground line */}
          <line x1="0" y1="150" x2={totalWidth} y2="150" stroke="rgba(59,130,246,0.4)" strokeWidth="2" />

          {/* Skyline path — always fully filled (no trace animation in this context) */}
          <path
            d={pathD}
            fill="rgba(15,23,42,0.82)"
            stroke="rgba(96,165,250,0.85)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0px -4px 14px rgba(96,165,250,0.35))' }}
          />

          {/* Glowing windows */}
          {windows.map(win => (
            <rect
              key={win.id}
              x={win.x} y={win.y}
              width="3" height="3"
              fill="#60A5FA"
              className="blw"
              style={{
                animationDelay: win.delay,
                animationDuration: win.dur,
                filter: 'drop-shadow(0px 0px 3px rgba(96,165,250,0.8))',
              }}
            />
          ))}

          {/* Scanning beam */}
          <rect x={scanX - 2} y={0} width={4} height={155} fill="url(#blScanGrad)" style={{ opacity: 0.6 }} />
        </svg>
      </div>

      {/* ── Stage label OR Quote ── */}
      <div style={{
        transition: 'opacity 0.55s ease, transform 0.55s ease',
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-14px)',
        width: '100%',
        maxWidth: '560px',
        minHeight: '140px',
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
            <div style={{
              width: '34px', height: '3px',
              background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
              borderRadius: '2px', margin: '0 auto',
              boxShadow: '0 0 10px rgba(59,130,246,0.5)',
              animation: 'bpBar 1.4s ease-in-out infinite',
            }} />
          </div>

        ) : (

          // ── Quote — same size as stage label, author low-contrast ────────────
          <div style={{ width: '100%', position: 'relative' }}>
            {/* Subtle decorative quote mark */}
            <div style={{
              position: 'absolute',
              top: '-18px',
              left: '-2px',
              fontSize: '6rem',
              lineHeight: 1,
              color: 'rgba(59,130,246,0.08)',
              fontFamily: 'Georgia, "Times New Roman", serif',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              &ldquo;
            </div>

            {/* Quote text — same visual weight as stage labels */}
            <p style={{
              position: 'relative',
              color: 'rgba(226,232,240,0.92)',
              fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              &ldquo;{item.text}&rdquo;
            </p>

            {/* Attribution — low contrast, small, bottom right */}
            <div style={{ textAlign: 'right', paddingRight: '0.25rem' }}>
              <p style={{
                color: '#334155',       /* slate-700 — present but not loud */
                fontSize: '0.62rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                marginBottom: '0.1rem',
              }}>
                — {item.author}
              </p>
              <p style={{
                color: '#1e293b',       /* slate-800 — even more receded */
                fontSize: '0.55rem',
                letterSpacing: '0.02em',
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
