/**
 * AdminDashboard.jsx — TekBoss Founder Command Center
 *
 * Accessed via: https://tekboss.ai/?admin
 * Protected by ADMIN_SECRET key stored in localStorage.
 *
 * Sections:
 *   1. Auth gate (admin key input)
 *   2. KPI stat cards row (MRR, Revenue, Users, Blueprints, DAU)
 *   3. User cohort ring chart (trialing / active / expired / cancelled)
 *   4. MRR sparkline (30-day SVG trend)
 *   5. DAU bar chart (30-day SVG)
 *   6. Recent blueprints table
 *   7. System health (DB size, WAL)
 *   8. Action controls (Force snapshot, Lifecycle check)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    BarChart3, TrendingUp, Users, FileText, Zap,
    RefreshCw, Activity, Database, AlertCircle,
    CheckCircle2, Clock, DollarSign, X
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = {
    dollar: (n) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    num:    (n) => (n || 0).toLocaleString('en-US'),
    date:   (s) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
    ago:    (s) => {
        const d = Math.floor((Date.now() - new Date(s)) / 1000);
        if (d < 60)  return `${d}s ago`;
        if (d < 3600) return `${Math.floor(d/60)}m ago`;
        return `${Math.floor(d/3600)}h ago`;
    },
};

// ─── SVG Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#3b82f6', height = 48, width = 200 }) {
    if (data.length < 2) return <div style={{ height }} className="flex items-center justify-center text-slate-700 text-xs">No data yet</div>;
    const max  = Math.max(...data, 1);
    const min  = Math.min(...data);
    const range = max - min || 1;
    const pts  = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 8) - 4;
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${height} ${pts} ${width},${height}`;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
                <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#grad-${color.replace('#','')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Last point dot */}
            {data.length > 0 && (() => {
                const last = data.length - 1;
                const x = width;
                const y = height - ((data[last] - min) / range) * (height - 8) - 4;
                return <circle cx={x} cy={y} r="3" fill={color} />;
            })()}
        </svg>
    );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data = [], color = '#6366f1', height = 60 }) {
    if (!data.length) return <div style={{ height }} className="flex items-center justify-center text-slate-700 text-xs">No data yet</div>;
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-[2px]" style={{ height }}>
            {data.map((v, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all"
                    style={{
                        height: `${Math.max((v / max) * 100, v > 0 ? 8 : 2)}%`,
                        backgroundColor: i === data.length - 1 ? color : color + '60',
                    }} />
            ))}
        </div>
    );
}

