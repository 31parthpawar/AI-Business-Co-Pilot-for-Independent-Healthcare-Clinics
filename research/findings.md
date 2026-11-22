# Questionnaire Findings: Small Clinic Survey

22 Nov 2026. 66 responses to the Clinic Growth Questionnaire. Question numbers follow the live form (see `docs/questionnaire.md`). Reproduce the numbers with `python3 research/analyze.py research/responses.csv`.

## Headline findings

The problem is real, but it is not quite the problem we assumed. Doctors want growth, mostly new patients, and they run their clinics on gut feel, paper and word of mouth.

1. **Getting new patients is the top pain.** 48% chose it, ahead of competition from hospitals (33%) and marketing (33%). Only 9% chose "patients not coming back".
2. **Retention is a blind spot, not a non-issue.** 97% don't regularly follow up with patients who stop coming, and 80% don't know or only roughly know how many return. They don't see it as a problem because they don't measure it.
3. **Decisions run on gut feel.** 65% rely mainly on experience and gut feel. Only 26% use their own records.
4. **Growth is almost entirely word of mouth.** 91% say new patients come through word of mouth, and 56% do no active promotion at all.
5. **The tool is wanted.** 89% find a growth tracker useful (42% very useful, 47% somewhat). Only 11% said not useful.
6. **What they want most is suggestions.** "Suggestions to grow the clinic" was the top pick (65%), followed by where new patients come from (53%) and which patients stopped coming (42%). Our MVP currently defers suggestions.
7. **Paper is the main record system.** 68% use a paper register, 42% use EMR software, only 11% use Excel. An Excel-upload MVP fits a small minority.
8. **AI tools are barely used.** 79% have never used ChatGPT or similar for business decisions. Our first clinic is the exception, not the rule.
9. **Willingness to pay exists but is low.** 76% would pay something; most would pay up to ₹1,500 a month. 24% want it free.
10. **Earnings are the least-shared data, but not refused.** 39% would add earnings, versus 64% for appointment records and 61% for visit counts.

All figures are out of 66 responses unless stated. Results for the target segment (5+ years of practice, 56 doctors) differ by no more than 5 percentage points on any headline figure.

## Who responded

66 doctors responded from 18 Nov 2026 onwards, through Parth's father's network.

| Profile | Result |
| --- | --- |
| Specialty | Pediatrics 67% (73% including pediatric sub-specialties), general physician 11%, 12 other specialties with 1 or 2 each |
| Years in practice | More than 20: 48%, 10 to 20: 32%, 5 to 10: 5%, less than 5: 15% |
| In target segment (5+ years) | 56 of 66 (85%) |
| Patients per day | Under 20: 48%, 20 to 40: 39%, 40+: 12% |
| Services besides consultation | Vaccinations 73%, diagnostics 39%, procedures 38%, pharmacy 24%, packages or memberships 8% |

Caveats to state in the report:

- **Convenience sample.** Respondents came through one doctor's network, so they skew to pediatrics and long-established practices. Strong signal for experienced pediatric clinics, weaker for other specialties.
- **No location data.** The live form doesn't include the location question, so areas can't be compared.
- **Self-reported.** Answers like "I track earnings regularly" are what doctors believe, not measured behaviour.

## Hypotheses

Four of seven held, two were refuted, one was mixed.

| Hypothesis | Verdict | Evidence |
| --- | --- | --- |
| Getting new patients is a top challenge | Confirmed | Top challenge at 48%; competition from hospitals and chains next at 33% |
| Patients not returning is a top challenge | Refuted as a stated pain | Only 9% chose it. But 97% don't follow up regularly and 80% don't clearly know their return rate, so it is an unseen problem |
| Doctors lack visibility into their numbers | Mixed | 58% say they track earnings regularly, but only 20% know how many patients return |
| Decisions are gut-driven | Confirmed | 65% rely mainly on experience and gut feel |
| Marketing effort doesn't match what works | Confirmed, with a twist | 91% get patients by word of mouth and 56% do no promotion. The gap isn't wrong channels, it's almost no deliberate marketing. Google is used by 38% and brings patients for 36% |
| Visit data is shared more readily than earnings | Confirmed, weaker than expected | Earnings 39% vs appointment records 64% and visit counts 61%. Only 12% would share nothing |
| Doctors already use AI tools and hit their limits | Refuted | 79% have never used ChatGPT or similar for business decisions |

Also: 59% spend under 2 hours a week on non-medical work. Business work isn't eating their time; it's mostly not being done.

## Results by question

Percentages of all 66. Multi-select questions add up to more than 100%.

### Running the clinic

| Question | Results |
| --- | --- |
| Q5 Records kept in | Paper register 68%, clinic software or EMR 42%, Excel 11%, WhatsApp 2% |
| Q6 Hours a week on non-medical work | Under 2: 59%, 2 to 5: 23%, 5 to 10: 14%, more than 10: 5% |
| Q7 Business decisions rely on | Experience and gut feel 65%, own records 26%, family, peers or CA 8%, AI tools 2% |
| Q8 Track earnings month to month | Yes, regularly 58%, roughly 29%, no 14% |
| Q9 Know how many patients return within a year | Yes 20%, roughly 55%, no 26% |

### Patients and growth

