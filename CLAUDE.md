# BTP Project Context: AI Business Co-Pilot for Independent Healthcare Clinics

This file is the single source of truth for our BTP. Claude Code reads it automatically at the start of every session, so both of us (and our agents) work from the same context.

**Rule for humans and agents:** if a decision changes, update this file (and `docs/decisions.md`) in the same commit. Never leave a decision only in a chat.

## Where we stand (as of 21 Nov 2026)

- Semester report due around **24 Nov 2026**. It covers ideation, research, validation and an MVP prototype.
- Questionnaire is live on Google Forms and has **66 responses** (target was 25 to 30).
- Next: analyze responses, build the MVP prototype, write the report.
- The growth monitor is our leading idea, not a final decision. The research decides whether we keep it, change it, or drop it.

## Project basics

| Item | Detail |
| --- | --- |
| Registered title | AI Business Co-Pilot for Independent Healthcare Clinics |
| Registered description | Independent clinic owners in India are domain experts forced to double as business owners, managing revenue, retention and growth with disconnected tools and no real business intelligence. This project builds a context-aware AI business co-pilot for small clinics that surfaces key metrics and insights through a natural language interface, enabling doctors to make informed business decisions without stepping outside their clinician role. |
| Track | Entrepreneurship (ENT) BTP. Credits count towards Parth's Entrepreneurship minor |
| Team | Joint BTP: Parth Pawar (B.Tech CSD, IIIT Delhi) and teammate. The report must state how work is divided |
| Advisor | Prof. Pankaj Vajpayee, Professor of Practice and Director & CEO of IIITD Innovation & Incubation Center (IIITD-IC) |
| Duration | 2 semesters: Monsoon 2026 (ends with this report) and Winter 2027 |
| Target user | Small specialist clinics in the service industry, practicing for 5+ years |
| First user | Parth's father's pediatric clinic in Delhi, fully committed to using what we build |
| Long-term | Generalize to other specialties, then possibly other small service businesses |

## The problem

Clinic owners are doctors first, but growing the clinic forces them to also think like business owners, with scattered data and no business support.

Our first clinic is **one example**, not proof that every clinic works the same way:

- **Services:** consultations (booked and walk-in), vaccinations, and an annual health program (yearly membership: free consultations, discounted vaccines, other benefits).
- **Records:** Excel for most data including the annual program; Axon EMR for vaccines; appointments booked by phone and written in a paper diary.
- **Staff:** a receptionist handles appointments, patient messages and admin.
- **Business decisions:** the doctor reviews the data himself and uses ChatGPT and Claude. They help, but have no memory of the clinic, need data pasted in each time, and don't think like a business advisor.

## Advisor guidance

Prof. Vajpayee judges the project through a business and entrepreneurship lens, not a CS one. Background in finance, business strategy and consulting; previously visiting faculty at IIM Raipur and IIFT.

Business areas he flagged for a clinic: USP, local demographics, customers' paying capacity, pivoting, SOPs, marketing channels, finance and records, resource management, network, customer lifetime value (CLV), cross-selling.

He asked us to: research before building (doctors with successful and unsuccessful practices), use a questionnaire for easy data collection, and narrow the target to small specialist clinics practicing 5+ years.

**His caution:** doctors won't share finances, because payments are mostly in cash.

## Proposed solution (to validate)

A growth monitor that tracks a clinic's key metrics and shows clearly what is changing, so the doctor sees the business at a glance without assembling the data.

- **Describes, doesn't prescribe.** The MVP shows what changed, not how to fix it. Good advice depends on demographics, the doctor's experience, operations, seasonality and more. Recommendations come later.
- **Built on patient and visit data, not finances.** Visit counts, new vs returning patients, services used, patient sources. Earnings are optional, only if the doctor adds them.

| Stage | What the monitor does |
| --- | --- |
| MVP (this semester) | Tracks key metrics and points out changes, e.g. "returning patients dropped 15% this quarter" |
| Later | Recommendations accounting for demographics, experience, operations, seasonality |
| Later | Benchmarking against similar clinics |

## Candidate metrics

Final MVP metrics come from the top answers to questionnaire **Q18**.

| Metric | Question it answers | Data needed |
| --- | --- | --- |
| Visit trend | Growing, flat or shrinking? | Visit dates |
| New vs returning | Growth from new or loyal patients? | Patient ID, visit dates |
| 12-month retention | How many patients stay? | Patient ID, visit dates |
| Lapsed patients | Who stopped coming? | Patient ID, last visit |
| Service mix | Which services are used most? | Service per visit |
| Cross-sell rate | Do consultation patients also take vaccines or memberships? | Patient ID, service per visit |
| Membership renewals | Which memberships expire soon, how many renew? | Enrollment and expiry dates |
| Patient sources | Which channels bring new patients? | Source at first visit |
| Seasonality | Busy and slow days and months | Visit dates |
| CLV in visits | How valuable is a patient over time? | Patient ID, visit dates |
| Revenue views (optional) | Earnings trend, revenue by service, CLV in rupees | Fees or earnings, only if added |

