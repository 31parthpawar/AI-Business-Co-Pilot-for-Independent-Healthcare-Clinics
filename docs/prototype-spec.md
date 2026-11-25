# Prototype Spec: Clinic Co-Pilot MVP

**Status:** agreed 25 Nov 2026. Demo at the poster presentation on **9 Dec 2026**.

**Replaces** `docs/demo-plan.md` as the plan for what we build now. The demo plan stays for history; its lead features (register photo reading, review QR, recommend links, check-in QR, AI features) are dropped or moved to later (see "Not in the MVP").

## Goal

A working app built on the first clinic's real record structure that does what Excel can't.

Excel counts what happened. The app tells the doctor **who to act on and what is working**: which patients to call today and why, who to offer the annual program to, which patients are worth most, whether new patients come back, and whether the month is on track.

The app must:

1. Take the data the clinic already keeps, with no new daily chore.
2. Produce the clinic's own daily and monthly summaries automatically (the base layer).
3. Add six features that Excel can't do (the pitch).

## Why we start from one clinic

We build on the first clinic's exact fields (Parth's father's pediatric clinic) because it is the only real data we have and the doctor is committed to using it. After the pilot we generalise. To keep that cheap, **nothing clinic-specific is hard-coded**: service names, the membership program, the vaccine schedule, targets and thresholds all live in Settings.

Survey context: only 11% of surveyed clinics keep records in Excel (68% paper, 42% EMR). Excel import is the answer for this clinic, not yet for most clinics.

## What the clinic records today

Five tables, all filled in by hand. Reference copies with headers only (all values removed, since this repo is public) are in `docs/clinic-data/`.

| Table | One row per | Reference |
| --- | --- | --- |
| Visit log | Patient visit | `docs/clinic-data/visit-log-fields.png` |
| Annual program (AP) table | AP membership | Headers to come (see open questions) |
| Vaccine table | Patient and vaccine | Headers to come (see open questions) |
| Daily summary sheet | Session (morning or evening OPD) | `docs/clinic-data/daily-summary-fields.xlsx` |
| 12-month summary sheet | Month | `docs/clinic-data/12-month-summary-fields.xlsx` |

The doctor tracks each patient by **case number**: visits, services used, payment per visit, AP expiry and renewals, and vaccines due.

**Key finding:** the daily and 12-month sheets restate the visit log. The same visits are entered once per patient, then tallied by hand into about 26 columns per session (two sessions a day), then rolled up again by month. 20 of the 26 daily columns can be calculated from the visit log, AP table and vaccine table. The reference copies contain no formulas, so totals may be typed by hand (to confirm).

### 1. Visit log

| Column | Meaning | Notes |
| --- | --- | --- |
| DATE | Visit date | |
| Day | Weekday | Derivable from DATE |
| Mopd/Eopd | Session: morning or evening OPD | |
| Name | Patient name | Stays on the clinic's device |
| Case No. | Patient ID, used to track the patient over time | Key for everything |
| Service | Service type, e.g. OPD, vaccine, AP | Exact values to confirm |
| Detail (visit/vac. name) | Visit type or vaccine name | Exact values to confirm |
| Amount | Amount paid for this visit | 0 for unpaid follow-ups |
| Mode | Payment mode: cash or online | Exact values to confirm |
| Remark | Free text | |

### 2. AP table (annual program)

The AP is a yearly membership: free consultations, discounted vaccines and other benefits. Fields the doctor keeps, as described to us (exact headers to come):

- Case No.
- AP start date (to confirm)
- AP expiry date
- Number of renewals

### 3. Vaccine table

Fields as described to us (exact headers to come):

- Case No.
- Vaccines given (name, date)
- Vaccines due (name, due date, to confirm whether stored or worked out)

### 4. Daily summary sheet (`daily-summary-fields.xlsx`)

Layout:

- Header cells: year, month, "Opening AP" and "Current AP" (active memberships at the start of the month and now).
- Rows 4 to 63: two rows per day, `mopd` and `eopd`.
- Columns D to AC: 26 per-session entries (below).
- Columns AE to CQ: monthly totals of the same items plus derived figures (revenue without vaccine cost, net profit, vaccine net profit, AP active, total patients).
- Bottom block: week number, days in week, month total, monthly target, weekly average, weekly target, % of weekly target achieved.