| Question | Results |
| --- | --- |
| Q10 Patient numbers over 3 years | Grown 48%, about the same 42%, gone down 9% |
| Q11 Biggest challenges | Getting new patients 48%, competition from hospitals and chains 33%, marketing the clinic 33%, finding or keeping staff 24%, rising rent and costs 21%, patients not coming back 9%, admin time 8% |
| Q12 Where new patients come from | Word of mouth 91%, Google search or Maps 36%, referrals 27%, location or walk-ins 26%, Practo 5%, social media 5% |
| Q13 Actively used to promote | Nothing, word of mouth only 56%, Google Business or Maps 38%, pamphlets or hoardings 18%, Instagram or Facebook 17%, website 17%, WhatsApp 15%, health camps 9%, Practo 6% |
| Q14 Follow up with lapsed patients | Never 58%, sometimes 39%, regularly 3% |

### The proposed tool

| Question | Results |
| --- | --- |
| Q15 Used AI tools for business decisions | Never 79%, sometimes 18%, often 3% |
| Q16 Usefulness of a growth tracker | Very useful 42%, somewhat useful 47%, not useful 11% |
| Q17 Want the tool to show | Suggestions to grow 65%, where new patients come from 53%, who stopped coming 42%, monthly visit trends 39%, which marketing works 35%, services used most 29%, comparison with similar clinics 27%, busy and slow months 15% |
| Q18 Comfortable adding | Appointment records 64%, visit counts 61%, services used 42%, earnings and billing 39%, none 12% |
| Q19 Would pay per month | Free only 24%, up to ₹500 33%, ₹500 to ₹1,500 29%, ₹1,500 to ₹3,000 9%, more than ₹3,000 5% |

### Cross-checks

- **Interest doesn't depend on AI use.** Of the 52 who never used AI tools, 88% still find the tracker useful.
- **Interest holds whether practices are growing or flat.** "Very useful" was 38% among growing clinics and 50% among flat ones.
- **Those who see value will pay.** Of the 28 who said "very useful", 82% would pay, mostly up to ₹1,500.
- **Gut feel and low visibility go together.** Of the 17 who don't know their return rate, 13 rely on gut feel.

## Open answers (Q20)

41 of 66 answered. About a quarter asked for more patients; a sixth asked for help with appointments and follow-ups, which the growth monitor doesn't cover yet.

| Theme | Answers | Example in the doctor's words |
| --- | --- | --- |
| More patients, reach and growth | 11 | "Help grow practice and bring new patients" |
| Appointments, reminders and patient follow-up | 7 | "Auto reminder call to patient that u are due for follow up" |
| Records, tracking and admin | 6 | "Track the revenue, growth trend and practical solutions for overall administration & management of my set-up" |
| Marketing that works today | 5 | "Tell me things that actually work in current scenario rather than giving me all the old ideas of pamphlets" |
| Not interested or satisfied as is | 3 | "Medical practice is a social service... I personally don't treat it as a business" |
| Vague or general support | 9 | "Definitely I will use it" |

Two stand out:

- One doctor says patients choose based on fee, proximity, Google reviews and referrals, and asks how to get patients to review online. A concrete growth lever we could measure.
- Another says "I already have it in my EMR software, but not using it". Having data and features isn't enough; the tool has to be effortless and push insights to the doctor.

## What this means for the product

The growth monitor is validated, but it should lead with patient acquisition, offer simple suggestions, and not rely on Excel uploads.

| Area | Current plan | What the data suggests |
| --- | --- | --- |
| Positioning | Better than generic AI tools like ChatGPT | The real competitor is gut feel and a paper register. "Your clinic's numbers, finally visible" |
| Lead problem | Visibility into business metrics | Getting new patients. Lead with where patients come from, then who stopped coming |
| Suggestions | Deferred past the MVP | Most wanted feature (65%). Add a few rule-based suggestions tied to metrics |
| Data input | Excel upload | Only 11% use Excel; 68% paper, 42% EMR. Quick receptionist entry and EMR export import |
| Retention | One of several metrics | A hidden leak: lapsed patient list plus reminder messages |
| Patient source | One of several metrics | Capture at first visit with a one-tap "how did you hear about us" field |
| Earnings | Optional | Keep optional; 39% would add it, so offer it openly |

**MVP metrics from Q17 (excluding suggestions):** where new patients come from (53%), which patients stopped coming (42%), monthly visit trends (39%), which marketing is working (35%), services used most (29%).

**Business plan inputs:**

- **Pricing:** 62% would pay up to ₹1,500 a month, 24% only if free, 14% more. A free tier plus a paid tier under ₹1,500 covers most doctors.
- **Who buys first:** doctors who said "very useful" (42%); 82% of them would pay.
- **Adjacent need:** appointments and reminders came up unprompted in 17% of open answers. A reminder feature serves that need and fixes the retention leak.

## Decisions to take to Prof. Vajpayee

- [ ] Add simple rule-based suggestions to the MVP?
- [ ] Lead the product with patient acquisition, with retention as the hidden second problem?
- [ ] How does data get in: receptionist entry, EMR export import, or both?
- [ ] Is the sample good enough, or widen it next semester (other specialties, cities, location question)?
- [ ] Appointments and reminders: next semester, or a separate product?
