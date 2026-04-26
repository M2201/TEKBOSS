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
import { runBrandDnaGenerator } from './agents/brandDnaGenerator.js';
import { runMarketScout } from './agents/marketScout.js';
import { runNoiseFilter } from './agents/noiseFilter.js';
import { runGrowthForecaster } from './agents/growthForecaster.js';
import { generateBlueprintPdf } from './agents/pdfGenerator.js';
import { uploadBlueprintToDrive, deliverBlueprintPackage, isDriveConfigured } from './agents/driveUploader.js';
import { logAiCall } from './agents/aiLogger.js';
import { selectToolsWithLlm } from './knowledge/llmToolSelector.js';
import { runTaskGenerator } from './agents/taskGenerator.js';
import {
    isCalendarConfigured, getCalendarAuthUrl, exchangeCodeAndSave,
    getCalendarStatus, createTaskEvent, deleteTaskEvent,
} from './calendarSync.js';
import authRouter, { requireStrictAuth, requireAuth } from './auth.js';
import db from './db.js';


const app = express();
const PORT = process.env.PORT || 3005;
const API_KEY = process.env.GEMINI_API_KEY;

// ─── Stripe Setup ─────────────────────────────────────────────────────────────
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET, {
    httpClient: Stripe.createFetchHttpClient(),
}) : null;

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

        await delay(2000);

        // Stage 3.5: Parallel enrichment — Brand DNA + Market Scout + Noise Filter
        // These run concurrently and are non-fatal (null on failure)
        console.log('🧠 Stage 3.5: Running parallel enrichment agents...');
        const [brandDna, marketIntel, roiData] = await Promise.allSettled([
            runBrandDnaGenerator(API_KEY, executiveSummary, answers),
            runMarketScout(API_KEY, executiveSummary, answers),
            runNoiseFilter(API_KEY, executiveSummary, validatedData, answers),
        ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

        if (brandDna) console.log('✅ Brand DNA complete');
        if (marketIntel) console.log('✅ Market Scout complete');
        if (roiData) console.log('✅ Noise Filter complete');

        await delay(1500);

        // Stage 3.6: Growth Forecaster — synthesizes 3.5 outputs into a phased roadmap
        // Runs after 3.5 so it can consume marketIntel and roiData
        console.log('📈 Stage 3.6: Growth Forecaster building roadmap...');
        let growthData = null;
        try {
            growthData = await runGrowthForecaster(API_KEY, executiveSummary, strategyText, validatedData, marketIntel, roiData);
            if (growthData && !growthData.error) console.log('✅ Growth Forecaster complete');
            else console.warn('⚠️  Growth Forecaster returned fallback');
        } catch (gfErr) {
            console.warn('⚠️  Growth Forecaster failed (non-fatal):', gfErr.message);
        }

        await delay(1000);

        // Stage 4: Generate Preview Report (now receives roiData for accurate stat.value)
        console.log('📊 Stage 4: Preview Report generating...');
        const previewReport = await runPreviewReportGenerator(API_KEY, executiveSummary, strategyText, validatedData, roiData);

        console.log('\n✅ PREVIEW GENERATION COMPLETE\n');

        return res.json({
            previewReport,
            // Store internally for later blueprint generation (not sent to user in detail)
            _internal: {
                executiveSummary,
                enablementStrategy: strategyText,
                validatedData,
                brandDna:    brandDna    || null,
                marketIntel: marketIntel || null,
                roiData:     roiData     || null,
                growthData:  growthData  || null,
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
    const { executiveSummary, enablementStrategy, validatedData, brandDna, marketIntel, roiData, growthData } = req.body;

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
            validatedData || {},
            marketIntel   || null,
            roiData       || null,
            growthData    || null
        );

        console.log('\n✅ BLUEPRINT COMPLETE\n');

        return res.json({
            diyPlaybook:  playbookData.diyPlaybook,
            sowPlaybook:  playbookData.sowPlaybook,
            _warning:     playbookData._warning || null,
            brandDna:     brandDna    || null,
            marketIntel:  marketIntel || null,
            roiData:      roiData     || null,
            generatedAt: new Date().toISOString(),
        });

    } catch (err) {
        console.error('💥 Blueprint generation failed:', err);
        return res.status(500).json({ error: 'Blueprint generation failed: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// SPEC JSON BUILDER — maps validatedData to canonical AI Build Spec format
// ─────────────────────────────────────────────────────────────────────────────
function buildSpecJson(validatedData = {}, businessName = '') {
    const vd = validatedData;

    // Derive phasedPriorities from namedSystems if guardrails didn't extract it
    const phasedPriorities = vd.phasedPriorities?.length
        ? vd.phasedPriorities
        : (vd.namedSystems || []).map((sys, idx) => ({
            phase: idx < Math.ceil((vd.namedSystems?.length || 3) / 3) ? 1
                 : idx < Math.ceil(2 * (vd.namedSystems?.length || 3) / 3) ? 2
                 : 3,
            zone: sys.name,
        }));

    return {
        _meta: {
            generatedBy: 'TEK BOSS AI Blueprint Engine',
            businessName: businessName || 'Unknown',
            generatedAt: new Date().toISOString(),
            specVersion: '1.0',
            purpose: 'Machine-readable AI implementation spec for developer/partner use',
        },
        brandFoundation:      vd.brandFoundation      || {},
        opportunityZones:     vd.opportunityZones     || [],
        targetChannels:       vd.targetChannels       || [],
        requiredCapabilities: vd.requiredCapabilities || [],
        toolCategories:       vd.toolCategories       || [],
        existingToolStack:    vd.existingToolStack     || [],
        systemOfRecord:       vd.systemOfRecord       || null,
        humanControlPoints:   vd.humanControlPoints   || [],
        phasedPriorities,
        namedSystems:         vd.namedSystems         || [],
        topRisks:             vd.topRisks             || [],
        competitorInsights:   vd.competitorInsights   || [],
        businessHealth:       vd.businessHealth       || {},
        pricingTier:          vd.pricingTier          || null,
        validationFlags:      vd.validationFlags      || [],
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD SPEC JSON — generates AI Build Spec, uploads to Drive, streams file
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/download-spec', requireAuth, async (req, res) => {
    const { businessName, validatedData } = req.body;

    if (!validatedData) {
        return res.status(400).json({ error: 'No validated data provided for spec generation.' });
    }

    try {
        const spec = buildSpecJson(validatedData, businessName);
        const specJson = JSON.stringify(spec, null, 2);
        const specBuffer = Buffer.from(specJson, 'utf-8');

        const safeName = (businessName || 'TekBoss').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
        const fileName = `TekBoss_AIBuildSpec_${safeName}_${Date.now()}.json`;

        // Upload to Drive
        let driveLink = null;
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                const driveResult = await uploadBlueprintToDrive(specBuffer, fileName, 'application/json');
                driveLink = driveResult.webViewLink;
                console.log('☁️  Spec JSON Drive upload:', driveLink);
            } catch (driveErr) {
                console.error('⚠️  Spec Drive upload failed (file still delivered):', driveErr.message);
            }
        }

        if (driveLink) res.setHeader('X-Drive-Link', driveLink);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', specBuffer.length);
        console.log('✅ AI Build Spec ready:', fileName);
        return res.send(specBuffer);

    } catch (err) {
        console.error('💥 Spec generation failed:', err);
        return res.status(500).json({ error: 'Spec generation failed: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD PDF — generates PDF, uploads to Drive, returns link + streams file
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/download-pdf', requireAuth, async (req, res) => {
    const { businessName, previewReport, diyPlaybook, brandDna, marketIntel, roiData, namedSystems, generatedAt } = req.body;

    if (!previewReport) {
        return res.status(400).json({ error: 'No report data provided for PDF generation.' });
    }

    try {
        console.log('📄 Generating PDF for:', businessName);
        const pdfBuffer = await generateBlueprintPdf({
            businessName,
            previewReport,
            diyPlaybook,
            brandDna,
            marketIntel,
            roiData,
            namedSystems,
            generatedAt,
        });

        const safeName = (businessName || 'TekBoss').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
        const fileName = `TekBoss_Blueprint_${safeName}_${Date.now()}.pdf`;

        // Upload to Drive in background (non-blocking for download)
        let driveLink = null;
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                const driveResult = await uploadBlueprintToDrive(pdfBuffer, fileName);
                driveLink = driveResult.webViewLink;
                console.log('☁️  Drive upload complete:', driveLink);

                // Store drive link on the user's blueprint record if we have a user
                if (req.user?.id) {
                    try {
                        const stmt = db.prepare('UPDATE blueprints SET drive_link = ? WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
                        stmt.run(driveLink, req.user.id);
                    } catch (_) { /* non-fatal */ }
                }
            } catch (driveErr) {
                console.error('⚠️  Drive upload failed (PDF still delivered):', driveErr.message);
            }
        }

        // Set drive link header so frontend can pick it up
        if (driveLink) res.setHeader('X-Drive-Link', driveLink);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        console.log('✅ PDF ready — sending', pdfBuffer.length, 'bytes');
        return res.send(pdfBuffer);

    } catch (err) {
        console.error('💥 PDF generation failed:', err);
        return res.status(500).json({ error: 'PDF generation failed: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELIVER TO DRIVE — upload only (no PDF download), return shareable link
// Called after blueprint unlock to deliver file to client
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/deliver-to-drive', requireAuth, async (req, res) => {
    const { businessName, previewReport, diyPlaybook, brandDna, marketIntel, roiData, generatedAt } = req.body;

    if (!previewReport) {
        return res.status(400).json({ error: 'No report data to deliver.' });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        return res.status(503).json({ error: 'Google Drive delivery not configured.' });
    }

    try {
        const pdfBuffer = await generateBlueprintPdf({ businessName, previewReport, diyPlaybook, brandDna, marketIntel, roiData, generatedAt });
        const safeName  = (businessName || 'TekBoss').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
        const fileName  = `TekBoss_Blueprint_${safeName}_${Date.now()}.pdf`;

        const driveResult = await uploadBlueprintToDrive(pdfBuffer, fileName);
        console.log('✅ Blueprint delivered to Drive:', driveResult.webViewLink);

        return res.json({
            success: true,
            driveLink:   driveResult.webViewLink,
            downloadLink: driveResult.webContentLink,
            fileName:    driveResult.name,
        });

    } catch (err) {
        console.error('💥 Drive delivery failed:', err);
        return res.status(500).json({ error: 'Drive delivery failed: ' + err.message });
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
                        businessName: validatedData.businessName || 'Your Business',
                        validated_data: validatedData,
                        diy_playbook: bp.diy_playbook || '',
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

        // ─── Auto-deliver 4-file blueprint package to Drive ───────────────────
        if (isDriveConfigured()) {
            const parsedAnswers  = typeof answers === 'string' ? JSON.parse(answers) : answers;
            const rawBizName     = parsedAnswers?.[1] || 'Unknown';
            const bizName        = rawBizName
                .replace(/https?:\/\/[^\s,()[\]]+/gi, '')
                .replace(/\bwww\.[^\s,()[\]]+/gi, '')
                .replace(/\([^)]*\)/g, '')
                .split(/[,—–\-|]/)[0]
                .trim().replace(/\s+/g, ' ') || 'Unknown';

            // Fetch customer's full name from users table
            const userRow     = db.prepare('SELECT full_name, email FROM users WHERE id = ?').get(req.user.id);
            const customerName = userRow?.full_name || userRow?.email || 'Unknown Customer';

            const previewReportData = typeof previewReport === 'string'
                ? (() => { try { return JSON.parse(previewReport); } catch { return previewReport; } })()
                : previewReport;

            setImmediate(async () => {
                try {
                    // Generate Statement of Work PDF
                    const vd = validatedData
                        ? (typeof validatedData === 'string' ? JSON.parse(validatedData) : validatedData)
                        : null;
                    const pdfBuffer = await generateBlueprintPdf({
                        businessName:  bizName,
                        previewReport: previewReportData,
                        diyPlaybook:   diyPlaybook || '',
                        brandDna:      brandDna      || null,
                        marketIntel:   marketIntel   || null,
                        roiData:       roiData        || null,
                        namedSystems:  vd?.namedSystems || [],
                        generatedAt:   new Date().toISOString(),
                    });

                    // Build Spec JSON (vd already parsed above)
                    const specJson = vd ? buildSpecJson(vd, bizName) : null;

                    // Deliver full package → customer subfolder in Drive
                    const pkg = await deliverBlueprintPackage({
                        customerName,
                        businessName:  bizName,
                        pdfBuffer,
                        specJson,
                        intakeSummary: executiveSummary || '',
                        playbook:      diyPlaybook || '',
                    });

                    // Save the folder link on the blueprint record
                    try {
                        db.prepare('UPDATE blueprints SET drive_link = ? WHERE id = ?')
                          .run(pkg.folderLink, id);
                    } catch (_) { /* non-fatal */ }

                    console.log(`☁️  Blueprint package delivered for ${customerName} / ${bizName}`);
                } catch (driveErr) {
                    console.error('⚠️  Auto Drive delivery failed (non-fatal):', driveErr.message);
                }
            });
        }
        // ─────────────────────────────────────────────────────────────────────

        // ─── Fire task generation async (non-blocking) ────────────────────────
        if (diyPlaybook && validatedData) {
            setImmediate(async () => {
                try {
                    const vdForTasks = typeof validatedData === 'string'
                        ? JSON.parse(validatedData)
                        : validatedData;
                    const parsedAns  = typeof answers === 'string' ? JSON.parse(answers) : answers;
                    const bName      = parsedAns?.[1]?.replace(/https?:\/\/[^\s,()[\]]+/gi, '').split(/[,—–\-|]/)[0].trim() || 'Your Business';
                    await runTaskGenerator({
                        blueprintId: id,
                        userId: req.user.id,
                        namedSystems: vdForTasks?.namedSystems || [],
                        businessName: bName,
                    });
                } catch (taskErr) {
                    console.error('⚠️  Task generation failed (non-fatal):', taskErr.message);
                }
            });
        }
        // ─────────────────────────────────────────────────────────────────────

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

// Get the Drive folder link for the user's most recent blueprint (polled by frontend)
app.get('/api/blueprint/drive-link', requireStrictAuth, (req, res) => {
    try {
        const row = db.prepare(
            'SELECT id, drive_link FROM blueprints WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        ).get(req.user.id);
        res.json({ driveLink: row?.drive_link || null, ready: !!row?.drive_link });
    } catch (err) {
        res.status(500).json({ driveLink: null, ready: false });
    }
});

// Get user's saved blueprints
app.get('/api/blueprints', requireStrictAuth, (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, created_at, paid_at, assistant_expires_at, tasks_generated, brand_theme_applied FROM blueprints WHERE user_id = ? ORDER BY created_at DESC');
        const blueprints = stmt.all(req.user.id);
        res.json({ blueprints });
    } catch (err) {
        console.error('Error fetching blueprints:', err);
        res.status(500).json({ error: 'Failed to fetch blueprints.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// TASK API — Get, update, and track task progress
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/tasks/:blueprintId — return all tasks + progress for this blueprint
app.get('/api/tasks/:blueprintId', requireStrictAuth, (req, res) => {
    try {
        const { blueprintId } = req.params;

        // Verify blueprint belongs to this user
        const bp = db.prepare('SELECT id FROM blueprints WHERE id = ? AND user_id = ?')
                     .get(blueprintId, req.user.id);
        if (!bp) return res.status(404).json({ error: 'Blueprint not found.' });

        const tasks    = db.prepare('SELECT * FROM user_tasks WHERE blueprint_id = ? AND user_id = ? ORDER BY id ASC')
                           .all(blueprintId, req.user.id);
        const progress = db.prepare('SELECT * FROM user_progress WHERE blueprint_id = ? AND user_id = ?')
                           .get(blueprintId, req.user.id);

        res.json({ tasks, progress: progress || { total_tasks: tasks.length, done_tasks: 0 } });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
});

// PATCH /api/tasks/:taskId — update status, due_date, notes, calendar_event_id
app.patch('/api/tasks/:taskId', requireStrictAuth, (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, due_date, notes, calendar_event_id } = req.body;

        // Verify task belongs to this user
        const task = db.prepare('SELECT * FROM user_tasks WHERE id = ? AND user_id = ?')
                       .get(taskId, req.user.id);
        if (!task) return res.status(404).json({ error: 'Task not found.' });

        const now = new Date().toISOString();
        const completedAt = status === 'done' ? now : (status === 'pending' || status === 'in_progress' ? null : task.completed_at);

        db.prepare(`
            UPDATE user_tasks SET
                status            = COALESCE(?, status),
                due_date          = COALESCE(?, due_date),
                notes             = COALESCE(?, notes),
                calendar_event_id = COALESCE(?, calendar_event_id),
                completed_at      = ?
            WHERE id = ? AND user_id = ?
        `).run(status, due_date, notes, calendar_event_id, completedAt, taskId, req.user.id);

        // Recalculate progress
        const doneTasks = db.prepare(
            'SELECT COUNT(*) as cnt FROM user_tasks WHERE blueprint_id = ? AND user_id = ? AND status = \'done\''
        ).get(task.blueprint_id, req.user.id);

        db.prepare(`
            INSERT INTO user_progress (user_id, blueprint_id, done_tasks, last_active, updated_at)
            VALUES (?, ?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(user_id, blueprint_id) DO UPDATE SET
                done_tasks  = excluded.done_tasks,
                last_active = excluded.last_active,
                updated_at  = excluded.updated_at
        `).run(req.user.id, task.blueprint_id, doneTasks.cnt);

        const updatedTask = db.prepare('SELECT * FROM user_tasks WHERE id = ?').get(taskId);
        const progress    = db.prepare('SELECT * FROM user_progress WHERE blueprint_id = ? AND user_id = ?')
                             .get(task.blueprint_id, req.user.id);

        res.json({ task: updatedTask, progress });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Failed to update task.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE CALENDAR API
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/calendar/status — is calendar connected for this user?
app.get('/api/calendar/status', requireStrictAuth, (req, res) => {
    if (!isCalendarConfigured()) return res.json({ connected: false, configured: false });
    const status = getCalendarStatus(req.user.id);
    res.json({ ...status, configured: true });
});

// GET /api/calendar/auth-url — returns the Google OAuth URL
app.get('/api/calendar/auth-url', requireStrictAuth, (req, res) => {
    if (!isCalendarConfigured()) {
        return res.status(503).json({ error: 'Google Calendar is not configured on this server.' });
    }
    const url = getCalendarAuthUrl(req.user.id);
    res.json({ url });
});

// GET /api/calendar/callback — Google redirects here after user grants access
// Note: this is a server-side redirect (no auth middleware — it IS the auth step)
app.get('/api/calendar/callback', async (req, res) => {
    const { code, state, error } = req.query;
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

    if (error || !code || !state) {
        console.error('[Calendar] OAuth callback error:', error || 'missing code/state');
        return res.redirect(`${BASE_URL}?calendar=error`);
    }

    try {
        await exchangeCodeAndSave(code, state);
        res.redirect(`${BASE_URL}?calendar=connected`);
    } catch (err) {
        console.error('[Calendar] Token exchange failed:', err.message);
        res.redirect(`${BASE_URL}?calendar=error`);
    }
});

// POST /api/tasks/:taskId/schedule — create a Calendar event for a task
app.post('/api/tasks/:taskId/schedule', requireStrictAuth, async (req, res) => {
    const { taskId } = req.params;
    const { startIso, durationMins } = req.body;

    if (!startIso) return res.status(400).json({ error: 'startIso is required (ISO 8601 datetime).' });

    const task = db.prepare('SELECT * FROM user_tasks WHERE id = ? AND user_id = ?')
                   .get(taskId, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const status = getCalendarStatus(req.user.id);
    if (!status.connected) return res.status(403).json({ error: 'Google Calendar not connected. Connect from the dashboard first.' });

    try {
        // Delete old event if rescheduling
        if (task.calendar_event_id) {
            await deleteTaskEvent(req.user.id, taskId);
        }

        const event = await createTaskEvent(req.user.id, {
            taskId,
            title:       task.title,
            description: task.description,
            startIso,
            durationMins: durationMins || 60,
        });

        const updatedTask = db.prepare('SELECT * FROM user_tasks WHERE id = ?').get(taskId);
        res.json({ task: updatedTask, event: { id: event.id, htmlLink: event.htmlLink } });
    } catch (err) {
        console.error('[Calendar] Schedule task failed:', err.message);
        res.status(500).json({ error: 'Failed to schedule task in Google Calendar.' });
    }
});

// DELETE /api/tasks/:taskId/schedule — remove the Calendar event
app.delete('/api/tasks/:taskId/schedule', requireStrictAuth, async (req, res) => {
    const { taskId } = req.params;
    try {
        await deleteTaskEvent(req.user.id, taskId);
        const updatedTask = db.prepare('SELECT * FROM user_tasks WHERE id = ?').get(taskId);
        res.json({ task: updatedTask });
    } catch (err) {
        console.error('[Calendar] Unschedule failed:', err.message);
        res.status(500).json({ error: 'Failed to remove calendar event.' });
    }
});


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
// ADMIN — AI Observability Logs
// Navigate to: GET /api/admin/logs  (add header: x-admin-secret: YOUR_ADMIN_SECRET)
// Shows: per-stage token usage, latency, success rates, recent errors
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/admin/logs', (req, res) => {
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Summary stats per stage
        const stageStats = db.prepare(`
            SELECT
                stage,
                COUNT(*) as total_calls,
                SUM(CASE WHEN error IS NULL THEN 1 ELSE 0 END) as successes,
                ROUND(AVG(CASE WHEN error IS NULL THEN latency_ms END)) as avg_latency_ms,
                ROUND(AVG(CASE WHEN error IS NULL THEN tokens_used END)) as avg_tokens,
                SUM(CASE WHEN has_sow_split = 1 THEN 1 ELSE 0 END) as sow_splits_succeeded,
                ROUND(AVG(CASE WHEN error IS NULL THEN output_length END)) as avg_output_length
            FROM ai_logs
            GROUP BY stage
            ORDER BY total_calls DESC
        `).all();

        // Recent 20 logs
        const recent = db.prepare(`
            SELECT id, stage, user_id, tokens_used, latency_ms, output_length,
                   has_sow_split, named_systems_count, error, metadata, created_at
            FROM ai_logs
            ORDER BY created_at DESC
            LIMIT 20
        `).all();

        // Top errors
        const topErrors = db.prepare(`
            SELECT stage, error, COUNT(*) as occurrences
            FROM ai_logs
            WHERE error IS NOT NULL
            GROUP BY stage, error
            ORDER BY occurrences DESC
            LIMIT 10
        `).all();

        res.json({ stageStats, recentLogs: recent, topErrors });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE CHECKOUT — $599 one-time + silent $34.99/mo subscription after 90 days
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
                        description: 'Complete AI Business Operating System — Named Systems, 90-Day Roadmap, Tool Stack, Prompt Templates, SOW, and 90-Day Guided Build-Out Assistant.',
                    },
                    unit_amount: 59900, // $599.00 in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            payment_intent_data: {
                setup_future_usage: 'off_session', // Save card for future $34.99/mo charges
            },
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
// VERIFY PAYMENT — Confirm payment, save card, create $34.99/mo subscription
// with 90-day free trial for the guided build-out assistant
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/verify-payment', requireAuth, async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured.' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: 'Missing session_id.' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent', 'payment_intent.payment_method'],
        });

        if (session.payment_status === 'paid') {
            console.log(`✅ Payment verified for session: ${sessionId}`);

            // ── Create $34.99/mo subscription with 90-day trial ──────────
            const userId = req.user?.id;
            if (userId && stripe) {
                try {
                    // Get or create Stripe customer
                    let customerId;
                    const existingUser = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(userId);
                    
                    if (existingUser?.stripe_customer_id) {
                        customerId = existingUser.stripe_customer_id;
                    } else {
                        const customer = await stripe.customers.create({
                            email: session.customer_details?.email,
                            metadata: { userId, businessName: session.metadata?.businessName },
                        });
                        customerId = customer.id;
                        db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, userId);
                    }

                    // Attach the payment method from the checkout to the customer
                    const paymentMethodId = session.payment_intent?.payment_method?.id || session.payment_intent?.payment_method;
                    if (paymentMethodId) {
                        try {
                            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
                            await stripe.customers.update(customerId, {
                                invoice_settings: { default_payment_method: paymentMethodId },
                            });
                        } catch (attachErr) {
                            // Payment method may already be attached
                            console.log('Payment method attach note:', attachErr.message);
                        }
                    }

                    // Create the $34.99/mo subscription with 90-day trial
                    const subscription = await stripe.subscriptions.create({
                        customer: customerId,
                        items: [{
                            price_data: {
                                currency: 'usd',
                                product_data: {
                                    name: 'TEK BOSS AI Instructor',
                                    description: 'Your AI Instructor — 60 days included with blueprint, then $49.99/month for continued access.',
                                },
                                recurring: { interval: 'month' },
                                unit_amount: 4999, // $49.99
                            },
                        }],
                        trial_period_days: 60, // 60-day included period before $49.99/mo kicks in
                        metadata: { userId, product: 'tek-boss-assistant' },
                    });

                    const trialEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
                    db.prepare(`UPDATE users SET 
                        stripe_subscription_id = ?, 
                        subscription_status = 'trialing',
                        subscription_ends_at = ?,
                        trial_started_at = datetime('now')
                        WHERE id = ?`
                    ).run(subscription.id, trialEnd, userId);

                    console.log(`🔁 Subscription created: ${subscription.id} (90-day trial, then $34.99/mo)`);
                } catch (subErr) {
                    // Don't block blueprint generation if subscription creation fails
                    console.error('⚠️ Subscription creation note:', subErr.message);
                }
            }

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
// SUBSCRIPTION STATUS — Check if assistant access is active
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/subscription-status', requireAuth, (req, res) => {
    if (!req.user) return res.json({ active: false, reason: 'not_authenticated' });

    try {
        const user = db.prepare('SELECT subscription_status, subscription_ends_at, trial_started_at FROM users WHERE id = ?').get(req.user.id);
        if (!user) return res.json({ active: false, reason: 'user_not_found' });

        const status = user.subscription_status || 'none';
        const endsAt = user.subscription_ends_at ? new Date(user.subscription_ends_at) : null;
        const now = new Date();

        // Active if trialing or active and not past end date
        const isActive = (status === 'trialing' || status === 'active') && (!endsAt || endsAt > now);
        const daysRemaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24))) : 0;
        const isWarningPeriod = daysRemaining > 0 && daysRemaining <= 10;

        return res.json({
            active: isActive,
            status,
            daysRemaining,
            endsAt: endsAt?.toISOString() || null,
            isWarningPeriod,
            monthlyRate: '$34.99',
        });
    } catch (err) {
        console.error('Subscription status error:', err);
        return res.status(500).json({ active: false, error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL SUBSCRIPTION — Cancel the $34.99/mo recurring charge
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/cancel-subscription', requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured.' });

    try {
        const user = db.prepare('SELECT stripe_subscription_id, subscription_ends_at FROM users WHERE id = ?').get(req.user.id);
        if (!user?.stripe_subscription_id) {
            return res.status(400).json({ error: 'No active subscription found.' });
        }

        // Cancel at period end so they keep access until the trial/period expires
        await stripe.subscriptions.update(user.stripe_subscription_id, {
            cancel_at_period_end: true,
        });

        db.prepare("UPDATE users SET subscription_status = 'cancelled' WHERE id = ?").run(req.user.id);

        console.log(`🚫 Subscription cancelled for user ${req.user.id}`);
        return res.json({
            cancelled: true,
            accessUntil: user.subscription_ends_at,
            message: 'Your assistant access will continue until the end of your current period. Your blueprint is yours forever.',
        });
    } catch (err) {
        console.error('Cancel subscription error:', err);
        return res.status(500).json({ error: 'Failed to cancel: ' + err.message });
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
// START SERVER (skip when imported by Vercel)
// ─────────────────────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
    // Always bind 0.0.0.0 so Railway's healthcheck can reach the server.
    // Binding to 127.0.0.1 (localhost-only) makes healthchecks fail in containers.
    const HOST = process.env.NODE_ENV === 'development' && !process.env.RAILWAY_ENVIRONMENT
        ? '127.0.0.1'
        : '0.0.0.0';
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
}

// Export for Vercel serverless
export default app;