// ─── Cohort Ring ──────────────────────────────────────────────────────────────
function CohortRing({ cohort = {} }) {
    const segments = [
        { key: 'trialing',  label: 'Trialing',  color: '#3b82f6' },
        { key: 'active',    label: 'Active',     color: '#22c55e' },
        { key: 'expired',   label: 'Expired',    color: '#ef4444' },
        { key: 'cancelled', label: 'Cancelled',  color: '#f59e0b' },
        { key: 'past_due',  label: 'Past Due',   color: '#f97316' },
        { key: 'none',      label: 'No Sub',     color: '#475569' },
    ].filter(s => cohort[s.key] > 0);

    const total = segments.reduce((s, seg) => s + (cohort[seg.key] || 0), 0);
    if (!total) return <p className="text-slate-600 text-sm text-center py-4">No users yet</p>;

    // SVG donut
    const r = 42, cx = 56, cy = 56, stroke = 26;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    const arcs = segments.map(seg => {
        const pct   = (cohort[seg.key] || 0) / total;
        const dash  = pct * circ;
        const arc   = { seg, pct, dash, offset };
        offset += dash;
        return arc;
    });

    return (
        <div className="flex items-center gap-6">
            <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
                {arcs.map(({ seg, dash, offset: off }, i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={seg.color} strokeWidth={stroke}
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={-off + circ * 0.25}
                        style={{ transition: 'all 0.6s ease' }} />
                ))}
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                    className="fill-white text-lg font-black" fontSize="18" fontWeight="900">{total}</text>
            </svg>
            <div className="space-y-1.5">
                {segments.map(seg => (
                    <div key={seg.key} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-slate-400">{seg.label}</span>
                        <span className="font-black text-white ml-auto">{cohort[seg.key] || 0}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = '#3b82f6', trend }) {
    return (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-2 hover:border-slate-700/60 transition-colors">
            <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
                    <Icon size={17} style={{ color }} />
                </div>
                {trend !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-400 bg-emerald-950/50' : 'text-red-400 bg-red-950/50'}`}>
                        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-white font-black text-2xl tracking-tight leading-none">{value}</p>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-wide font-semibold">{label}</p>
                {sub && <p className="text-slate-600 text-[11px] mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!key.trim()) return;
        localStorage.setItem('tb_admin_key', key.trim());
        onAuth(key.trim());
    };

    return (
        <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl mb-4">
                        <Zap size={24} className="text-white" />
                    </div>
                    <h1 className="text-white font-black text-2xl">TekBoss Admin</h1>
                    <p className="text-slate-500 text-sm mt-1">Enter your admin key to continue</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="password" autoFocus value={key}
                        onChange={e => { setKey(e.target.value); setError(false); }}
                        placeholder="Admin secret key"
                        className={`w-full bg-slate-800/60 border ${error ? 'border-red-500/60' : 'border-slate-700/60'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors`}
                    />
                    {error && <p className="text-red-400 text-xs text-center">Invalid key</p>}
                    <button type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-3 rounded-xl transition-colors tracking-widest uppercase">
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-900/80 border border-emerald-700/60 px-4 py-3 rounded-xl text-emerald-300 text-sm font-semibold shadow-2xl backdrop-blur-sm">
            <CheckCircle2 size={15} /> {msg}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [adminKey, setAdminKey] = useState(() => localStorage.getItem('tb_admin_key') || '');
    const [authed,   setAuthed]   = useState(false);
    const [data,     setData]     = useState(null);
    const [health,   setHealth]   = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [lastFetch, setLastFetch] = useState(null);
    const [toast,    setToast]    = useState(null);
    const [range,    setRange]    = useState(30);
    const intervalRef = useRef(null);

    const headers = { 'x-admin-key': adminKey };

    const fetchData = useCallback(async (key = adminKey) => {
        if (!key) return;
        setLoading(true);
        try {
            const [metricsRes, healthRes] = await Promise.all([
                fetch(`/api/admin/metrics?days=${range}`, { headers: { 'x-admin-key': key } }),
                fetch('/api/admin/health',                { headers: { 'x-admin-key': key } }),
            ]);
            if (metricsRes.status === 401) { setAuthed(false); return; }
            if (metricsRes.ok) { setData(await metricsRes.json()); setAuthed(true); }
            if (healthRes.ok)  { setHealth(await healthRes.json()); }
            setLastFetch(new Date().toISOString());
        } catch { /* network hiccup */ } finally { setLoading(false); }
    }, [adminKey, range]);

    // Auth handler
    const handleAuth = (key) => { setAdminKey(key); fetchData(key); };

    // Auto-refresh every 60 seconds
    useEffect(() => {
        if (!authed) return;
        intervalRef.current = setInterval(() => fetchData(), 60000);
        return () => clearInterval(intervalRef.current);
    }, [authed, fetchData]);

    // Initial load if we have a saved key
    useEffect(() => { if (adminKey) fetchData(adminKey); }, []);
    useEffect(() => { if (authed) fetchData(); }, [range]);

    // Actions
    const triggerSnapshot = async () => {
        await fetch('/api/admin/metrics/snapshot', { method: 'POST', headers });
        setToast('Snapshot recorded ✓');
        fetchData();
    };
    const triggerLifecycle = async () => {
        await fetch('/api/admin/lifecycle-check', { method: 'POST', headers });
        setToast('Lifecycle check complete ✓');
    };

    if (!authed) return <AuthGate onAuth={handleAuth} />;

    const s  = data?.summary || {};
    const h  = data?.history || [];
    const co = data?.cohort  || {};
    const rb = data?.recentBlueprints || [];

    // Chart data (oldest → newest)
    const chartHistory = [...h].reverse();
    const mrrData  = chartHistory.map(r => (r.mrr_cents || 0) / 100);
    const dauData  = chartHistory.map(r => r.dau || 0);

    return (
        <div className="min-h-screen bg-[#070B14] text-white font-sans p-5 md:p-8">
            {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                        <Zap size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-black text-lg tracking-tight">TEKBOSS ADMIN</h1>
                        <p className="text-slate-600 text-[11px]">
                            {lastFetch ? `Updated ${fmt.ago(lastFetch)}` : 'Loading…'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Range selector */}
                    {[7,30,90].map(d => (
                        <button key={d} onClick={() => setRange(d)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${range === d ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300 border border-slate-800'}`}>
                            {d}d
                        </button>
                    ))}
                    <button onClick={() => fetchData()}
                        className={`ml-2 w-9 h-9 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-600 transition-all ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={() => { localStorage.removeItem('tb_admin_key'); setAuthed(false); }}
                        className="ml-1 w-9 h-9 rounded-xl border border-slate-800 flex items-center justify-center text-slate-600 hover:text-red-400 hover:border-red-800/40 transition-all">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <StatCard label="Total Revenue" value={fmt.dollar(s.total_revenue_dollars)} sub={`${fmt.num(s.total_blueprints)} blueprints × $599`} icon={DollarSign} color="#22c55e" />
                <StatCard label="MRR" value={fmt.dollar(s.mrr_dollars)} sub={`${s.active_subscribers || 0} active @ $49.99`} icon={TrendingUp} color="#3b82f6" />
                <StatCard label="Total Users" value={fmt.num(s.total_users)} sub={`${s.trialing_users || 0} trialing`} icon={Users} color="#a855f7" />
                <StatCard label="Blueprints Sold" value={fmt.num(s.total_blueprints)} sub="Paid & generated" icon={FileText} color="#f59e0b" />
                <StatCard label="DAU Today" value={fmt.num(s.dau_today)} sub={`${s.tasks_completed_today || 0} tasks completed`} icon={Activity} color="#06b6d4" />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                {/* MRR Trend */}
                <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">MRR Trend ({range}d)</p>
                        <p className="text-white font-black text-sm">{fmt.dollar(s.mrr_dollars)}</p>
                    </div>
                    <div className="w-full">
                        <Sparkline data={mrrData} color="#3b82f6" height={72} width={600} />
                    </div>
                    <div className="flex gap-4 mt-3">
                        <div>
                            <p className="text-slate-600 text-[10px] uppercase tracking-widest">Active</p>
                            <p className="text-emerald-400 font-black text-sm">{s.active_subscribers || 0}</p>
                        </div>
                        <div>
                            <p className="text-slate-600 text-[10px] uppercase tracking-widest">Trialing</p>
                            <p className="text-blue-400 font-black text-sm">{s.trialing_users || 0}</p>
                        </div>
                        <div>
                            <p className="text-slate-600 text-[10px] uppercase tracking-widest">Expired</p>
                            <p className="text-red-400 font-black text-sm">{s.expired_users || 0}</p>
                        </div>
                        <div>
                            <p className="text-slate-600 text-[10px] uppercase tracking-widest">Past Due</p>
                            <p className="text-orange-400 font-black text-sm">{s.past_due_users || 0}</p>
                        </div>
                    </div>
                </div>

                {/* User Cohort Ring */}
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">User Cohorts</p>
                    <CohortRing cohort={co} />
                </div>
            </div>

            {/* DAU Bar Chart */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Daily Active Users ({range}d)</p>
                    <p className="text-white font-black text-sm">{s.dau_today || 0} today</p>
                </div>
                <BarChart data={dauData} color="#6366f1" height={64} />
                <div className="flex justify-between mt-1 text-[10px] text-slate-700">
                    <span>{chartHistory[0] ? fmt.date(chartHistory[0].date) : '—'}</span>
                    <span>{chartHistory[chartHistory.length - 1] ? fmt.date(chartHistory[chartHistory.length - 1].date) : '—'}</span>
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Recent Blueprints */}
                <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Recent Blueprints</p>
                    {rb.length === 0 ? (
                        <p className="text-slate-700 text-sm text-center py-6">No paid blueprints yet</p>
                    ) : (
                        <div className="space-y-2">
                            {rb.map((bp, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-bold truncate">{bp.business_name}</p>
                                        <p className="text-slate-600 text-xs truncate">{bp.email}</p>
                                    </div>
                                    <div className="shrink-0 text-right ml-4">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                            bp.subscription_status === 'active'    ? 'bg-emerald-950/60 text-emerald-400' :
                                            bp.subscription_status === 'trialing'  ? 'bg-blue-950/60 text-blue-400' :
                                            bp.subscription_status === 'expired'   ? 'bg-red-950/60 text-red-400' :
                                            'bg-slate-800 text-slate-500'
                                        }`}>
                                            {bp.subscription_status || 'none'}
                                        </span>
                                        <p className="text-slate-700 text-[10px] mt-0.5">{fmt.date(bp.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* System Health + Controls */}
                <div className="space-y-3">
                    {/* Health Card */}
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">System Health</p>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Database size={13} /> DB Size
                                </div>
                                <span className="text-white font-bold text-xs">{s.db_size_mb || 0} MB</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Activity size={13} /> WAL Status
                                </div>
                                <span className={`text-xs font-bold ${health?.wal_size_mb > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {health?.wal_size_mb || 0} MB
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Clock size={13} /> Last Snapshot
                                </div>
                                <span className="text-slate-500 text-xs">{h[0]?.date || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Controls</p>
                        <div className="space-y-2">
                            <button onClick={triggerSnapshot}
                                className="w-full flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 px-3 py-2.5 rounded-xl transition-all">
                                <BarChart3 size={13} className="text-blue-400" /> Force Metrics Snapshot
                            </button>
                            <button onClick={triggerLifecycle}
                                className="w-full flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 px-3 py-2.5 rounded-xl transition-all">
                                <Zap size={13} className="text-amber-400" /> Run Lifecycle Check
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <p className="text-center text-slate-800 text-[11px] mt-8">
                TekBoss Admin · Auto-refreshes every 60s · Press Ctrl+R to force refresh
            </p>
        </div>
    );
}
