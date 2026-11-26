# BTP Project Context: AI Business Co-Pilot for Independent Healthcare Clinics

This file is the single source of truth for our BTP. Claude Code reads it automatically at the start of every session, so both of us (and our agents) work from the same context.

**Rule for humans and agents:** if a decision changes, update this file and `docs/decisions.md` in the same commit. Never leave a decision only in a chat.

## Where we stand (as of 25 Nov 2026)

- Semester report submitted 25 Nov 2026. **Poster presentation with a progress demo on 9 Dec 2026. First functional prototype by end of December; pilot at the clinic from January, 4 to 6 weeks (tentative).**
- Questionnaire analysed at **66 responses** (target was 25 to 30; the form now shows 67). Full analysis in `research/findings.md`.
- **The growth tracker is validated** (89% find it useful).
- **The prototype is now specified** on the first clinic's real record structure: `docs/prototype-spec.md`. Its fields are in `docs/clinic-data/`.
- **App foundation built (25 Nov)** in `app/web/`: an installable web app (PWA) for Android, iPhone and desktop, data on the device only. Done: import, dashboard, call lists F1 and F2 with outcomes, retention F4, pacing F5, load F6, patient card, new patients by source, sample clinic. To do: summaries B2, export B3, manual form B4, patient value F3, deploy. Status in `app/README.md`.
- **Current goals:**
  1. Build the MVP for the 9 Dec demo, per `docs/prototype-spec.md`.
  2. Get the open data questions answered by the clinic (end of the spec).
  3. Next semester's approach, per `docs/next-semester-plan.md`.

## Project basics

| Item | Detail |
| --- | --- |
| Registered title | AI Business Co-Pilot for Independent Healthcare Clinics |
| Registered description | Independent clinic owners in India are domain experts forced to double as business owners, managing revenue, retention and growth with disconnected tools and no real business intelligence. This project builds a context-aware AI business co-pilot for small clinics that surfaces key metrics and insights through a natural language interface, enabling doctors to make informed business decisions without stepping outside their clinician role. |
| Track | Entrepreneurship (ENT) BTP. Credits count towards Parth's Entrepreneurship minor |
| Team | Parth Pawar (BTP) and Garvit (Independent Project, IP), both B.Tech, IIIT Delhi, working together on the same product. The BTP is Parth's alone; Garvit's work is his IP |
| Advisor | Prof. Pankaj Vajpayee, Professor of Practice and Director & CEO of IIITD Innovation & Incubation Center (IIITD-IC) |
| Duration | 2 semesters: Monsoon 2026 (ends with this report) and Winter 2027 |
| Target user | Small specialist clinics in the service industry, practicing for 5+ years |
| First user | Parth's father's pediatric clinic in Delhi, fully committed to using what we build |
| Long-term | Generalize to other specialties, then possibly other small service businesses |

## How we got here

| Decision | What we chose | Why |
| --- | --- | --- |
| Domain | Small healthcare clinics | Committed real user (Parth's father) with real data. Set aside: token-optimization middleware (needs a CS advisor), personal finance (crowded market). Content creation was set aside earlier (overlap with a family member's startup; NMC) and brought back on 25 Nov as a later AI feature limited to health education and clinic notices |
| First focus | Clinic's business side, not a patient-facing app | Smaller build, one clear user. Parent app is a possible later extension |
| Core problem | Doctors forced to think like business owners | Discovery with Parth's father |
| Order of work | Business thinking first, tech second | Start from what an MBA or entrepreneur would analyze; build only what serves those insights |
| Target segment | Small specialist clinics, 5+ years of practice | Enough history to see trends. Agreed with advisor |
| Data | Patient and visit data first, finances optional | Advisor: payments mostly cash, doctors won't share finances. Survey partly confirms: 39% would add earnings vs 64% appointments |
| Validation | Questionnaire as main source, after informal conversations with doctors in Parth's father's network | Done: 66 responses |
| MVP scope | Action lists and rule-based insights on the clinic's own records, no general growth advice | Suggestions were the most wanted feature (65%); describing changes alone is something Excel already does |
| Starting point | Build on the first clinic's exact data fields; generalise after the pilot | Only real data we have. Settings keep it clinic-agnostic |

