import { fetchItemsFromSheet } from './_lib/items.js';
import { fetchTraitAxisItemsFromSheet } from './_lib/traitAxisItems.js';
import { insertResponse } from './_lib/db.js';
import { scoreResponses } from '../src/lib/scoring.js';
import { scoreTraitAxis } from '../src/lib/traitAxisScoring.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const { name, email, answers, traitAxisAnswers } = body;

    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Answers are required' });
      return;
    }
    if (!traitAxisAnswers || typeof traitAxisAnswers !== 'object') {
      res.status(400).json({ error: 'Part 2 answers are required' });
      return;
    }

    // Item lists (and the mappings used for scoring) are re-fetched from the
    // sheets rather than trusted from the client.
    const [items, traitAxisItems] = await Promise.all([
      fetchItemsFromSheet(),
      fetchTraitAxisItemsFromSheet(),
    ]);

    const normalizedAnswers = {};
    const invalidItems = [];
    for (const item of items) {
      const raw = Number(answers[item.item_id]);
      if (![1, 2, 3, 4].includes(raw)) {
        invalidItems.push(item.item_id);
        continue;
      }
      normalizedAnswers[item.item_id] = raw;
    }

    if (invalidItems.length > 0) {
      res.status(400).json({ error: `Missing or invalid answers for ${invalidItems.length} item(s)` });
      return;
    }

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
      res.status(400).json({ error: `Missing or invalid answers for ${invalidPairs.length} part 2 pair(s)` });
      return;
    }

    // Scoring is run here from the raw answers — client-computed scores, if any
    // were sent, are never trusted or used.
    const scored = scoreResponses(normalizedAnswers, items);
    const traitAxisScored = scoreTraitAxis(normalizedTraitAxisAnswers, traitAxisItems);

    await insertResponse({
      name: name.trim(),
      email: email.trim(),
      answers: normalizedAnswers,
      scored,
      traitAxisAnswers: normalizedTraitAxisAnswers,
      traitAxisScored,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('POST /api/submit-response failed', err);
    res.status(500).json({ error: 'Failed to save response' });
  }
}
