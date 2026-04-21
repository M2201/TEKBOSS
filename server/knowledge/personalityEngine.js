/**
 * PERSONALITY ENGINE — DISC Inference
 * 
 * Silently infers the user's DISC profile from coaching conversation patterns.
 * Used ONLY to adapt coaching style — never surfaced to the user.
 *
 * Design principles:
 *   - Probe questions feel like natural coaching curiosity, not an assessment
 *   - Inference is probabilistic — soft signals, not definitive labels
 *   - Style adjustments are subtle — tone and pacing shifts, not personality lectures
 *   - Profile finalises after ~10 interactions; coach style locks in from there
 */

// ─── Signal vocabulary per DISC dimension ────────────────────────────────────
const DISC_KEYWORDS = {
  D: [
    'fast','quick','now','asap','result','results','win','goal','revenue','direct',
    'bottom line','roi','decide','decision','action','move','drive','push','control',
    'done','deadline','target','cut','skip','lead','output','execute','done',
    'straight','blunt','just do','get it done','makes sense','let\'s go',
  ],
  I: [
    'team','people','together','excited','love','feel','feeling','share','community',
    'connect','brand','creative','vision','everyone','culture','inspire','energy',
    'fun','relationship','partner','collaborate','engage','momentum','story','vibe',
    'excited','awesome','amazing','love this','big picture','possibilities',
  ],
  S: [
    'careful','step','steady','slow','stable','consistent','plan','process','wait',
    'buy-in','secure','safe','systematic','support','worried','concerned','risk',
    'team needs','how will they','not sure','i think','maybe','probably','kind of',
    'sort of','i guess','eventually','gradually','comfortable','trust',
  ],
  C: [
    'data','analytics','accurate','report','measure','detail','research','proven',
    'track','understand','specific','exactly','evidence','compare','analyze','correct',
    'precise','document','how does','why does','what if','benchmark','metric',
    'specifically','technically','logic','reason','validate','confirm','double-check',
  ],
};

/**
 * Score a single user message for DISC signals.
 * Returns delta {D, I, S, C} to add to the accumulator.
 */
export function scoreMessage(message) {
  if (!message || typeof message !== 'string') return { D: 0, I: 0, S: 0, C: 0 };

  const lower = message.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;
  const scores = { D: 0, I: 0, S: 0, C: 0 };

  // Keyword matching
  for (const [dim, keywords] of Object.entries(DISC_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[dim] += 1;
    }
  }

  // Response length signals
  if (wordCount < 20) scores.D += 1.5;          // Very direct/brief → D
  if (wordCount > 90) scores.C += 1.5;           // Very detailed → C

  // Punctuation/style signals
  if (/!/.test(message)) scores.I += 1;           // Exclamation → I
  if (/\b(i think|maybe|kind of|sort of|not sure|i guess|possibly)\b/.test(lower)) scores.S += 1;
  if (/\b(specifically|exactly|precisely|to be specific)\b/.test(lower)) scores.C += 1;
  if (/\b(just|simply|bottom line|straight up|look|okay so)\b/.test(lower)) scores.D += 0.5;

  return scores;
}

/**
 * Build a normalised DISC profile from an accumulated signal object.
 */
export function buildProfile(accumulated, interactionsAnalyzed = 0) {
  const total = Object.values(accumulated).reduce((s, v) => s + v, 0) || 1;
  const norm = {};
  for (const [k, v] of Object.entries(accumulated)) {
    norm[k] = Math.round((v / total) * 100) / 100;
  }

  const ranked = Object.entries(norm).sort((a, b) => b[1] - a[1]);
  return {
    disc: norm,
    primary: ranked[0][0],
    secondary: ranked[1][0],
    interactionsAnalyzed,
    finalized: interactionsAnalyzed >= 10,
  };
}

