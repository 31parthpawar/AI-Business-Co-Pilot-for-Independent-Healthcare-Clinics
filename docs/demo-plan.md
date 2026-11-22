# Demo App Plan

**Goal:** a working web app to show Prof. Vajpayee and put in the report (screenshots), ready by 24 Nov 2026. It runs on synthetic data modeled on the first clinic, and switches to the clinic's real, anonymized data once we have it.

**Status:** proposed, pending team approval. Items marked *(open decision)* can be switched on or off, so either answer from the advisor is cheap to adopt.

## The problems it has to address

Ranked by survey evidence (`research/findings.md`).

| Problem | Evidence | What the demo does about it |
| --- | --- | --- |
| Getting new patients | Top challenge, 48%; "where new patients come from" 53% in Q17 | Shows where new patients come from, flags when a source drops, and prompts for Google reviews |
| Retention nobody sees | 97% don't follow up regularly; 80% don't clearly know their return rate | Lists the patients to call back (lapsed patients and vaccines due), with a one-tap WhatsApp reminder |
| Marketing that doesn't happen | 56% do no promotion; Google profile users get Google patients far more often (19 of 25 vs 5 of 41) | Small, specific actions instead of general marketing advice |
| Decisions on gut feel | 65% | The clinic's numbers in plain language: what changed and why |
| Wants suggestions | Most wanted feature, 65% (60% within the pick limit) | Rule-based nudges, each tied to a number *(open decision)* |

## Design principles

Each one comes from a survey finding.

1. **Push, don't pull.** 59% spend under 2 hours a week on business work, and one doctor wrote "I already have it in my EMR software, but not using it". The home screen shows at most three things, and a weekly WhatsApp-style digest brings the insights to the doctor.
2. **Lead with new patients.** It is the top pain, especially for flat practices (64% vs 28% for growing ones).
3. **Show people, not rates.** A list of 18 named-by-ID patients to call is actionable; "return rate 41%" is not. Doctors who know their return rate are about twice as likely to follow up (7 of 13 vs 4 of 17).
4. **Suggest narrowly.** Each nudge names a number and one action. No general growth advice: doctors asked for "things that actually work... rather than the old ideas of pamphlets".
5. **Paper-friendly input.** 68% keep paper registers and only 11% use Excel. Receptionist entry takes under 2 minutes a day; file import serves EMR users, who are also the likelier payers (11% want it free vs 34% without EMR).
6. **No finance needed.** Everything runs on visits. Earnings are optional (39% would share).
7. **Don't sell it as AI.** 79% have never used AI tools for business. The chat box is called "Ask about your clinic" and comes with ready-made questions.
8. **Phone first.** Doctors check it between patients; the receptionist may use a desktop.

## How the design evolved

**v0, before the survey:** upload an Excel file, see a dashboard of metrics, ask questions in a chat box.

Problems the survey exposed:
- Excel upload fits 11% of clinics.
- A dashboard waits to be opened, and doctors spend little time on business work.
- Plain metrics don't say what to do, yet suggestions were the top request.
- Patient source is barely recorded anywhere, so "where new patients come from" can't be computed from existing records.
- An AI-first pitch means little to doctors who don't use AI.

**v1, after the survey:** quick receptionist entry with a one-tap "how did you hear about us", a call-back list, rule-based nudges, a weekly digest, and the chat box kept but secondary.

**Demo cut:** v1 trimmed to what can be built in about two days and shown in five minutes. Real WhatsApp sending, logins and EMR integration are left out. The table below shows what each version has.

