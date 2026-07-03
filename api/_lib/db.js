import { neon } from '@neondatabase/serverless';
import { TRACK_ORDER } from '../../src/lib/scoring.js';

// Vercel's Storage tab provisions a Neon-backed Postgres database and injects
// a connection string automatically when linked to the project — no manual
// credentials to configure. Different integration versions have used
// different env var names, so check the common ones.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

const sql = neon(connectionString);

let tableReady = null;

// Idempotent — safe to call on every request. The Neon HTTP driver only runs
// one statement per call, so the Trait-Axis columns (added after Layer 1 was
// already live in production) are added as separate, nullable ALTER
// TABLE ... ADD COLUMN IF NOT EXISTS statements rather than baked into the
// CREATE TABLE — existing rows predate Part 2 and genuinely have no
// trait-axis data.
async function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS responses (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          dominant_track TEXT NOT NULL,
          secondary_track TEXT NOT NULL,
          differentiation_score DOUBLE PRECISION NOT NULL,
          low_differentiation BOOLEAN NOT NULL,
          pct_d DOUBLE PRECISION NOT NULL,
          pct_t DOUBLE PRECISION NOT NULL,
          pct_p DOUBLE PRECISION NOT NULL,
          pct_b DOUBLE PRECISION NOT NULL,
          pct_o DOUBLE PRECISION NOT NULL,
          raw_answers JSONB NOT NULL
        )
      `;
      await sql`ALTER TABLE responses ADD COLUMN IF NOT EXISTS axis1_raw INTEGER`;
      await sql`ALTER TABLE responses ADD COLUMN IF NOT EXISTS axis2_raw INTEGER`;
      await sql`ALTER TABLE responses ADD COLUMN IF NOT EXISTS axis1_normalized DOUBLE PRECISION`;
      await sql`ALTER TABLE responses ADD COLUMN IF NOT EXISTS axis2_normalized DOUBLE PRECISION`;
      await sql`ALTER TABLE responses ADD COLUMN IF NOT EXISTS quadrant_lean TEXT`;
      await sql`ALTER TABLE responses ADD COLUMN IF NOT EXISTS quadrant_strength TEXT`;
      await sql`ALTER TABLE responses ADD COLUMN IF NOT EXISTS trait_axis_answers JSONB`;
    })();
  }
  await tableReady;
}

export async function insertResponse({ name, email, answers, scored, traitAxisAnswers, traitAxisScored }) {
  await ensureTable();
  await sql`
    INSERT INTO responses (
      name, email, dominant_track, secondary_track, differentiation_score,
      low_differentiation, pct_d, pct_t, pct_p, pct_b, pct_o, raw_answers,
      axis1_raw, axis2_raw, axis1_normalized, axis2_normalized,
      quadrant_lean, quadrant_strength, trait_axis_answers
    ) VALUES (
      ${name}, ${email}, ${scored.dominant}, ${scored.secondary}, ${scored.differentiationScore},
      ${scored.lowDifferentiation}, ${scored.pct.D}, ${scored.pct.T}, ${scored.pct.P}, ${scored.pct.B}, ${scored.pct.O},
      ${JSON.stringify(answers)},
      ${traitAxisScored.axis1Raw}, ${traitAxisScored.axis2Raw}, ${traitAxisScored.axis1Normalized}, ${traitAxisScored.axis2Normalized},
      ${traitAxisScored.quadrantLean}, ${traitAxisScored.quadrantStrength}, ${JSON.stringify(traitAxisAnswers)}
    )
  `;
}

export async function getFirmSummary() {
  await ensureTable();
  const rows = await sql`
    SELECT
      COUNT(*)::int AS count,
      AVG(pct_d) AS avg_d,
      AVG(pct_t) AS avg_t,
      AVG(pct_p) AS avg_p,
      AVG(pct_b) AS avg_b,
      AVG(pct_o) AS avg_o
    FROM responses
  `;
  const row = rows[0];
  const count = row.count;

  if (count === 0) {
    return { count: 0, pct: null };
  }

  const avgByTrack = { D: row.avg_d, T: row.avg_t, P: row.avg_p, B: row.avg_b, O: row.avg_o };
  const pct = {};
  for (const trackId of TRACK_ORDER) {
    pct[trackId] = Number(avgByTrack[trackId]);
  }

  return { count, pct };
}
