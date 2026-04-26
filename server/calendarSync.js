/**
 * calendarSync.js — Google Calendar integration for task scheduling
 *
 * Uses per-user OAuth 2.0 (not service account) so events appear in the
 * user's own Google Calendar. Reuses the existing GOOGLE_CLIENT_ID +
 * GOOGLE_CLIENT_SECRET already configured for Drive.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID         — same as Drive
 *   GOOGLE_CLIENT_SECRET     — same as Drive
 *   GOOGLE_CALENDAR_REDIRECT — e.g. https://tekboss.ai/api/calendar/callback
 *                              (must be registered in Google Cloud Console)
 *   BASE_URL                 — e.g. https://tekboss.ai (for post-auth redirect)
 *
 * Token storage: JSON blob in users.google_calendar_token
 * (encrypt at rest in a future security pass)
 */
import { google } from 'googleapis';
import db from '../db.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// ─── OAuth client factory ────────────────────────────────────────────────────
function makeOAuth2Client() {
    const redirectUri =
        process.env.GOOGLE_CALENDAR_REDIRECT ||
        `${process.env.BASE_URL || 'http://localhost:3005'}/api/calendar/callback`;

    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri,
    );
}

// ─── Public helpers ──────────────────────────────────────────────────────────

/** Returns true if Calendar OAuth env vars are configured */
export function isCalendarConfigured() {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Build the OAuth URL the user visits to grant Calendar access.
 * state encodes the userId so the callback knows who to save the token for.
 */
export function getCalendarAuthUrl(userId) {
    const client = makeOAuth2Client();
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
        state: Buffer.from(JSON.stringify({ userId })).toString('base64'),
    });
}

/**
 * Called from the OAuth callback route.
 * Exchanges the code for tokens and persists them to the user row.
 * Returns the userId decoded from state.
 */
export async function exchangeCodeAndSave(code, state) {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    const client = makeOAuth2Client();
    const { tokens } = await client.getToken(code);

    db.prepare(`
        UPDATE users
        SET google_calendar_token     = ?,
            google_calendar_connected = 1
        WHERE id = ?
    `).run(JSON.stringify(tokens), userId);

    return userId;
}

/**
 * Returns { connected: bool, email? } for this user's Calendar status.
 */
export function getCalendarStatus(userId) {
    const row = db.prepare(
        'SELECT google_calendar_connected, google_calendar_token FROM users WHERE id = ?'
    ).get(userId);
    if (!row) return { connected: false };
    return { connected: !!row.google_calendar_connected && !!row.google_calendar_token };
}

/**
 * Creates a Google Calendar event for a task.
 * startIso — ISO 8601 string (e.g. "2026-05-01T10:00:00")
 * durationMins — default 60
 * Returns the created event object.
 */
export async function createTaskEvent(userId, { taskId, title, description, startIso, durationMins = 60 }) {
    const client = makeAuthedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth: client });

    const startDt = new Date(startIso);
    const endDt   = new Date(startDt.getTime() + durationMins * 60 * 1000);

    const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary:     `[TEK BOSS] ${title}`,
            description: description
                ? `${description}\n\n— From your TEK BOSS blueprint`
                : 'From your TEK BOSS blueprint',
            start: { dateTime: startDt.toISOString(), timeZone: 'America/Chicago' },
            end:   { dateTime: endDt.toISOString(),   timeZone: 'America/Chicago' },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 30 },
                    { method: 'email', minutes: 60 },
                ],
            },
            colorId: '7', // Blueberry — distinctive
        },
    });

    // Persist event ID back to the task
    db.prepare('UPDATE user_tasks SET calendar_event_id = ?, due_date = ? WHERE id = ? AND user_id = ?')
      .run(event.data.id, startIso, taskId, userId);

    return event.data;
}

/**
 * Deletes a previously created event (e.g. when user reschedules).
 */
export async function deleteTaskEvent(userId, taskId) {
    const task = db.prepare('SELECT calendar_event_id FROM user_tasks WHERE id = ? AND user_id = ?')
                   .get(taskId, userId);
    if (!task?.calendar_event_id) return;

    try {
        const client = makeAuthedClient(userId);
        const calendar = google.calendar({ version: 'v3', auth: client });
        await calendar.events.delete({ calendarId: 'primary', eventId: task.calendar_event_id });
    } catch (err) {
        console.warn('[Calendar] Event delete failed (may already be gone):', err.message);
    }

    db.prepare('UPDATE user_tasks SET calendar_event_id = NULL, due_date = NULL WHERE id = ? AND user_id = ?')
      .run(taskId, userId);
}

// ─── Internal ────────────────────────────────────────────────────────────────

/** Returns an authed OAuth2 client loaded with the user's stored tokens. */
function makeAuthedClient(userId) {
    const row = db.prepare('SELECT google_calendar_token FROM users WHERE id = ?').get(userId);
    if (!row?.google_calendar_token) throw new Error('Calendar not connected for this user');

    const tokens = JSON.parse(row.google_calendar_token);
    const client = makeOAuth2Client();
    client.setCredentials(tokens);

    // Auto-save refreshed tokens
    client.on('tokens', (newTokens) => {
        const merged = { ...tokens, ...newTokens };
        db.prepare('UPDATE users SET google_calendar_token = ? WHERE id = ?')
          .run(JSON.stringify(merged), userId);
    });

    return client;
}
