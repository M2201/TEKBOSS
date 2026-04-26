/**
 * dbMonitor.js — SQLite health checker
 *
 * Checks DB file size and WAL status every hour.
 * Logs warnings at thresholds and critical alerts above limits.
 *
 * Thresholds (conservative for Railway volume):
 *   WARN  > 200 MB  — approaching limits, start planning
 *   CRIT  > 500 MB  — checkpoint + investigate immediately
 *   WAL   > 50 MB   — WAL not being checkpointed properly
 *
 * Call scheduleDbMonitor() once on server startup.
 */
import fs from 'fs';
import path from 'path';
import db from './db.js';

const WARN_MB = 200;
const CRIT_MB = 500;
const WAL_WARN_MB = 50;

function getDbPaths() {
    const volumeMount = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    const base = volumeMount
        ? path.join(volumeMount, 'tekboss.db')
        : path.resolve('./tekboss.db');
    return { dbPath: base, walPath: base + '-wal', shmPath: base + '-shm' };
}

function fileSizeMb(filePath) {
    try {
        const stat = fs.statSync(filePath);
        return parseFloat((stat.size / 1024 / 1024).toFixed(2));
    } catch (_) {
        return 0;
    }
}

export function checkDbHealth() {
    const { dbPath, walPath } = getDbPaths();

    const dbMb  = fileSizeMb(dbPath);
    const walMb = fileSizeMb(walPath);

    const status = {
        db_size_mb:  dbMb,
        wal_size_mb: walMb,
        timestamp:   new Date().toISOString(),
        ok: true,
        warnings: [],
    };

    // ── WAL check ───────────────────────────────────────────────────────────────
    if (walMb > WAL_WARN_MB) {
        status.warnings.push(`WAL file is ${walMb} MB — running checkpoint`);
        try {
            db.pragma('wal_checkpoint(PASSIVE)');
            console.warn(`[DBMonitor] WAL was ${walMb} MB — checkpoint triggered`);
        } catch (e) {
            console.error('[DBMonitor] Checkpoint failed:', e.message);
        }
    }

    // ── DB size checks ──────────────────────────────────────────────────────────
    if (dbMb >= CRIT_MB) {
        status.ok = false;
        status.warnings.push(`CRITICAL: DB is ${dbMb} MB — investigate immediately`);
        console.error(`[DBMonitor] ⚠️  CRITICAL DB size: ${dbMb} MB`);
    } else if (dbMb >= WARN_MB) {
        status.warnings.push(`WARNING: DB is ${dbMb} MB — plan for growth`);
        console.warn(`[DBMonitor] ⚠️  DB size warning: ${dbMb} MB`);
    } else {
        console.log(`[DBMonitor] ✓ DB ${dbMb} MB  WAL ${walMb} MB`);
    }

    // ── Row counts for context ──────────────────────────────────────────────────
    try {
        status.row_counts = {
            users:      db.prepare('SELECT COUNT(*) AS c FROM users').get()?.c ?? 0,
            blueprints: db.prepare('SELECT COUNT(*) AS c FROM blueprints').get()?.c ?? 0,
            tasks:      db.prepare('SELECT COUNT(*) AS c FROM user_tasks').get()?.c ?? 0,
            ai_logs:    db.prepare('SELECT COUNT(*) AS c FROM ai_logs').get()?.c ?? 0,
        };
    } catch (_) {}

    return status;
}

/**
 * Schedules checkDbHealth every hour (and runs immediately on startup).
 */
export function scheduleDbMonitor() {
    checkDbHealth(); // immediate run on startup
    setInterval(checkDbHealth, 60 * 60 * 1000); // every hour
    console.log('[DBMonitor] Hourly health checks scheduled.');
}
