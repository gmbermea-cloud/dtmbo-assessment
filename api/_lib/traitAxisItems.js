// Reads the TraitAxisItems tab with the same plain Sheets API key used for
// Items (read-only, server-side only). See Build Brief Addendum Section 2.
export async function fetchTraitAxisItemsFromSheet() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!sheetId || !apiKey) {
    throw new Error('GOOGLE_SHEET_ID / GOOGLE_SHEETS_API_KEY are not configured');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/TraitAxisItems!A2:G1000?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch TraitAxisItems sheet (${res.status})`);
  }
  const data = await res.json();
  const rows = data.values || [];

  const items = rows
    .filter((row) => row[0])
    .map((row) => ({
      pair_id: row[0],
      axis: Number(row[1]),
      axis_name: row[2],
      statement_a: row[3],
      statement_b: row[4],
      a_pole: row[5],
      b_pole: row[6],
    }));

  // Fixed order: TA1-TA8 (Axis 1), then TA9-TA16 (Axis 2).
  items.sort((a, b) => {
    if (a.axis !== b.axis) return a.axis - b.axis;
    const aNum = Number(a.pair_id.replace(/\D/g, ''));
    const bNum = Number(b.pair_id.replace(/\D/g, ''));
    return aNum - bNum;
  });

  return items;
}
