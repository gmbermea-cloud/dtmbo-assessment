import { fetchTraitAxisItemsFromSheet } from './_lib/traitAxisItems.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const items = await fetchTraitAxisItemsFromSheet();
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=60');
    res.status(200).json(items);
  } catch (err) {
    console.error('GET /api/trait-axis-items failed', err);
    res.status(502).json({ error: 'Unable to load trait-axis items' });
  }
}
