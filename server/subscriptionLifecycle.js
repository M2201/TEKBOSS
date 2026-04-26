/**
 * subscriptionLifecycle.js — Automated 60-day trial lifecycle management
 *
 * Runs daily and handles:
 *   Day 30 — "Time is ticking" email alert + set trial_alert_30_sent = 1
 *   Day 55 — "5 days left!" urgency email + set trial_alert_55_sent = 1
 *   Day 60+ — Expire stale 'trialing' users (backup for Stripe webhook)
 *
 * Emails are sent via Resend (same key used by auth.js).
 * Call scheduleLifecycleChecks() once on server startup.
 */
import db from './db.js';

const BASE_URL = process.env.BASE_URL || 'https://tekboss.ai';

// ─── Email helper ─────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.warn('[Lifecycle] RESEND_API_KEY not set — skipping email:', subject);
        return false;
    }
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'TEK BOSS <noreply@tekboss.ai>',
                to,
                subject,
                html,
            }),
        });
        const data = await res.json();
        if (!res.ok) { console.error('[Lifecycle] Resend error:', data); return false; }
        return true;
    } catch (err) {
        console.error('[Lifecycle] Email failed:', err.message);
        return false;
    }
}

// ─── Email templates ──────────────────────────────────────────────────────────
function alert30Html(name) {
    const displayName = name || 'there';
    return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#020817;color:#fff;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:#1818E8;border-radius:14px;font-weight:900;font-size:18px;">TB</span>
        <h1 style="color:#fff;font-size:22px;font-weight:900;margin:16px 0 6px;">⏱ Time Is Ticking, ${displayName}</h1>
        <p style="color:#64748b;font-size:14px;margin:0;">You're 30 days into your 60-day AI Blueprint implementation period.</p>
      </div>
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="color:#94a3b8;font-size:14px;margin:0 0 12px;">📍 <strong style="color:#fff;">30 days down. 30 days left.</strong></p>
        <p style="color:#94a3b8;font-size:14px;margin:0;">Your AI Instructor and full dashboard access continue until Day 60. After that, continued access is $49.99/mo — but everything you've built is yours forever.</p>
      </div>
      <a href="${BASE_URL}" style="display:block;background:#1818E8;color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:0.05em;margin-bottom:20px;">
        CONTINUE BUILDING MY BLUEPRINT →
      </a>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0;">Questions? Reply to this email — we read every one.</p>
    </div>`;
}

function alert55Html(name) {
    const displayName = name || 'there';
    return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#020817;color:#fff;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:#ef4444;border-radius:14px;font-weight:900;font-size:22px;">!</span>
        <h1 style="color:#fff;font-size:22px;font-weight:900;margin:16px 0 6px;">🚨 5 Days Left, ${displayName}</h1>
        <p style="color:#64748b;font-size:14px;margin:0;">Your 60-day AI Instructor period ends in 5 days.</p>
      </div>
      <div style="background:#1c0a0a;border:1px solid #7f1d1d;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="color:#fca5a5;font-size:14px;margin:0 0 12px;">After Day 60, your AI Instructor and dashboard task-tracking will require a $49.99/mo subscription to stay active.</p>
        <p style="color:#94a3b8;font-size:14px;margin:0;">Your blueprint, all progress, and your PDF are <strong style="color:#fff;">yours forever</strong> regardless.</p>
      </div>
      <a href="${BASE_URL}" style="display:block;background:#ef4444;color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:0.05em;margin-bottom:16px;">
        KEEP MY ACCESS ACTIVE — $49.99/MO →
      </a>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0;">Prefer to go it alone? Your PDF blueprint and completed tasks are always accessible.</p>
    </div>`;
}

// ─── Core check functions ─────────────────────────────────────────────────────

/** Send 30-day alert to users who hit day 30 today */
async function sendDay30Alerts() {
    const users = db.prepare(`
        SELECT id, email, full_name, trial_started_at
        FROM users
        WHERE subscription_status IN ('trialing', 'active')
          AND trial_alert_30_sent = 0
          AND trial_started_at IS NOT NULL
          AND CAST(julianday('now') - julianday(trial_started_at) AS INTEGER) BETWEEN 29 AND 32
    `).all();

    console.log(`[Lifecycle] Day-30 check: ${users.length} user(s) eligible`);
    for (const user of users) {
        const sent = await sendEmail({
            to: user.email,
            subject: '⏱ Time is ticking — 30 days into your TEK BOSS Blueprint',
            html: alert30Html(user.full_name),
        });
        if (sent) {
            db.prepare('UPDATE users SET trial_alert_30_sent = 1 WHERE id = ?').run(user.id);
            console.log(`[Lifecycle] 30-day alert sent to ${user.email}`);
        }
    }
}

/** Send 55-day urgency alert (5 days before expiry) */
async function sendDay55Alerts() {
    const users = db.prepare(`
        SELECT id, email, full_name, subscription_ends_at
        FROM users
        WHERE subscription_status IN ('trialing', 'active')
          AND trial_alert_55_sent = 0
          AND subscription_ends_at IS NOT NULL
          AND CAST(julianday(subscription_ends_at) - julianday('now') AS INTEGER) BETWEEN 4 AND 6
    `).all();

    console.log(`[Lifecycle] Day-55 check: ${users.length} user(s) eligible`);
    for (const user of users) {
        const sent = await sendEmail({
            to: user.email,
            subject: '🚨 5 days left — Your TEK BOSS AI Instructor access is ending',
            html: alert55Html(user.full_name),
        });
        if (sent) {
            db.prepare('UPDATE users SET trial_alert_55_sent = 1 WHERE id = ?').run(user.id);
            console.log(`[Lifecycle] 55-day alert sent to ${user.email}`);
        }
    }
}

/** Expire trials past their end date (safety net for missed Stripe webhooks) */
function expireStaleTrials() {
    const result = db.prepare(`
        UPDATE users
        SET subscription_status = 'expired'
        WHERE subscription_status = 'trialing'
          AND subscription_ends_at IS NOT NULL
          AND subscription_ends_at < datetime('now')
    `).run();
    if (result.changes > 0) {
        console.log(`[Lifecycle] Expired ${result.changes} stale trial(s).`);
    }
}

/** Run all lifecycle checks — call this daily */
export async function runLifecycleChecks() {
    console.log('[Lifecycle] Running daily checks...');
    expireStaleTrials();
    await sendDay30Alerts();
    await sendDay55Alerts();
    console.log('[Lifecycle] Daily checks complete.');
}

/**
 * Schedule lifecycle checks daily at 9 AM local server time.
 * Also runs immediately on startup to catch anything missed.
 */
export function scheduleLifecycleChecks() {
    // Run once on startup (non-blocking)
    setImmediate(() => runLifecycleChecks().catch(err =>
        console.error('[Lifecycle] Startup check failed:', err.message)
    ));

    // Schedule next 9 AM
    const scheduleNext = () => {
        const now  = new Date();
        const next = new Date(now);
        next.setHours(9, 0, 5, 0);
        if (next <= now) next.setDate(next.getDate() + 1); // already past 9am — schedule for tomorrow
        const ms = next - now;
        console.log(`[Lifecycle] Next check scheduled in ${Math.round(ms / 60000)} minutes.`);
        setTimeout(async () => {
            await runLifecycleChecks().catch(err =>
                console.error('[Lifecycle] Scheduled check failed:', err.message)
            );
            setInterval(() => runLifecycleChecks().catch(console.error), 24 * 60 * 60 * 1000);
        }, ms);
    };
    scheduleNext();
}
