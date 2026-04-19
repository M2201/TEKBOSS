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

    // Store database in the root of the project (outside server directory)
    // so it persists between server restarts/changes.
    const dbPath = path.resolve(__dirname, '../tekboss.db');
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
                answers TEXT NOT NULL, -- JSON string
                executive_summary TEXT,
                enablement_strategy TEXT,
                validated_data TEXT, -- JSON string from guardrails
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
                messages TEXT NOT NULL DEFAULT '[]', -- JSON array of {role, content, timestamp}
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS dfy_requests (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                blueprint_id TEXT,
                system_context TEXT, -- JSON with relevant systems and business context
                status TEXT DEFAULT 'pending', -- pending, contacted, in_progress, completed
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(blueprint_id) REFERENCES blueprints(id) ON DELETE SET NULL
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

        // Blueprints table migrations
        safeAddColumn('blueprints', 'validated_data', 'TEXT');
        safeAddColumn('blueprints', 'preview_report', 'TEXT');
        safeAddColumn('blueprints', 'paid_at', 'DATETIME');
        safeAddColumn('blueprints', 'assistant_expires_at', 'DATETIME');
    }

    initSchema();
}

export default db;
