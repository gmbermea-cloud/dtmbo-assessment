import { neon } from '@neondatabase/serverless';

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
// one statement per call, so each schema change is its own statement.
//
// Layer 1 (the original 50-item task-based assessment) has been retired —
// this table originally required its columns as NOT NULL, so existing rows
// still have that data, but new rows only ever populate the Trait-Axis
// (Layer 2) columns. DROP NOT NULL is idempotent (a no-op if already
// nullable), so this is safe to run against both a fresh table and the
// existing production table.
async function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS responses (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          dominant_track TEXT,
          secondary_track TEXT,
          differentiation_score DOUBLE PRECISION,
          low_differentiation BOOLEAN,
          pct_d DOUBLE PRECISION,
          pct_t DOUBLE PRECISION,
          pct_p DOUBLE PRECISION,
          pct_b DOUBLE PRECISION,
          pct_o DOUBLE PRECISION,
          raw_answers JSONB,
          axis1_raw INTEGER,
          axis2_raw INTEGER,
          axis1_normalized DOUBLE PRECISION,
          axis2_normalized DOUBLE PRECISION,
          quadrant_lean TEXT,
          quadrant_strength TEXT,
          trait_axis_answers JSONB
        )
      `;
      await sql`ALTER TABLE responses ALTER COLUMN dominant_track DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN secondary_track DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN differentiation_score DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN low_differentiation DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN pct_d DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN pct_t DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN pct_p DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN pct_b DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN pct_o DROP NOT NULL`;
      await sql`ALTER TABLE responses ALTER COLUMN raw_answers DROP NOT NULL`;
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

export async function insertResponse({ name, email, traitAxisAnswers, traitAxisScored }) {
  await ensureTable();
  await sql`
    INSERT INTO responses (
      name, email, axis1_raw, axis2_raw, axis1_normalized, axis2_normalized,
      quadrant_lean, quadrant_strength, trait_axis_answers
    ) VALUES (
      ${name}, ${email}, ${traitAxisScored.axis1Raw}, ${traitAxisScored.axis2Raw},
      ${traitAxisScored.axis1Normalized}, ${traitAxisScored.axis2Normalized},
      ${traitAxisScored.quadrantLean}, ${traitAxisScored.quadrantStrength}, ${JSON.stringify(traitAxisAnswers)}
    )
  `;
}
