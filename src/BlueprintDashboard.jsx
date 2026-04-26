/**
 * BlueprintDashboard — Interactive module-card platform (Phase 1)
 * Replaces the flat markdown dump in Stage 4.
 * Features: brand color theming, task checklist, coin reward, progress bar.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2, Circle, ChevronRight, ChevronDown, Download,
  Zap, BarChart3, Globe, TrendingUp, Target, Layers, Calendar,
  FileText, Star, ArrowRight, Bot, CalendarPlus, X,
} from 'lucide-react';


// ─── Coin reward animation + sound ───────────────────────────────────────────
function playCoinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (_) {}
}

function CoinBurst({ x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 900); return () => clearTimeout(t); }, [onDone]);
  return (
    <div
      className="pointer-events-none fixed z-50 text-2xl select-none"
      style={{ left: x - 12, top: y - 12, animation: 'coin-burst 0.9s ease-out forwards' }}
    >
      🪙
    </div>
  );
}

// ─── Module icon map ──────────────────────────────────────────────────────────
const MODULE_ICONS = {
  'brand dna':       <Star size={18} />,
  'brand':           <Star size={18} />,
  'market intel':    <BarChart3 size={18} />,
  'market':          <BarChart3 size={18} />,
  'website':         <Globe size={18} />,
  'roi':             <TrendingUp size={18} />,
  'revenue':         <TrendingUp size={18} />,
  'growth':          <TrendingUp size={18} />,
  'roadmap':         <Target size={18} />,
  'plan':            <Target size={18} />,
  'automation':      <Zap size={18} />,
  'content':         <FileText size={18} />,
  'crm':             <Layers size={18} />,
  'ai':              <Bot size={18} />,
  'default':         <Layers size={18} />,
};

function getModuleIcon(name = '') {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(MODULE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return MODULE_ICONS.default;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function GlobalProgress({ done, total, businessName }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mb-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            Implementation Progress
          </p>
          <p className="text-white font-black text-lg">
            {businessName ? `${businessName}'s Blueprint` : 'Your Blueprint'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black" style={{ color: 'var(--brand-primary, #3b82f6)' }}>{pct}%</p>
          <p className="text-xs text-slate-500 font-bold">{done} / {total} tasks</p>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right, var(--brand-primary, #3b82f6), var(--brand-secondary, #6366f1))',
          }}
        />
      </div>
      {pct === 100 && (
        <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-3 text-center">
          🎉 Blueprint Complete!
        </p>
      )}
    </div>
  );
}

// ─── Task Item ─────────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle, calendarConnected, onSchedule, onUnschedule }) {
  const done = task.status === 'done';
  const [showScheduler, setShowScheduler] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('09:00');
  const [scheduling, setScheduling] = useState(false);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedDate) return;
    setScheduling(true);
    try {
      await onSchedule(task, `${schedDate}T${schedTime}:00`);
      setShowScheduler(false);
    } finally { setScheduling(false); }
  };

  return (
    <div className={`rounded-xl transition-all ${done ? 'opacity-60' : ''}`}>
      <div
        className={`flex items-start gap-3 p-3 cursor-pointer select-none group ${done ? '' : 'hover:bg-slate-800/50 rounded-xl'}`}
        onClick={() => onToggle(task, !done)}
        role="checkbox"
        aria-checked={done}
      >
        <div className={`mt-0.5 shrink-0 transition-colors ${done ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
          {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>
          )}
          {task.calendar_event_id && task.due_date && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-950/40 border border-blue-800/30 px-2 py-0.5 rounded-full">
                <Calendar size={9} />
                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
              <button
                onClick={(ev) => { ev.stopPropagation(); onUnschedule(task); }}
                className="text-[10px] text-slate-600 hover:text-red-400 transition-colors"
                title="Remove from calendar"
              ><X size={10} /></button>
            </div>
          )}
        </div>
        {calendarConnected && !done && (
          <button
            onClick={(ev) => { ev.stopPropagation(); setShowScheduler(s => !s); }}
            className={`shrink-0 mt-0.5 p-1 rounded-lg transition-colors ${showScheduler ? 'text-blue-400 bg-blue-950/40' : 'text-slate-600 hover:text-blue-400 hover:bg-slate-800'}`}
            title="Schedule in Google Calendar"
          ><CalendarPlus size={13} /></button>
        )}
      </div>

      {showScheduler && (
        <form
          onSubmit={handleScheduleSubmit}
          className="ml-9 mr-3 mb-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-end gap-2"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Date</label>
            <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} required
              className="bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg w-full outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Time</label>
            <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg outline-none focus:border-blue-500" />
          </div>
          <button type="submit" disabled={scheduling}
            className="text-xs font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-primary, #3b82f6)' }}>
            {scheduling ? '…' : 'Add'}
          </button>
          <button type="button" onClick={() => setShowScheduler(false)} className="text-slate-500 hover:text-slate-300 p-1">
            <X size={13} />
          </button>
        </form>
      )}
    </div>
  );
}


// ─── Module Card ───────────────────────────────────────────────────────────────
function ModuleCard({ system, tasks = [], onTaskToggle, index, calendarConnected, onScheduleTask, onUnscheduleTask }) {
  const [open, setOpen] = useState(false);
  const done  = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200
        ${allDone
          ? 'border-emerald-800/50 bg-emerald-950/20'
          : open
            ? 'border-slate-700 bg-slate-900'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
        }`}
    >
      {/* Card Header */}
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: allDone ? 'rgba(16,185,129,0.1)' : 'rgba(var(--brand-primary-rgb, 59,130,246),0.1)',
            borderColor: allDone ? 'rgba(16,185,129,0.3)' : 'rgba(var(--brand-primary-rgb, 59,130,246),0.2)',
            color: allDone ? '#10b981' : 'var(--brand-primary, #3b82f6)',
          }}
        >
          {allDone ? <CheckCircle2 size={18} /> : getModuleIcon(system.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              System {String(index + 1).padStart(2, '0')}
            </span>
            {allDone && (
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full">
                Complete
              </span>
            )}
          </div>
          <p className="text-white font-black text-sm uppercase tracking-tight leading-tight mb-1">
            {system.name}
          </p>
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{system.purpose}</p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
          {total > 0 && (
            <span
              className="text-[10px] font-black px-2 py-1 rounded-lg"
              style={{
                color: allDone ? '#10b981' : 'var(--brand-primary, #3b82f6)',
                backgroundColor: allDone ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)',
              }}
            >
              {done}/{total}
            </span>
          )}
          {open ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
        </div>
      </button>

      {/* Mini Progress Bar */}
      {total > 0 && (
        <div className="px-5 pb-1">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: allDone ? '#10b981' : 'var(--brand-primary, #3b82f6)',
              }}
            />
          </div>
        </div>
      )}

      {/* Task List (expanded) */}
      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/50 mt-3">
          {tasks.length === 0 ? (
            <p className="text-slate-600 text-xs py-3 text-center">Tasks are being generated…</p>
          ) : (
            <div className="space-y-1">
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onTaskToggle}
                  calendarConnected={calendarConnected}
                  onSchedule={onScheduleTask}
                  onUnschedule={onUnscheduleTask}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function BlueprintDashboard({
  blueprint,
  businessName,
  onDownloadPdf,
  pdfDownloading,
  onLaunchInstructor,
  blueprintDriveLink,
}) {
  const [tasks, setTasks]               = useState([]);
  const [progress, setProgress]         = useState({ total_tasks: 0, done_tasks: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState({ connected: false, configured: false });
  const [subStatus, setSubStatus] = useState({ active: true, status: 'trialing', daysRemaining: 60 });
  const [coins, setCoins]               = useState([]);
  const coinIdRef = useRef(0);

  // ── Load subscription status ───────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/subscription-status', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setSubStatus(d))
      .catch(() => {});
    // Also detect ?resubscribed=true param
    const p = new URLSearchParams(window.location.search);
    if (p.get('resubscribed') === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      fetch('/api/subscription-status', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setSubStatus(d))
        .catch(() => {});
    }
  }, []);

  const handleResubscribe = useCallback(async () => {
    try {
      const res = await fetch('/api/create-monthly-checkout', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (_) {}
  }, []);

  // ── Detect ?calendar=connected after OAuth redirect ───────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('calendar') === 'connected') {
      setCalendarStatus({ connected: true, configured: true });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (p.get('calendar') === 'error') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // ── Load calendar status ────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/calendar/status', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setCalendarStatus(d))
      .catch(() => {});
  }, []);

  const handleConnectCalendar = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/auth-url', { credentials: 'include' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (_) {}
  }, []);

  const handleScheduleTask = useCallback(async (task, startIso) => {
    const res = await fetch(`/api/tasks/${task.id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ startIso }),
    });
    if (res.ok) {
      const { task: updated } = await res.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    }
  }, []);

  const handleUnscheduleTask = useCallback(async (task) => {
    const res = await fetch(`/api/tasks/${task.id}/schedule`, {
      method: 'DELETE', credentials: 'include',
    });
    if (res.ok) {
      const { task: updated } = await res.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    }
  }, []);

  // ── Apply brand color theming ─────────────────────────────────────────────
  useEffect(() => {
    let brandDna = null;
    try {
      if (blueprint?.validated_data) {
        const vd = typeof blueprint.validated_data === 'string'
          ? JSON.parse(blueprint.validated_data) : blueprint.validated_data;
        brandDna = vd?.brandDna || null;
      }
    } catch (_) {}

    const root = document.documentElement;
    if (brandDna?.colorPalette?.primary) {
      root.style.setProperty('--brand-primary', brandDna.colorPalette.primary);
      root.style.setProperty('--brand-secondary', brandDna.colorPalette.secondary || brandDna.colorPalette.primary);
      // Parse RGB for rgba() usage
      const hex = brandDna.colorPalette.primary.replace('#', '');
      const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
      root.style.setProperty('--brand-primary-rgb', `${r},${g},${b}`);
    } else {
      root.style.setProperty('--brand-primary', '#3b82f6');
      root.style.setProperty('--brand-secondary', '#6366f1');
      root.style.setProperty('--brand-primary-rgb', '59,130,246');
    }
    return () => {
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-primary-rgb');
    };
  }, [blueprint]);

  // ── Load tasks ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!blueprint?.id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/tasks/${blueprint.id}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setTasks(data.tasks || []);
        setProgress(data.progress || { total_tasks: 0, done_tasks: 0 });
      } catch (_) {}
      finally { setLoadingTasks(false); }
    };
    load();
    // Poll every 8 seconds in case tasks are still generating
    const poll = setInterval(load, 8000);
    return () => clearInterval(poll);
  }, [blueprint?.id]);

  // ── Task toggle ───────────────────────────────────────────────────────────
  const handleTaskToggle = useCallback(async (task, markDone, event) => {
    const newStatus = markDone ? 'done' : 'pending';

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, completed_at: markDone ? new Date().toISOString() : null } : t));

    // Coin burst on completion
    if (markDone) {
      playCoinSound();
      const coinId = ++coinIdRef.current;
      const rect = event?.currentTarget?.getBoundingClientRect?.();
      setCoins(prev => [...prev, { id: coinId, x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2, y: rect ? rect.top : window.innerHeight / 2 }]);
    }

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.progress) setProgress(data.progress);
      }
    } catch (_) {}
  }, []);

  // ── Group tasks by module ─────────────────────────────────────────────────
  const namedSystems = (() => {
    try {
      const vd = typeof blueprint?.validated_data === 'string'
        ? JSON.parse(blueprint.validated_data) : blueprint?.validated_data;
      return vd?.namedSystems || [];
    } catch { return []; }
  })();

  const tasksByModule = tasks.reduce((acc, t) => {
    (acc[t.module] = acc[t.module] || []).push(t);
    return acc;
  }, {});

  return (
    <>
      {/* Coin burst layer */}
      <style>{`
        @keyframes coin-burst {
          0%   { transform: scale(1) translateY(0); opacity: 1; }
          60%  { transform: scale(1.6) translateY(-40px); opacity: 0.9; }
          100% { transform: scale(0.8) translateY(-80px); opacity: 0; }
        }
      `}</style>
      {coins.map(c => (
        <CoinBurst key={c.id} x={c.x} y={c.y} onDone={() => setCoins(prev => prev.filter(ci => ci.id !== c.id))} />
      ))}

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ── Dashboard Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1">Interactive Platform</p>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Your Blueprint</h2>
          </div>
          <div className="flex items-center gap-3">
            {blueprintDriveLink && (
              <a
                href={blueprintDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <svg width="14" height="12" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
                Drive Files
              </a>
            )}
            <button
              onClick={onDownloadPdf}
              disabled={pdfDownloading}
              id="blueprint-download-pdf"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={12} />
              {pdfDownloading ? 'Generating…' : 'Download PDF'}
            </button>
            <button
              onClick={onLaunchInstructor}
              id="blueprint-launch-instructor"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-white"
              style={{ backgroundColor: 'var(--brand-primary, #3b82f6)' }}
            >
              <Bot size={12} /> AI Instructor <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* ── Global Progress ── */}
        <GlobalProgress
          done={progress.done_tasks || 0}
          total={progress.total_tasks || tasks.length}
          businessName={businessName}
        />

        {/* ── Subscription Banners ── */}
        {/* Warning: ≤30 days left */}
        {subStatus.active && subStatus.daysRemaining <= 30 && subStatus.daysRemaining > 0 && (
          <div className="mb-4 flex items-center justify-between p-4 rounded-2xl border border-amber-700/40 bg-amber-950/20">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-xl">⏱</span>
              <div>
                <p className="text-amber-300 text-sm font-bold">{subStatus.daysRemaining} days of AI access remaining</p>
                <p className="text-slate-500 text-xs">After Day 60, continued access is $49.99/mo. Your blueprint is yours forever.</p>
              </div>
            </div>
            <button onClick={handleResubscribe}
              className="shrink-0 text-xs font-black uppercase tracking-widest text-white px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 transition-colors">
              Keep Access
            </button>
          </div>
        )}
        {/* Expired */}
        {!subStatus.active && subStatus.status === 'expired' && (
          <div className="mb-4 flex items-center justify-between p-4 rounded-2xl border border-red-800/40 bg-red-950/20">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">🚨</span>
              <div>
                <p className="text-red-300 text-sm font-bold">Your 60-day AI access has ended</p>
                <p className="text-slate-500 text-xs">Resubscribe for $49.99/mo to restore the AI Instructor, task tracking, and calendar sync.</p>
              </div>
            </div>
            <button onClick={handleResubscribe}
              className="shrink-0 text-xs font-black uppercase tracking-widest text-white px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition-colors">
              Resubscribe — $49.99/mo
            </button>
          </div>
        )}

        {/* ── Calendar Banner ── */}
        {calendarStatus.configured && !calendarStatus.connected && (
          <div className="mb-6 flex items-center justify-between p-4 rounded-2xl border border-blue-800/30 bg-blue-950/20">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-white text-sm font-bold">Connect Google Calendar</p>
                <p className="text-slate-400 text-xs">Schedule tasks to your calendar with 1 click.</p>
              </div>
            </div>
            <button id="calendar-connect-btn" onClick={handleConnectCalendar}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white px-4 py-2 rounded-xl shrink-0 transition-all"
              style={{ backgroundColor: 'var(--brand-primary, #3b82f6)' }}>
              <Calendar size={11} /> Connect
            </button>
          </div>
        )}
        {calendarStatus.connected && (
          <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-800/30 bg-emerald-950/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-emerald-400 text-xs font-bold">Google Calendar connected — tap the calendar icon on any task to schedule it.</p>
          </div>
        )}


        {/* ── Named Systems Module Grid ── */}

        {namedSystems.length > 0 ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">
              Your Named Systems — {namedSystems.length} AI Systems
            </p>
            <div className="space-y-3 mb-10">
              {namedSystems.map((system, i) => (
                <ModuleCard
                  key={system.name}
                  system={system}
                  index={i}
                  tasks={tasksByModule[system.name] || []}
                  onTaskToggle={(task, markDone) => handleTaskToggle(task, markDone)}
                  calendarConnected={calendarStatus.connected}
                  onScheduleTask={handleScheduleTask}
                  onUnscheduleTask={handleUnscheduleTask}
                />
              ))}
            </div>
          </>
        ) : loadingTasks ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Loading your blueprint modules…</p>
          </div>
        ) : null}

        {/* ── Playbook Download ── */}
        {blueprint?.diyPlaybook && (
          <div className="mt-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-black text-sm uppercase tracking-tight mb-1">Full Implementation Playbook</p>
                <p className="text-slate-500 text-xs">Your complete 90-day written roadmap — also sent to your Drive folder.</p>
              </div>
              <button
                onClick={onDownloadPdf}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl transition-all"
              >
                <FileText size={12} /> Download
              </button>
            </div>
          </div>
        )}

        {/* ── AI Instructor CTA ── */}
        <div
          className="mt-6 p-8 rounded-2xl text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary, #2563eb), var(--brand-secondary, #4f46e5))' }}
        >
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Included for 60 days</p>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Your AI Instructor is ready</h3>
            <p className="text-white/70 text-sm mb-5">Ask questions, get implementation help, and get walked through your tasks — all grounded in YOUR blueprint.</p>
            <button
              onClick={onLaunchInstructor}
              className="bg-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white/90 transition-all"
              style={{ color: 'var(--brand-primary, #2563eb)' }}
            >
              Launch AI Instructor <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
