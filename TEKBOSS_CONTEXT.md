# TekBoss.ai — Project Context File
> Last updated: 2026-04-26 | Read this at the start of every AI coding session.

---

## 🚀 Deployment

| Key | Value |
|---|---|
| **Live URL** | https://tekboss.ai |
| **Platform** | Railway |
| **Repo** | Connected to Railway via GitHub (push to `main` = auto-deploy) |
| **Database** | SQLite via `better-sqlite3` — persistent volume mounted at `tekboss.db` |
| **Build** | `npm run build` (Vite) then `node server/index.js` |

---

## 🔑 Required Environment Variables (Railway)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini AI (model: `gemini-2.5-flash`) |
| `JWT_SECRET` | Auth token signing |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 (currently log-only / non-blocking — new domain) |
| `RESEND_API_KEY` | Email delivery for password reset flows |
| `ADMIN_SECRET` | Admin endpoint for emergency account reset |
| `BASE_URL` | `https://tekboss.ai` |
| `GOOGLE_CLIENT_ID` | Google Drive OAuth |
| `GOOGLE_CLIENT_SECRET` | Google Drive OAuth |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Google Drive OAuth |
| `STRIPE_SECRET_KEY` | Payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook validation |

---

## 🗂️ Key File Map

```
/server
  index.js              ← Main Express server, all API routes
  auth.js               ← JWT auth, login/register/forgot/reset/change-password
  db.js                 ← SQLite schema + migrations
  /agents
    prompts.js          ← ALL AI prompts (23-question intake, 6-stage pipeline)
    orchestrationPlaybook.js ← Stage 5: Full blueprint generation (65,536 tokens)
    pdfGenerator.js     ← PDFKit blueprint renderer
    driveUploader.js    ← Google Drive package delivery (root folder ID: 1V4rQpXzG8PmyLWbC7FWPptWv2_gwk4mU)
    intakeSynthesizer.js
    enablementStrategy.js
    guardrails.js        ← Stage 3: Validates → structured JSON (namedSystems, etc.)
    brandDnaGenerator.js
    marketScout.js
    noiseFilter.js       ← ROI calculator
    growthForecaster.js  ← 90-day roadmap
    previewReportGenerator.js
    followUpGenerator.js
  /knowledge/tools/      ← Tool knowledge base for recommendations
/src
  App.jsx               ← Main React SPA (2,600+ lines) — ALL UI/UX
  PreviewReport.jsx     ← Free preview report component
  BlueprintLoader.jsx   ← Blueprint fetch/display
  IntelligenceEngineLoader.jsx
index.html              ← Splash screen lives here (cold-start fix)
```

---

## 🧠 AI Pipeline (6 Stages)

```
Intake (23 Qs) → Stage 1: intakeSynthesizer  → Executive Summary
               → Stage 2: enablementStrategy  → Named Systems Blueprint
               → Stage 3: guardrails          → Validated JSON (namedSystems[], etc.)
               → Stage 4: previewReportGen    → Free teaser (JSON)
               → Stage 5: orchestrationPlaybook → Full DIY + SOW (65,536 tokens)
                 + Parallel: brandDna, marketScout, noiseFilter, growthForecaster
```

**Google Drive delivery:** Each blueprint → `Tek Boss - Blueprints/[Name] — [Biz] — [Date]/`
- `01 — Intake Summary.txt`
- `02 — Statement of Work.pdf`
- `03 — AI Build Spec.json`
- `04 — Implementation Playbook.txt`

---

## 🔐 Auth System

- JWT tokens in httpOnly cookies (`secure: true`, `sameSite: 'strict'` in prod)
- **reCAPTCHA:** Currently log-only (non-blocking) — revert to blocking once domain has 2+ weeks of traffic
- **Password flows:** Login → Forgot Password (Resend email) → Reset token → New password
- **Admin reset:** `POST /api/auth/admin-reset` with `{adminKey, email, newPassword}` — emergency bypass
- **Change password:** `POST /api/auth/change-password` — requires current password (logged-in users)
- **`requireStrictAuth` middleware** guards all paid/sensitive endpoints

---

## 💳 Subscription / Paywall

- Stripe integration for paid blueprint access
- Free tier: 23-question interview + Preview Report
- Paid tier: Full Blueprint PDF + Google Drive delivery + Build-Out Coach (AI assistant)

---

## 📱 Mobile Fixes (2026-04-26)

- Sidebar: `hidden md:flex` — only shows on tablet+ (was always visible, crushed mobile layout)
- Mobile brand bar: added at top of chat (logo + username tap → Change Password)
- Chat padding: `px-3 sm:px-6 md:px-8` (was `px-8` always)
- Input footer: same responsive padding

---

## ⚠️ Git Push — Known Limitation

**`git push` from AI terminal sessions does NOT work.**
- Both HTTPS (`github.com`) and SSH (port 22) are blocked
- Error: `fatal: unable to access ... Could not resolve host: github.com`
- This is a local firewall/security tool blocking terminal process outbound connections
- Browser traffic works fine — only terminal git push is affected
- **Workaround:** After committing in the AI session, user manually runs `git push origin main --tags` from their own Terminal app or GitHub Desktop
- **Do not waste time debugging this in future sessions — it is a known environment constraint**

---

## 📌 Current Version

| Field | Value |
|---|---|
| **Tag** | `v2.1.0` |
| **Commit** | `3a4f278` |
| **Date** | 2026-04-26 |
| **Status** | Pipeline Stabilization — stable rollback point |

**To roll back:** `git checkout v2.1.0`

---

## 🐛 Known Issues / Watch List

- **reCAPTCHA trust building:** Monitor `/api/auth` logs for score values. Once scores regularly > 0.5, re-enable blocking mode in `server/auth.js` (change `if (score < 0.3)` from log-only to blocking)
- **Cold starts:** Splash screen in `index.html` bridges the gap. UptimeRobot pinging `/api/health` every 5 min prevents cold starts entirely
- **Blueprint token limit:** Now 65,536 — previous sessions used 8,192 (caused truncation/gaps)
- **Named systems in PDF:** Fixed 2026-04-26 (was hardcoded `[]`)

---

## 🔄 How to Use This File

**At the start of every session:** Say "Read TEKBOSS_CONTEXT.md before we begin" or just reference it.
**After major changes:** Ask me to update this file with what changed.
**This file lives in the repo** so Railway deployments always have it accessible.
