# Next Semester Plan (Winter 2027)

**Status:** proposed, pending team approval and advisor review.

**Goal:** move from "doctors say they want it" to "a clinic uses it every week, and we know who pays".

This semester answered whether the problem is real (66 doctors, 89% find the tool useful). It left three things unproven: that doctors will actually use it, that anyone will pay, and that it works beyond experienced pediatricians. Next semester tests those three in that order.

## Workstreams

### 1. Pilot at the first clinic (Jan to Feb)

Run the app at Parth's father's clinic for 6 weeks with real data.

Track:
- Days with visits entered, and minutes the receptionist spends per day (target: under 2).
- Share of new patients with a source recorded (target: 80%+).
- Lapsed patients contacted, and how many came back within 30 days.
- Vaccine reminders sent, and how many were followed by a visit.
- How often the doctor opens the app or reads the digest, and which nudges were acted on.

Kill or change signals: if entry stops within 2 weeks, the input design is wrong. If the doctor ignores the digest, the push channel is wrong.

### 2. Who pays (Jan to Feb, in parallel)

Three models to compare.

| Model | For | Against |
| --- | --- | --- |
| Doctor subscription (free tier, paid tier under ₹1,500) | 76% say they would pay something; the likely buyers are clear (10 to 20 years in practice, EMR users) | Stated willingness to pay is soft; 24% want it free; most would pay only up to ₹500 |
| Chemist or nearby store pays (Prof. Vajpayee's suggestion, see below) | Removes the price barrier for doctors; the chemist gains directly from more patients and repeat visits | No evidence yet; ethics and privacy limits; doctors may distrust it |
| Clinic's own pharmacy | 24% of surveyed clinics run a pharmacy, so payer and user are the same | Small segment |

**The chemist idea, as given:** sell the product to chemists and nearby stores rather than to doctors. Recorded as a suggestion to test, not a decision. Two readings, to test separately:

- **Chemist as payer or channel:** a chemist next to a clinic sponsors the tool for the doctor, because more patients and recalled patients mean more prescriptions filled next door.
- **Chemist as customer:** chemists and other small stores have the same problem (repeat customers, footfall, knowing what sells) and usually keep digital billing already, which avoids the paper-record problem (68% of clinics use paper). This fits the long-term plan to reach other small service businesses.

To test it:
- Interview 8 to 10 chemists near clinics in the network: footfall drivers, what software they use, what they would pay for, and whether they would sponsor a doctor's tool.
- Ask 5 to 10 doctors how they would feel about a chemist-sponsored tool.
- Check the rules before pitching: NMC regulations on doctors' dealings with pharmacies (commissions and gifts), and DPDP Act consent. Patient data must never reach the chemist; any sponsored model would share aggregates or nothing.

Decide by end of February which model the business plan leads with.

### 3. Pilot expansion (March)

Bring in 3 to 5 more clinics that match the likely-buyer profile: 10 to 20 years in practice, EMR users, 20+ patients a day. Include at least one non-pediatric clinic. Test real willingness to pay: ask for a paid commitment or a deposit after 4 weeks, not a survey answer.

### 4. Wider validation (Feb to March)

- Rerun the survey with a location question, enforced pick limits and more specialties, beyond one doctor's network.
- If the chemist interviews look promising, run a short survey for chemists too.

### 5. Product, driven by the pilot

Candidates, ordered by evidence; the pilot decides what gets built.

1. Automated WhatsApp reminders through the Business API (lapsed patients, vaccines due, membership renewals).
2. EMR import (Axon first), since EMR users are the likelier payers.
3. Appointment booking and reminders: 17% of open answers asked for it unprompted. Decide whether it belongs in this product or a separate one.
4. Proactive alerts and a richer weekly digest.
5. Fee-based revenue estimate (fee list × visits), kept optional.
6. Benchmarking against similar clinics, once there are enough clinics (27% asked for it).
7. A parent-facing app, only if pilots show demand.

### 6. Business plan and incubation (March to April)

Pricing backed by pilot results, unit economics, go-to-market (direct to doctors, or through chemists), and a pitch to IIITD-IC for incubation support.

## Timeline

| Month | Milestones |
| --- | --- |
| January | Review of semester 1. Pilot live at first clinic. Chemist and doctor interviews start |
| February | Pilot results. Payer model chosen. Survey v2 out |
| March | 3 to 5 more clinics. Paid commitment test. Top product features built |
| April | Business plan, final report, poster, IIITD-IC pitch |

## What we will have at the end

- Usage data from at least 4 clinics.
- A tested answer to who pays and how much.
- Survey v2 across more specialties and locations.
- A business plan ready for incubation.
