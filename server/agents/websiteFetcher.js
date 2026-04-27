/**
 * WEBSITE FETCHER — Jina Reader Integration (Splash-Aware)
 * Silently fetches any public website URL and returns clean readable text.
 * Handles splash pages / decision gates by automatically trying subpages.
 *
 * Powered by: https://r.jina.ai/ (free, no auth required)
 * Timeout: 20 seconds per request — never blocks the main pipeline
 */

// Subpages to try when root content looks like a splash/gateway page
const FALLBACK_PATHS = [
    '/commercial',
    '/residential',
    '/about',
    '/about-us',
    '/services',
    '/what-we-do',
    '/solutions',
    '/home',
];

// Signals that the fetched page is a thin splash/decision gate
const SPLASH_SIGNALS = [
    'choose your experience',
    'select your path',
    'enter site',
    'commercial or residential',
    'residential or commercial',
    'who are you',
    'i am a',
    'select one',
    'click to enter',
    'welcome to',
    'loading',
];

function looksLikeSplash(text) {
    if (!text || text.length < 300) return true;  // suspiciously short
    const lower = text.toLowerCase();
    const signals = SPLASH_SIGNALS.filter(s => lower.includes(s));
    return signals.length >= 1;
}

/**
 * Extract the first URL from a free-text answer
 * e.g. "Apex Media — apexmedia.co" or bare "controlfreq.net"
 */
export function extractUrl(rawAnswer) {
    if (!rawAnswer || typeof rawAnswer !== 'string') return null;

    // Explicit http(s) URL first
    const httpMatch = rawAnswer.match(/https?:\/\/[^\s,'"]+/i);
    if (httpMatch) return httpMatch[0].replace(/[.,;]+$/, '');

    // Domain-like pattern
    const domainMatch = rawAnswer.match(/\b(?:www\.)?[a-z0-9-]{2,}\.[a-z]{2,6}(?:\/[^\s]*)?\b/i);
    if (domainMatch) return domainMatch[0].replace(/[.,;]+$/, '');

    return null;
}

/**
 * Fetch a single URL via Jina Reader. Returns text or null on failure.
 */
async function jinaFetch(url, timeoutMs = 20000) {
    const jinaUrl = `https://r.jina.ai/${url}`;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(jinaUrl, {
            headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
            signal: controller.signal,
        });
        if (!res.ok) {
            clearTimeout(timer);
            return null;
        }
        const text = await res.text();
        clearTimeout(timer);
        return text;
    } catch {
        return null;
    }
}

/**
 * Extract og:image URL from raw HTML or Jina's markdown-like output.
 */
function extractOgImage(rawText, baseUrl) {
    if (!rawText) return null;
    const ogMatch = rawText.match(/og:image[:\s"']+([^\s"'<>\n]+)/i);
    if (ogMatch) {
        const url = ogMatch[1].trim();
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) {
            try { return new URL(url, baseUrl).href; } catch { return null; }
        }
    }
    // Fallback: first absolute image URL that looks like a hero banner
    const imgMatch = rawText.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/i);
    return imgMatch ? imgMatch[0] : null;
}

/**
 * Detect dominant font personality from scraped content signals.
 * Returns 'serif' or 'sans-serif'.
 */
function detectFontType(rawText) {
    if (!rawText) return 'sans-serif';
    const lower = rawText.toLowerCase();
    const serifSignals = ['garamond', 'georgia', 'times new roman', 'playfair', 'merriweather', 'lora', 'serif', 'classic', 'heritage', 'elegant', 'luxury', 'artisan', 'editorial'];
    const sansSignals = ['helvetica', 'inter', 'montserrat', 'poppins', 'modern', 'minimal', 'clean', 'tech', 'saas', 'startup', 'digital', 'bold', 'grotesk'];
    const serifScore = serifSignals.filter(s => lower.includes(s)).length;
    const sansScore = sansSignals.filter(s => lower.includes(s)).length;
    return serifScore > sansScore ? 'serif' : 'sans-serif';
}

/**
 * Main entry point — fetch website content for a Q1 raw answer.
 * Returns { url, content, ogImage, fontType } or null on failure.
 */
export async function fetchWebsiteContent(rawAnswer) {
    const raw = extractUrl(rawAnswer);
    if (!raw) return null;

    const baseUrl = raw.startsWith('http') ? raw : `https://${raw}`;
    const origin = (() => {
        try { return new URL(baseUrl).origin; } catch { return baseUrl; }
    })();

    console.log(`🌐 Fetching root: ${baseUrl}`);
    let text = await jinaFetch(baseUrl);

    if (!text || looksLikeSplash(text)) {
        console.log(`🚪 Splash page detected at ${baseUrl} — trying subpages in parallel...`);
        const fetchPromises = FALLBACK_PATHS.map(path =>
            jinaFetch(`${origin}${path}`, 12000).then(subText => ({ path, subText }))
        );
        const results = await Promise.allSettled(fetchPromises);

        const collected = [];
        for (const result of results) {
            if (result.status === 'fulfilled') {
                const { path, subText } = result.value;
                if (subText && !looksLikeSplash(subText) && subText.length > 200) {
                    console.log(`  ✅ Subpage hit: ${origin}${path} (${subText.length} chars)`);
                    collected.push(`--- [${path.replace('/', '').toUpperCase()} PAGE] ---\n${subText.slice(0, 5000)}`);
                    if (collected.length >= 3) break; // max 3 subpages
                }
            }
        }
        if (collected.length > 0) {
            text = collected.join('\n\n');
            console.log(`✅ Assembled ${collected.length} subpage(s) for ${origin}`);
        } else {
            console.log(`⚠️  No useful subpages found — using root content as-is`);
        }
    }

    if (!text) {
        console.warn(`⚠️  Website fetch totally failed for: ${baseUrl}`);
        return null;
    }

    const ogImage  = extractOgImage(text, baseUrl);
    const fontType = detectFontType(text);
    const truncated = text.slice(0, 12000);

    console.log(`✅ Website content ready: ${truncated.length} chars from ${baseUrl}`);
    console.log(`🖼  og:image: ${ogImage || 'none found'}`);
    console.log(`🔤 Font type signal: ${fontType}`);

    return { url: baseUrl, content: truncated, ogImage, fontType };
}
