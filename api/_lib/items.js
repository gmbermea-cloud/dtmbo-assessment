import { TRACK_ORDER } from '../../src/lib/scoring.js';
import { getSheetsClient } from './sheetsClient.js';

// Reads the Items tab via the same service account used for writes, so only
// one credential (GOOGLE_SERVICE_ACCOUNT_KEY) is needed for the whole app.
export async function fetchItemsFromSheet() {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured');
  }

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Items!A2:E1000',
  });
  const rows = res.data.values || [];

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
