/**
 * GOOGLE DRIVE UPLOADER — v2
 *
 * Delivers a complete 4-file blueprint package into a named customer subfolder:
 *
 *   Tek Boss - Blueprints/
 *   └── [Last, First] — [Business Name] — YYYY-MM-DD/
 *       ├── 01 — Intake Summary.txt
 *       ├── 02 — Statement of Work.pdf
 *       ├── 03 — AI Build Spec.json
 *       └── 04 — Implementation Playbook.txt
 *
 * Auth priority:
 *   1. OAuth2 refresh token  (GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_OAUTH_REFRESH_TOKEN)
 *      → Uploads AS the Google account owner. Uses owner's storage. ✅ Recommended.
 *   2. Service Account JSON  (GOOGLE_SERVICE_ACCOUNT_JSON)
 *      → Only works on Google Workspace accounts with Drive storage.
 */
import { google } from 'googleapis';
import { Readable } from 'stream';

const ROOT_FOLDER_ID = '1V4rQpXzG8PmyLWbC7FWPptWv2_gwk4mU';

export function isDriveConfigured() {
  return !!(
    (process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET) ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  );
}

function getAuthClient() {
  const { GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

  if (GOOGLE_OAUTH_REFRESH_TOKEN && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    const oauth2 = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );
    oauth2.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });
    return oauth2;
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('No Google Drive credentials configured.');
  const credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
}

/** Format a date as YYYY-MM-DD */
function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/** Sanitise a string for use in a Drive folder/file name */
function safeName(str = '') {
  return str
    .replace(/https?:\/\/[^\s,()[\]]+/gi, '')
    .replace(/\bwww\.[^\s,()[\]]+/gi, '')
    .replace(/\([^)]*\)/g, '')
    .split(/[,—–\-|]/)[0]
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s'.,&-]/g, '')  // keep safe chars
    .trim()
    || 'Unknown';
}

/**
 * Get or create a subfolder inside the root Blueprints folder.
 * Returns the subfolder ID.
 */
async function getOrCreateFolder(drive, folderName) {
  // Check if it already exists (avoid duplicates on retry)
  const existing = await drive.files.list({
    q: `'${ROOT_FOLDER_ID}' in parents and name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 1,
  });

  if (existing.data.files?.length) {
    console.log(`📂 Reusing existing Drive folder: ${folderName}`);
    return existing.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ROOT_FOLDER_ID],
    },
    fields: 'id',
  });
  console.log(`📁 Created Drive folder: ${folderName}`);
  return folder.data.id;
}

/** Upload one file into a specific folder, make it publicly readable */
async function uploadFile(drive, buffer, fileName, mimeType, folderId) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: [folderId],
    },
    media: { mimeType, body: stream },
    fields: 'id, webViewLink, name',
  });

  const fileId = file.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  const meta = await drive.files.get({ fileId, fields: 'id, webViewLink, name' });
  console.log(`  ✅ Uploaded: ${meta.data.name}`);

  return {
    fileId,
    webViewLink: meta.data.webViewLink,
    name: meta.data.name,
    webContentLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

/**
 * deliverBlueprintPackage — uploads all 4 files into a named customer folder.
 *
 * @param {object} opts
 * @param {string}  opts.customerName    Full name of the user (from users.full_name)
 * @param {string}  opts.businessName    Business name (cleaned, from answers[1])
 * @param {Buffer}  opts.pdfBuffer       Blueprint / SOW PDF
 * @param {object}  opts.specJson        AI Build Spec (will be JSON-stringified)
 * @param {string}  opts.intakeSummary   Executive summary text
 * @param {string}  opts.playbook        DIY playbook text
 * @param {Date}   [opts.date]           Optional date override (defaults to today)
 *
 * @returns {object} { folderLink, files: { intake, sow, spec, playbook } }
 */
export async function deliverBlueprintPackage({
  customerName,
  businessName,
  pdfBuffer,
  specJson,
  intakeSummary,
  playbook,
  date = new Date(),
}) {
  const auth  = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const cleanBiz      = safeName(businessName);
  const cleanCustomer = (customerName || 'Unknown Customer').trim();
  const dateStr       = isoDate(date);

  // Folder: "Smith, John — Control FREQ — 2026-04-21"
  const folderName = `${cleanCustomer} — ${cleanBiz} — ${dateStr}`;
  const folderId   = await getOrCreateFolder(drive, folderName);
  const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

  console.log(`\n📦 Delivering blueprint package to Drive folder: "${folderName}"`);

  const results = {};

  // 01 — Intake Summary (plain text)
  if (intakeSummary) {
    const content = `TEKBOSS BLUEPRINT — INTAKE SUMMARY\n${'='.repeat(44)}\nCustomer : ${cleanCustomer}\nBusiness : ${cleanBiz}\nDate     : ${dateStr}\n\n${intakeSummary}`;
    results.intake = await uploadFile(
      drive,
      Buffer.from(content, 'utf-8'),
      '01 — Intake Summary.txt',
      'text/plain',
      folderId,
    );
  }

  // 02 — Statement of Work (blueprint PDF)
  if (pdfBuffer) {
    results.sow = await uploadFile(
      drive,
      pdfBuffer,
      '02 — Statement of Work.pdf',
      'application/pdf',
      folderId,
    );
  }

  // 03 — AI Build Spec (JSON)
  if (specJson) {
    const specBuffer = Buffer.from(
      JSON.stringify(specJson, null, 2),
      'utf-8',
    );
    results.spec = await uploadFile(
      drive,
      specBuffer,
      '03 — AI Build Spec.json',
      'application/json',
      folderId,
    );
  }

  // 04 — Implementation Playbook (plain text)
  if (playbook) {
    const content = `TEKBOSS BLUEPRINT — IMPLEMENTATION PLAYBOOK\n${'='.repeat(44)}\nCustomer : ${cleanCustomer}\nBusiness : ${cleanBiz}\nDate     : ${dateStr}\n\n${playbook}`;
    results.playbook = await uploadFile(
      drive,
      Buffer.from(content, 'utf-8'),
      '04 — Implementation Playbook.txt',
      'text/plain',
      folderId,
    );
  }

  console.log(`\n✅ Blueprint package delivered → ${folderLink}\n`);

  return { folderLink, files: results };
}

/**
 * Legacy single-file uploader — kept for the manual /api/download-pdf and
 * /api/deliver-to-drive endpoints that still upload individual files.
 */
export async function uploadBlueprintToDrive(
  fileBuffer,
  fileName,
  mimeType = 'application/pdf',
) {
  const auth  = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: [ROOT_FOLDER_ID],
    },
    media: { mimeType, body: stream },
    fields: 'id, webViewLink, name',
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