| Feature | v0 | v1 | Demo |
| --- | --- | --- | --- |
| Excel upload | Main input | One of two inputs | CSV import (sample file) |
| Receptionist entry with patient source | No | Yes | Yes |
| New-patient sources and trend | One metric | Lead screen | Yes |
| Call-back list (lapsed and vaccines due) | No | Yes | Yes, with WhatsApp links |
| Rule-based nudges | No | Yes *(open decision)* | Yes, behind a toggle |
| Weekly digest | No | Yes | Preview screen |
| Monthly trends, services used | Yes | Yes | Yes |
| Chat about own numbers | Main pitch | Secondary | Yes, with suggested questions |
| Earnings view | Optional | Optional | Toggle, estimated as fee × visits |
| Busy months, benchmarking | Yes | Later | No (15% and 27% in Q17) |

## Screens

1. **Home, "This week":** new patients this month vs the usual, the call-back count, and up to three nudges.
2. **Add visit (receptionist):** patient ID or phone number, new or returning, service (consultation, vaccination, annual program), and, for new patients, "how did you hear about us" (word of mouth, Google, doctor referral, walk-in, other). Large tap targets, about 10 seconds per entry.
3. **Call back:** patients due for a vaccine and patients not seen in 6+ months, each with a "Send reminder" button that opens a prefilled WhatsApp message.
4. **New patients:** source mix over time, a flag when a source drops, and a "request Google review" link to send after a visit.
5. **Trends:** monthly visits, services used most, annual program renewals.
6. **Ask about your clinic:** chat with suggested questions ("Why were new patients down in October?").
7. **Weekly digest:** a preview of the message the doctor would receive on WhatsApp.
8. **Settings:** nudges on or off, earnings on or off (fee list), file import.

## Nudge rules (examples)

| Trigger | Nudge |
| --- | --- |
| Patients last seen 6 to 12 months ago | "18 patients haven't visited in 6 months. Send them a reminder?" |
| Vaccine due within 14 days | "9 children are due for vaccines this fortnight." |
| New patients 20% below the 3-month average | "New patients fell 25% this month. Most of the drop is from Google." |
| Few Google-sourced patients | "Only 3 new patients came from Google this month. Ask today's patients for a review." |
| Source missing for many new patients | "Source wasn't recorded for 40% of new patients this week." |
| Annual program memberships expiring | "6 annual memberships expire this month." |
| A referring doctor sends fewer patients | "Referrals from Dr. A dropped from 8 to 2 this quarter." |

## Demo script (5 minutes)

1. Monday morning at the clinic: the doctor opens the weekly digest on the phone.
2. Home screen: new patients are down and Google is the cause, so the doctor sends a review request.
3. Call back: 18 lapsed patients and 9 vaccines due, so the receptionist sends reminders.
4. Receptionist adds a new patient in 10 seconds, including how they heard about the clinic.
5. Ask: "Which months were slowest last year?"
6. Close on the evidence: each screen maps to a survey number.

## Data

- **Synthetic dataset:** a pediatric clinic over about 3 years with roughly 1,500 patients. Visits carry a service type, a patient source and a vaccine schedule. It includes deliberate patterns for the demo to find: a drop in Google-sourced patients, a group of lapsed patients, a monsoon peak and expiring annual memberships.
- **Real data:** the first clinic's Excel and EMR exports, anonymized, kept in git-ignored `data/`. Never committed.

## Recommended tech

- Vite, React and TypeScript with Tailwind and a chart library. Deployed as a static site (Vercel or GitHub Pages).
- All data stays in the browser. No backend and no patient data leaving the device, which keeps us on the right side of the DPDP Act.
- WhatsApp through `wa.me` links with prefilled text, so no API approval is needed.
- Ask box: a language model call through a small serverless function that receives only aggregated numbers, never patient rows. Canned answers as a fallback so the demo works offline.
- Why: buildable in 1 to 2 days, no infrastructure, and easy to change after the advisor's answers.

## Out of scope for the demo

Automated WhatsApp sending, live EMR integration, logins and multiple clinics, benchmarking, billing, appointment booking, and any view for chemists or partners. Appointments and reminders came up unprompted in 17% of open answers; they are tracked in `docs/next-semester-plan.md`.
