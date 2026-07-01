// Section 5 scoring logic (DTPBO build brief) — z-score standardization + Dominant/Secondary blend.
// Used both client-side (instant preview on the Results screen) and server-side
// (authoritative, re-run from raw answers inside api/submit-response.js).

export const TRACK_ORDER = ['D', 'T', 'P', 'B', 'O'];

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function populationStdev(values, avg) {
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * @param {Record<string, number>} answers - item_id -> raw answer (1-4)
 * @param {Array<{item_id: string, track: string}>} items - the 50 items (any order)
 */
export function scoreResponses(answers, items) {
  const rawValues = items.map((item) => answers[item.item_id]);
  const respondentMean = mean(rawValues);
  const stdev = populationStdev(rawValues, respondentMean);
  const lowDifferentiation = stdev === 0;

  const trackZAvg = {};
  const trackRawAvg = {};

  for (const trackId of TRACK_ORDER) {
    const trackItems = items.filter((item) => item.track === trackId);
    const trackRawValues = trackItems.map((item) => answers[item.item_id]);
    trackRawAvg[trackId] = mean(trackRawValues);
    trackZAvg[trackId] = lowDifferentiation
      ? 0
      : mean(trackRawValues.map((raw) => (raw - respondentMean) / stdev));
  }

  // When every answer is identical there's no z-score signal to rank on, so fall
  // back to raw track averages (which will all be equal, correctly yielding a
  // ~20%-per-track blend and a 0 differentiation score).
  const baseAvg = lowDifferentiation ? trackRawAvg : trackZAvg;

  const minVal = Math.min(...TRACK_ORDER.map((t) => baseAvg[t]));
  const shifted = {};
  let total = 0;
  for (const trackId of TRACK_ORDER) {
    shifted[trackId] = baseAvg[trackId] - minVal + 0.1;
    total += shifted[trackId];
  }

  const pct = {};
  for (const trackId of TRACK_ORDER) {
    pct[trackId] = (shifted[trackId] / total) * 100;
  }

  const ranked = [...TRACK_ORDER].sort((a, b) => baseAvg[b] - baseAvg[a]);
  const dominant = ranked[0];
  const secondary = ranked[1];
  const differentiationScore = baseAvg[dominant] - baseAvg[secondary];

  let differentiationTier;
  if (lowDifferentiation) {
    differentiationTier = 'low_differentiation';
  } else if (differentiationScore >= 0.6) {
    differentiationTier = 'strong';
  } else if (differentiationScore >= 0.3) {
    differentiationTier = 'leaning';
  } else {
    differentiationTier = 'blended';
  }

  return {
    mean: respondentMean,
    stdev,
    lowDifferentiation,
    trackZAvg,
    trackRawAvg,
    pct,
    dominant,
    secondary,
    differentiationScore,
    differentiationTier,
  };
}
