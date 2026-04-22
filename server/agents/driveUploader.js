/**
 * GOOGLE DRIVE UPLOADER
 * Uploads the blueprint PDF to the TekBoss Blueprints folder
 * and returns a shareable link for the client.
 *
 * Auth priority:
 *   1. OAuth2 refresh token — uploads AS the Google account owner.
 *      Files land in the owner's Drive and count against THEIR quota.
 *      Required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN
 *
 *   2. Service Account JSON — fallback. Works ONLY with Google Workspace
 *      accounts that have Drive storage. Personal Gmail SA accounts have
 *      zero quota and will fail with "Service Accounts do not have storage quota."
 *      Required env var: GOOGLE_SERVICE_ACCOUNT_JSON
 *
 * Target folder: 1V4rQpXzG8PmyLWbC7FWPptWv2_gwk4mU
 */
import { google } from 'googleapis';
import { Readable } from 'stream';

const DRIVE_FOLDER_ID = '1V4rQpXzG8PmyLWbC7FWPptWv2_gwk4mU';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

function getAuthClient() {
  const { GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

  // ── Preferred: OAuth2 user credentials (uses the real Google account's storage)
  if (GOOGLE_OAUTH_REFRESH_TOKEN && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    const oauth2 = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );
    oauth2.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });
    console.log('🔑 Drive auth: OAuth2 user credentials');
    return oauth2;
  }

  // ── Fallback: Service Account (only works on Workspace accounts with Drive storage)
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('No Google auth credentials configured. Set GOOGLE_OAUTH_REFRESH_TOKEN or GOOGLE_SERVICE_ACCOUNT_JSON.');
  const credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;
  console.log('🔑 Drive auth: Service Account');
  return new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
}

/**
 * uploadBlueprintToDrive(pdfBuffer, fileName)
 * → { fileId, webViewLink, webContentLink }
 */
export async function uploadBlueprintToDrive(fileBuffer, fileName, mimeType = 'application/pdf') {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: [DRIVE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink, name',
  });

  const fileId = response.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  const meta = await drive.files.get({ fileId, fields: 'id, webViewLink, name' });
  console.log(`✅ Uploaded to Drive: ${meta.data.name} (${fileId})`);

  return {
    fileId,
    webViewLink:    meta.data.webViewLink,
    webContentLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
    name:           meta.data.name,
  };
}