## The problem

Clinic owners are doctors first, but growing the clinic forces them to think like business owners, with scattered data and no business support.

Our first clinic is **one example**, not proof that every clinic works the same way:

- **Services:** consultations (booked and walk-in), vaccinations, and an annual health program (AP: yearly membership with free consultations, discounted vaccines, other benefits).
- **Records:** Excel for most data including the annual program; Axon EMR for vaccines (with due dates); appointments booked by phone and written in a paper diary. Patients are tracked by case number, one per child (siblings have separate numbers). Five hand-filled tables: a visit log, an AP table, a vaccine table, a daily summary sheet (two sessions a day) and a 12-month summary with monthly targets. The summary sheets restate the visit log: 20 of 26 daily columns can be calculated. Details: `docs/prototype-spec.md`.
- **Staff:** a receptionist handles appointments, patient messages and admin.
- **Business decisions:** the doctor reviews data himself and uses ChatGPT and Claude. The survey shows this is unusual: 79% of doctors have never used AI tools for business decisions.

## What the survey showed (66 doctors)

Full detail in `research/findings.md`. Question numbers follow the live form (20 questions, no location question).

- **Getting new patients is the top pain** (48%), then competition from hospitals and chains (33%) and marketing (33%). Only 9% chose "patients not coming back".
- **Retention is a blind spot:** 97% don't regularly follow up with lapsed patients; 80% don't know or only roughly know their return rate.
- **Gut feel drives decisions** (65%); only 26% use their own records.
- **Word of mouth is everything:** 91% get new patients through it; 56% do no active promotion.
- **Paper is the main record system** (68%); EMR 42%; Excel only 11%.
- **AI tools are barely used:** 79% never for business decisions.
- **Little time on business work:** 59% spend under 2 hours a week. Business work isn't eating their time; it mostly isn't being done.
- **The tool is wanted:** 42% very useful, 47% somewhat, 11% not useful.
- **Most wanted (Q17):** suggestions to grow (65%), where new patients come from (53%), who stopped coming (42%), monthly visit trends (39%), which marketing works (35%), services used most (29%), comparison with similar clinics (27%), busy and slow months (15%).
- **Data sharing (Q18):** appointment records 64%, visit counts 61%, services used 42%, earnings 39%, none 12%.
- **Pricing (Q19):** free only 24%, up to ₹500 33%, ₹500 to ₹1,500 29%, above ₹1,500 14%.
- **Open answers (Q20):** more patients and reach (11 of 41), appointments, reminders and follow-up (7), records and admin (6), marketing that works today (5).
- **Acquisition pain sits with flat practices:** 64% of flat practices name getting new patients, vs 28% of growing ones. Of the 32 who name it, 20 do no active promotion.
- **Likely first buyers:** 10 to 20 years in practice (20 of 21 find it useful, 1 wants it free), 2+ hours a week on business work, EMR users (11% want it free vs 34% without EMR), 20+ patients a day.
- **Skeptics:** 6 of the 7 "not useful" answers come from doctors practicing 20+ years, mostly the same ones who would share no data.
- **Google profile is the one channel that visibly pays off:** 19 of 25 who use it get patients from Google, vs 5 of 41 who don't (correlation).

Sample caveat: convenience sample through one doctor's network, 73% pediatrics, 80% practicing 10+ years. Strong signal for experienced pediatricians, weaker for other specialties. No location data. The form didn't enforce "pick up to N" (11 doctors ticked more than 3 in Q17); rankings hold without them. 5 respondents appear to run larger setups (NICU, admissions). Willingness to pay is self-reported and barely varies with how useful doctors rate the tool.

Hypotheses: confirmed (new patients top pain, gut-driven decisions, little deliberate marketing, earnings shared least); refuted (patients not returning as a stated pain, doctors already using AI tools); mixed (visibility: 58% say they track earnings, only 20% know return rate).

## Advisor guidance