Per-session columns and how the app gets each one. "Assumed" rules need the doctor's confirmation.

| Col | Header | How the app gets it |
| --- | --- | --- |
| D | OPD | Sum of Amount where service is OPD |
| E | Vac. Amount | Sum of Amount where service is vaccine |
| F | Annual Programe sale | Sum of Amount where service is AP sale |
| G | CASH payment | Sum of Amount where Mode is cash |
| H | BANK payment | Sum of Amount where Mode is online or bank |
| I | Variable Expens | **Manual** |
| J | Fixed Expens | **Manual** |
| K | Vaccian used Cost | **Manual** |
| L | Aditi bill | **Manual** (supplier bill) |
| M | Toasha bill | **Manual** (supplier bill) |
| N | Total review | **Manual**. Stored only; no nudges (see NMC note) |
| O | New AP sales | AP rows starting in the session with renewal count 0 |
| P | Renew AP sale | AP rows renewed in the session |
| Q | Exp | AP rows whose expiry date falls in the session's day |
| R | Paid OPD Old pt. | OPD, Amount > 0, case number seen before |
| S | Unpaid OPD pt. | OPD, Amount = 0 |
| T | Unpaid online opd | OPD, online consult, Amount = 0 (assumed: "online" means teleconsult) |
| U | AP visit 1 | AP member's first visit in the membership (assumed) |
| V | AP - Follow up | AP member's later visits (assumed) |
| W | Online AP | AP member's online consults (assumed) |
| X | New OPD pt. | OPD where the case number has no earlier visit |
| Y | AP Vac pt. | Vaccine visits by AP members |
| Z | Old Vacc. Pt. | Vaccine visits by patients with an earlier vaccine visit |
| AA | New Vac 1st time | Vaccine visit where the case number has no earlier visit |
| AB | New vac old pt. | First vaccine visit for a case number with earlier non-vaccine visits |
| AC | No. of Vac | Count of vaccines given (a visit can have several) |

20 calculated, 6 manual. The six manual ones are a small form per session (B4 below).

### 5. 12-month summary sheet (`12-month-summary-fields.xlsx`)

One row per month (about 30 months back), plus five summary rows: max, min and average over the last 12 months, monthly target, and total over the last 12 months.

Columns: total revenue (OPD + vaccine + AP), OPD revenue, vaccine revenue, AP revenue, vaccine bill, revenue without vaccine cost, fixed and variable expenses, net profit, vaccine cost used, vaccine net profit, cash, online, reviews, AP sales (with % of target), new AP sales, AP renewals, AP expiries, AP active, AP visit 1, AP follow-up, AP OPD, AP per day, paid OPD (with % of target), paid old OPD, new patients, vaccine patients, old vaccine patients, new vaccine old patients, new vaccine new patients, AP vaccine patients, number of vaccines, all patients, unpaid OPD patients.

The doctor sets **monthly targets** for: OPD revenue, AP revenue, net profit, reviews, AP sales, paid OPD and vaccine patients.

Everything here is a monthly roll-up of the daily sheet, so the app calculates it.

### What the clinic does not record

- **Phone number:** needed before any WhatsApp reminder. Until then, call lists are for the receptionist to phone from the clinic's own records.
- **How a new patient found the clinic:** this is the survey's top pain (getting new patients, 48%; "where new patients come from" 53% in Q17), and the MVP can't address it without the data. Proposal: one optional "Source" column for new case numbers, added during the pilot.
- **Date of birth:** not needed for the MVP if the vaccine table stores due dates.

## Data model

Normalised from the tables above. Names are suggestions.

```
Patient        case_no (key), name, first_visit_date (derived)
Visit          id, date, session (M|E), case_no, service (mapped category), detail,
               vaccines[] (parsed from detail), amount, mode (cash|online), remark
Membership     case_no, start_date, expiry_date, renewal_count, price
VaccineRecord  case_no, vaccine, given_date?, due_date?
DailyManual    date, session, variable_exp, fixed_exp, vaccine_cost, supplier_bills{}, reviews
CallOutcome    case_no, list, date, outcome (reached|not reached|booked|declined), note
Settings       service_map, membership {name, price, duration_months}, targets,
               thresholds, vaccine_schedule, earnings_on
```

Everything else is derived, never stored.

## Base layer (plumbing, needed by everything)

