/**
 * AI LOGGER — Observability for every pipeline stage
 *
 * Logs token usage, latency, output quality signals, and errors to ai_logs table.
 * View results at: GET /api/admin/logs (requires ADMIN_SECRET header)
 */
import db from '../db.js';

/**
 * Log a completed AI stage call.
 *
 * @param {object} opts
 * @param {string}  opts.stage            - e.g. 'orchestration_playbook', 'guardrails'
 * @param {string} [opts.userId]          - Logged-in user ID (if available)
 * @param {string} [opts.blueprintId]     - Blueprint ID (if available)
 * @param {number} [opts.tokensUsed]      - From response.usageMetadata.totalTokenCount
 * @param {number} [opts.latencyMs]       - Date.now() - startTime
 * @param {number} [opts.outputLength]    - response.text.length
 * @param {boolean} [opts.hasSowSplit]    - Whether --- SOW_SPLIT --- was found
 * @param {number} [opts.namedSystemsCount] - Number of named systems in guardrails output
 * @param {string} [opts.error]           - Error message if failed
 * @param {object} [opts.metadata]        - Any extra stage-specific data
 */
export function logAiCall(opts = {}) {
  try {
    db.prepare(`
      INSERT INTO ai_logs
        (stage, user_id, blueprint_id, tokens_used, latency_ms, output_length,
         has_sow_split, named_systems_count, error, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      opts.stage || 'unknown',
      opts.userId || null,
      opts.blueprintId || null,
      opts.tokensUsed || null,
      opts.latencyMs || null,
      opts.outputLength || null,
      opts.hasSowSplit != null ? (opts.hasSowSplit ? 1 : 0) : null,
      opts.namedSystemsCount != null ? opts.namedSystemsCount : null,
      opts.error || null,
      opts.metadata ? JSON.stringify(opts.metadata) : null,
    );
  } catch (err) {
    // Never crash the main pipeline due to logging failure
    console.warn('[ai-logger] Failed to write log:', err.message);
  }
}

/**
 * Convenience wrapper: time an async AI call and auto-log it.
 *
 * Usage:
 *   const result = await timedAiCall('guardrails', { userId }, async () => {
 *     return await runGuardrails(...);
 *   });
 */
export async function timedAiCall(stage, opts, fn) {
  const start = Date.now();
  try {
    const result = await fn();
    logAiCall({
      stage,
      userId: opts.userId,
      blueprintId: opts.blueprintId,
      latencyMs: Date.now() - start,
      outputLength: typeof result === 'string' ? result.length : JSON.stringify(result || '').length,
      hasSowSplit: typeof result === 'string' ? result.includes('--- SOW_SPLIT ---') : null,
      namedSystemsCount: Array.isArray(result?.namedSystems) ? result.namedSystems.length : null,
      ...opts.extra,
    });
    return result;
  } catch (err) {
    logAiCall({
      stage,
      userId: opts.userId,
      blueprintId: opts.blueprintId,
      latencyMs: Date.now() - start,
      error: err.message,
    });
    throw err;
  }
}
