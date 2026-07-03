# DTPBO Career Inclination Assessment

Standalone Practice & Purpose Co. assessment site, in two parts:

- **Part 1 — Task-based (Layer 1):** 50 fixed-order statements across five tracks
  (Design, Technical, Project Management, Business Development, Operations/Finance),
  scored with z-score standardization, producing a Dominant/Secondary blend.
- **Part 2 — Trait-Axis (Layer 2):** 16 forced-choice pairs across two axes (Conceptual
  vs Concrete, Content vs People), producing a Design/Technical/Management quadrant
  placement, plotted on a 2x2 grid. **This is a first-draft, face-valid instrument — not
  yet empirically validated.** Revisit after piloting with real COR3 team members.

Both parts run back-to-back in one sitting; one response is saved per respondent, once,
at the very end. Each response is saved so a firm-wide average blend can be viewed at
`/firm`.

This is a separate product from COR3 — not part of that dashboard.

## Setup

### 1. Google Sheet (editable questions)

1. Create a Google Sheet with two tabs named exactly `Items` and `TraitAxisItems`.
2. Import the Layer 1 item bank CSV into `Items` with columns:
   `item_id, track, track_full_name, item_text, item_order_in_track`.
3. Import the Layer 2 item bank CSV into `TraitAxisItems` with columns:
   `pair_id, axis, axis_name, statement_a, statement_b, a_pole, b_pole`.
4. In Google Cloud Console, enable the **Google Sheets API** on a project, then create
   an **API key** (Credentials → Create Credentials → API key). This only needs read
   access and is used server-side by `/api/items` and `/api/trait-axis-items` — it's
   never exposed to the browser.

### 2. Database (saved responses + firm-wide chart)

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
| `GOOGLE_SHEET_ID` | The spreadsheet ID from the sheet URL (the part between `/d/` and `/edit`) |
| `DATABASE_URL` | Postgres connection string (auto-filled by Vercel once the database is linked; for local dev, run `npx vercel env pull` after linking) |

### 4. Run locally

```bash
npx vercel dev
```

Vite alone (`npm run dev`) will serve the frontend but not the `/api` serverless
functions — use `vercel dev` locally so the Items fetch and submission both work.

## Deploy to Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Link a Postgres database from the Storage tab (see above).
3. Add `GOOGLE_SHEETS_API_KEY` and `GOOGLE_SHEET_ID` as environment variables in the
   Vercel project settings.
4. Deploy.

## App flow

```
Intake → Layer 1 questions (50) → Layer 1 results → Part 2 transition
       → Layer 2 questions (16) → Layer 2 results (final screen)
```

- Layer 1 question order is fixed: Design → Technical → Project Management → Business
  Development → Operations/Finance, in `item_order_in_track` order within each track.
  Layer 2 order is fixed: TA1-TA8 (Conceptual vs Concrete), then TA9-TA16 (Content vs
  People).
- Selecting an answer both records it and advances; the Back button lets a respondent
  revise a prior answer (on Layer 2's first question, Back returns to the Part 2
  transition screen).
- Layer 1 results are scored and shown immediately after the 50th answer, entirely
  client-side (`src/lib/scoring.js`) — nothing is saved yet at that point.
- The respondent then continues into Layer 2. After the 16th trait-axis answer, Layer 2
  is scored client-side (`src/lib/traitAxisScoring.js`) and shown as the final screen —
  **this is also when the single save happens**: both layers' raw answers are POSTed
  together to `/api/submit-response`, which independently re-fetches both sheets,
  re-runs both scoring functions server-side (authoritative — client-computed scores are
  never trusted), and saves one row to the database. This save is best-effort and
  doesn't block or delay the on-screen result.
- `/firm` shows the average Layer 1 track blend across every saved response, no login
  required — open to anyone with the URL, same as the assessment itself. (Layer 2 data
  is saved but not yet surfaced on `/firm`.)

## Deviations from the build briefs

- **Storage:** both build briefs describe writing to Google Sheets via a service
  account. That path is blocked — this org's Google Cloud policy disables all service
  account key creation. Responses are saved to Postgres instead (see Setup #2); reading
  the item banks still uses a plain read-only Sheets API key, which isn't affected by
  that policy.
- **Layer 2 grid layout:** the Trait-Axis addendum's written anchor positions ("Design
  top-left... Technical bottom-left... Management right side") are internally
  inconsistent with its own scoring math (Design and Technical only differ on one axis,
  so they can't be on the same side; Management is decided by the other axis alone, so
  it can't be tied to one side of the first). `TraitAxisResults.jsx` lays the grid out
  to match the scoring logic instead — see the comment at the top of that file for the
  exact reasoning.
- **Layer 2 raw answers:** stored as one JSONB column (`trait_axis_answers`) rather than
  16 separate `TA1`...`TA16` columns, for consistency with how Layer 1's 50 raw answers
  are already stored (`raw_answers` JSONB).

## Structure

```
src/
  App.jsx                    — full screen state machine, plus /firm routing
  components/
    IntakeForm.jsx
    QuestionCard.jsx           — Layer 1 (4-point scale)
    ProgressBar.jsx
    ResultsScreen.jsx           — Layer 1 result + "Continue to Part 2"
    TrackBarChart.jsx
    TraitAxisTransition.jsx     — Part 2 intro screen
    TraitAxisQuestionCard.jsx   — Layer 2 (forced-choice pairs)
    TraitAxisResults.jsx        — Layer 2 result: 2x2 grid + final screenshot note
    FirmDashboard.jsx           — firm-wide average blend chart, reads /api/firm-summary
  lib/
    getItems.js                 — fetches /api/items, 5-minute session cache
    getTraitAxisItems.js        — fetches /api/trait-axis-items, 5-minute session cache
    scoring.js                   — Layer 1: z-score + Dominant/Secondary blend logic
    traitAxisScoring.js          — Layer 2: forced-choice axis + quadrant logic
    tracks.js                    — Layer 1 track names/descriptions/chart colors
api/
  items.js                    — GET, proxies the Items sheet read (API key)
  trait-axis-items.js         — GET, proxies the TraitAxisItems sheet read (API key)
  submit-response.js          — POST, scores both layers + saves one response row
  firm-summary.js             — GET, average Layer 1 track % across all saved responses
  _lib/items.js, traitAxisItems.js, db.js
```

## Brand tokens

- **Navy (primary):** `#1B2A4A`
- **Gold (accent, scale buttons, respondent's dot on the Layer 2 grid):** `#C9973D`
- **Track chart colors:** Design `#B5563C`, Technical `#4C6B57`, Project Management
  `#1B2A4A`, Business Development `#C9973D`, Operations/Finance `#6B4E71`
  (deliberately avoids COR3's teal `#0097A7`)

## Out of scope for v1

PDF/download of individual results, authentication (including on `/firm`), randomized
question order, empirical validation of the Layer 2 trait-axis items, and a Layer 2
view on the firm-wide dashboard.
