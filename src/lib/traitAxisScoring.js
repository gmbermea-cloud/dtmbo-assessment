// Trait-Axis Layer scoring (Build Brief Addendum v2, Section 4).
// v1, face-valid instrument — not yet empirically validated. Flagging per
// Section 8 of the addendum so this gets revisited after piloting.
//
// Used both client-side (instant preview on the trait-axis results screen)
// and server-side (authoritative, re-run from raw answers in
// api/submit-response.js).

export const AXIS_1 = 1; // Conceptual (A) vs Concrete (B)
export const AXIS_2 = 2; // Content (A) vs People (B)

function axisScore(axisItems, answers) {
  let countA = 0;
  let countB = 0;
  for (const item of axisItems) {
    const choice = answers[item.pair_id];
    if (choice === 'A') countA += 1;
    else if (choice === 'B') countB += 1;
  }
  const raw = countA - countB; // -8 to 8
  const normalized = ((raw + 8) / 16) * 100; // 0-100
  return { raw, normalized };
}

/**
 * @param {Record<string, 'A' | 'B'>} answers - pair_id -> chosen pole
 * @param {Array<{pair_id: string, axis: number}>} items - the 16 pairs (any order)
 */
export function scoreTraitAxis(answers, items) {
  const axis1Items = items.filter((item) => Number(item.axis) === AXIS_1);
  const axis2Items = items.filter((item) => Number(item.axis) === AXIS_2);

  const axis1 = axisScore(axis1Items, answers); // 0 = Concrete, 100 = Conceptual
  const axis2 = axisScore(axis2Items, answers); // 0 = People-focus, 100 = Content-focus

  let quadrantLean;
  let decidingNormalized;
  let boundaryTracks;

  if (axis2.normalized < 50) {
    quadrantLean = 'Management';
    decidingNormalized = axis2.normalized;
    boundaryTracks = ['Management', axis1.normalized > 50 ? 'Design' : 'Technical'];
  } else {
    quadrantLean = axis1.normalized > 50 ? 'Design' : 'Technical';
    decidingNormalized = axis1.normalized;
    boundaryTracks = ['Design', 'Technical'];
  }

  const distance = Math.abs(decidingNormalized - 50);
  let quadrantStrength;
  let headline;
  if (distance >= 25) {
    quadrantStrength = 'Strongly leaning';
    headline = `Strongly ${quadrantLean}-leaning`;
  } else if (distance >= 10) {
    quadrantStrength = 'Leaning';
    headline = `${quadrantLean}-leaning`;
  } else {
    quadrantStrength = 'Boundary blend';
    headline = `Right at the boundary between ${boundaryTracks[0]} and ${boundaryTracks[1]} — a genuine blend`;
  }

  return {
    axis1Raw: axis1.raw,
    axis2Raw: axis2.raw,
    axis1Normalized: axis1.normalized,
    axis2Normalized: axis2.normalized,
    quadrantLean,
    quadrantStrength,
    headline,
  };
}
