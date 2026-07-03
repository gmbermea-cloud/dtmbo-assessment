# DTPBO Career Inclination Assessment

Standalone Practice & Purpose Co. assessment site. Collects a respondent's name/email,
presents 50 fixed-order statements across five tracks (Design, Technical, Project
Management, Business Development, Operations/Finance), scores answers with z-score
standardization, shows a Dominant/Secondary blend result on-screen, and saves each
response so a firm-wide average blend can be viewed at `/firm`.

This is a separate product from COR3 — not part of that dashboard.

## Setup

### 1. Google Sheet (editable questions)

1. Create a Google Sheet with a tab named exactly `Items`.
2. Import the item bank CSV into that tab with columns:
   `item_id, track, track_full_name, item_text, item_order_in_track`.
3. In Google Cloud Console, enable the **Google Sheets API** on a project, then create
   an **API key** (Credentials → Create Credentials → API key). This only needs read
   access and is used server-side by `/api/items` — it's never exposed to the browser.

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
Intake (name + email) → Questions (50, one per screen) → Results (on-screen, no download)
```

- Question order is fixed: Design → Technical → Project Management → Business
  Development → Operations/Finance, in `item_order_in_track` order within each track.
- Selecting an answer both records it and advances; the Back button lets a respondent
  revise a prior answer.
- On the 50th answer, results are scored and shown immediately, entirely client-side
  (`src/lib/scoring.js`). The raw answers are also POSTed to `/api/submit-response`,
  which independently re-fetches the Items sheet, re-runs the same scoring logic
  server-side, and saves the row to the database. The server never trusts
  client-computed scores. This save is best-effort and doesn't block or delay the
  on-screen result.
- `/firm` shows the average track blend across every saved response, no login
  required — open to anyone with the URL, same as the assessment itself.

## Structure

```
src/
  App.jsx                 — screen state machine (intake / questions / results), plus /firm routing
  components/
    IntakeForm.jsx
    QuestionCard.jsx
    ProgressBar.jsx
    ResultsScreen.jsx
    TrackBarChart.jsx
    FirmDashboard.jsx     — firm-wide average blend chart, reads /api/firm-summary
  lib/
    getItems.js            — fetches /api/items, 5-minute session cache
    scoring.js              — z-score + Dominant/Secondary blend logic
    tracks.js               — track names/descriptions/chart colors
api/
  items.js                 — GET, proxies the Items sheet read (API key)
  submit-response.js       — POST, scores + saves a response row (database)
  firm-summary.js          — GET, average track % across all saved responses
  _lib/items.js, db.js
```

## Brand tokens

- **Navy (primary):** `#1B2A4A`
- **Gold (accent, scale buttons):** `#C9973D`
- **Track chart colors:** Design `#B5563C`, Technical `#4C6B57`, Project Management
  `#1B2A4A`, Business Development `#C9973D`, Operations/Finance `#6B4E71`
  (deliberately avoids COR3's teal `#0097A7`)

## Out of scope for v1

PDF/download of individual results, authentication (including on `/firm`), and
randomized question order.
