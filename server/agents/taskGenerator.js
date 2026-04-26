/**
 * Task Generator — Blueprint-to-Action Checklist
 * Runs once at blueprint delivery. Converts Named Systems into an
 * ordered, specific task list stored in user_tasks.
 * Non-fatal: if this fails, it logs and silently moves on.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TASK_GENERATOR_PROMPT } from './prompts.js';
import db from '../db.js';

const MODEL = 'gemini-2.0-flash';

/**
 * @param {Object} params
 * @param {string} params.blueprintId
 * @param {string} params.userId
 * @param {Array}  params.namedSystems  — array of { name, purpose, components[], revenueRole }
 * @param {string} params.businessName
 */
export async function runTaskGenerator({ blueprintId, userId, namedSystems, businessName }) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('[TaskGen] No GEMINI_API_KEY — skipping task generation');
        return null;
    }
    if (!namedSystems?.length) {
        console.warn('[TaskGen] No namedSystems — skipping task generation');
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL,
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 4096,
            },
        });

        // Build context block for each Named System
        const systemsContext = namedSystems.map((s, i) => {
            const parts = [
                `System ${i + 1}: ${s.name}`,
                `Purpose: ${s.purpose || 'AI-powered system'}`,
            ];
            if (s.components?.length) {
                parts.push(`Components: ${s.components.join(', ')}`);
            }
            if (s.revenueRole) {
                parts.push(`Revenue Role: ${s.revenueRole}`);
            }
            return parts.join('\n');
        }).join('\n\n');

        const prompt = [
            TASK_GENERATOR_PROMPT,
            '',
            `Business: ${businessName}`,
            '',
            'Named Systems:',
            systemsContext,
        ].join('\n');

        const result = await model.generateContent(prompt);
        const text   = result.response.text().trim();

        // Strip any accidental markdown fences
        const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

        let tasks;
        try {
            tasks = JSON.parse(cleaned);
        } catch (parseErr) {
            // Try to extract JSON array from within the text
            const match = cleaned.match(/\[[\s\S]*\]/);
            if (!match) throw new Error(`Task generator returned non-JSON: ${cleaned.slice(0, 200)}`);
            tasks = JSON.parse(match[0]);
        }

        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new Error('Task generator returned empty array');
        }

        // ── Persist to DB ─────────────────────────────────────────────────────
        const insertTask = db.prepare(`
            INSERT INTO user_tasks
                (user_id, blueprint_id, task_id, title, description, module, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `);

        const insertAll = db.transaction((taskList) => {
            for (const t of taskList) {
                insertTask.run(
                    userId,
                    blueprintId,
                    t.taskId,
                    (t.title || '').slice(0, 200),
                    (t.description || '').slice(0, 1000),
                    (t.module || 'General').slice(0, 100),
                );
            }
        });

        insertAll(tasks);

        // ── Upsert progress row ───────────────────────────────────────────────
        db.prepare(`
            INSERT INTO user_progress (user_id, blueprint_id, total_tasks, done_tasks, last_active)
            VALUES (?, ?, ?, 0, datetime('now'))
            ON CONFLICT(user_id, blueprint_id) DO UPDATE SET
                total_tasks = excluded.total_tasks,
                last_active = excluded.last_active,
                updated_at  = datetime('now')
        `).run(userId, blueprintId, tasks.length);

        // ── Mark blueprint as tasks-generated ────────────────────────────────
        db.prepare('UPDATE blueprints SET tasks_generated = 1 WHERE id = ?').run(blueprintId);

        console.log(`✅ [TaskGen] ${tasks.length} tasks generated for blueprint ${blueprintId}`);
        return tasks;

    } catch (err) {
        console.error(`⚠️ [TaskGen] Failed (non-fatal): ${err.message}`);
        return null;
    }
}