Prof. Vajpayee judges the project through a business and entrepreneurship lens, not a CS one. Background in finance, business strategy and consulting; previously visiting faculty at IIM Raipur and IIFT.

Business areas he flagged for a clinic: USP, local demographics, customers' paying capacity, pivoting, SOPs, marketing channels, finance and records, resource management, network, customer lifetime value (CLV), cross-selling.

He asked us to research before building, use a questionnaire, and narrow the target to small specialist clinics practicing 5+ years. His caution: doctors won't share finances because payments are mostly cash.

His suggestion (Nov 2026, after the survey): sell the product to chemists and nearby stores rather than to doctors themselves. An idea, not a decision. It is tested next semester as one of three payer models (`docs/next-semester-plan.md`); the survey has no data on it yet.

## Proposed solution

A business co-pilot that works on the clinic's own records and tells the doctor **who to act on and what is working**. Excel counts what happened; EMRs record visits; neither says what to do next.

How the idea evolved:

| Stage | Idea | What changed it |
| --- | --- | --- |
| Registered | AI co-pilot with a natural-language interface | Advisor: research before building |
| Growth monitor | Track metrics, describe changes, don't prescribe fixes | Survey: suggestions most wanted (65%), paper is the main record (68%) |
| v2 demo plan (`docs/demo-plan.md`) | Register photo reading, review QR, health-due reminders, recommend links | NMC advertising guidelines (Oct 2026) bar requesting reviews; the first clinic's real data was available |
| **Current MVP** (`docs/prototype-spec.md`) | Import the clinic's sheets, calculate its summaries, plus six action features | |

## MVP prototype

Built on the first clinic's exact data fields; synthetic data in the same columns for the demo, real data only on the clinic's computer. Full spec: `docs/prototype-spec.md`.

**Base layer:** import the visit log, AP table and vaccine table from Excel; calculate the daily and 12-month summaries (20 of 26 daily columns); a small form for the 6 manual items; export back in the clinic's layout.

**Six features:**

1. **Who to call today:** AP renewals (ranked by use), overdue vaccines, lapsed regulars, AP members not using it; each with a reason and an outcome button.
2. **Cross-sell to AP:** non-members whose spend would have been covered by AP.
3. **Patient value:** 12-month value by first service; AP renewal rate by renewal count.
4. **Retention:** share of each month's new patients who return within 3 and 6 months.
5. **Target pacing:** month to date against the doctor's own targets, with projected month end.
6. **Session and seasonal load:** morning vs evening, weekday and month.

AI features are shown as **"Coming soon" cards with a "See a sample" view** (no API credits yet): post and carousel writer (Posts tab; health education and clinic notices only, per NMC), Ask about your clinic, weekly WhatsApp summary, register photo reading. Samples for Ask and the weekly summary are built from the clinic's own numbers by fixed rules. The Posts tab's "What to post this month" topics already work (rules, no AI). Light, dark and auto themes.

No server and no AI calls in the MVP. Not in the MVP: review QR and review nudges (dropped, NMC), recommend links, register photo reading, check-in QR, WhatsApp sending (no phone field), AI summaries and Ask (next semester).

New patients (the survey's top pain, 48%): the app reads an optional Source column (a word or one letter: G, W, R, L, O), falls back to the first visit's remark, and tells new patients from old ones by case number. More ideas (referrer names, locality, Google Business Profile numbers) in `docs/prototype-spec.md`. Needs the clinic to start filling the column; until then old data gives remarks only.

Out of scope this semester: general growth recommendations, live EMR integration, multi-clinic support, benchmarking, a native app-store app (the MVP is an installable web app), appointment booking.

## Final report (ENT format)

| Required section | What fills it |
| --- | --- |
| Context and opportunity | Problem, advisor's business areas, survey findings Q5 to Q14 |
| Product and value proposition | Growth monitor, survey Q15 to Q17 and Q20 |
| Design, architecture, implementation | MVP flow, metrics chosen and why, screenshots, Dad's feedback |
| Business plan (appendix) | Target segment, pricing (Q19), data-sharing comfort (Q18), path to other specialties |

End with next semester's plan. BTP rules: institute LaTeX template with "Entrepreneurship" on the title page; poster presentation; single BTP (Garvit's IP is separate), poster up to 30 minutes; committee of three, advisor's grade double-weighted on disagreement; second semester opens with a review of this one.

