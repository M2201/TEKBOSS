/**
 * THE RECONNAISSANCE ENGINE
 * Asynchronously gathers website intelligence in the background while the
 * user fills out the intake form. Results are cached in-memory and injected
 * into the pipeline when /api/generate-preview is called.
 *
 * PROGRESSIVE INTELLIGENCE PIPELINE:
 *   Q1  → startRecon()  → Website scrape (Jina Reader)
 *   Final → getReconData() → Inject website content into Stage 1 context
 */

import { fetchWebsiteContent, extractUrl } from './websiteFetcher.js';

// In-memory cache: URL → { status, url, website, seoAudit, ... }
const reconCache = new Map();

/**
 * Initiates the background website sweep.
 * Called immediately when the user submits Q1.
 * @param {string} businessInput — Raw Q1 answer (e.g. "Apex Media — apex.com")
 */
export async function startRecon(businessInput) {
    if (!businessInput || businessInput.trim() === '') return;

    const raw = extractUrl(businessInput);
    const url = raw ? (raw.startsWith('http') ? raw : 'https://' + raw) : '';

    if (!url) {
        console.log(`\n🔍 RECON ENGINE: No valid URL in Q1 ("${businessInput}"). Skipping web crawl.`);
        return;
    }

    // De-dupe: if already cached or pending, skip
    if (reconCache.has(url)) return;

    console.log(`\n🔍 RECON ENGINE: Pre-fetch started → ${url}`);
    reconCache.set(url, { status: 'pending', url });

    try {
        const websiteData = await fetchWebsiteContent(url);
        const isSuccessful = !!(websiteData && websiteData.content);

        reconCache.set(url, {
            status: 'complete',
            url,
            website: websiteData,
            seoAudit: isSuccessful
                ? 'Website content ingested. Full analysis will be performed by the AI pipeline.'
                : 'No website content available for audit.',
            reputation: isSuccessful
                ? 'Reputation analysis will be enriched by Market Scout agent.'
                : 'Unable to enrich reputation without domain.',
            competitors: isSuccessful
                ? 'Competitor analysis will be enriched by Market Scout agent.'
                : 'Cannot perform competitor analysis without valid domain.',
        });

        console.log(`✅ RECON ENGINE: Pre-fetch complete → ${url}`);
    } catch (e) {
        console.error(`❌ RECON ENGINE Error:`, e.message);
        reconCache.set(url, { status: 'error', url, error: e.message });
    }
}

/**
 * Retrieves the cached recon payload for a given Q1 answer.
 * Returns null if no recon was run or if the URL couldn't be extracted.
 */
export function getReconData(businessInput) {
    if (!businessInput) return null;
    const raw = extractUrl(businessInput);
    const url = raw ? (raw.startsWith('http') ? raw : 'https://' + raw) : '';
    if (!url) return null;
    return reconCache.get(url) || null;
}

/**
 * Returns true if recon is complete (not pending) for the given input.
 */
export function isReconComplete(businessInput) {
    if (!businessInput) return false;
    const raw = extractUrl(businessInput);
    const url = raw ? (raw.startsWith('http') ? raw : 'https://' + raw) : '';
    if (!url) return false;
    const cached = reconCache.get(url);
    return cached?.status === 'complete';
}
