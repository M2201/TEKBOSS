/**
 * THE TEK BOSS AI BLUEPRINT — Express Server
 * Orchestrates the AI consulting pipeline:
 * 
 * FREE FLOW:
 *   Stage 1: Intake Synthesizer    → Executive Summary
 *   Stage 2: Enablement Strategy   → Named Systems + AI Map
 *   Stage 3: Guardrails            → Validated Structured Data
 *   Stage 4: Preview Report        → Conversion-focused preview (FREE)
 * 
 * PAID FLOW ($599):
 *   Stage 5: Orchestration Playbook → Full execution-ready blueprint
 *   Stage 6: Implementation Assist. → Blueprint-grounded chat (90 days)
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { QUESTIONS } from './agents/prompts.js';
import { runIntakeSynthesizer } from './agents/intakeSynthesizer.js';
import { runEnablementStrategy } from './agents/enablementStrategy.js';
import { runGuardrails } from './agents/guardrails.js';
import { runPreviewReportGenerator } from './agents/previewReportGenerator.js';
import { runOrchestrationPlaybook } from './agents/orchestrationPlaybook.js';
import { runImplementationAssistant } from './agents/implementationAssistant.js';
import { runFollowUpGenerator } from './agents/followUpGenerator.js';
import authRouter, { requireStrictAuth, requireAuth } from './auth.js';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3005;
const API_KEY = process.env.GEMINI_API_KEY;

// ─── Stripe Setup ─────────────────────────────────────────────────────────────
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        product: 'The TEK BOSS AI Blueprint',
        agents: [
            'Intake Synthesizer',
            'Enablement Strategy',
            'Guardrails',
            'Preview Report',
            'Orchestration Playbook',
            'Implementation Assistant'
        ],
        apiKey: API_KEY ? '✅ loaded' : '❌ MISSING'
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET QUESTIONS — sends the 23-question manifest to the frontend
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/questions', (req, res) => {
    res.json({ questions: QUESTIONS });
});

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC FOLLOW-UP — evaluates a single answer and optionally returns a follow-up
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/follow-up', async (req, res) => {
    const { originalQuestion, userAnswer, businessName, industry } = req.body;

    if (!originalQuestion || !userAnswer) {
        return res.status(400).json({ followUp: null });
    }

    if (!API_KEY) {
        return res.json({ followUp: null }); // fail gracefully if no key
    }

    try {
        const followUp = await runFollowUpGenerator(API_KEY, originalQuestion, userAnswer, businessName, industry);
        // Safety net: ensure NO_FOLLOWUP never leaks as a string to the client
        const safeFollowUp = (followUp && !followUp.includes('NO_FOLLOWUP')) ? followUp : null;
        return res.json({ followUp: safeFollowUp });
    } catch (err) {
        console.error('Follow-up error:', err.message);
        return res.json({ followUp: null });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE PREVIEW — FREE flow
// Stages 1→2→3→4: Intake → Strategy → Guardrails → Preview Report
// Returns the conversion-focused preview (no execution details)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/generate-preview', async (req, res) => {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid answers payload.' });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server.' });
    }

    console.log('\n══════════════════════════════════════════');
    console.log('  🧠 TEK BOSS — PREVIEW GENERATION START');
    console.log('══════════════════════════════════════════\n');

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    try {
        // Stage 1: Synthesize the Executive Summary
        console.log('📋 Stage 1: Intake Synthesizer running...');
        const executiveSummary = await runIntakeSynthesizer(API_KEY, answers);

        await delay(3000);

        // Stage 2: Build Enablement Strategy (Named Systems)
        console.log('💡 Stage 2: Enablement Strategy building...');
        const { strategyText } = await runEnablementStrategy(API_KEY, executiveSummary);

        await delay(3000);

        // Stage 3: Guardrails validation
        console.log('🛡️  Stage 3: Guardrails validating...');
        const validatedData = await runGuardrails(API_KEY, executiveSummary, strategyText);

        await delay(3000);

        // Stage 4: Generate Preview Report
        console.log('📊 Stage 4: Preview Report generating...');
        const previewReport = await runPreviewReportGenerator(API_KEY, executiveSummary, strategyText, validatedData);

        console.log('\n✅ PREVIEW GENERATION COMPLETE\n');

        return res.json({
            previewReport,
            // Store internally for later blueprint generation (not sent to user in detail)
            _internal: {
                executiveSummary,
                enablementStrategy: strategyText,
                validatedData,
            },
            generatedAt: new Date().toISOString(),
        });

    } catch (err) {
        console.error('💥 Preview generation failed:', err);
        return res.status(500).json({ error: 'Preview generation failed: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE BLUEPRINT — PAID flow ($599)
// Stage 5: Takes pre-validated data → generates full Orchestration Playbook
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/generate-blueprint', async (req, res) => {
    const { executiveSummary, enablementStrategy, validatedData } = req.body;

    if (!executiveSummary || !enablementStrategy) {
        return res.status(400).json({ error: 'Missing required data for blueprint generation.' });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server.' });
    }

    console.log('\n══════════════════════════════════════════');
    console.log('  🧠 TEK BOSS — BLUEPRINT GENERATION START');
    console.log('══════════════════════════════════════════\n');

    try {
        // Stage 5: Orchestration Playbook
        console.log('📈 Stage 5: Orchestration Playbook generating...');
        const playbookData = await runOrchestrationPlaybook(
            API_KEY,
            executiveSummary,
            enablementStrategy,
            validatedData || {}
        );

        console.log('\n✅ BLUEPRINT COMPLETE\n');

        return res.json({
            diyPlaybook: playbookData.diyPlaybook,
            sowPlaybook: playbookData.sowPlaybook,
            generatedAt: new Date().toISOString(),
        });

    } catch (err) {
        console.error('💥 Blueprint generation failed:', err);
        return res.status(500).json({ error: 'Blueprint generation failed: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// IMPLEMENTATION ASSISTANT — Blueprint-grounded chat
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/assistant', async (req, res) => {
    const { blueprintId, message, conversationHistory } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server.' });
    }

    try {
        // Build blueprint context from stored data or from request
        let blueprintContext = req.body.blueprintContext || {};

        // If blueprintId provided and user is authenticated, load from DB
        if (blueprintId) {
            try {
                const stmt = db.prepare('SELECT * FROM blueprints WHERE id = ?');
                const bp = stmt.get(blueprintId);
                if (bp) {
                    const validatedData = bp.validated_data ? JSON.parse(bp.validated_data) : {};
                    blueprintContext = {
                        businessName: validatedData.brandFoundation?.missionStatement?.split(' ')[0] || 'Your Business',
                        systems: validatedData.namedSystems || [],
                        goals: validatedData.opportunityZones || [],
                        brandVoice: validatedData.brandFoundation?.emotionalTone?.join(', ') || '',
                        constraints: validatedData.brandFoundation?.doNotSayLanguage || [],
                        fullBlueprint: bp.diy_playbook || '',
                    };
                }
            } catch (dbErr) {
                console.error('Failed to load blueprint from DB:', dbErr.message);
            }
        }

        const response = await runImplementationAssistant(
            API_KEY,
            blueprintContext,
            message,
            conversationHistory || []
        );

        return res.json({ response, generatedAt: new Date().toISOString() });

    } catch (err) {
        console.error('💥 Assistant error:', err);
        return res.status(500).json({ error: 'Assistant failed: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DFY REQUEST — Captures Done-For-You implementation interest
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/request-dfy', async (req, res) => {
    const { blueprintId, systemContext, contactEmail, businessName } = req.body;

    try {
        const id = crypto.randomUUID();
        const userId = req.body.userId || 'anonymous';

        const contextData = JSON.stringify({
            businessName: businessName || '',
            contactEmail: contactEmail || '',
            systemContext: systemContext || '',
            requestedAt: new Date().toISOString(),
        });

        const stmt = db.prepare(`
            INSERT INTO dfy_requests (id, user_id, blueprint_id, system_context, status)
            VALUES (?, ?, ?, ?, 'pending')
        `);

        stmt.run(id, userId, blueprintId || null, contextData);

        console.log(`📩 DFY Request received — ID: ${id}`);

        return res.json({
            message: 'Your implementation request has been received. Our team will evaluate your blueprint and provide a custom scope and quote.',
            requestId: id,
        });
    } catch (err) {
        console.error('DFY request error:', err);
        return res.status(500).json({ error: 'Failed to submit request.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINTS (SAVING & LOADING)
// ─────────────────────────────────────────────────────────────────────────────

// Save a generated blueprint to the user's account
app.post('/api/blueprints', requireStrictAuth, (req, res) => {
    const {
        answers, executiveSummary, enablementStrategy, validatedData,
        previewReport, diyPlaybook, sowPlaybook
    } = req.body;

    if (!answers) {
        return res.status(400).json({ error: 'Missing blueprint data to save.' });
    }

    try {
        const id = crypto.randomUUID();
        const assistantExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

        const stmt = db.prepare(`
            INSERT INTO blueprints 
            (id, user_id, answers, executive_summary, enablement_strategy, validated_data, preview_report, diy_playbook, sow_playbook, paid_at, assistant_expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            req.user.id,
            JSON.stringify(answers),
            executiveSummary || '',
            enablementStrategy || '',
            validatedData ? JSON.stringify(validatedData) : '',
            previewReport || '',
            diyPlaybook || '',
            sowPlaybook || '',
            diyPlaybook ? new Date().toISOString() : null,
            diyPlaybook ? assistantExpiresAt : null,
        );

        res.json({
            message: 'Blueprint saved securely to your account.',
            blueprintId: id,
            assistantExpiresAt: diyPlaybook ? assistantExpiresAt : null,
        });
    } catch (err) {
        console.error('Error saving blueprint:', err);
        res.status(500).json({ error: 'Failed to save blueprint.' });
    }
});

// Get user's saved blueprints
app.get('/api/blueprints', requireStrictAuth, (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, created_at, paid_at, assistant_expires_at FROM blueprints WHERE user_id = ? ORDER BY created_at DESC');
        const blueprints = stmt.all(req.user.id);
        res.json({ blueprints });
    } catch (err) {
        console.error('Error fetching blueprints:', err);
        res.status(500).json({ error: 'Failed to fetch blueprints.' });
    }
});

// Load a specific blueprint
app.get('/api/blueprints/:id', requireStrictAuth, (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM blueprints WHERE id = ? AND user_id = ?');
        const blueprint = stmt.get(req.params.id, req.user.id);

        if (!blueprint) return res.status(404).json({ error: 'Blueprint not found.' });

        // Parse JSON fields
        blueprint.answers = JSON.parse(blueprint.answers);
        if (blueprint.validated_data) {
            try { blueprint.validated_data = JSON.parse(blueprint.validated_data); } catch (e) {}
        }

        res.json({ blueprint });
    } catch (err) {
        console.error('Error fetching blueprint:', err);
        res.status(500).json({ error: 'Failed to fetch blueprint.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE CHECKOUT — Create a $599 one-time payment session
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in .env.' });
    }

    try {
        const { businessName } = req.body;
        const origin = req.headers.origin || `http://localhost:${PORT}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'The TEK BOSS AI Blueprint',
                        description: 'Complete AI Business Operating System — Named Systems, 90-Day Roadmap, Tool Stack, Prompt Templates, SOW, and 90 days Implementation Assistant access.',
                    },
                    unit_amount: 59900, // $599.00 in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?payment=cancelled`,
            metadata: {
                product: 'tek-boss-ai-blueprint',
                businessName: businessName || 'Unknown',
            },
        });

        console.log(`💳 Stripe Checkout session created: ${session.id}`);
        return res.json({ url: session.url });

    } catch (err) {
        console.error('💥 Stripe checkout error:', err.message);
        return res.status(500).json({ error: 'Failed to create checkout session: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY PAYMENT — Confirm a Stripe session was paid before generating blueprint
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/verify-payment', async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured.' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing session_id.' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            console.log(`✅ Payment verified for session: ${sessionId}`);
            return res.json({
                paid: true,
                customerEmail: session.customer_details?.email || null,
                businessName: session.metadata?.businessName || null,
            });
        } else {
            console.log(`❌ Payment NOT complete for session: ${sessionId} (status: ${session.payment_status})`);
            return res.json({ paid: false, status: session.payment_status });
        }
    } catch (err) {
        console.error('💥 Payment verification error:', err.message);
        return res.status(500).json({ error: 'Failed to verify payment: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY COMPATIBILITY — redirect old endpoints
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/generate-briefing', async (req, res) => {
    // Redirect to new preview endpoint
    console.log('⚠️ Legacy /api/generate-briefing called — redirecting to /api/generate-preview');
    return res.redirect(307, '/api/generate-preview');
});

app.post('/api/generate-playbook', async (req, res) => {
    // Redirect to new blueprint endpoint
    console.log('⚠️ Legacy /api/generate-playbook called — redirecting to /api/generate-blueprint');
    return res.redirect(307, '/api/generate-blueprint');
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION STATIC SERVING — serve built frontend from ../dist
// ─────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

// Serve static assets (JS, CSS, images)
app.use(express.static(distPath));

// SPA catch-all: any non-API route serves index.html
app.get('*', (req, res, next) => {
    // Skip API routes — let the API 404 handler catch those
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING — prevent stack trace leaks in production
// ─────────────────────────────────────────────────────────────────────────────

// Catch-all for unknown API routes
app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.path}` });
});

// JSON parse errors (malformed request bodies)
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON in request body.' });
    }
    // Generic server error — no stack traces
    console.error('💥 Unhandled error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
    console.log(`\n🧠 The TEK BOSS AI Blueprint — Server Online — port ${PORT}`);
    console.log(`   Gemini API Key: ${API_KEY ? '✅ loaded' : '❌ MISSING'}`);
    console.log(`   Stripe:         ${stripe ? '✅ loaded (test mode)' : '❌ MISSING'}`);
    console.log(`   Routes:`);
    console.log(`     /api/health | /api/questions | /api/follow-up`);
    console.log(`     /api/generate-preview | /api/generate-blueprint`);
    console.log(`     /api/create-checkout-session | /api/verify-payment`);
    console.log(`     /api/assistant | /api/request-dfy`);
    console.log(`     /api/blueprints\n`);
});

// Keep connections alive for up to 5 minutes — Gemini generation can take 30-90s
// and Node's default keepAliveTimeout can drop long-running requests mid-stream.
server.keepAliveTimeout = 300000;
server.headersTimeout = 306000;
