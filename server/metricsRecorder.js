/**
 * metricsRecorder.js — Daily snapshot logger
 *
 * Captures a point-in-time snapshot of key business and system metrics once
 * per day (called at midnight by the scheduler in index.js).
 *
 * Metrics logged:
 *   dau                 — distinct users with activity in the past 24 h
 *   blueprints_generated — blueprints paid for today
 *   tasks_completed     — tasks marked done today
 *   mrr_cents           — active subscribers × $49.99 (in cents)
 *   api_errors          — ai_logs rows with an error column today
 *   token_usage         — total tokens consumed today (ai_logs)
 *   db_size_mb          — SQLite file size on disk
 */
import fs from 'fs';
import path from 'path';
import db from './db.js';

export function recordDailyMetrics() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
        // ── DAU: users active in last 24 hours ─────────────────────────────────
        const dau = db.prepare(`
            SELECT COUNT(DISTINCT user_id) AS cnt
            FROM user_progress
            WHERE last_active >= datetime('now', '-24 hours')
        `).get()?.cnt ?? 0;

        // ── Blueprints paid for today ───────────────────────────────────────────
        const blueprints_generated = db.prepare(`
            SELECT COUNT(*) AS cnt
            FROM blueprints
            WHERE DATE(paid_at) = ?
        `).get(today)?.cnt ?? 0;

        // ── Tasks completed today ───────────────────────────────────────────────
        const tasks_completed = db.prepare(`
            SELECT COUNT(*) AS cnt
            FROM user_tasks
            WHERE DATE(completed_at) = ?
        `).get(today)?.cnt ?? 0;

        // ── MRR: active monthly subscribers × $49.99 ───────────────────────────
        const activeSubs = db.prepare(`
            SELECT COUNT(*) AS cnt
            FROM users
            WHERE subscription_status = 'active'
        `).get()?.cnt ?? 0;
        const mrr_cents = activeSubs * 4999; // $49.99 in cents

        // ── API errors today ────────────────────────────────────────────────────
        const api_errors = db.prepare(`
            SELECT COUNT(*) AS cnt
            FROM ai_logs
            WHERE DATE(created_at) = ? AND error IS NOT NULL
        `).get(today)?.cnt ?? 0;

        // ── Token usage today ───────────────────────────────────────────────────
        const token_usage = db.prepare(`
            SELECT COALESCE(SUM(tokens_used), 0) AS total
            FROM ai_logs
            WHERE DATE(created_at) = ?
        `).get(today)?.total ?? 0;

        // ── DB file size ────────────────────────────────────────────────────────
        const volumeMount = process.env.RAILWAY_VOLUME_MOUNT_PATH;
        const dbPath = volumeMount
            ? path.join(volumeMount, 'tekboss.db')
            : path.resolve('./tekboss.db');
        let db_size_mb = 0;
        try {
            const stat = fs.statSync(dbPath);
            db_size_mb = parseFloat((stat.size / 1024 / 1024).toFixed(2));
        } catch (_) {}

        // ── Upsert into metrics table (UNIQUE on date) ─────────────────────────
        db.prepare(`
            INSERT INTO metrics (date, dau, blueprints_generated, tasks_completed,
                                 mrr_cents, api_errors, token_usage, db_size_mb)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
                dau                  = excluded.dau,
                blueprints_generated = excluded.blueprints_generated,
                tasks_completed      = excluded.tasks_completed,
                mrr_cents            = excluded.mrr_cents,
                api_errors           = excluded.api_errors,
                token_usage          = excluded.token_usage,
                db_size_mb           = excluded.db_size_mb,
                recorded_at          = CURRENT_TIMESTAMP
        `).run(today, dau, blueprints_generated, tasks_completed,
               mrr_cents, api_errors, token_usage, db_size_mb);

        console.log(`[Metrics] ${today} recorded — DAU:${dau} MRR:$${(mrr_cents/100).toFixed(2)} DB:${db_size_mb}MB`);
        return { today, dau, blueprints_generated, tasks_completed, mrr_cents, api_errors, token_usage, db_size_mb };

    } catch (err) {
        console.error('[Metrics] recordDailyMetrics failed:', err.message);
        return null;
    }
}

/**
 * Schedules recordDailyMetrics to run once at midnight, then every 24 hours.
 * Safe to call on server startup — first run happens at next local midnight.
 */
export function scheduleDailyMetrics() {
    const now  = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 5, 0); // 00:00:05 tomorrow (5-second buffer)
    const msToMidnight = next - now;

    console.log(`[Metrics] First snapshot scheduled in ${Math.round(msToMidnight / 60000)} minutes.`);

    setTimeout(() => {
        recordDailyMetrics();
        setInterval(recordDailyMetrics, 24 * 60 * 60 * 1000); // repeat every 24 h
    }, msToMidnight);
}
