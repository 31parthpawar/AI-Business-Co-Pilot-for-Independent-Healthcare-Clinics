# App: Clinic Co-Pilot

**Live: https://clinic-copilot-six.vercel.app** (sample data only; open it on a phone and install it).

The MVP from `docs/prototype-spec.md` (read that first: the clinic's fields, features F1 to F6, build plan). A web app that runs entirely in the browser: no server, no AI calls, no data leaves the device. Demo at the poster presentation on 9 Dec 2026.

No real clinic data in this folder or anywhere in the repo (it's public). Real files stay in git-ignored `data/` and are only opened on the clinic's computer.

## What it is

- **A web app (PWA).** One codebase for Android, iPhone and the receptionist's computer. It installs to the home screen like a normal app and works offline after the first load.
  - **Android (Chrome):** open the link, then menu > "Install app" (or "Add to Home screen").
  - **iPhone (Safari):** open the link, then Share > "Add to Home Screen". Install it rather than using a tab: Safari can clear a website's stored data after about a week without use, but home-screen apps keep it.
- **Data stays on the device,** in the browser's storage (IndexedDB). Each phone or computer has its own copy; there is no sync yet.
- **Phone first** for the doctor; wider screens get a fuller dashboard for the receptionist.
- **Light, dark or auto** (follows the phone), switched from the header and remembered on each device.

## AI features (coming soon)

There are no API credits yet, so each AI feature shows what it will do and a **See a sample** view:

| Feature | Where | Sample |
| --- | --- | --- |
| Post and carousel writer | Posts | Five hand-written posts: dengue carousel, 9-month check carousel, fever myths (English and Hindi), a clinic notice story |
| Ask about your clinic | Dashboard | Answers built from the clinic's real numbers by fixed rules |
| Weekly WhatsApp summary | Dashboard | This week's summary built from the clinic's numbers |
| Read register photos | Data | A register page and the table the reader would extract |

Posts follow the NMC guidelines (Oct 2026): health education and neutral clinic notices only; no offers, testimonials or "best" claims; every post says it's for information only, and the doctor approves it. A test checks the sample posts for banned wording.

## Run it

```bash
cd app/web
npm install
npm run dev              # http://localhost:5173
npm run dev -- --host    # also opens on a phone on the same Wi-Fi (as a website)
npm test                 # logic tests on planted sample data
npm run build            # production build in dist/
npm run sample           # write the sample clinic's sheets to app/sample-data/
```

Installing to the home screen needs https, so use the live link, not local Wi-Fi.

## Deploy

Hosted on Vercel (project `clinic-copilot`, iamgarvit's account). Not yet linked to GitHub, so redeploy by hand from `app/web`:

```bash
npx vercel deploy --prod
```

To deploy on every push to main: install the Vercel GitHub app on this repo (the repo owner has to approve it), then run `npx vercel git connect` and set the project's Root Directory to `app/web`.

## Screens

| Screen | What it shows |
| --- | --- |
| Dashboard | Needs attention (rule-based, plain language), headline numbers, month against target, who to call, new patients by source, what changed, retention, busy months, busy sessions; Ask about your clinic and the weekly WhatsApp summary (coming soon, with samples from the clinic's numbers) |
| Calls | The five call lists, top 10 by priority, one-tap outcome (booked, reached, no answer, declined) |
| Patients | Search by case number or name; patient card with visits, AP history, vaccines due, call outcomes |
| Posts | What to post this month (from the clinic's data and the season), the NMC rules every post follows, and the AI post and carousel writer (coming soon, with sample posts) |
| Data | Load sample data, import the clinic's Excel or CSV, download sample sheets, Settings (clinic name and timings, targets, earnings switch, call-list rules), register photo reading (coming soon, with a sample) |

## Status against the spec

| Spec item | Status |
| --- | --- |
| B1 Import (visit log, AP table, vaccine table) | Done. Finds the header row, maps column names, day-first dates, carries a blank date down, reports unreadable rows |
| F1 Who to call (renewals, overdue vaccines, lapsed regulars, unused AP) with outcomes | Done |
| F2 Cross-sell to AP | Done (a fifth call list) |
| F4 Retention | Done |
| F5 Target pacing | Done |
| F6 Session and seasonal load | Done |
| Patient card | Done |
| Dashboard and rule-based insights | Done |
| New patients by source | Done (optional Source column, falls back to the Remark text) |
| B2 Daily and 12-month summaries in the clinic's layout | To do |
| B3 Export back to Excel | To do |
| B4 Manual daily form | To do |
| F3 Patient value | To do |
| Settings for service names and sources | To do (defaults in `src/settings.ts`) |
| Deploy | To do |

## New patients

Getting new patients is the survey's top pain (48%), and the clinic doesn't record how they found it. The app handles it three ways today:

1. **Optional Source column** in the visit log: a word ("Google") or a one-letter code (G Google, W word of mouth, R doctor referral, L walk-in, O other), for new patients only.
2. **Remark fallback:** if Source is blank, the first visit's remark is read for words like "ref Dr.", "Google", "friend".
3. **New vs old by case number.** When the data starts, every long-standing patient looks "new" on their first row. Clinics usually issue case numbers in order, so a new patient's number is higher than any seen before. To confirm with the clinic; without numeric case numbers the app ignores the first 3 months instead.

More ideas, not built yet: `docs/prototype-spec.md`, "New patients: ways to capture the source".

## Code layout

```
app/web/
  src/types.ts, settings.ts   data model and defaults (nothing clinic-specific in code)
  src/import/                 Excel/CSV reading and column mapping
  src/logic/                  every rule as a pure function, with tests
  src/sample/                 synthetic clinic generator (planted patterns) and Excel writer
  src/screens/                Dashboard, Calls, Patients, Data
  src/charts.tsx, ui.tsx      charts and shared UI
  src/store.tsx, db.ts        app state, stored in IndexedDB
  scripts/write-sample.ts     writes sample sheets to app/sample-data/
app/sample-data/              generated sample sheets (git-ignored; regenerate any time)
```

## Sample data

A made-up pediatric clinic: about 2,800 patients and 27 visits a day over 3 years, generated up to today. Planted patterns so every feature has something to find: Google-sourced new patients drop in the last 10 weeks, regulars who stop coming, overdue vaccines, AP members who never use it, a monsoon peak, busier evenings, and AP sales behind target this month. Fake names only.
