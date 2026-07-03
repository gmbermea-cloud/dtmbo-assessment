const CACHE_KEY = 'dtpbo_trait_axis_items_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

// Fetches through /api/trait-axis-items (a serverless proxy that reads the
// TraitAxisItems sheet server-side) so Gabriella can edit item wording
// without a redeploy, with a 5-minute session cache.
export async function getTraitAxisItems() {
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

  const res = await fetch('/api/trait-axis-items');
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
