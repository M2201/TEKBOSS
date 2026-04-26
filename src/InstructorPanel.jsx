/**
 * InstructorPanel.jsx — Phase 3 AI Instructor Chat Panel
 *
 * A slide-in chat panel powered by /api/instructor endpoints.
 * Features:
 *   - Full conversation history (persisted in DB, loaded on open)
 *   - Task shortcut chips (ask about a pending task with one click)
 *   - Opening message generation on first session
 *   - Typing / loading indicator
 *   - Subscription expiry gate with upgrade CTA
 *   - Markdown-lite rendering for AI responses
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Send, Bot, ChevronRight, Zap, Lock } from 'lucide-react';

// ─── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMarkdown(text) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) { elements.push(<div key={key++} className="h-2" />); continue; }

        // Bold headers: **text:**
        const boldHeader = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
        if (boldHeader) {
            elements.push(
                <div key={key++} className="mt-3 mb-1">
                    <span className="font-black text-white text-sm">{boldHeader[1]}:</span>
                    {boldHeader[2] && <span className="text-slate-300 text-sm"> {boldHeader[2]}</span>}
                </div>
            );
            continue;
        }

        // Bullet
        if (line.match(/^[-•*]\s/)) {
            elements.push(
                <div key={key++} className="flex gap-2 text-sm text-slate-300 ml-2 my-0.5">
                    <span className="text-blue-400 shrink-0 mt-0.5">▸</span>
                    <span>{line.replace(/^[-•*]\s/, '').replace(/\*\*(.+?)\*\*/g, (_, m) => m)}</span>
                </div>
            );
            continue;
        }

        // Numbered list
        const numbered = line.match(/^(\d+)\.\s(.+)$/);
        if (numbered) {
            elements.push(
                <div key={key++} className="flex gap-2 text-sm text-slate-300 ml-2 my-0.5">
                    <span className="text-blue-400 shrink-0 font-bold min-w-[18px]">{numbered[1]}.</span>
                    <span dangerouslySetInnerHTML={{ __html: numbered[2].replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                </div>
            );
            continue;
        }

        // Regular paragraph
        elements.push(
            <p key={key++} className="text-sm text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
        );
    }
    return elements;
}

