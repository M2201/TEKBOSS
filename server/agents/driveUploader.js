/**
 * GOOGLE DRIVE UPLOADER
 * Uploads the blueprint PDF to the TekBoss Blueprints folder
 * and returns a shareable link for the client.
 *
 * Credentials come from: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
 * Target folder: 1V4rQpXzG8PmyLWbC7FWPptWv2_gwk4mU
 */
import { google } from 'googleapis';
import { Readable } from 'stream';

const DRIVE_FOLDER_ID = '1V4rQpXzG8PmyLWbC7FWPptWv2_gwk4mU';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

function getAuthClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var is not set.');

  const credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return auth;
}

/**
 * uploadBlueprintToDrive(pdfBuffer, fileName)
 * → { fileId, webViewLink, webContentLink }
 */
export async function uploadBlueprintToDrive(pdfBuffer, fileName) {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  // Convert Buffer to readable stream
  const stream = new Readable();
  stream.push(pdfBuffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: 'application/pdf',
      parents: [DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: 'application/pdf',
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink, name',
  });

  const fileId = response.data.id;

  // Make it accessible to anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Fetch the updated sharing link
  const meta = await drive.files.get({
    fileId,
    fields: 'id, webViewLink, name',
  });

  console.log(`✅ Blueprint uploaded to Drive: ${meta.data.name} (${fileId})`);

  return {
    fileId,
    webViewLink:     meta.data.webViewLink,
    webContentLink:  `https://drive.google.com/uc?export=download&id=${fileId}`,
    name:            meta.data.name,
  };
}
