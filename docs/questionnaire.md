# Clinic Growth Questionnaire

The validation survey as it ran on Google Forms (title: "Clinic Growth Questionnaire"). 19 tap-to-answer questions and one optional open question. Question text below matches the live form's response sheet. 66 responses collected; analysis in `research/findings.md`.

The live form has **no location question**. An earlier draft added one (broad Delhi NCR zones); it should be added if the survey is run again next semester.

## Intro text (as on the live form)

Dear Doctor,

We are a team of B.Tech researchers from IIIT Delhi developing a real-time analytics solution designed to help independent clinics accelerate their financial and operational growth.

We are currently mapping the most common hidden bottlenecks that slow down private practice growth. The survey takes approximately 3 minutes minutes to share your operational pain points in the brief survey below. We would love to share our final growth-strategy report with you, offering data-driven insights into how top clinics are optimizing their practice.

The survey does not request any patient information or financial figures. All responses are anonymous, kept confidential, and used solely for academic research.

For any queries, please contact Parth Pawar at parth23372@iiitd.ac.in.

We sincerely appreciate your time and contribution.

## Questions

1. **Your specialty** (pick one): Pediatrics / General physician / Gynaecology / Dermatology / Dentistry / Other
2. **Years running your own practice** (pick one): Less than 5 / 5 to 10 / 10 to 20 / More than 20
3. **Patients you see on an average day** (pick one): Under 20 / 20 to 40 / 40 to 60 / More than 60
4. **Services you offer besides consultation** (pick all that apply): Vaccinations / Procedures / Diagnostic tests / Health packages or memberships / Pharmacy / None / Other
5. **Where do you keep patient and billing records?** (pick all that apply): Paper register or diary / Excel / Clinic software or EMR / WhatsApp / My staff handles it / Other
6. **Hours per week you spend on non-medical work (accounts, staff, admin, marketing)** (pick one): Under 2 / 2 to 5 / 5 to 10 / More than 10
7. **When making business decisions (fees, new services, hiring, marketing), what do you rely on most?** (pick one): Experience and gut feel / My clinic's records and numbers / Advice from family, peers or my CA / AI tools like ChatGPT
8. **Do you keep track of your clinic's earnings month to month?** (pick one): Yes, regularly / Roughly / No
9. **Do you know how many of your patients come back within a year?** (pick one): Yes / Roughly / No
10. **Over the last 3 years, your patient numbers have** (pick one): Grown / Stayed about the same / Gone down
11. **Your biggest challenges** (pick up to 2): Getting new patients / Patients not coming back / Competition from hospitals and chains / Rising rent and costs / Finding or keeping staff / Too much time on admin / Marketing the clinic / Other
12. **Where do most new patients come from?** (pick up to 2): Word of mouth / Google search or Maps / Practo or other apps / Referrals from doctors or hospitals / Social media / Clinic location or walk-ins
13. **What do you actively use to promote your clinic?** (pick all that apply): Google Business profile or Maps / Practo or other listing apps / Instagram or Facebook / WhatsApp messages to patients / Clinic website / Pamphlets, hoardings or newspaper / Health camps or school and society tie-ups / Nothing, I rely on word of mouth
14. **Do you follow up with patients who haven't come back in a while?** (pick one): Regularly / Sometimes / Never
15. **Have you used ChatGPT or similar AI tools for clinic business decisions (not medical)?** (pick one): Often / Sometimes / Never
16. **How useful would a tool be that tracks your clinic's growth and shows changes, like patients who stopped coming or a drop in visits?** (pick one): Very useful / Somewhat useful / Not useful
17. **What would you most want such a tool to show you?** (pick up to 3): Which patients have stopped coming / Monthly patient visit trends / Which services are used most / Where new patients come from / Which marketing is working / Busy and slow months / How I compare to similar clinics / Suggestions to grow the clinic
18. **Which of these would you be comfortable adding to such a tool, without patient names?** (pick all that apply): Patient visit counts / Which services patients use / Appointment records / Earnings and billing / None of these
19. **How much would you pay per month for such a tool?** (pick one): Nothing, only if free / Up to ₹500 / ₹500 to ₹1,500 / ₹1,500 to ₹3,000 / More than ₹3,000
20. **If you could have any tool or service to help your clinic grow, what would it do for you?** (optional, open answer)

## What each block tests

| Questions | Purpose |
| --- | --- |
| Q1 to Q4 | Who responded; Q2 filters to the 5+ years target segment |
| Q5 to Q9 | The core problem: time on business work, how decisions are made, visibility into numbers |
| Q10 to Q14 | Where growth breaks down: trend, challenges, patient sources vs promotion, follow-up |
| Q15 to Q17 | AI use today; whether the growth monitor is wanted; which metrics matter |
| Q18 to Q19 | Which data doctors will share; pricing |
| Q20 | Needs we haven't thought of |