| ID | Piece | What it does |
| --- | --- | --- |
| B1 | Import | Read the visit log, AP table and vaccine table from Excel. Map columns and Service values through Settings. Show rows it couldn't read for a quick fix |
| B2 | Automatic summaries | The 20 calculable daily columns by session, monthly totals, and the 12-month view (max, min, average, target, total), matching the doctor's layout |
| B3 | Export | Write the daily and 12-month sheets back to Excel in his layout, so he loses nothing |
| B4 | Manual daily form | The 6 manual items per session |
| B5 | Settings | Service mapping, membership price and duration, targets, thresholds, vaccine schedule, earnings on or off |

## The six features

Each rule is a first version; thresholds live in Settings.

### F1. Who to call today

Four lists. Every row shows case number, name, **why** they are on the list, last visit, and an outcome button.

| List | Rule | Sorted by |
| --- | --- | --- |
| a. AP renewals | Membership expiring in the next 30 days, or expired in the last 30 days and not renewed | Visits during the membership (high use = easy renewal; low use = needs a call explaining what they missed) |
| b. Vaccines overdue | Vaccine due date has passed and there's no vaccine visit since | Days overdue |
| c. Lapsed regulars | Patients with 3+ visits whose time since last visit is more than 2× their usual gap between visits | Past 12-month spend |
| d. AP members not using it | Active members with 0 or 1 visits in the last 6 months | Days to expiry |

**Outcome button** (reached, not reached, booked, declined): one tap, stored as CallOutcome. This is how the pilot will show whether the lists bring patients back.

Why: 97% of surveyed doctors don't follow up regularly with lapsed patients; "which patients stopped coming" was wanted by 42%.

### F2. Cross-sell to AP

Patients who aren't AP members and whose spending in the last 12 months is at or above the AP price. Shows "would have saved ₹X with AP", using the visits they paid for that AP would have covered (rule set in Settings).

Why: the advisor flagged cross-selling.

### F3. Patient value

- Average 12-month spend and visits per patient, grouped by **first service** (first visit was OPD, vaccine or AP).
- AP renewal rate by renewal count (first-year members vs second-year and later).

Why: the advisor flagged customer lifetime value. Answers "which kind of new patient is worth most?"

### F4. Retention

For each month, the new case numbers that month and the share that came back within 3 months and within 6 months. Shown as a simple cohort table and a line.

Why: only 20% of surveyed doctors know how many patients return within a year.

### F5. Target pacing

For each count target (paid OPD, AP sales, vaccine patients): month to date, % of target, and projected month-end at the current pace. Example: "Paid OPD at 40% of target with 10 days left. At this pace: 55%."

Projection: month-to-date ÷ sessions so far × sessions in the month.

Money targets (OPD revenue, AP revenue, net profit) appear only if earnings are switched on. The **reviews target is not used** (see NMC note).

Why: the doctor sets targets today but only sees the gap after the month ends.

### F6. Session and seasonal load

Patients per session (morning and evening) by weekday, and visits by month across years. A heatmap and a bar chart.

Why: the advisor flagged resource management. Helps with session timings and staff.

## Not in the MVP, and why

| Feature | Status | Reason |
| --- | --- | --- |
| Review QR, review drafting, review-count nudges | **Dropped** | NMC Guidelines on Ethical Advertising and Public Communication (in effect from 6 Oct 2026) bar doctors from requesting patient reviews or testimonials for promotion |
| Recommend links | **Dropped for now** | Same NMC rules on soliciting patients; revisit only after a proper check |
| Register photo reading | Later | This clinic already keeps Excel; needs API credits |
| Self check-in QR | Later | Not needed for this clinic |
| WhatsApp reminders | Later | No phone field yet; needs consent under the DPDP Act |
| Patient source tracking | Pilot | Needs the proposed optional Source column |
| AI features (plain-language summaries, Ask about your clinic) | Next semester | No API credits; every MVP feature is plain logic |
| Appointment booking, logins, multiple clinics | Out of scope | |

## Screens

1. **Today:** pacing cards (F5) and the number of patients on each call list (F1).
2. **Call lists:** tabs for renewals, vaccines, lapsed regulars, unused AP, cross-sell (F2).
3. **Patient card:** search by case number or name. Visit timeline, services, amounts, total spend, AP status and renewals, vaccines given and due, call outcomes.
4. **Insights:** retention (F4), patient value (F3), load (F6), monthly trends.
5. **Data:** import (B1), daily summary with manual form (B2, B4), 12-month view, export (B3).
6. **Settings** (B5).

