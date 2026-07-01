const CACHE_KEY = 'dtpbo_items_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

// Items are fetched through /api/items (a serverless proxy that reads the
// Items Google Sheet server-side) so Gabriella can edit item wording without
// a redeploy, and the service account credentials never ship to the browser.
export async function getItems() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { items, fetchedAt } = JSON.parse(cached);
      if (Date.now() - fetchedAt < CACHE_TTL_MS && Array.isArray(items) && items.length) {
        return items;
      }
    }
  } catch {
    // sessionStorage unavailable or corrupt cache — fall through to a fresh fetch
  }

  const res = await fetch('/api/items');
  if (!res.ok) {
    throw new Error('Unable to load the assessment right now. Please try again shortly.');
  }
  const items = await res.json();

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ items, fetchedAt: Date.now() }));
  } catch {
    // ignore storage quota/availability errors
  }

  return items;
}
