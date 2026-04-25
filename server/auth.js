import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from './db.js';

const router = express.Router();
// Use a fallback secret for local dev if none is in env
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_tek_boss_2026';

// ─── Helper: Send email via Resend ──────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not set — skipping email send');
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
        if (!res.ok) {
            console.error('[Email] Resend error:', data);
            return false;
        }
        console.log('[Email] Sent to', to, '— id:', data.id);
        return true;
    } catch (err) {
        console.error('[Email] Send failed:', err.message);
        return false;
    }
}

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
export const requireAuth = (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) {
        req.user = null;
        return next(); // We don't block, just set req.user so controllers know if logged in
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

export const requireStrictAuth = (req, res, next) => {
    requireAuth(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        next();
    });
};

// ─── ROUTES ─────────────────────────────────────────────────────────────────

// Register
router.post('/register', async (req, res) => {
    const { email, password, fullName, recaptchaToken } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    // ── reCAPTCHA v3 — log only, non-blocking ────────────────────────────────
    // New domains receive low scores from Google regardless of legitimacy.
    // We log to monitor and can enforce later once the domain has history.
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
    if (RECAPTCHA_SECRET && recaptchaToken) {
        try {
            const verifyRes = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
                { method: 'POST' }
            );
            const verifyData = await verifyRes.json();
            console.log(`[reCAPTCHA] score=${verifyData.score} success=${verifyData.success} errors=${verifyData['error-codes']}`);
        } catch (captchaErr) {
            console.error('reCAPTCHA check error:', captchaErr.message);
        }
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();

        const stmt = db.prepare('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)');
        stmt.run(id, email.toLowerCase(), hash, fullName || '');

        const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('jwt', token, { httpOnly: true, secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: isProduction ? 'strict' : 'lax' });

        res.json({ message: 'Registered successfully', user: { id, email, fullName } });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already in use.' });
        }
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email.toLowerCase());

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('jwt', token, { httpOnly: true, secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: isProduction ? 'strict' : 'lax' });

        res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, fullName: user.full_name } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Get Current User (Me)
router.get('/me', requireStrictAuth, (req, res) => {
    const stmt = db.prepare('SELECT id, email, full_name, created_at FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: 'Logged out successfully' });
});

// ─── Forgot Password — sends reset link via email ───────────────────────────
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    // Always return success to prevent email enumeration
    res.json({ message: 'If that email is registered, a reset link is on its way.' });

    // Do the work async after responding
    try {
        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (!user) return; // Silently do nothing — don't reveal if email exists

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

        // Store token in DB (add columns if not yet present)
        try {
            db.exec(`ALTER TABLE users ADD COLUMN reset_token TEXT`);
            db.exec(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME`);
        } catch { /* columns already exist */ }

        db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
            .run(token, expires, user.id);

        const BASE_URL = process.env.BASE_URL || 'https://tekboss.ai';
        const resetUrl = `${BASE_URL}?reset_token=${token}`;

        await sendEmail({
            to: email,
            subject: 'Reset your TEK BOSS password',
            html: `
                <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#020817;color:#fff;padding:40px 32px;border-radius:16px;">
                    <div style="text-align:center;margin-bottom:32px;">
                        <div style="display:inline-flex;width:56px;height:56px;background:#0A0F2A;border-radius:14px;align-items:center;justify-content:center;">
                            <span style="font-weight:900;font-size:20px;color:#1818E8">TB</span>
                        </div>
                        <h1 style="color:#fff;font-size:22px;font-weight:900;margin:16px 0 4px;">Reset Your Password</h1>
                        <p style="color:#64748b;font-size:14px;margin:0;">You requested a password reset for TEK BOSS.ai</p>
                    </div>
                    <a href="${resetUrl}" style="display:block;background:#1818E8;color:#fff;text-align:center;padding:16px 24px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.05em;margin-bottom:24px;">
                        RESET MY PASSWORD →
                    </a>
                    <p style="color:#475569;font-size:13px;text-align:center;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
                    <p style="color:#475569;font-size:12px;text-align:center;margin-top:8px;">Or copy this link: <span style="color:#60a5fa;">${resetUrl}</span></p>
                </div>
            `,
        });
    } catch (err) {
        console.error('[forgot-password] Error:', err.message);
    }
});

// ─── Reset Password — validates token and sets new password ─────────────────
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required.' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    try {
        const user = db.prepare(
            'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > ?'
        ).get(token, new Date().toISOString());

        if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired.' });

        const hash = await bcrypt.hash(newPassword, 10);
        db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
            .run(hash, user.id);

        // Auto-login after reset
        const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('jwt', jwtToken, { httpOnly: true, secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: isProduction ? 'strict' : 'lax' });

        res.json({ message: 'Password reset successfully.', user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── Admin Reset — protected by ADMIN_SECRET env var ───────────────────────
// Usage: POST /api/auth/admin-reset  { adminKey, email, newPassword }
router.post('/admin-reset', async (req, res) => {
    const { adminKey, email, newPassword } = req.body;
    const ADMIN_SECRET = process.env.ADMIN_SECRET;
    if (!ADMIN_SECRET || adminKey !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Forbidden.' });
    }
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and newPassword required.' });

    try {
        const hash = await bcrypt.hash(newPassword, 10);
        const result = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
            .run(hash, email.toLowerCase());
        if (result.changes === 0) return res.status(404).json({ error: 'User not found.' });
        res.json({ message: `Password reset for ${email}.` });
    } catch (err) {
        console.error('Admin reset error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── Change Password — requires current password ─────────────────────────────
router.post('/change-password', requireStrictAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required.' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

        const hash = await bcrypt.hash(newPassword, 10);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;