Desktop first (the receptionist's computer), readable on a phone.

## Tech

- **Vite + React + TypeScript + Tailwind.** Charts: Recharts. Dates: date-fns.
- **Excel:** SheetJS. Install it from `cdn.sheetjs.com`; the `xlsx` package on npm is out of date.
- **Storage:** IndexedDB through Dexie. Everything runs in the browser; **no server, no AI calls** in the MVP.
- **Logic:** every rule in F1 to F6 and B2 is a pure TypeScript function in `app/web/src/logic/`, with Vitest tests against synthetic data where the expected answers are planted.
- **Deploy:** static (Vercel), synthetic data only. Real data is used only on the clinic's own computer.

Folder layout:

```
app/
  web/            the app
    src/logic/    rules (pure functions + tests)
    src/import/   Excel reading and column mapping
    src/screens/
  sample-data/    synthetic data generator and generated .xlsx files in the clinic's layout
```

## Synthetic data

A generator in `app/sample-data/` that writes the visit log, AP table and vaccine table as `.xlsx` in the clinic's exact columns, for 3 years of a small pediatric clinic: two sessions a day, a mix of paid and unpaid OPD, AP visits and vaccines, fake names.

Planted patterns, so each feature has something to find:

- About half of expiring AP members don't renew; a few members never visit after buying.
- Children with an overdue vaccine dose.
- Regulars who stop coming.
- Frequent non-members whose spend is above the AP price.
- A monsoon peak; evenings busier than mornings.
- A month running behind target.

Vaccine due dates come from a simple configurable schedule in Settings. It is the doctor's schedule, not medical advice from the app.

## Privacy

- **This repo is public.** Never commit real clinic files or real numbers. Real files go in `data/` (git-ignored). `docs/clinic-data/` holds field names only.
- Real data stays on the clinic's computer, in the browser.
- Before any messaging to patients: consent under the DPDP Act.

## Build plan to 9 Dec

| Dates | Work | Priority |
| --- | --- | --- |
| 26 to 28 Nov | Project setup, data model, synthetic data generator, Excel import (B1), patient card | Must |
| 29 Nov to 2 Dec | Call lists F1 (all four) with outcome button, target pacing F5, Today screen | Must |
| 3 to 5 Dec | Cross-sell F2, retention F4, daily summary and manual form (B2, B4) | Should |
| 6 to 7 Dec | Patient value F3, load F6, export B3, Settings screen | Nice to have |
| 8 Dec | Run on the clinic's real data (on its computer), doctor's feedback, fixes | Must |
| 9 Dec | Demo at the poster presentation | |

**Done for the demo:** import synthetic files, see the daily summary, Today screen with pacing, all four call lists with outcomes, patient card, and at least cross-sell and retention.

## Demo script (5 minutes)

1. Import the clinic's sheets (synthetic). The daily summary appears in the doctor's own layout: "20 of 26 columns he types by hand, calculated."
2. Today: AP sales at 40% of target with 10 days left.
3. Call lists: renewals ranked by use; mark one "booked".
4. Open that patient's card: visits, spend, AP history, vaccines due.
5. Cross-sell: a family that would have saved ₹X with AP.
6. Insights: how many new patients come back.
7. Close: next is a 6-week pilot at the clinic.

## Open questions for the clinic (blocking the importer)

1. Screenshots of the **AP table** and **vaccine table** headers, like the visit log one.
2. The exact values used in **Service**, **Detail** and **Mode**. How are several vaccines in one visit written?
3. **AP price(s)**, duration (12 months?) and what it covers (which consults are free, vaccine discount).
4. Does the vaccine table store **due dates**, or only vaccines given? Is it in Excel or Axon EMR, and can it be exported?
5. Is the **case number** permanent per child? Do siblings get separate numbers?
6. In the daily sheet, does **"online"** mean a teleconsult or an online payment? What exactly are AP visit 1, AP follow-up and Online AP?
7. Are the daily and 12-month totals **typed by hand** or calculated with formulas?
8. Are the default thresholds right: 30 days for renewals, 2× usual gap for lapsed, 0 or 1 visits in 6 months for unused AP?
