/**
 * PreviewReport.jsx
 * Full redesign of Stage 3 — replaces markdown box with visual intelligence cards.
 * Driven by the structured JSON from the preview AI agent.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, ArrowRight, Download, Copy, ExternalLink,
  Lock, Zap, TrendingUp, BarChart3, RefreshCw, Star, ShieldOff
} from 'lucide-react';

// ─── Tier config ─────────────────────────────────────────────────────────────
const TIER = {
  green: { bar: '#10B981', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Well-Positioned', glow: 'shadow-emerald-900/20' },
  amber: { bar: '#F59E0B', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Growth Opportunity', glow: 'shadow-amber-900/20' },
  red:   { bar: '#F97316', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', label: 'Priority Unlock', glow: 'shadow-orange-900/20' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatHero({ stat, brandAccent }) {
  const accent = brandAccent || '#60A5FA';
  return (
    <div
      className="rounded-[2rem] p-10 mb-8 text-center relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}18 0%, #0A0F1E 70%)`, border: `1px solid ${accent}30` }}
    >
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-4" style={{ color: accent }}>
        Intelligence Engine Finding
      </p>
      <div
        className="text-6xl md:text-8xl font-black mb-3 leading-none"
        style={{ color: '#FFFFFF', textShadow: `0 0 60px ${accent}60` }}
      >
        {stat?.value || '—'}
      </div>
      <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto">
        {stat?.context || 'identified in recoverable time'}
      </p>
    </div>
  );
}

function BrandColorBar({ colorPalette }) {
  if (!colorPalette?.length) return null;
  return (
    <div className="mb-8 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="flex">
        {colorPalette.slice(0, 5).map((c, i) => {
          const hex = /^#[0-9A-Fa-f]{6}$/.test(c.hex || '') ? c.hex : '#1B2B4B';
          return (
            <div key={i} className="flex-1 group relative" style={{ height: 56, background: hex }}>
              <div className="absolute inset-0 flex items-end justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-bold text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                  {c.name || hex}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2 bg-slate-900/80">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Brand Color Profile — Extracted from your business identity</p>
      </div>
    </div>
  );
}

function BusinessSnapshot({ text, businessName }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 mb-8">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3">Business Intelligence Assessment</p>
      <p className="text-white text-base leading-relaxed font-medium">{text}</p>
    </div>
  );
}

function HealthScoreGrid({ scores }) {
  if (!scores?.length) return null;
  return (
    <div className="mb-8">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 text-center">Business Health Assessment</p>
      <div className="grid grid-cols-2 gap-4">
        {scores.map((item, i) => {
          const t = TIER[item.tier] || TIER.amber;
          return (
            <div key={i} className={`bg-slate-900/80 border border-slate-800 rounded-[1.5rem] p-5 shadow-xl ${t.glow}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-white uppercase tracking-tight">{item.category}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${t.badge}`}>
                  {t.label}
                </span>
              </div>
              {/* Score bar */}
              <div className="h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${item.score}%`, background: t.bar, boxShadow: `0 0 8px ${t.bar}80` }}
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black" style={{ color: t.bar }}>{item.score}%</span>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">of potential optimized</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{item.insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WhatsWorkingList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="mb-8">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">What's Already Working</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl px-5 py-4">
            <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 text-sm font-medium leading-snug">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConstraintsList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="mb-8">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Growth Unlocks Identified</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl px-5 py-4">
            <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 text-sm font-medium leading-snug">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NamedSystemsTeaser({ systems, brandAccent }) {
  const accent = brandAccent || '#1E6FE5';
  const [flippedCards, setFlippedCards] = useState(new Set());

  const toggleFlip = (i) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const scrollToPricing = (e) => {
    e?.stopPropagation();
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!systems?.length) return null;
  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
          Your Operating Systems — Engineered by AI
        </p>
      </div>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        The AI has identified {systems.length} custom-built systems for your business.
        Tap a card to preview what’s inside &mdash; full architecture and playbooks unlock when you move forward.
      </p>

      {/* Flippable locked cards */}
      <div className="space-y-3">
        {systems.map((sys, i) => {
          const isFlipped = flippedCards.has(i);
          return (
            <div
              key={i}
              style={{ perspective: '1000px', cursor: 'pointer' }}
              onClick={() => toggleFlip(i)}
            >
              <div
                style={{
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '148px',
                }}
              >
                {/* ── FRONT ── */}
                <div
                  style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 overflow-hidden transition-colors"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" style={{ background: accent }} />
                  <div className="flex items-start justify-between gap-4 pl-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-sm tracking-tight mb-1">{sys.name}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{sys.hook}</p>
                      <p className="text-slate-600 text-[10px] mt-2.5 font-bold uppercase tracking-wider">Tap to preview &rarr;</p>
                    </div>
                    {/* UNLOCK badge — scrolls to pricing */}
                    <div
                      className="shrink-0 flex flex-col items-center gap-1"
                      onClick={scrollToPricing}
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/20 transition-colors ring-1 ring-amber-500/10">
                        <Lock size={14} className="text-amber-400" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-200 transition-colors">Unlock</span>
                    </div>
                  </div>
                  {/* Ghost lines */}
                  <div className="mt-3 pl-3 space-y-1.5 select-none pointer-events-none">
                    <div className="h-2 rounded-full bg-slate-800/70 w-4/5" />
                    <div className="h-2 rounded-full bg-slate-800/40 w-3/5" />
                  </div>
                </div>

                {/* ── BACK ── */}
                <div
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
                  className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-5 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-blue-500" />
                  <div className="pl-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3">What’s Inside</p>
                    <div className="space-y-1.5 mb-4">
                      {[
                        'Custom tool stack & integrations',
                        'Step-by-step automation workflow',
                        'Prompt templates with your brand voice',
                        '90-day build & launch timeline',
                      ].map((item, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                          <span className="text-slate-300 text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={scrollToPricing}
                      className="w-full text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-slate-900 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      Unlock Now <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom unlock prompt — clickable */}
      <div
        className="mt-4 flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-500/10 transition-colors"
        onClick={scrollToPricing}
      >
        <Lock size={13} className="text-amber-400 shrink-0" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          <span className="font-bold text-amber-300">These systems are yours</span> — the tools, the automation logic, and the 90-day build order unlock the moment you move forward.
        </p>
      </div>
    </div>
  );
}

function NoAiZones({ items }) {
  if (!items?.length) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShieldOff size={13} className="text-rose-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Where Human Judgment Is Non-Negotiable</p>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="relative bg-slate-900/80 border border-rose-500/20 rounded-2xl px-5 py-4 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500/60 rounded-l-2xl" />
            <div className="pl-3">
              <p className="text-white text-sm font-black tracking-tight mb-1">{item.area}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighestLeverageCard({ text, brandAccent }) {
  const accent = brandAccent || '#F59E0B';
  return (
    <div
      className="rounded-[2rem] p-8 mb-8 relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}12 0%, #0A0F1E 70%)`, border: `1px solid ${accent}25` }}
    >
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }} />
      <div className="flex items-center gap-2 mb-4">
        <Star size={14} style={{ color: accent }} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>Your Highest-Leverage Move Right Now</p>
      </div>
      <p className="text-white font-bold text-base leading-relaxed">{text}</p>
    </div>
  );
}

function ExecutionGapCard({ text }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-[2rem] p-8 mb-8 text-center">
      <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-500/20">
        <TrendingUp size={24} />
      </div>
      <h3 className="text-xl font-black text-white mb-4 tracking-tighter uppercase">The Execution Gap</h3>
      <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
        {text || 'ChatGPT, Claude, and Gemini can answer individual questions — but assembling those answers into a connected, executable business system takes dozens of hours of iteration and decision-making.'}
      </p>
      <p className="text-blue-400 font-black text-base tracking-tight mt-4">The gap is not effort — it's system design.</p>
    </div>
  );
}

function DriveDeliveryCard({ driveLink, driveLoading }) {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    if (!driveLink) return;
    navigator.clipboard.writeText(driveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-6 py-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          {driveLoading ? (
            <RefreshCw size={15} className="text-emerald-400 animate-spin" />
          ) : (
            <CheckCircle size={15} className="text-emerald-400" />
          )}
        </div>
        <div>
          <p className="text-emerald-400 text-xs font-black uppercase tracking-wider">
            {driveLoading ? 'Saving to Google Drive…' : 'Saved to Google Drive'}
          </p>
          {driveLink && (
            <a href={driveLink} target="_blank" rel="noopener noreferrer"
              className="text-slate-400 text-xs hover:text-white transition-colors truncate max-w-xs block">
              {driveLink}
            </a>
          )}
          {!driveLink && !driveLoading && (
            <p className="text-slate-600 text-xs">Your intelligence report is queued for delivery.</p>
          )}
        </div>
      </div>
      {driveLink && (
        <div className="flex gap-2 shrink-0">
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all">
            <Copy size={12} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a href={driveLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all">
            <ExternalLink size={12} /> Open
          </a>
        </div>
      )}
    </div>
  );
}

function PdfPreviewMockup({ businessName, onDownload, pdfDownloading, brandAccent }) {
  const accent = brandAccent || '#1E6FE5';
  return (
    <div className="mb-8">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 text-center">Your Intelligence Document</p>
      {/* Faux PDF cover */}
      <div
        className="relative rounded-2xl overflow-hidden mx-auto max-w-sm shadow-2xl cursor-pointer group"
        style={{ background: '#0A0F1E', border: `1px solid ${accent}30`, aspectRatio: '8.5/11' }}
        onClick={onDownload}
      >
        {/* Top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: accent }} />
        {/* TEK BOSS label */}
        <div className="absolute top-6 left-0 right-0 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: accent }}>TEK BOSS AI</p>
        </div>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div className="w-8 h-0.5 mb-6 rounded" style={{ background: accent }} />
          <h3 className="text-white font-black text-lg text-center uppercase tracking-tight leading-tight mb-2">AI Intelligence Blueprint</h3>
          <p className="text-base font-black text-center" style={{ color: accent }}>{businessName || 'Your Business'}</p>
          <p className="text-slate-600 text-[9px] uppercase tracking-widest mt-2">Proprietary — Confidential</p>
        </div>
        {/* Bottom stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: accent }} />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${accent}20` }}>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
            {pdfDownloading ? (
              <><RefreshCw size={14} className="animate-spin text-white" /><span className="text-white text-xs font-bold">Generating…</span></>
            ) : (
              <><Download size={14} className="text-white" /><span className="text-white text-xs font-bold">Download PDF</span></>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-slate-600 text-xs mt-3">Click to download your Intelligence Blueprint</p>
    </div>
  );
}

// ─── Main PreviewReport component ─────────────────────────────────────────────

export default function PreviewReport({
  previewData,
  businessName,
  onDownload,
  onCheckout,
  pdfDownloading,
  blueprintLoading,
  driveLink,
  driveLoading,
  error,
  onRetry,
}) {
  const pr = previewData?.previewReport;
  const brandDna = previewData?._internal?.brandDna;
  const colorPalette = brandDna?.visualAesthetic?.colorPalette;
  const brandAccent = colorPalette?.[0]?.hex || '#1E6FE5';
  const brandSecondary = colorPalette?.[1]?.hex || '#10B981';

  if (error && !previewData) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-6">⚠</div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Synthesis Interrupted</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed max-w-md mx-auto">{error}</p>
          <button onClick={onRetry} className="bg-blue-600 text-white font-black px-12 py-5 rounded-2xl uppercase tracking-widest text-xs flex items-center gap-2 mx-auto hover:bg-blue-500 transition-colors">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ '--brand-accent': brandAccent }}>
      <div className="max-w-3xl mx-auto py-16 px-6">

        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-600/20">
            <BarChart3 size={12} /> Intelligence Preview — Complimentary
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter leading-none">
            {businessName ? `${businessName}` : 'Your'} <span style={{ color: brandAccent }}>AI Blueprint</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium">
            Based on your discovery interview — here's what we found.
          </p>
        </header>

        {/* Stat Hero */}
        {pr?.stat && <StatHero stat={pr.stat} brandAccent={brandAccent} />}

        {/* Brand Color Bar */}
        {colorPalette?.length > 0 && <BrandColorBar colorPalette={colorPalette} />}

        {/* Business Snapshot */}
        {pr?.business_snapshot && <BusinessSnapshot text={pr.business_snapshot} businessName={businessName} />}

        {/* Health Score Grid */}
        {pr?.health_assessment?.length > 0 && <HealthScoreGrid scores={pr.health_assessment} />}

        {/* What's Working */}
        {pr?.whats_working?.length > 0 && <WhatsWorkingList items={pr.whats_working} />}

        {/* Constraints as Growth Unlocks */}
        {pr?.constraints?.length > 0 && <ConstraintsList items={pr.constraints} />}

        {/* Named Systems Teaser */}
        {pr?.named_systems?.length > 0 && <NamedSystemsTeaser systems={pr.named_systems} brandAccent={brandAccent} />}

        {/* Highest Leverage Move */}
        {pr?.highest_leverage_move && <HighestLeverageCard text={pr.highest_leverage_move} brandAccent={brandSecondary} />}

        {/* No-AI Zones — strategic restraint */}
        {pr?.no_ai_zones?.length > 0 && <NoAiZones items={pr.no_ai_zones} />}

        {/* Execution Gap */}
        <ExecutionGapCard text={pr?.execution_gap} />

        {/* Drive Delivery */}
        <DriveDeliveryCard driveLink={driveLink} driveLoading={driveLoading} />

        {/* PDF Preview Mockup + Download */}
        <PdfPreviewMockup
          businessName={businessName}
          onDownload={() => onDownload(previewData)}
          pdfDownloading={pdfDownloading}
          brandAccent={brandAccent}
        />

        {/* Pricing CTA */}
        <div id="pricing-section" className="mt-12">
          <div className="max-w-xl mx-auto">
            <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 border rounded-[2.5rem] p-10 text-center relative shadow-2xl overflow-hidden"
              style={{ borderColor: `${brandAccent}40` }}>
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${brandAccent}, transparent)` }} />

              <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-6" style={{ color: brandAccent }}>
                Complete AI Business Operating System
              </p>

              <div className="text-5xl font-black text-white mb-2">$599</div>
              <p className="text-slate-500 text-sm font-bold mb-8">One-time · Lifetime Access</p>

              <div className="text-left mb-8 space-y-3">
                {[
                  'Full AI Blueprint with Named Systems & Architecture',
                  '90-Day Implementation Roadmap (Phase 1 → 2 → 3)',
                  'Tool Stack Decisions & Automation Workflows',
                  'Prompt Templates with Brand Voice Built In',
                  'Custom Scope of Work (SOW) — Partner-Ready',
                  '90-Day AI Build-Out Coach — Guided Setup Included',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={15} className="text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <button
                id="purchase-blueprint-btn"
                onClick={onCheckout}
                disabled={blueprintLoading}
                className="w-full text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${brandAccent}, ${brandSecondary || brandAccent})` }}
              >
                {blueprintLoading ? (
                  <><RefreshCw size={16} className="animate-spin" /> Generating Blueprint...</>
                ) : (
                  <>Get Your AI Blueprint <ArrowRight size={16} /></>
                )}
              </button>

              {pr?.cta_line && (
                <p className="text-slate-500 text-xs mt-4 font-medium">{pr.cta_line}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
