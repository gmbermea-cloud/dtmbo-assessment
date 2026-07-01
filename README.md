# DTPBO Career Inclination Assessment

Standalone Practice & Purpose Co. assessment site. Collects a respondent's name/email,
presents 50 fixed-order statements across five tracks (Design, Technical, Project
Management, Business Development, Operations/Finance), scores answers with z-score
standardization, shows a Dominant/Secondary blend result on-screen, and logs raw +
scored data to a Google Sheet.

This is a separate product from COR3 — not part of that dashboard.

## Setup

### 1. Google Sheet

1. Create a Google Sheet with two tabs: `Items` and `Responses`.
2. Import the item bank CSV into the `Items` tab with columns:
   `item_id, track, track_full_name, item_text, item_order_in_track`.
3. Leave `Responses` empty — the app creates the header row on first submission.

### 2. Google Cloud credentials

- **Read access (Items):** enable the Sheets API in Google Cloud Console and create an
  API key. This only needs read access and is used server-side by `/api/items`.
- **Write access (Responses):** create a service account, enable the Sheets API for it,
  and share the spreadsheet with the service account's `client_email` as an **Editor**.

### 3. Install and configure env vars

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `GOOGLE_SHEETS_API_KEY` | Read-only Sheets API key (server-side only) |
| `GOOGLE_SHEET_ID` | The spreadsheet ID from the sheet URL |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Service account JSON (raw or base64), write access |

### 4. Run locally

```bash
npx vercel dev
```

Vite alone (`npm run dev`) will serve the frontend but not the `/api` serverless
functions — use `vercel dev` locally so the Items fetch and submission flow both work.

## Deploy to Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Add `GOOGLE_SHEETS_API_KEY`, `GOOGLE_SHEET_ID`, and `GOOGLE_SERVICE_ACCOUNT_KEY` as
   environment variables in the Vercel project settings.
3. Deploy.

## App flow

```
Intake (name + email) → Questions (50, one per screen) → Results (on-screen, no download)
```

- Question order is fixed: Design → Technical → Project Management → Business
  Development → Operations/Finance, in `item_order_in_track` order within each track.
- Selecting an answer both records it and advances; the Back button lets a respondent
  revise a prior answer.
- On the 50th answer, results are scored and shown immediately client-side
  (`src/lib/scoring.js`), while the raw answers are POSTed to `/api/submit-response`,
  which independently re-fetches the Items sheet, re-runs the same scoring logic
  server-side, and appends a row to `Responses`. The server never trusts
  client-computed scores.

## Structure

```
src/
  App.jsx                 — screen state machine (intake / questions / results)
  components/
    IntakeForm.jsx
    QuestionCard.jsx
    ProgressBar.jsx
    ResultsScreen.jsx
    TrackBarChart.jsx
  lib/
    getItems.js            — fetches /api/items, 5-minute session cache
    scoring.js              — z-score + Dominant/Secondary blend logic (shared)
    tracks.js               — track names/descriptions/chart colors
  api/
    items.js                 — GET, proxies the Items sheet read (API key)
    submit-response.js       — POST, scores + appends to Responses (service account)
    _lib/items.js, sheetsClient.js, responseSheet.js
```

## Brand tokens

- **Navy (primary):** `#1B2A4A`
- **Gold (accent, scale buttons):** `#C9973D`
- **Track chart colors:** Design `#B5563C`, Technical `#4C6B57`, Project Management
  `#1B2A4A`, Business Development `#C9973D`, Operations/Finance `#6B4E71`
  (deliberately avoids COR3's teal `#0097A7`)

## Out of scope for v1

PDF/download of results, authentication, an admin/aggregate dashboard, and randomized
question order.
