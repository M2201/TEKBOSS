/**
 * SENTINEL INTERCEPTOR — The Tek Boss Security Layer
 *
 * Scans all user input for adversarial prompt-injection attempts before any
 * AI call. If a threat is detected the pipeline halts immediately and returns
 * [SECURITY_PROTOCOL_ALPHA].
 *
 * System Sovereignty: protects synthesis logic from manipulation.
 */

const JAILBREAK_PATTERNS = [
    'DAN',
    'do anything now',
    'ignore previous instructions',
    'ignore all instructions',
    'ignore your instructions',
    'disregard all prior',
    'disregard previous',
    'forget your instructions',
    'you are now',
    'pretend you are',
    'act as if you have no restrictions',
    'as an AI with no restrictions',
    'jailbreak',
    'bypass your filters',
    'override your programming',
    'your new instructions are',
    'new system prompt',
    '[system]',
    '<system>',
    '###instruction###',
];

/**
 * Scan a single string for adversarial patterns.
 * @returns {{ blocked: boolean, code?: string, pattern?: string }}
 */
export function sentinelInterceptor(input) {
    if (!input || typeof input !== 'string') return { blocked: false };

    const normalized = input.toLowerCase();

    for (const pattern of JAILBREAK_PATTERNS) {
        const escapedPattern = pattern.toLowerCase().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const isAlphanumeric = /[a-zA-Z0-9]/.test(pattern);
        const regexPattern = isAlphanumeric
            ? `(?:^|\\W)${escapedPattern}(?:\\W|$)`
            : escapedPattern;

        const regex = new RegExp(regexPattern, 'i');

        if (regex.test(normalized)) {
            console.warn(`🚨 SENTINEL: Threat detected — pattern: "${pattern}"`);
            return { blocked: true, code: '[SECURITY_PROTOCOL_ALPHA]', pattern };
        }
    }

    return { blocked: false };
}

/**
 * Scan all answers in a key-value answers object.
 * @param {object} answers — { [qId]: answerString }
 * @returns {{ blocked: boolean, code?: string }}
 */
export function sentinelScanAnswers(answers) {
    if (!answers || typeof answers !== 'object') return { blocked: false };

    for (const [qId, answer] of Object.entries(answers)) {
        const result = sentinelInterceptor(String(answer));
        if (result.blocked) {
            console.warn(`🚨 SENTINEL: Threat in Q${qId} — pattern: "${result.pattern}"`);
            return result;
        }
    }

    return { blocked: false };
}
