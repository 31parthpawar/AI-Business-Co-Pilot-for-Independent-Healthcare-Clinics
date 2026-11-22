# BTP Project Context: AI Business Co-Pilot for Independent Healthcare Clinics

This file is the single source of truth for our BTP. Claude Code reads it automatically at the start of every session, so both of us (and our agents) work from the same context.

**Rule for humans and agents:** if a decision changes, update this file and `docs/decisions.md` in the same commit. Never leave a decision only in a chat.

## Where we stand (as of 22 Nov 2026)

- Semester report due around **24 Nov 2026**. It covers ideation, research, validation and an MVP prototype.
- Questionnaire closed for analysis at **66 responses** (target was 25 to 30). Full analysis in `research/findings.md`.
- Met Prof. Vajpayee on 21 Nov to discuss the responses.
- **The growth monitor is validated** (89% find it useful), but three findings conflict with earlier MVP decisions. These are open until agreed with the advisor (see "Open decisions" below).
- Next: settle the open decisions, build the MVP, write the report.

## Project basics

| Item | Detail |
| --- | --- |
| Registered title | AI Business Co-Pilot for Independent Healthcare Clinics |
| Registered description | Independent clinic owners in India are domain experts forced to double as business owners, managing revenue, retention and growth with disconnected tools and no real business intelligence. This project builds a context-aware AI business co-pilot for small clinics that surfaces key metrics and insights through a natural language interface, enabling doctors to make informed business decisions without stepping outside their clinician role. |
| Track | Entrepreneurship (ENT) BTP. Credits count towards Parth's Entrepreneurship minor |
| Team | Joint BTP: Parth Pawar and Garvit (both B.Tech, IIIT Delhi). The report must state how work is divided |
| Advisor | Prof. Pankaj Vajpayee, Professor of Practice and Director & CEO of IIITD Innovation & Incubation Center (IIITD-IC) |
| Duration | 2 semesters: Monsoon 2026 (ends with this report) and Winter 2027 |
| Target user | Small specialist clinics in the service industry, practicing for 5+ years |
| First user | Parth's father's pediatric clinic in Delhi, fully committed to using what we build |
| Long-term | Generalize to other specialties, then possibly other small service businesses |

## How we got here

| Decision | What we chose | Why |
| --- | --- | --- |
| Domain | Small healthcare clinics | Committed real user (Parth's father) with real data. Set aside: token-optimization middleware (needs a CS advisor), content creation tools (overlaps with a family member's startup), personal finance (crowded market) |
| First focus | Clinic's business side, not a patient-facing app | Smaller build, one clear user. Parent app is a possible later extension |
| Core problem | Doctors forced to think like business owners | Discovery with Parth's father |
| Order of work | Business thinking first, tech second | Start from what an MBA or entrepreneur would analyze; build only what serves those insights |
| Target segment | Small specialist clinics, 5+ years of practice | Enough history to see trends. Agreed with advisor |
| Data | Patient and visit data first, finances optional | Advisor: payments mostly cash, doctors won't share finances. Survey partly confirms: 39% would add earnings vs 64% appointments |
| Validation | Questionnaire as main source | Done: 66 responses |
| MVP scope | Describe changes, don't prescribe fixes | **Under review**: suggestions were the most wanted feature (65%) |

## The problem

Clinic owners are doctors first, but growing the clinic forces them to think like business owners, with scattered data and no business support.

Our first clinic is **one example**, not proof that every clinic works the same way:

- **Services:** consultations (booked and walk-in), vaccinations, and an annual health program (yearly membership: free consultations, discounted vaccines, other benefits).
- **Records:** Excel for most data including the annual program; Axon EMR for vaccines; appointments booked by phone and written in a paper diary.
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

Sample caveat: convenience sample through one doctor's network, 73% pediatrics, 80% practicing 10+ years. Strong signal for experienced pediatricians, weaker for other specialties. No location data.

Hypotheses: confirmed (new patients top pain, gut-driven decisions, little deliberate marketing, earnings shared least); refuted (patients not returning as a stated pain, doctors already using AI tools); mixed (visibility: 58% say they track earnings, only 20% know return rate).

## Advisor guidance

Prof. Vajpayee judges the project through a business and entrepreneurship lens, not a CS one. Background in finance, business strategy and consulting; previously visiting faculty at IIM Raipur and IIFT.

Business areas he flagged for a clinic: USP, local demographics, customers' paying capacity, pivoting, SOPs, marketing channels, finance and records, resource management, network, customer lifetime value (CLV), cross-selling.

