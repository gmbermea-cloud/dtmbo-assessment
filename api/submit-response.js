import { fetchTraitAxisItemsFromSheet } from './_lib/traitAxisItems.js';
import { insertResponse } from './_lib/db.js';
import { scoreTraitAxis } from '../src/lib/traitAxisScoring.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const { name, email, traitAxisAnswers } = body;

    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }
    if (!traitAxisAnswers || typeof traitAxisAnswers !== 'object') {
      res.status(400).json({ error: 'Answers are required' });
      return;
    }

    // Item list (and the axis mapping used for scoring) is re-fetched from
    // the sheet rather than trusted from the client.
    const traitAxisItems = await fetchTraitAxisItemsFromSheet();

    const normalizedTraitAxisAnswers = {};
    const invalidPairs = [];
    for (const item of traitAxisItems) {
      const choice = traitAxisAnswers[item.pair_id];
      if (choice !== 'A' && choice !== 'B') {
        invalidPairs.push(item.pair_id);
        continue;
      }
      normalizedTraitAxisAnswers[item.pair_id] = choice;
    }

    if (invalidPairs.length > 0) {
      res.status(400).json({ error: `Missing or invalid answers for ${invalidPairs.length} pair(s)` });
      return;
    }

    // Scoring is run here from the raw answers — client-computed scores, if any
    // were sent, are never trusted or used.
    const traitAxisScored = scoreTraitAxis(normalizedTraitAxisAnswers, traitAxisItems);

    await insertResponse({
      name: name.trim(),
      email: email.trim(),
      traitAxisAnswers: normalizedTraitAxisAnswers,
      traitAxisScored,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('POST /api/submit-response failed', err);
    res.status(500).json({ error: 'Failed to save response' });
  }
}
