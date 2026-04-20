/**
 * TEK BOSS PDF GENERATOR
 * Creates a professional multi-page PDF blueprint using PDFKit.
 * Pure Node.js — no browser/Puppeteer required. Works on Railway.
 */
import PDFDocument from 'pdfkit';

// ─── Brand colors ────────────────────────────────────────────────────────────
const COLORS = {
  black:       '#0A0F1E',
  darkNavy:    '#0D1B2A',
  navy:        '#1B2B4B',
  blue:        '#1E6FE5',
  lightBlue:   '#60A5FA',
  skyBlue:     '#00BFFF',
  white:       '#FFFFFF',
  offWhite:    '#F8FAFC',
  slate:       '#94A3B8',
  slateLight:  '#CBD5E1',
  gold:        '#F59E0B',
  emerald:     '#10B981',
  charcoal:    '#1E293B',
};

// ─── Layout constants ─────────────────────────────────────────────────────────
const PAGE_W = 612;   // Letter width in points
const PAGE_H = 792;   // Letter height in points
const L_MARGIN = 50;
const R_MARGIN = 50;
const CONTENT_W = PAGE_W - L_MARGIN - R_MARGIN;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function fillRect(doc, x, y, w, h, hex) {
  doc.save().rect(x, y, w, h).fill(hex).restore();
}

function drawLine(doc, x1, y1, x2, y2, hex, width = 1) {
  doc.save().moveTo(x1, y1).lineTo(x2, y2).strokeColor(hex).lineWidth(width).stroke().restore();
}

function sectionDivider(doc) {
  const y = doc.y + 10;
  drawLine(doc, L_MARGIN, y, PAGE_W - R_MARGIN, y, COLORS.navy, 1);
  doc.moveDown(1.2);
}

function ensureSpace(doc, needed = 120) {
  if (doc.y > PAGE_H - needed) doc.addPage();
}

function safeText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

