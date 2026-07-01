import { getSheetsClient } from './sheetsClient.js';
import { TRACK_ORDER } from '../../src/lib/scoring.js';

const TAB = 'Responses';

function columnLetter(n) {
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function buildHeader(items) {
  return [
    'timestamp',
    'name',
    'email',
    ...items.map((item) => item.item_id),
    'dominant_track',
    'secondary_track',
    'differentiation_score',
    'low_differentiation',
    ...TRACK_ORDER.map((t) => `${t}_pct`),
  ];
}

async function ensureHeader(sheets, spreadsheetId, header) {
  const lastCol = columnLetter(header.length);
  const range = `${TAB}!A1:${lastCol}1`;
  const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const hasHeader = Boolean(existing.data.values?.[0]?.length);
  if (!hasHeader) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TAB}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [header] },
    });
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export async function appendResponseRow({ name, email, answers, items, scored }) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured');
  }

  const sheets = getSheetsClient();
  const header = buildHeader(items);
  await ensureHeader(sheets, spreadsheetId, header);

  const row = [
    new Date().toISOString(),
    name,
    email,
    ...items.map((item) => answers[item.item_id]),
    scored.dominant,
    scored.secondary,
    round2(scored.differentiationScore),
    scored.lowDifferentiation,
    ...TRACK_ORDER.map((t) => round2(scored.pct[t])),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TAB}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}