// ─── Probe questions ──────────────────────────────────────────────────────────
// Injected naturally at specific interaction counts.
// Each feels like genuine coaching curiosity — not an assessment.
const PROBES = [
  {
    turn: 3,
    instruction: `Somewhere in your response, weave in this coaching question naturally: "Quick question while we work through this — when you're deciding if something new is actually worth doing, what matters most to you: does it need to show results fast, will your team actually use it, is there solid proof it works, or does the process just need to feel right?" Don't introduce it as a question — fold it into the flow of coaching conversation.`,
  },
  {
    turn: 6,
    instruction: `Weave this into your response naturally, as coaching curiosity: "One thing I want to understand — when a project stalls on you, what's your first instinct: make the call and push forward, bring more people in to figure it out together, gather more information before deciding, or step back and rethink the whole approach?" Fold it smoothly into the coaching — don't announce it as a question.`,
  },
  {
    turn: 9,
    instruction: `Near the end of your response, include this naturally: "What would make today's session genuinely useful for you — walking away with one clear action, feeling real momentum on the right direction, having a solid plan mapped out, or understanding how all the pieces fit together?" Keep it conversational, not clinical.`,
  },
];

/**
 * Return the probe injection instruction for a given interaction turn, if any.
 */
export function getProbeInstruction(turn) {
  const probe = PROBES.find(p => p.turn === turn);
  return probe ? probe.instruction : null;
}

// ─── Coaching style instructions ──────────────────────────────────────────────
const STYLE_INSTRUCTIONS = {
  D: `INFERRED COACHING STYLE — RESULTS-DRIVEN (DO NOT MENTION THIS TO THE USER):
This user shows high-D patterns: direct, results-oriented, impatient with excess context.
- Lead every response with the ONE action to take — context comes after, if at all
- Keep responses tight — long explanations will cause disengagement
- Frame everything as outcome + speed: "This takes 2 hours and gets you X"
- Skip reassurance and warm-up — get to the point immediately
- One concrete next step per response maximum
- Use numbers and outcomes, not process descriptions`,

  I: `INFERRED COACHING STYLE — MOMENTUM & PEOPLE-FIRST (DO NOT MENTION THIS TO THE USER):
This user shows high-I patterns: enthusiastic, team-focused, motivated by vision and connection.
- Acknowledge progress and wins before moving to the next step
- Connect every recommendation to team or client impact ("your team will feel this")
- Use positive, forward-looking framing — they need to feel momentum
- Slightly warmer tone is appropriate, but stay action-focused
- Name visible milestones so they feel the journey, not just the destination
- Avoid cold, clinical language — keep it human`,

  S: `INFERRED COACHING STYLE — STEADY & SYSTEMATIC (DO NOT MENTION THIS TO THE USER):
This user shows high-S patterns: methodical, team-conscious, cautious about change.
- Break every recommendation into clear numbered steps — no ambiguity
- Validate each step before advancing: "Once that's solid, then we..."
- Emphasise stability, reliability, and low-disruption
- Avoid overwhelming with options — give one clear recommendation per response
- Acknowledge any risk or concern before offering the path forward
- They need to trust before they move — earn it step by step`,

  C: `INFERRED COACHING STYLE — ANALYTICAL & EVIDENCE-BASED (DO NOT MENTION THIS TO THE USER):
This user shows high-C patterns: detail-oriented, logical, data-driven, needs the "why".
- Explain the rationale behind every recommendation
- Include evidence, success rates, or logical reasoning where possible
- Acknowledge complexity — they distrust oversimplification
- Offer comparisons when there are multiple options ("Option A does X, B does Y")
- They will independently research what you suggest — give them the right search terms
- Precision matters: vague advice will reduce trust`,
};

/**
 * Build the coaching style instruction block for the system prompt.
 * Returns empty string if profile isn't ready yet.
 */
export function getCoachingStyleInstruction(profile) {
  if (!profile?.primary || (profile.interactionsAnalyzed || 0) < 3) return '';

  const primaryStyle = STYLE_INSTRUCTIONS[profile.primary] || '';
  const secondaryNote = profile.secondary && profile.secondary !== profile.primary
    ? `\nSecondary tendency detected: ${profile.secondary}. When the user seems disengaged, subtly blend in one element of the ${profile.secondary} coaching style to re-engage them.`
    : '';

  return `\n\n---\n${primaryStyle}${secondaryNote}\n---\n`;
}