function drawCoverPage(doc, businessName, generatedAt) {
  // Full dark background
  fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.black);

  // Accent stripe top
  fillRect(doc, 0, 0, PAGE_W, 6, COLORS.blue);

  // Logo area
  doc.y = 80;
  doc.font('Helvetica-Bold').fontSize(9)
    .fillColor(COLORS.lightBlue)
    .text('TEK BOSS AI', { align: 'center', characterSpacing: 4 });

  // Main headline
  doc.y = 160;
  doc.font('Helvetica-Bold').fontSize(38)
    .fillColor(COLORS.white)
    .text('AI INTELLIGENCE', { align: 'center', lineGap: 4 });
  doc.font('Helvetica-Bold').fontSize(38)
    .fillColor(COLORS.lightBlue)
    .text('BLUEPRINT', { align: 'center', lineGap: 4 });

  // Divider
  const divY = doc.y + 20;
  fillRect(doc, PAGE_W / 2 - 30, divY, 60, 2, COLORS.blue);

  // Business name
  doc.y = divY + 28;
  doc.font('Helvetica-Bold').fontSize(18)
    .fillColor(COLORS.white)
    .text(safeText(businessName) || 'Your Business', { align: 'center' });

  // Subtitle
  doc.moveDown(0.8);
  doc.font('Helvetica').fontSize(11)
    .fillColor(COLORS.slate)
    .text('Proprietary AI Systems Blueprint — Confidential', { align: 'center' });

  // Timestamp
  doc.y = PAGE_H - 120;
  doc.font('Helvetica').fontSize(9)
    .fillColor(COLORS.slate)
    .text(`Generated: ${new Date(generatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

  // Legal footer
  doc.moveDown(0.6);
  doc.font('Helvetica').fontSize(7)
    .fillColor('#475569')
    .text('This document contains proprietary strategy developed exclusively for the named business. Not for distribution.', {
      align: 'center', width: CONTENT_W, indent: L_MARGIN,
    });

  // Bottom accent stripe
  fillRect(doc, 0, PAGE_H - 6, PAGE_W, 6, COLORS.blue);

  doc.addPage();
}

// ─── Page Header / Footer ─────────────────────────────────────────────────────

function drawPageHeader(doc, sectionTitle) {
  fillRect(doc, 0, 0, PAGE_W, 38, COLORS.darkNavy);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.lightBlue)
    .text('TEK BOSS AI', L_MARGIN, 14, { characterSpacing: 2 });
  doc.font('Helvetica').fontSize(7).fillColor(COLORS.slate)
    .text(sectionTitle.toUpperCase(), 0, 14, { align: 'right', width: PAGE_W - R_MARGIN, characterSpacing: 1 });
  doc.y = 56;
}

function drawPageFooter(doc, pageNum) {
  fillRect(doc, 0, PAGE_H - 30, PAGE_W, 30, COLORS.darkNavy);
  doc.font('Helvetica').fontSize(7).fillColor(COLORS.slate)
    .text('CONFIDENTIAL — Property of TEK BOSS AI', L_MARGIN, PAGE_H - 18);
  doc.font('Helvetica').fontSize(7).fillColor(COLORS.slate)
    .text(`Page ${pageNum}`, 0, PAGE_H - 18, { align: 'right', width: PAGE_W - R_MARGIN });
}

// ─── Section Title ────────────────────────────────────────────────────────────

function drawSectionTitle(doc, title, subtitle) {
  ensureSpace(doc, 80);
  doc.moveDown(0.5);

  // Blue left bar
  fillRect(doc, L_MARGIN, doc.y, 3, subtitle ? 36 : 22, COLORS.blue);

  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLORS.white)
    .text(title, L_MARGIN + 14, doc.y, { width: CONTENT_W - 14 });

  if (subtitle) {
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.slate)
      .text(subtitle, L_MARGIN + 14, doc.y + 2, { width: CONTENT_W - 14 });
    doc.moveDown(0.4);
  }
  doc.moveDown(0.8);
}

// ─── Bullet list ─────────────────────────────────────────────────────────────

function drawBulletList(doc, items, color = COLORS.lightBlue) {
  if (!Array.isArray(items)) return;
  items.forEach(item => {
    ensureSpace(doc, 40);
    const text = safeText(item);
    if (!text) return;
    // Blue dot
    doc.save().circle(L_MARGIN + 5, doc.y + 6, 3).fill(color).restore();
    doc.font('Helvetica').fontSize(10).fillColor(COLORS.slateLight)
      .text(text, L_MARGIN + 16, doc.y, { width: CONTENT_W - 16, lineGap: 2 });
    doc.moveDown(0.35);
  });
  doc.moveDown(0.4);
}

// ─── Card block ──────────────────────────────────────────────────────────────

function drawCard(doc, title, body, accentColor = COLORS.blue) {
  ensureSpace(doc, 100);
  const startY = doc.y;
  const cardX = L_MARGIN;
  const cardW = CONTENT_W;
  const innerPad = 14;

  // Measure body text height
  const bodyHeight = doc.heightOfString(safeText(body), { width: cardW - innerPad * 2 - 6, fontSize: 10 });
  const cardH = 30 + bodyHeight + innerPad * 2;

  // Card background
  fillRect(doc, cardX, startY, cardW, cardH, COLORS.charcoal);
  // Accent left bar
  fillRect(doc, cardX, startY, 4, cardH, accentColor);

  // Title
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.white)
    .text(safeText(title), cardX + innerPad + 6, startY + innerPad, { width: cardW - innerPad * 2 - 6 });

  const bodyY = startY + innerPad + 18;
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.slateLight)
    .text(safeText(body), cardX + innerPad + 6, bodyY, { width: cardW - innerPad * 2 - 6, lineGap: 2 });

  doc.y = startY + cardH + 10;
}

// ─── Named System card ────────────────────────────────────────────────────────

function drawSystemCard(doc, system) {
  ensureSpace(doc, 130);
  const cardX = L_MARGIN;
  const cardW = CONTENT_W;
  const innerPad = 14;

  const nameText   = safeText(system.name || system);
  const purpose    = safeText(system.purpose || '');
  const components = Array.isArray(system.components) ? system.components : [];
  const revenueRole = safeText(system.revenueRole || system.revenue_role || '');

  const bodyText = purpose + (components.length ? '\n\nComponents:\n' + components.map(c => `  • ${c}`).join('\n') : '') +
    (revenueRole ? '\n\nRevenue Role: ' + revenueRole : '');

  const bodyH = doc.heightOfString(bodyText, { width: cardW - innerPad * 2 - 6, fontSize: 9.5 });
  const cardH = 36 + bodyH + innerPad * 2;

  fillRect(doc, cardX, doc.y, cardW, cardH, COLORS.navy);
  fillRect(doc, cardX, doc.y, cardW, 4, COLORS.blue);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.white)
    .text(nameText, cardX + innerPad, doc.y + 12, { width: cardW - innerPad * 2 });

  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.slateLight)
    .text(bodyText, cardX + innerPad, doc.y + 2, { width: cardW - innerPad * 2, lineGap: 2.5 });

  doc.y = doc.y + cardH + 12;
}

// ─── Brand DNA Section ────────────────────────────────────────────────────────

function drawBrandDnaSection(doc, brandDna) {
  if (!brandDna) return;

  drawSectionTitle(doc, 'BRAND DNA PROFILE',
    'Governs all AI-generated content for your business');

  // Core Promise
  if (brandDna.brandEssence?.corePromise) {
    drawCard(doc, 'Core Promise', brandDna.brandEssence.corePromise, COLORS.gold);
  }
  if (brandDna.brandEssence?.uniqueValueProposition) {
    drawCard(doc, 'Unique Value Proposition', brandDna.brandEssence.uniqueValueProposition, COLORS.emerald);
  }

  // Personality
  if (brandDna.brandPersonality?.personalityTraits?.length) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.lightBlue).text('Brand Personality Traits', L_MARGIN);
    doc.moveDown(0.3);
    drawBulletList(doc, brandDna.brandPersonality.personalityTraits, COLORS.gold);
  }

  // Voice
  if (brandDna.voiceAndTone?.primaryVoice) {
    drawCard(doc, 'Brand Voice', brandDna.voiceAndTone.primaryVoice, COLORS.skyBlue);
  }
  if (brandDna.voiceAndTone?.forbiddenWords?.length) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.lightBlue).text('Words To Never Use', L_MARGIN);
    doc.moveDown(0.3);
    drawBulletList(doc, brandDna.voiceAndTone.forbiddenWords, '#EF4444');
  }

  // Elevator Statement
  if (brandDna.elevatorStatement) {
    doc.moveDown(0.5);
    ensureSpace(doc, 60);
    fillRect(doc, L_MARGIN, doc.y, CONTENT_W, 54, '#0F172A');
    doc.font('Helvetica-Oblique').fontSize(12).fillColor(COLORS.white)
      .text(`"${safeText(brandDna.elevatorStatement)}"`,
        L_MARGIN + 16, doc.y + 12, { width: CONTENT_W - 32, align: 'center' });
    doc.y = doc.y + 58;
  }

  sectionDivider(doc);
}

// ─── Market Intel Section ─────────────────────────────────────────────────────

function drawMarketSection(doc, marketIntel) {
  if (!marketIntel) return;

  drawSectionTitle(doc, 'COMPETITIVE INTELLIGENCE',
    'Market positioning and competitor analysis');

  if (marketIntel.strategicInsight) {
    drawCard(doc, 'Strategic Insight', marketIntel.strategicInsight, COLORS.gold);
  }

  if (Array.isArray(marketIntel.competitors)) {
    marketIntel.competitors.forEach(c => {
      ensureSpace(doc, 120);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.white)
        .text(safeText(c.name), L_MARGIN);
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.slate)
        .text(`Positioning: ${safeText(c.positioning)}`, L_MARGIN, doc.y + 2, { width: CONTENT_W });
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.emerald)
        .text(`Your Angle: ${safeText(c.differentiationAngle)}`, L_MARGIN, doc.y + 2, { width: CONTENT_W });
      doc.moveDown(0.8);
    });
  }

  if (marketIntel.recommendedPositioningMove) {
    drawCard(doc, 'Recommended Move', marketIntel.recommendedPositioningMove, COLORS.emerald);
  }

  sectionDivider(doc);
}

// ─── ROI Section ──────────────────────────────────────────────────────────────

function drawRoiSection(doc, roiData) {
  if (!roiData) return;

  drawSectionTitle(doc, 'REVENUE & TIME OPPORTUNITY',
    'Projected impact of implementing your blueprint');

  // Big numbers row
  const metrics = [
    { label: 'Hours Recoverable/Year', value: safeText(roiData.annualHoursRecoverable) },
    { label: 'Value of Recovered Time', value: `$${(Number(roiData.annualValueOfRecoverableTime) || 0).toLocaleString()}` },
  ];

  const colW = CONTENT_W / 2 - 6;
  metrics.forEach((m, i) => {
    const x = L_MARGIN + i * (colW + 12);
    fillRect(doc, x, doc.y, colW, 64, COLORS.navy);
    fillRect(doc, x, doc.y, colW, 3, COLORS.blue);
    doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.lightBlue)
      .text(safeText(m.value), x + 10, doc.y + 10, { width: colW - 20 });
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.slate)
      .text(m.label.toUpperCase(), x + 10, doc.y + 2, { width: colW - 20 });
  });
  doc.y = doc.y + 78;

  if (roiData.topPriorityAction) {
    drawCard(doc, '🎯 Highest-ROI Action (Next 30 Days)', roiData.topPriorityAction, COLORS.gold);
  }

  if (Array.isArray(roiData.automationTargets) && roiData.automationTargets.length) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.lightBlue).text('Top Automation Targets', L_MARGIN);
    doc.moveDown(0.4);
    roiData.automationTargets.slice(0, 5).forEach(t => {
      ensureSpace(doc, 50);
      const text = `${safeText(t.process)} — ${safeText(t.estimatedTimeSaved)} hrs/wk (${safeText(t.automationFeasibility)} feasibility)`;
      drawBulletList(doc, [text], COLORS.emerald);
    });
  }

  sectionDivider(doc);
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * generateBlueprintPdf(pdfData) → Buffer
 *
 * pdfData shape:
 * {
 *   businessName,
 *   previewReport,        // markdown string
 *   diyPlaybook,          // markdown string (optional)
 *   brandDna,             // JSON (optional)
 *   marketIntel,          // JSON (optional)
 *   roiData,              // JSON (optional)
 *   namedSystems,         // array (optional)
 *   generatedAt,
 * }
 */
export function generateBlueprintPdf(pdfData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'letter',
      margins: { top: 56, bottom: 40, left: L_MARGIN, right: R_MARGIN },
      info: {
        Title: `TekBoss AI Blueprint — ${pdfData.businessName || 'Your Business'}`,
        Author: 'TekBoss AI',
        Subject: 'Proprietary AI Integration Blueprint',
        Keywords: 'AI strategy, automation, business blueprint',
      },
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    let pageNum = 1;

    // ── Cover ──────────────────────────────────────────────────────────────
    drawCoverPage(doc, pdfData.businessName, pdfData.generatedAt);

    // ── Page 2: Preview Report ─────────────────────────────────────────────
    drawPageHeader(doc, 'Intelligence Preview');
    drawSectionTitle(doc, 'YOUR BUSINESS INTELLIGENCE PREVIEW',
      'AI-generated analysis based on your discovery interview');

    // Render preview report as cleaned plain text
    if (pdfData.previewReport) {
      const cleanText = pdfData.previewReport
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/^[-•]\s+/gm, '  • ')
        .trim();

      const sections = cleanText.split(/\n{2,}/);
      sections.forEach(section => {
        ensureSpace(doc, 60);
        const lines = section.split('\n');
        lines.forEach(line => {
          if (!line.trim()) return;
          if (line.startsWith('  • ')) {
            doc.save().circle(L_MARGIN + 5, doc.y + 6, 3).fill(COLORS.lightBlue).restore();
            doc.font('Helvetica').fontSize(10).fillColor(COLORS.slateLight)
              .text(line.replace('  • ', ''), L_MARGIN + 16, doc.y, { width: CONTENT_W - 16, lineGap: 2 });
          } else if (line.length < 60 && line === line.toUpperCase() && line.trim().length > 3) {
            // Treat as a sub-heading
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.lightBlue)
              .text(line.trim(), L_MARGIN, doc.y, { width: CONTENT_W });
            doc.moveDown(0.3);
          } else {
            doc.font('Helvetica').fontSize(10).fillColor(COLORS.slateLight)
              .text(line.trim(), L_MARGIN, doc.y, { width: CONTENT_W, lineGap: 2 });
          }
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      });
    }

    drawPageFooter(doc, pageNum++);
    sectionDivider(doc);

    // ── Brand DNA ──────────────────────────────────────────────────────────
    if (pdfData.brandDna) {
      doc.addPage();
      drawPageHeader(doc, 'Brand DNA Profile');
      drawBrandDnaSection(doc, pdfData.brandDna);
      drawPageFooter(doc, pageNum++);
    }

    // ── Market Intel ───────────────────────────────────────────────────────
    if (pdfData.marketIntel) {
      doc.addPage();
      drawPageHeader(doc, 'Competitive Intelligence');
      drawMarketSection(doc, pdfData.marketIntel);
      drawPageFooter(doc, pageNum++);
    }

    // ── ROI Data ───────────────────────────────────────────────────────────
    if (pdfData.roiData) {
      doc.addPage();
      drawPageHeader(doc, 'Revenue & Time Opportunity');
      drawRoiSection(doc, pdfData.roiData);
      drawPageFooter(doc, pageNum++);
    }

    // ── Named Systems ──────────────────────────────────────────────────────
    const systems = pdfData.namedSystems ||
      (Array.isArray(pdfData.diyPlaybook) ? pdfData.diyPlaybook : null);
    if (Array.isArray(systems) && systems.length) {
      doc.addPage();
      drawPageHeader(doc, 'Named Systems');
      drawSectionTitle(doc, 'YOUR AI-POWERED NAMED SYSTEMS',
        'Custom-designed systems for your specific business operations');
      systems.forEach(s => drawSystemCard(doc, s));
      drawPageFooter(doc, pageNum++);
    }

    // ── Full Blueprint (playbook text) ─────────────────────────────────────
    if (pdfData.diyPlaybook && typeof pdfData.diyPlaybook === 'string') {
      doc.addPage();
      drawPageHeader(doc, 'Full Blueprint');
      drawSectionTitle(doc, 'FULL ORCHESTRATION PLAYBOOK',
        'Your complete AI implementation blueprint');

      const cleanPlaybook = pdfData.diyPlaybook
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .trim();

      const sections = cleanPlaybook.split(/\n{2,}/);
      sections.forEach(section => {
        ensureSpace(doc, 60);
        const lines = section.split('\n');
        lines.forEach(line => {
          if (!line.trim()) return;
          const isBullet = /^[-•]\s/.test(line);
          if (isBullet) {
            doc.save().circle(L_MARGIN + 5, doc.y + 6, 3).fill(COLORS.lightBlue).restore();
            doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.slateLight)
              .text(line.replace(/^[-•]\s/, ''), L_MARGIN + 16, doc.y, { width: CONTENT_W - 16, lineGap: 2 });
          } else if (line.length < 80 && !line.endsWith('.') && line.trim().length > 4) {
            doc.moveDown(0.4);
            doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.lightBlue)
              .text(line.trim(), L_MARGIN, doc.y, { width: CONTENT_W });
            doc.moveDown(0.2);
          } else {
            doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.slateLight)
              .text(line.trim(), L_MARGIN, doc.y, { width: CONTENT_W, lineGap: 2 });
          }
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
      });

      drawPageFooter(doc, pageNum++);
    }

    // ── Back Cover ─────────────────────────────────────────────────────────
    doc.addPage();
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.black);
    fillRect(doc, 0, 0, PAGE_W, 6, COLORS.blue);
    fillRect(doc, 0, PAGE_H - 6, PAGE_W, 6, COLORS.blue);

    doc.y = PAGE_H / 2 - 60;
    doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.lightBlue)
      .text('Ready to execute?', { align: 'center' });
    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(11).fillColor(COLORS.slate).text(
      'Your 90-Day Build-Out Coach is waiting in the dashboard.',
      { align: 'center', width: CONTENT_W, indent: L_MARGIN }
    );
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.blue)
      .text('tekboss-production.up.railway.app', { align: 'center' });

    doc.end();
  });
}
