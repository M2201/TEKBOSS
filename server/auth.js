import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from './db.js';

const router = express.Router();
// Use a fallback secret for local dev if none is in env
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_tek_boss_2026';

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

    // ── reCAPTCHA v3 verification ─────────────────────────────────────────────
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
    if (RECAPTCHA_SECRET && recaptchaToken) {
        try {
            const verifyRes = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
                { method: 'POST' }
            );
            const verifyData = await verifyRes.json();
            if (!verifyData.success || verifyData.score < 0.5) {
                console.warn('⚠️  reCAPTCHA failed — score:', verifyData.score, verifyData['error-codes']);
                return res.status(403).json({ error: 'Bot check failed. Please try again.' });
            }
            console.log('✅ reCAPTCHA passed — score:', verifyData.score);
        } catch (captchaErr) {
            console.error('reCAPTCHA verification error:', captchaErr.message);
            // Non-fatal: allow registration if the captcha check itself fails (network issue)
        }
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();

        const stmt = db.prepare('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)');
        stmt.run(id, email.toLowerCase(), hash, fullName || '');

        const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('jwt', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

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
        res.cookie('jwt', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

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

export default router;