## Next semester (Winter 2027)

Full plan: `docs/next-semester-plan.md`. Goal: move from "doctors say they want it" to "a clinic uses it every week, and we know who pays".

1. Pilot at the first clinic from January, 4 to 6 weeks (tentative), with usage metrics; change the product from its feedback.
2. Who pays: doctor subscription vs chemist or nearby store (advisor's suggestion) vs clinic pharmacy. Chemist and doctor interviews; NMC and DPDP checks (Jan to Feb).
3. Test the next version with a few more clinics matching the likely-buyer profile, with a paid commitment test; then decide the direction.
4. Survey v2: location question, enforced pick limits, more specialties.
5. Product features chosen by the pilot: WhatsApp reminders, EMR import, appointments (in or out), alerts, revenue estimate, benchmarking.
6. Business plan and IIITD-IC pitch (March to April).

## Open decisions (take to Prof. Vajpayee)

- [x] ~~Add simple rule-based suggestions to the MVP?~~ Decided 25 Nov: yes, as action lists and target pacing tied to the clinic's own numbers. Tell the advisor.
- [ ] Lead the product with patient acquisition? The MVP leads with renewals, retention and pacing because the clinic's data has no patient source. Acquisition comes with the proposed Source column.
- [x] ~~How does data get in?~~ For the first clinic: import its existing Excel sheets. For other clinics (68% paper, 42% EMR): still open.
- [ ] Is the sample good enough, or widen it next semester?
- [ ] Appointments and reminders: next semester, or a separate product?
- [ ] Who pays: doctors, or chemists and nearby stores (his suggestion)? Plan is to test both next semester.

## Open questions

- [ ] The clinic's remaining data questions at the end of `docs/prototype-spec.md`: vaccine table export from Axon EMR, the values used in Service, Detail and Mode, and the AP table's Buying and Programe name columns. These block the importer.
- [ ] Where to get API credits for the AI features next semester. Not needed for the MVP.
- [ ] Privacy: real data stays on the clinic's computer; DPDP Act consent before any patient messaging.

Resolved: work split (done together; Garvit's part is his IP), tech stack (Vite + React + TypeScript, browser only, see `docs/prototype-spec.md`), contents of the clinic's Excel files (`docs/clinic-data/`).

## Working rules for agents

- **This file is the source of truth.** If a suggestion conflicts with a decision here or in `docs/decisions.md`, flag it rather than silently changing direction.
- **Business thinking leads, tech follows.** The advisor evaluates the business case, not the code.
- **Cite the survey.** Claims about "doctors" need a number from `research/findings.md`. Don't generalize from one clinic.
- **No finance dependency.** Every feature must work on visit data alone; money figures are optional (earnings switch in Settings).
- **Nothing clinic-specific in code.** Service names, the membership program, vaccine schedule, targets and thresholds come from Settings.
- **Don't resolve open decisions on your own.** Build so either answer is easy to switch to.
- **This repo is public.** Never commit patient data or the clinic's real numbers. Real files go in `data/`, which is git-ignored. `docs/clinic-data/` holds field names only. Survey responses in `research/` are anonymous and fine.
- **No patient solicitation features.** NMC rules bar doctors from requesting reviews or testimonials for promotion and from soliciting patients. Check before adding anything that touches reviews, referrals or marketing. Posts are health education and neutral clinic notices only: no offers, testimonials, "best" or "guaranteed" claims; every post says it is for information only and the doctor approves it.
- **AI features without credits:** show a "Coming soon" card that says what the feature will do, with a "See a sample" view of realistic output.
- **Log decisions** in `docs/decisions.md` with date and reason.
- **Branches:** work on your own branch, merge through pull requests, keep commits small.
- **Writing style:** only what's necessary. No filler, no em dashes, nothing that reads as AI-written.
- **Deadlines:** progress demo on 9 Dec; first functional prototype by end of December; pilot from January.