He asked us to research before building, use a questionnaire, and narrow the target to small specialist clinics practicing 5+ years. His caution: doctors won't share finances because payments are mostly cash.

## Proposed solution

A growth monitor that tracks a clinic's key metrics from patient and visit data and shows clearly what is changing.

What the survey suggests changing (pending advisor agreement):

| Area | Earlier plan | What the data suggests |
| --- | --- | --- |
| Positioning | Better than generic AI tools | The competitor is gut feel and a paper register. "Your clinic's numbers, finally visible" |
| Lead problem | Visibility into business metrics | Getting new patients first; lapsed patients as the hidden second problem |
| Suggestions | Deferred past the MVP | Add a few rule-based nudges tied to specific metrics, no general growth advice |
| Data input | Excel upload | Quick receptionist entry (under 2 minutes a day) plus EMR export import |
| Retention | One of several metrics | Lapsed patient list plus reminder messages |
| Patient source | One of several metrics | One-tap "how did you hear about us" at the first visit, since almost no clinic records it |
| Earnings | Optional | Keep optional, offer it openly |

## MVP prototype

Working prototype on the first clinic's real (anonymized) data.

**Metrics, from Q17 top picks:** where new patients come from, which patients stopped coming, monthly visit trends, which marketing is working, services used most. Comparison with similar clinics and busy months can wait.

Core flow:

1. **Data in:** receptionist entry and/or file import (Excel or EMR export), patient names replaced by IDs. No financial data needed.
2. **Metrics:** the five above.
3. **Changes:** plain-language summary of what moved, e.g. "new patients from Google fell 30% this quarter".
4. **Nudges (pending advisor):** simple rule-based actions, e.g. "18 patients haven't visited in 6 months".
5. **Ask:** chat box for questions about the clinic's own numbers.
6. **Optional earnings view.**

Out of scope this semester: general growth recommendations, live EMR integration, multi-clinic support, benchmarking, mobile app, appointment booking.

## Final report (ENT format)

| Required section | What fills it |
| --- | --- |
| Context and opportunity | Problem, advisor's business areas, survey findings Q5 to Q14 |
| Product and value proposition | Growth monitor, survey Q15 to Q17 and Q20 |
| Design, architecture, implementation | MVP flow, metrics chosen and why, screenshots, Dad's feedback |
| Business plan (appendix) | Target segment, pricing (Q19), data-sharing comfort (Q18), path to other specialties |

End with next semester's plan. BTP rules: institute LaTeX template with "Entrepreneurship" on the title page; poster presentation; joint BTP states work division, both present (up to 1 hour), evaluated individually; committee of three, advisor's grade double-weighted on disagreement; second semester opens with a review of this one.

## Roadmap (Winter 2027 candidates)

Wider validation across specialties and cities (add location question); pilots with doctors from the network; appointment reminders and follow-ups; proactive alerts; fee-based revenue estimates (fee list × visits); data kept on the doctor's device; growth recommendations; benchmarking; business plan with possible IIITD-IC support; possible parent-facing app.

## Open decisions (take to Prof. Vajpayee)

- [ ] Add simple rule-based suggestions to the MVP?
- [ ] Lead the product with patient acquisition?
- [ ] How does data get in: receptionist entry, EMR export, or both?
- [ ] Is the sample good enough, or widen it next semester?
- [ ] Appointments and reminders: next semester, or a separate product?

## Open questions

- [ ] Work split between Parth and Garvit (state in report).
- [ ] MVP tech stack (buildable in 1 to 2 days).
- [ ] What exactly is in the clinic's Excel files; can visit-level data be exported from Axon EMR?
- [ ] Privacy: names removed before data leaves the clinic; keep India's DPDP Act in mind.

## Working rules for agents

- **This file is the source of truth.** If a suggestion conflicts with a decision here or in `docs/decisions.md`, flag it rather than silently changing direction.
- **Business thinking leads, tech follows.** The advisor evaluates the business case, not the code.
- **Cite the survey.** Claims about "doctors" need a number from `research/findings.md`. Don't generalize from one clinic.
- **No finance dependency.** Everything must work on patient and visit data alone.
- **Don't resolve open decisions on your own.** Build so either answer is easy to switch to.
- **Never commit patient data.** Real clinic files go in `data/`, which is git-ignored. Survey responses in `research/` are anonymous and fine.
- **Log decisions** in `docs/decisions.md` with date and reason.
- **Branches:** work on your own branch, merge through pull requests, keep commits small.
- **Writing style:** only what's necessary. No filler, no em dashes, nothing that reads as AI-written.
- **Deadline first:** everything this week serves the report due around 24 Nov 2026.
