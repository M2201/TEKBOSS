/**
 * Database module — uses better-sqlite3 locally, gracefully degrades on Vercel.
 * Vercel's serverless runtime can't run native C++ addons like better-sqlite3,
 * so we provide a safe no-op wrapper that returns empty results.
 */
let db;

if (process.env.VERCEL) {
    // ─── Vercel: No-op DB wrapper (auth/storage not available in serverless) ────
    const noop = () => ({});
    const noopAll = () => [];
    db = {
        prepare: () => ({ run: noop, get: noop, all: noopAll }),
        exec: noop,
        pragma: noop,
        _isVercelStub: true
    };
} else {
    // ─── Local / Railway: Real SQLite database ──────────────────────────────────
    const Database = (await import('better-sqlite3')).default;
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // On Railway: use the persistent volume mount so data survives redeployments.
    // Locally: use the project root.
    const volumeMount = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    const dbPath = volumeMount
        ? path.join(volumeMount, 'tekboss.db')
        : path.resolve(__dirname, '../tekboss.db');
    console.log(`[DB] Using database at: ${dbPath}`);
    db = new Database(dbPath);

    // Enable WAL mode for better concurrent performance
    db.pragma('journal_mode = WAL');

    // ─── Initialize Schema ───────────────────────────────────────────────────
    function initSchema() {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS blueprints (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                answers TEXT NOT NULL,
                executive_summary TEXT,
                enablement_strategy TEXT,
                validated_data TEXT,
                preview_report TEXT,
                pricing_tier TEXT,
                diy_playbook TEXT,
                sow_playbook TEXT,
                paid_at DATETIME,
                assistant_expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS assistant_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                blueprint_id TEXT NOT NULL,
                messages TEXT NOT NULL DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS dfy_requests (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                blueprint_id TEXT,
                system_context TEXT,
                status TEXT DEFAULT 'pending',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS ai_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stage TEXT NOT NULL,
                user_id TEXT,
                blueprint_id TEXT,
                tokens_used INTEGER,
                latency_ms INTEGER,
                output_length INTEGER,
                has_sow_split INTEGER,
                named_systems_count INTEGER,
                error TEXT,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS instructor_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                blueprint_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                image_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                blueprint_id TEXT NOT NULL,
                task_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                module TEXT,
                status TEXT DEFAULT 'pending',
                due_date TEXT,
                completed_at TEXT,
                calendar_event_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                blueprint_id TEXT NOT NULL,
                total_tasks INTEGER DEFAULT 0,
                done_tasks INTEGER DEFAULT 0,
                last_active DATETIME,
                phase TEXT DEFAULT 'phase_1',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, blueprint_id),
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                dau INTEGER DEFAULT 0,
                blueprints_generated INTEGER DEFAULT 0,
                tasks_completed INTEGER DEFAULT 0,
                mrr_cents INTEGER DEFAULT 0,
                api_errors INTEGER DEFAULT 0,
                token_usage INTEGER DEFAULT 0,
                db_size_mb REAL DEFAULT 0,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);


        // ─── Safe column additions for existing databases ─────────────────────
        const safeAddColumn = (table, column, type) => {
            try {
                db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
            } catch (e) {
                // Column already exists — ignore
            }
        };

        // Users table migrations
        safeAddColumn('users', 'stripe_customer_id', 'TEXT');
        safeAddColumn('users', 'stripe_subscription_id', 'TEXT');
        safeAddColumn('users', 'subscription_status', "TEXT DEFAULT 'none'"); // none | trialing | active | cancelled | expired
        safeAddColumn('users', 'subscription_ends_at', 'DATETIME');       // when monthly access expires
        safeAddColumn('users', 'trial_started_at', 'DATETIME');           // when $599 was paid → 60-day trial begins
        safeAddColumn('users', 'trial_alert_30_sent', 'INTEGER DEFAULT 0'); // 1 = 30-day "time ticking" alert sent
        safeAddColumn('users', 'google_calendar_token', 'TEXT');           // encrypted OAuth token for Calendar
        safeAddColumn('users', 'google_calendar_connected', 'INTEGER DEFAULT 0');
        safeAddColumn('users', 'trial_alert_55_sent', 'INTEGER DEFAULT 0'); // 1 = 55-day "5 days left" alert sent


        // Blueprints table migrations
        safeAddColumn('blueprints', 'validated_data', 'TEXT');
        safeAddColumn('blueprints', 'preview_report', 'TEXT');
        safeAddColumn('blueprints', 'paid_at', 'DATETIME');
        safeAddColumn('blueprints', 'assistant_expires_at', 'DATETIME');
        safeAddColumn('blueprints', 'tasks_generated', 'INTEGER DEFAULT 0');  // 1 = AI task list generated
        safeAddColumn('blueprints', 'brand_theme_applied', 'INTEGER DEFAULT 0'); // 1 = client colors injected
        safeAddColumn('blueprints', 'website_analysis', 'TEXT');          // scraped + AI website analysis JSON
        safeAddColumn('blueprints', 'website_teaser', 'TEXT');            // pre-paywall observation bullets (no solutions)
    }

    initSchema();
}

export default db;
