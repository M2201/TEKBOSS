/**
 * Quick Drive upload smoke test.
 * Run with: node test-drive-upload.mjs
 * Reads creds from .env or process.env — set them before running.
 */
import { google } from 'googleapis';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const DRIVE_FOLDER_ID = '1V4rQpXzG8PmyLWbC7FWPptWv2_gwk4mU';

const {
  GOOGLE_OAUTH_REFRESH_TOKEN,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_SERVICE_ACCOUNT_JSON,
} = process.env;

function getAuth() {
  if (GOOGLE_OAUTH_REFRESH_TOKEN && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    console.log('🔑 Using OAuth2 user credentials');
    const oauth2 = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );
    oauth2.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });
    return oauth2;
  }
  if (GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log('🔑 Using Service Account (fallback)');
    const creds = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
  }
  throw new Error('No Google credentials found in environment.');
}

async function run() {
  console.log('\n🚀 TekBoss Drive Upload Smoke Test\n');

  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  // Create a tiny text file as test payload
  const content = `TekBoss Drive Upload Test\nTimestamp: ${new Date().toISOString()}\n`;
  const buffer = Buffer.from(content, 'utf8');

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileName = `_DRIVE_TEST_${Date.now()}.txt`;

  console.log(`📤 Uploading "${fileName}" to folder ${DRIVE_FOLDER_ID}...`);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: 'text/plain',
      parents: [DRIVE_FOLDER_ID],
    },
    media: { mimeType: 'text/plain', body: stream },
    fields: 'id, webViewLink, name',
  });

  const fileId = response.data.id;

  // Make it readable by anyone so we can verify the link
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  const meta = await drive.files.get({ fileId, fields: 'id, webViewLink, name' });

  console.log('\n✅ SUCCESS — File uploaded to Google Drive!');
  console.log(`   Name    : ${meta.data.name}`);
  console.log(`   File ID : ${fileId}`);
  console.log(`   Link    : ${meta.data.webViewLink}`);
  console.log(`\n📂 Check your Drive folder here:`);
  console.log(`   https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`);
  console.log('');
}

run().catch(err => {
  console.error('\n❌ DRIVE UPLOAD FAILED');
  console.error('   Error:', err.message);
  if (err.response?.data) {
    console.error('   API response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
