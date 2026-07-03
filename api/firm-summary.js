import { getFirmSummary } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const summary = await getFirmSummary();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(summary);
  } catch (err) {
    console.error('GET /api/firm-summary failed', err);
    res.status(502).json({ error: 'Unable to load firm summary' });
  }
}
