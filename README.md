# DTPBO Career Inclination Assessment

Standalone Practice & Purpose Co. assessment site. Collects a respondent's name/email,
presents 16 forced-choice pairs across two axes (Conceptual vs Concrete, Content vs
People), and shows a Design/Technical/Management quadrant result on a 2x2 grid.

**This is a first-draft, face-valid instrument — not yet empirically validated.**
Revisit after piloting with real COR3 team members.

This is a separate product from COR3 — not part of that dashboard.

## Setup

### 1. Google Sheet (editable questions)

1. Create a Google Sheet with a tab named exactly `TraitAxisItems`.
2. Import the item bank CSV into that tab with columns:
   `pair_id, axis, axis_name, statement_a, statement_b, a_pole, b_pole`.
3. In Google Cloud Console, enable the **Google Sheets API** on a project, then create
   an **API key** (Credentials → Create Credentials → API key). This only needs read
   access and is used server-side by `/api/trait-axis-items` — it's never exposed to
   the browser.

### 2. Database (saved responses)

In your Vercel project dashboard, go to the **Storage** tab → **Create Database** →
choose a Postgres option (Neon). Link it to this project. Vercel automatically adds the
connection string as an environment variable — no manual credentials to copy anywhere.

### 3. Install and configure env vars

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `GOOGLE_SHEETS_API_KEY` | Read-only Sheets API key (server-side only) |
| `GOOGLE_SHEET_ID` | The spreadsheet ID from the sheet URL (the part between `/d/` and `/edit`) — must be the spreadsheet that has the `TraitAxisItems` tab |
| `DATABASE_URL` | Postgres connection string (auto-filled by Vercel once the database is linked; for local dev, run `npx vercel env pull` after linking) |

### 4. Run locally

```bash
npx vercel dev
```

Vite alone (`npm run dev`) will serve the frontend but not the `/api` serverless
functions — use `vercel dev` locally so the item fetch and submission both work.

## Deploy to Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Link a Postgres database from the Storage tab (see above).
3. Add `GOOGLE_SHEETS_API_KEY` and `GOOGLE_SHEET_ID` as environment variables in the
   Vercel project settings.
4. Deploy.

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
  `/api/submit-response`, which independently re-fetches the item bank, re-runs the same
  scoring server-side (authoritative — client-computed scores are never trusted), and
  saves a row to the database. This save is best-effort and doesn't block or delay the
  on-screen result.
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
    getTraitAxisItems.js        — fetches /api/trait-axis-items, 5-minute session cache
    traitAxisScoring.js          — forced-choice axis + quadrant scoring logic
api/
  trait-axis-items.js         — GET, proxies the TraitAxisItems sheet read (API key)
  submit-response.js          — POST, scores + saves a response row (database)
  _lib/traitAxisItems.js, db.js
```

## Brand tokens

- **Navy (primary):** `#1B2A4A`
- **Gold (accent, respondent's dot on the grid):** `#C9973D`
- (deliberately avoids COR3's teal `#0097A7`)

## Out of scope for v1

PDF/download of individual results, authentication, empirical validation of the
trait-axis items, and any firm-wide/aggregate view.
