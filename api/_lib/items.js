import { TRACK_ORDER } from '../../src/lib/scoring.js';

// Reads the Items tab with the read-only Sheets API key (same key/pattern as
// the COR3 dashboard). Kept server-side only — the browser never sees this key.
export async function fetchItemsFromSheet() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!sheetId || !apiKey) {
    throw new Error('GOOGLE_SHEET_ID / GOOGLE_SHEETS_API_KEY are not configured');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Items!A2:E1000?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Items sheet (${res.status})`);
  }
  const data = await res.json();
  const rows = data.values || [];

  const items = rows
    .filter((row) => row[0])
    .map((row) => ({
      item_id: row[0],
      track: row[1],
      track_full_name: row[2],
      item_text: row[3],
      item_order_in_track: Number(row[4]),
    }));

  items.sort((a, b) => {
    const trackDiff = TRACK_ORDER.indexOf(a.track) - TRACK_ORDER.indexOf(b.track);
    if (trackDiff !== 0) return trackDiff;
    return a.item_order_in_track - b.item_order_in_track;
  });

  return items;
}
