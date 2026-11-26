# Decisions Log

Newest first. Each entry: date, decision, reason. Add an entry whenever a direction changes, and update `CLAUDE.md` in the same commit.

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-26 | Timeline: progress demo at the poster presentation 9 Dec; first functional prototype by end of December 2026; pilot at the first clinic from January for 4 to 6 weeks (tentative, can run longer); then changes from its feedback, then a few more clinics test the next version, then decide the direction | Set by Parth; the pilot needs a complete, stable prototype |
| 2026-11-25 | Posts tab added: AI post and carousel writer as "Coming soon" with sample posts; topic ideas from the clinic's data work now. Health education plus neutral clinic notices (timings, vaccination mornings, closures) only | Marketing is a real need (33% name it a top challenge; 56% do no promotion). NMC guidelines (Oct 2026) allow health education but bar promotion, offers and testimonials. Content creation was set aside earlier for overlapping a family member's startup; Garvit confirmed bringing it back |
| 2026-11-25 | Every AI feature without API credits shows "Coming soon", what it will do, and "See a sample" | Shows the full product in the demo without spending credits |
| 2026-11-25 | Light, dark and auto (follow the phone) themes, chosen per device | Asked for both modes; doctors use phones in both |
| 2026-11-25 | The MVP is an installable web app (PWA): one codebase for Android, iPhone and desktop, no app store, works offline, data in the browser on each device | Both platforms needed; a native app is too slow to build and ship by 9 Dec. On iPhone it must be added to the home screen so Safari doesn't clear its data |
| 2026-11-25 | New patients: optional Source column (word or one letter) with the Remark as fallback; new and old patients told apart by case number order (to confirm with the clinic) | Survey's top pain (48%); the clinic records no source. Measuring only, no solicitation, so within NMC rules |
| 2026-11-25 | Call lists show today's top 10 by priority, with the full list one tap away | On a 3-year clinic the full lists run to hundreds; a receptionist can call about 10 a day |
| 2026-11-25 | Sample data simulates an established clinic (patients from before the data starts), about 27 visits a day | A clinic "opening" on the first day of the data made the first year and new-patient counts look wrong |
| 2026-11-25 | Clinic answers recorded in `docs/prototype-spec.md`: AP lasts a year (free consultations, discounted vaccines, free checkups), price taken from the AP table; one case number per child; "online" means online payment; totals are formulas; vaccine due dates stored, probably in Axon EMR. App needs no vaccine schedule of its own | Answers from the doctor |
| 2026-11-25 | Prototype built on the first clinic's exact data fields (visit log, AP table, vaccine table, daily and 12-month summary sheets); generalise after the pilot, with clinic specifics in Settings | Only real data we have; the doctor is committed. Only 11% of surveyed clinics use Excel, so this is the first clinic's answer, not the general one |
| 2026-11-25 | MVP = base layer (import, automatic summaries, export) plus six features: who to call today, cross-sell to AP, patient value, retention, target pacing, session and seasonal load. Spec: `docs/prototype-spec.md` | Consolidating his sheets alone is what Excel formulas can do; the value is telling him who to act on. Covers advisor's CLV, cross-selling and resource management |
| 2026-11-25 | Rule-based suggestions are in the MVP, as action lists and pacing tied to the clinic's numbers | Most wanted feature (65%); tell the advisor |
| 2026-11-25 | Review QR, review drafting, review-count nudges dropped; recommend links dropped for now | NMC Guidelines on Ethical Advertising and Public Communication (in effect 6 Oct 2026) bar doctors from requesting reviews or testimonials for promotion; NMC 2023 rules bar soliciting patients |
| 2026-11-25 | No server and no AI calls in the MVP; runs in the browser, real data stays on the clinic's computer | Rules are plain logic; no API credits; avoids moving patient names off the device |
| 2026-11-25 | `docs/demo-plan.md` superseded by `docs/prototype-spec.md` | New direction above |
| 2026-11-25 | Build plan: core features by 2 Dec, the rest by 7 Dec, real-data run 8 Dec, demo at the poster presentation 9 Dec | Report submitted 25 Nov; demo shows progress since |
| 2026-11-25 | Team corrected: the BTP is Parth's alone; Garvit works on the same product as his Independent Project. Work done together, no split | Earlier context wrongly said joint BTP |
| 2026-11-25 | Content creation tool for the doctor's YouTube and Instagram recorded as a considered and set-aside idea | Overlaps with a family member's startup; NMC treats promotional and AI-generated content by doctors as advertising |
| 2026-11-22 | AI features (register reading, review drafting, Ask, written summary) shown as "Coming soon" in the demo; everything else built fully | No API credits yet; build tier depends on Parth's Claude credits (`app/README.md`) |
| 2026-11-22 | Current goals set: build the demo app (`docs/demo-plan.md`) and plan next semester (`docs/next-semester-plan.md`) | Survey done; the report needs a demo and a next-semester plan |
| 2026-11-22 | Advisor's suggestion recorded: sell to chemists and nearby stores rather than doctors. Treated as a hypothesis to test next semester, not adopted | No evidence yet; needs chemist interviews and NMC/DPDP checks |
| 2026-11-22 | Survey analysed (66 responses): growth monitor validated (89% find it useful). Three earlier decisions put under review pending advisor: suggestions in MVP (65% want them), lead with patient acquisition (48% top pain), data input beyond Excel (68% use paper) | See `research/findings.md` |
| 2026-11-22 | Earlier "AI gap vs ChatGPT" positioning dropped | 79% of doctors never use AI tools for business; the real competitor is gut feel and paper |
| 2026-11-22 | `docs/questionnaire.md` corrected to the live form (20 questions, no location question) | The location question was drafted but never added to the live form |
| 2026-11-21 | Met Prof. Vajpayee to discuss survey responses | Guidance on analysis and next steps |
| 2026-11-21 | This repo becomes the single source of truth for context and the prototype | Avoid miscommunication between the two of us and our agents |
| 2026-11-21 | Questionnaire closed at 66+ responses for analysis | Well past the 25 to 30 target; time to analyze for the report |
| 2026-11-18 | Drafted a location question with broad zones only (not on the live form) | Advisor flagged local demographics; zones keep responses anonymous |
| 2026-11-17 | Product runs on patient and visit data; earnings optional | Advisor: payments mostly cash, doctors won't share finances |
| 2026-11-17 | MVP describes changes, doesn't prescribe fixes | Recommendations depend on too many factors (demographics, experience, operations, seasonality) |
| 2026-11-17 | Questionnaire is the main validation source; no follow-up calls | Easy for doctors, feasible in one week |
| 2026-11-17 | Growth monitor treated as a hypothesis, not final | Research decides whether to keep, change or drop it |
| Nov 2026 | Target: small specialist clinics in service industry, 5+ years of practice | Agreed with advisor; enough history to see trends |
| Earlier | Business thinking first, tech second | Start from what an MBA or entrepreneur would analyze; build only what serves those insights |
| Earlier | Clinic business side first, not a patient-facing app | Smaller build, one clear user; parent app is a later extension |
| Earlier | Domain: small healthcare clinics | Committed real user (Parth's father) with real data. Set aside: token-optimization middleware, content creation tools, personal finance |
