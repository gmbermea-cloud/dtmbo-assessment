# DTPBO Career Inclination Assessment

Standalone Practice & Purpose Co. assessment site. Collects a respondent's name/email,
presents 16 forced-choice pairs across two axes (Conceptual vs Concrete, Content vs
People), and shows a Design/Technical/Management quadrant result on a 2x2 grid.

**This is a first-draft, face-valid instrument — not yet empirically validated.**
Revisit after piloting with real COR3 team members.

This is a separate product from COR3 — not part of that dashboard.

## Setup

### 1. Database (saved responses)

In your Vercel project dashboard, go to the **Storage** tab → **Create Database** →
choose a Postgres option (Neon). Link it to this project. Vercel automatically adds the
connection string as an environment variable — no manual credentials to copy anywhere.

This is the only external dependency the app has. The 16 questions are embedded
directly in the code (`src/lib/traitAxisItemsData.js`) rather than read from a Google
Sheet — see "History" below for why.

### 2. Install and configure env vars

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (auto-filled by Vercel once the database is linked; for local dev, run `npx vercel env pull` after linking) |

### 3. Run locally

```bash
npx vercel dev
```

Vite alone (`npm run dev`) will serve the frontend but not the `/api` serverless
function — use `vercel dev` locally so submission works too (the assessment itself
will run fine either way, since the questions are embedded).

## Deploy to Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Link a Postgres database from the Storage tab (see above).
3. Deploy.

## Editing the questions

Edit `src/lib/traitAxisItemsData.js` directly and redeploy — there's no live sheet to
update. Each entry needs `pair_id`, `axis` (`1` or `2`), `axis_name`, `statement_a`,
`statement_b`, `a_pole`, and `b_pole`. Order matters: TA1-TA8 must be axis 1
(Conceptual vs Concrete), TA9-TA16 must be axis 2 (Content vs People) — the scoring
logic in `src/lib/traitAxisScoring.js` counts A/B picks per axis, so both axes need
exactly 8 items each.

## App flow

```
Intake (name + email) → Questions (16, one per screen) → Result (on-screen, no download)
```

- Question order is fixed: TA1-TA8 (Conceptual vs Concrete), then TA9-TA16 (Content vs
  People).
- Each screen shows two equal-weight statements (no default/pre-selected option, to
  avoid biasing toward one side); picking one both records it and advances. Back returns
  to the previous question; disabled on the first question.
- After the 16th answer, the result is scored and shown immediately, entirely
  client-side (`src/lib/traitAxisScoring.js`). The raw answers are also POSTed to
  `/api/submit-response`, which independently re-runs the same scoring server-side
  (authoritative — client-computed scores are never trusted) and saves a row to the
  database. This save is best-effort and doesn't block or delay the on-screen result.
- The result screen shows the quadrant name, a strength/confidence line, and a 2x2 grid
  with the respondent plotted as a dot. See the comment at the top of
  `TraitAxisResults.jsx` for how the grid's layout was resolved against an internal
  inconsistency in the original build brief addendum's written spec.

## History

This app originally had a first layer — a 50-item, five-track (Design/Technical/PM/BD/
Ops) task-based assessment — with this trait-axis section as a "Part 2" appended after
it. That first layer has been retired; this is now the entire assessment. The database
schema still carries those original columns (nullable, for old rows) but no longer
writes to them.

The questions were also originally read live from a Google Sheet (so wording could be
edited without a redeploy), same as Layer 1 had been. That was dropped in favor of
embedding the 16 items directly in the code: reads kept breaking on sheet/tab
misconfiguration (wrong spreadsheet ID pointing at the wrong document, tab naming
mismatches) even after simplifying away from the Google Cloud service-account issues
documented in earlier commits. For something this short and rarely edited, embedding
removes an entire class of "why isn't this loading" failures at the cost of needing a
code change + redeploy to edit wording.

## Structure

```
src/
  App.jsx                    — screen state machine (intake / questions / results)
  components/
    IntakeForm.jsx
    ProgressBar.jsx
    TraitAxisQuestionCard.jsx  — two-card forced-choice UI
    TraitAxisResults.jsx        — 2x2 grid result + final screenshot note
  lib/
    getTraitAxisItems.js        — returns the embedded items (async, for a stable API)
    traitAxisItemsData.js        — the 16 questions themselves
    traitAxisScoring.js          — forced-choice axis + quadrant scoring logic
api/
  submit-response.js          — POST, scores + saves a response row (database)
  _lib/db.js
```

## Brand tokens

- **Navy (primary):** `#1B2A4A`
- **Gold (accent, respondent's dot on the grid):** `#C9973D`
- (deliberately avoids COR3's teal `#0097A7`)

## Out of scope for v1

PDF/download of individual results, authentication, empirical validation of the
trait-axis items, and any firm-wide/aggregate view.