**Key data rule:** we need visit-level records (who came, when, for which service), not monthly totals.

## Research

Questionnaire (full text in `docs/questionnaire.md`) sent through Parth's father's network on WhatsApp. 66 responses so far.

| Questions | What we learn |
| --- | --- |
| Q1 to Q5 | Who responded (specialty, location, years, volume, services); filter to target segment |
| Q6 to Q10 | Whether doctors lack visibility into their business (core problem) |
| Q11 to Q15 | Where growth breaks down: challenges, patient sources, marketing, follow-up |
| Q16 to Q18 | Whether the growth monitor is wanted, and which metrics matter most |
| Q19 to Q20 | Which data doctors will share, and pricing |
| Q21 | Open answer: needs we haven't thought of |

Hypotheses to test:

- **Getting new patients** is a top challenge: Delhi NCR has many corporate hospitals and pediatric/maternity chains with bigger marketing budgets and cashless insurance.
- **Patients not returning** is a top challenge: patients shop around or move within NCR, and clinics can't tell when someone stops coming.
- **Low visibility:** most doctors don't track earnings closely or know how many patients return.
- **Gut-driven decisions:** most rely on experience rather than their numbers.
- **Marketing mismatch:** where patients come from (Q13) differs from what doctors promote through (Q14).
- **Data sharing:** visit data is shared far more readily than earnings (tested by Q19).
- **AI gap:** doctors using ChatGPT re-explain their clinic and paste data each time; nothing is proactive.

These hypotheses come from reporting on small hospitals across India, not Delhi clinics specifically. Claims about "doctors" in the report need questionnaire evidence.

## MVP prototype

Working prototype on the first clinic's real (anonymized) data.

1. **Upload:** visit records from Excel, patient names replaced by IDs. No financial data needed.
2. **Metrics:** 5 or 6 key metrics, chosen from Q18 results.
3. **Changes:** plain-language summary of what moved, e.g. "vaccine visits fell 20% vs last quarter".
4. **Ask:** chat box for questions about the clinic's own numbers.
5. **Optional earnings view:** only if the doctor adds fees or earnings.

Out of scope this semester: growth recommendations, EMR integration, multi-clinic support, benchmarking, mobile app.

## Final report (ENT format)

| Required section | What fills it |
| --- | --- |
| Context and opportunity | Problem, advisor's business areas, findings from Q6 to Q15 |
| Product and value proposition | Growth monitor, why it beats generic AI tools, Q16 to Q18 and Q21 |
| Design, architecture, implementation | MVP flow, metrics chosen and why, screenshots, Dad's feedback |
| Business plan (appendix) | Target segment, pricing (Q20), data-sharing comfort (Q19), path to other specialties |

End with next semester's plan. BTP rules: institute LaTeX template with "Entrepreneurship" on the title page; poster presentation; joint BTP states work division, both present, evaluated individually; committee of three, advisor's grade double-weighted on disagreement.

## Roadmap (Winter 2027 candidates)

Wider validation and pilots; proactive alerts; fee-based revenue estimates (fee list × visits); keeping data on the doctor's device; growth recommendations; benchmarking; business plan with possible IIITD-IC support; possible parent-facing app for the first clinic.

## Open questions

- [ ] Who leads research vs build (state in report)?
- [ ] MVP tech stack (buildable in 2 to 3 days).
- [ ] What exactly is in the clinic's Excel files; can visit-level data be exported from Axon EMR?
- [ ] Privacy: names removed before data leaves the clinic; keep India's DPDP Act in mind.

## Working rules for agents

- **This file is the source of truth.** If a suggestion conflicts with a decision here or in `docs/decisions.md`, flag it rather than silently changing direction.
- **Business thinking leads, tech follows.** The advisor evaluates the business case, not the code.
- **The growth monitor is a hypothesis** until questionnaire results confirm it.
- **Don't generalize from one clinic.**
- **No finance dependency.** Everything must work on patient and visit data alone.
- **MVP describes, doesn't prescribe.**
- **Never commit patient data.** Real clinic files go in `data/`, which is git-ignored. Only commit synthetic sample data.
- **Log decisions** in `docs/decisions.md` with date and reason.
- **Branches:** work on your own branch, merge through pull requests, keep commits small.
- **Writing style:** only what's necessary. No filler, no em dashes, nothing that reads as AI-written.
- **Deadline first:** everything this week serves the report due around 24 Nov 2026.
