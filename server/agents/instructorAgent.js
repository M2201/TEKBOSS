/**
 * instructorAgent.js — Phase 3 AI Instructor
 *
 * Wraps the existing runImplementationAssistant engine with:
 *   - Task progress context injection (done vs pending, by module)
 *   - "Day X of 60" journey awareness
 *   - DB-persisted message history
 *
 * Called by POST /api/instructor in index.js
 */
import { runImplementationAssistant } from './implementationAssistant.js';

/**
 * Build a task-progress context block to inject into the assistant prompt.
 * Shows the AI which tasks are done and what's still pending per module.
 */
export function buildTaskProgressContext(tasks = [], trialStartedAt = null) {
    if (!tasks.length) return '';

    // Group by module
    const modules = {};
    for (const task of tasks) {
        const mod = task.module || 'General';
        if (!modules[mod]) modules[mod] = { done: [], pending: [] };
        if (task.status === 'done') modules[mod].done.push(task.title);
        else modules[mod].pending.push(task.title);
    }

    const totalDone    = tasks.filter(t => t.status === 'done').length;
    const totalPending = tasks.filter(t => t.status !== 'done').length;
    const pct          = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;

    // Day-of-journey
    let dayLine = '';
    if (trialStartedAt) {
        const days = Math.floor((Date.now() - new Date(trialStartedAt).getTime()) / (1000 * 60 * 60 * 24));
        const remaining = Math.max(0, 60 - days);
        dayLine = `\nIMPLEMENTATION JOURNEY: Day ${days} of 60 (${remaining} days remaining in included period)\n`;
    }

    const moduleLines = Object.entries(modules).map(([mod, { done, pending }]) => {
        const lines = [];
        if (done.length)    lines.push(`  ✅ Done (${done.length}): ${done.join(' | ')}`);
        if (pending.length) lines.push(`  ⬜ Pending (${pending.length}): ${pending.join(' | ')}`);
        return `${mod}:\n${lines.join('\n')}`;
    });

    return `\n---\nTASK PROGRESS SNAPSHOT (${totalDone}/${tasks.length} complete — ${pct}%):${dayLine}\n${moduleLines.join('\n\n')}\n\nUse this to reference specific pending tasks when suggesting next steps. Prioritize tasks the user hasn't started yet. If all tasks in a module are done, congratulate them briefly and redirect to the next open module.\n---\n`;
}

/**
 * Run the AI Instructor with full context.
 *
 * @param {string} apiKey
 * @param {object} blueprint  — from DB (has validated_data, diy_playbook, etc.)
 * @param {string} userMessage
 * @param {Array}  dbHistory  — [{role:'user'|'assistant', content}] from instructor_messages
 * @param {Array}  tasks      — user_tasks rows for this blueprint
 * @param {string} trialStartedAt — ISO string
 * @returns {Promise<string>} AI response text
 */
export async function runInstructor(apiKey, blueprint, userMessage, dbHistory = [], tasks = [], trialStartedAt = null) {
    // Build the blueprint context object expected by implementationAssistant
    const validatedData = blueprint.validated_data
        ? JSON.parse(blueprint.validated_data)
        : {};

    const blueprintContext = {
        businessName:        validatedData.businessName || 'Your Business',
        validated_data:      validatedData,
        diy_playbook:        blueprint.diy_playbook || '',
        systems:             validatedData.namedSystems || [],
        goals:               validatedData.opportunityZones || [],
        brandVoice:          validatedData.brandFoundation?.emotionalTone?.join(', ') || '',
        constraints:         validatedData.brandFoundation?.doNotSayLanguage || [],
        fullBlueprint:       blueprint.diy_playbook || '',
        discAccumulator:     blueprint.discAccumulator || { D: 0, I: 0, S: 0, C: 0 },
        coachInteractionCount: dbHistory.filter(m => m.role === 'user').length,
        // Inject task progress as extra context in the blueprint object
        taskProgressContext: buildTaskProgressContext(tasks, trialStartedAt),
    };

    // Use last 20 messages from DB history
    const trimmedHistory = dbHistory.slice(-20);

    return runImplementationAssistant(apiKey, blueprintContext, userMessage, trimmedHistory);
}
