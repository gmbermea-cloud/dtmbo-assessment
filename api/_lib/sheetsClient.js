import { google } from 'googleapis';

function loadServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not configured');
  }
  // Accepts either a raw JSON string or a base64-encoded JSON string.
  const jsonStr = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8');
  return JSON.parse(jsonStr);
}

let cachedSheetsClient = null;

// Single service account, used for both reading Items and writing Responses.
// Credentials never leave the server. See build brief Section 6.
export function getSheetsClient() {
  if (cachedSheetsClient) return cachedSheetsClient;

  const credentials = loadServiceAccountCredentials();
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  cachedSheetsClient = google.sheets({ version: 'v4', auth });
  return cachedSheetsClient;
}