// ─── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ role, content, createdAt }) {
    const isUser = role === 'user';
    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
            {/* Avatar */}
            {!isUser && (
                <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                    <Bot size={15} className="text-white" />
                </div>
            )}
            {isUser && (
                <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-xs font-black text-slate-300">
                    YOU
                </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[82%] ${isUser
                ? 'bg-blue-600/20 border border-blue-500/30 rounded-2xl rounded-tr-sm px-4 py-3'
                : 'bg-slate-800/70 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3'
            }`}>
                {isUser
                    ? <p className="text-sm text-blue-100">{content}</p>
                    : <div className="space-y-0.5">{renderMarkdown(content)}</div>
                }
                {createdAt && (
                    <p className="text-[10px] text-slate-600 mt-2 text-right">
                        {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Typing Indicator ───────────────────────────────────────────────────────────
function TypingIndicator() {
    return (
        <div className="flex gap-3 mb-4">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <Bot size={15} className="text-white" />
            </div>
            <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Task Chip ──────────────────────────────────────────────────────────────────
function TaskChip({ task, onClick }) {
    return (
        <button onClick={onClick}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/60 hover:border-blue-500/50 hover:bg-blue-950/30 transition-all text-xs text-slate-400 hover:text-blue-300 group">
            <ChevronRight size={11} className="group-hover:text-blue-400 transition-colors" />
            <span className="truncate max-w-[140px]">{task.title}</span>
        </button>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function InstructorPanel({ isOpen, onClose, blueprintId, tasks = [], subStatus }) {
    const [messages, setMessages]   = useState([]);
    const [input, setInput]         = useState('');
    const [loading, setLoading]     = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [error, setError]         = useState(null);
    const bottomRef                 = useRef(null);
    const inputRef                  = useRef(null);

    const pendingTasks = (tasks || []).filter(t => t.status !== 'done').slice(0, 5);
    const isExpired    = !subStatus?.active && subStatus?.status === 'expired';

    // ── Load or init session ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen || !blueprintId || isExpired) return;

        async function initSession() {
            setInitializing(true);
            setError(null);
            try {
                // Try to load existing history
                const histRes = await fetch(`/api/instructor/history?blueprintId=${blueprintId}`, { credentials: 'include' });
                if (histRes.status === 403) {
                    const errData = await histRes.json();
                    if (errData.expired) setError('expired');
                    return;
                }
                const { messages: history } = await histRes.json();

                if (history && history.length > 0) {
                    setMessages(history);
                } else {
                    // First session — generate opening message
                    setMessages([]);
                    setLoading(true);
                    const firstRes = await fetch(`/api/instructor/first-message?blueprintId=${blueprintId}`, { credentials: 'include' });
                    const firstData = await firstRes.json();
                    if (firstData.response) {
                        setMessages([
                            { role: 'user', content: firstData.openingMessage },
                            { role: 'assistant', content: firstData.response },
                        ]);
                    }
                    setLoading(false);
                }
            } catch {
                setError('network');
            } finally {
                setInitializing(false);
                setLoading(false);
            }
        }
        initSession();
    }, [isOpen, blueprintId, isExpired]);

    // ── Auto-scroll ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, [messages, loading, isOpen]);

    // ── Focus input when opened ────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen && !isExpired) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen, isExpired]);

    // ── Send message ───────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');
        setLoading(true);
        setError(null);

        // Optimistic update
        setMessages(prev => [...prev, { role: 'user', content: msg }]);

        try {
            const res = await fetch('/api/instructor', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blueprintId, message: msg }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.expired) { setError('expired'); return; }
                throw new Error(data.error || 'Request failed');
            }
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`,
            }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, blueprintId]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    if (!isOpen) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex justify-end"
            onClick={(e) => e.target === e.currentTarget && onClose()}>

            {/* Slide-in Panel */}
            <div className="w-full max-w-[420px] h-full bg-[#070B14] border-l border-slate-800/80 flex flex-col shadow-2xl"
                style={{ animation: 'slideInRight 0.25s ease-out' }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-[#0A0E1A]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                            <Zap size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-wide">AI INSTRUCTOR</p>
                            <p className="text-slate-500 text-[11px]">Your 60-day implementation guide</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <X size={15} className="text-slate-400" />
                    </button>
                </div>

                {/* ── Expired Gate ── */}
                {(isExpired || error === 'expired') ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800/30 flex items-center justify-center">
                            <Lock size={22} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-white font-black text-base mb-2">Instructor Access Ended</p>
                            <p className="text-slate-500 text-sm leading-relaxed">Your 60-day included period has ended. Resubscribe to restore full AI Instructor access.</p>
                        </div>
                        <button onClick={() => fetch('/api/create-monthly-checkout', {
                            method: 'POST', credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                        }).then(r => r.json()).then(d => d.url && (window.location.href = d.url))}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition-colors tracking-widest uppercase">
                            Resubscribe — $49.99/mo
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── Task Chips ── */}
                        {pendingTasks.length > 0 && (
                            <div className="px-4 py-3 border-b border-slate-800/40">
                                <p className="text-slate-600 text-[10px] uppercase tracking-widest mb-2 font-bold">Ask about a task</p>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {pendingTasks.map(task => (
                                        <TaskChip key={task.id} task={task}
                                            onClick={() => sendMessage(`How do I complete this task: "${task.title}"? Give me the specific steps for my business.`)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Message Thread ── */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0">
                            {initializing && (
                                <div className="flex items-center justify-center h-32">
                                    <div className="flex gap-1.5">
                                        {[0,1,2].map(i => (
                                            <span key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!initializing && messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 text-center gap-3 opacity-50">
                                    <Bot size={32} className="text-slate-600" />
                                    <p className="text-slate-500 text-sm">Starting your session...</p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <MessageBubble key={i} role={msg.role} content={msg.content} createdAt={msg.created_at} />
                            ))}

                            {loading && !initializing && <TypingIndicator />}
                            <div ref={bottomRef} />
                        </div>

                        {/* ── Input Bar ── */}
                        <div className="px-4 py-4 border-t border-slate-800/60 bg-[#070B14]">
                            {error && error !== 'expired' && (
                                <p className="text-red-400 text-xs mb-2 text-center">{error}</p>
                            )}
                            <div className="flex gap-2 items-end">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask your Instructor anything..."
                                    rows={1}
                                    className="flex-1 resize-none bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors min-h-[44px] max-h-[120px]"
                                    style={{ scrollbarWidth: 'none' }}
                                    onInput={e => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={loading || !input.trim()}
                                    className="shrink-0 w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg">
                                    <Send size={16} className="text-white" />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-700 text-center mt-2">
                                Press Enter to send · Shift+Enter for new line
                            </p>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
