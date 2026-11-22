# Demo App Plan

**Goal:** a working web app to show Prof. Vajpayee and put in the report (screenshots). Design first; it runs on synthetic data for the demo, and real clinic data comes later.

**Status:** v2 design, pending team approval. Items marked *(open decision)* can be switched on or off, so either answer from the advisor is cheap to adopt.

## What changed from v1

| v1 idea | Problem | v2 |
| --- | --- | --- |
| Remind lapsed patients to visit | People see a doctor when they are ill. "Come back" reminders feel like spam and don't match how care works (Garvit's point) | **Health-due reminders:** vaccines, routine blood tests, growth checks, sent in the clinic's name. They keep the clinic in front of the family even when the action happens at a lab, so the clinic is the first call when someone falls ill |
| Receptionist types every visit | Still a new daily chore. 68% of clinics keep paper registers and won't change habits | **Snap the register:** photograph the day's register page; AI reads it into a table. The register stays as it is |
| "Request a Google review" link | Patients don't know what to write, and leave | **Review QR:** patient scans a QR at reception, picks or writes a few points, optionally gets AI help, copies the text in one tap and is taken to Google, Practo or Justdial |
| "How did you hear about us" asked by receptionist | Gets skipped when the clinic is busy | **Patient self check-in QR** and **recommend links** capture the source without staff effort |

## The problems it has to address

Ranked by survey evidence (`research/findings.md`).

| Problem | Evidence | What the app does |
| --- | --- | --- |
| Getting new patients | Top challenge, 48%; "where new patients come from" 53% in Q17 | Review QR, recommend links, source tracking |
| Word of mouth is everything but invisible | 91% get patients by word of mouth; nobody measures it | Recommend links make word of mouth countable and easier to spread |
| Marketing that doesn't happen | 56% do no promotion; Google profile users get Google patients far more often (19 of 25 vs 5 of 41) | Reviews and recommendations that run themselves; no campaigns to plan |
| Staying in touch | 97% don't follow up regularly; 80% don't clearly know return rate | Health-due reminders in the clinic's name |
| Paper records | 68% paper, 11% Excel | Snap the register |
| Decisions on gut feel | 65% | Plain-language weekly summary of what changed and why |
| Wants suggestions | Most wanted feature, 65% (60% within the pick limit) | Rule-based nudges tied to a number *(open decision)* |

## Design principles

1. **The app does the work, not the doctor.** 59% spend under 2 hours a week on business work. Capture, reminders and reviews run on their own; the doctor reads one weekly summary.
2. **Fit existing habits.** Keep the paper register (snap it); use WhatsApp, which everyone already has.
3. **AI in the background, not in the pitch.** 79% have never used AI tools for business. AI reads registers, drafts reviews and answers questions, but the doctor never has to write a prompt.
4. **Be useful to the patient, not promotional.** Reminders carry health value (vaccine due, test due), never "visit us". This also keeps us clear of rules on soliciting patients.
5. **Show people and actions, not just rates.**
6. **No finance needed.** Earnings are optional (39% would share).
7. **Phone first.** For doctors, receptionists and patients.

## The app in four parts

### 1. Capture: get data in without a new chore

- **Snap the register.** The receptionist photographs the register page at the end of the day. A vision model reads the rows (date, patient, age, phone, complaint, new or returning) into a table, and cells it is unsure about are highlighted for a quick check. Exports to Excel or feeds the app.
  - **Backfill:** photograph the last 1 to 2 years of registers on day one, and the trends and lists work immediately instead of after months of entry. This solves the cold start.
  - **Source code column:** the receptionist writes one letter beside a new patient (G Google, W word of mouth, R doctor referral, L walk-in). The reader picks it up. A rubber stamp could print the options on each page.
- **Patient self check-in QR** *(optional)*: a new patient scans at reception and enters the child's name, date of birth, phone and how they heard about the clinic. This also records consent for WhatsApp messages.
- **File import** for clinics with EMR software or Excel.

### 2. Stay in touch: health-due reminders

- **The doctor sets the rules** in their own words, so the app never gives medical advice:
  - vaccines from the clinic's schedule
  - "TSH every 6 months for patients tagged thyroid"
  - "growth check at 9, 12 and 18 months"
  - annual membership renewals
- **Messages say what is due, not "visit us".** Example: "Dr. Pawar's Clinic: Aarav's MMR second dose is due next week." The family may go to a lab or another place, but the clinic's name is the one they see.
- **Seasonal advisories:** for example dengue season prevention tips before the monsoon peak the clinic saw last year.
- **Vaccine stock forecast:** the due list tells the clinic how many doses of each vaccine it will need next month. 73% of clinics offer vaccinations.
- **Demo:** a due list with prefilled WhatsApp messages (`wa.me` links). Automated sending comes later.

### 3. Get found: reviews and word of mouth

- **Review QR** (a standee at reception, plus a link in the after-visit message). The patient:
  1. Picks a star rating and a few tags ("explains clearly", "short wait", "good with kids"), or writes freely.
  2. Taps "help me write" if they want: AI turns their own points into a short review in English, Hindi or Hinglish, which they can edit.
  3. Copies the text in one tap and picks Google, Practo or Justdial; the app opens that platform's review page.
- **Rules it follows:** every patient is offered the public review, whatever rating they gave. There's no filtering of unhappy patients, no incentives, and the patient always posts it themselves. Google prohibits review gating and incentives, and the review must be the patient's own experience.
- **Recommend links:** after a visit, the family gets a "Share Dr. Pawar's clinic" card with the clinic's address, map and timings to forward on WhatsApp. Each link is tagged, so the app can count new patients who came from a recommendation. This turns the 91% word-of-mouth channel into something measurable.
- **Google profile check:** rating, review count and recent reviews compared with nearby clinics, using public data. This gives the comparison 27% asked for without anyone sharing data. *(later)*

### 4. Understand: what's working

- **Weekly summary on WhatsApp:** new patients and where they came from, reminders sent, reviews posted, plus up to three nudges.
- **Ask about your clinic:** chat with ready-made questions, also answerable by replying to the WhatsApp summary.
- **Where patients live:** a map of patients by area (from pin codes or locality), to decide where a camp or tie-up would reach new families. The advisor flagged local demographics. *(later)*
- **Trends:** monthly visits, services used, seasonal peaks.

## Nudge rules (examples)

| Trigger | Nudge |
| --- | --- |
| Vaccines due in the next 14 days | "9 children are due for vaccines this fortnight. Send reminders?" |
| New patients 20% below the 3-month average | "New patients fell 25% this month. Most of the drop is from Google." |
| Few new reviews | "2 reviews this month vs 9 last month. Is the QR standee still at the desk?" |
| Recommend links working | "6 new patients came from shared links this month." |
| Source letter missing | "Source wasn't marked for 40% of new patients this week." |
| Memberships expiring | "6 annual memberships expire this month." |
| Seasonal peak ahead | "Visits rose 40% last September. Vaccine and staff planning?" |

## AI pieces

| Feature | What AI does | Fallback if it fails |
| --- | --- | --- |
| Snap the register | Reads handwritten rows (English and Hindi), flags unsure cells | Manual correction in the review table |
| Review helper | Turns the patient's own tags and words into a short review | Patient writes it themselves |
| Ask about your clinic | Answers from aggregated numbers only | Ready-made answers to the suggested questions |
| Weekly summary | Writes the plain-language "what changed" | Template text |

Privacy: register photos contain names and phone numbers. Process them, keep the extracted table on the clinic's device, replace names with IDs for analysis, and delete the photo. Get consent under the DPDP Act before messaging patients.

## Screens

**Clinic side (doctor and receptionist):**
1. **Home, "This week":** headline numbers and up to three nudges.
2. **Snap register:** camera, extracted table with highlighted cells, confirm.
3. **Due list:** vaccines, tests, renewals; send reminders.
4. **Get found:** reviews this month, recommend-link shares and new patients from them, source mix.
5. **Trends.**
6. **Ask about your clinic.**
7. **Settings:** reminder rules, nudges on or off, earnings on or off, QR codes to print.

**Patient side (opened from a QR or WhatsApp, no app install):**

8. **Review helper.**
9. **Self check-in.**
10. **Recommend card.**

## Demo script (6 minutes)

1. Receptionist snaps a register page; rows appear in a table. "Two years of registers were backfilled like this."
2. Home screen: new patients down, mostly from Google. Reviews have dried up.
3. On a phone, play the patient: scan the QR, tap tags, get an AI-drafted Hinglish review, copy, land on Google.
4. Due list: 9 vaccines due; send a WhatsApp reminder in the clinic's name.
5. Recommend card forwarded on WhatsApp; it shows up later as a new patient "via shared link".
6. Weekly summary on WhatsApp; reply with a question and get an answer.
7. Close on the evidence: each screen maps to a survey number.

## Build order for the demo

1. Patient-side review helper (self-contained, the biggest wow).
2. Snap register with sample handwritten pages we write ourselves.
3. Home, due list and get-found screens on synthetic data.
4. Weekly summary preview and Ask.
5. Recommend card, check-in, trends, settings if time allows.

## Recommended tech

- Vite, React and TypeScript with Tailwind and a chart library. Static deploy (Vercel).
- A small serverless function calls a vision-capable language model for register reading, review drafting and Ask. No patient rows are sent to Ask; only aggregates.
- Clinic data stays in the browser for the demo.
- WhatsApp through `wa.me` links; QR codes generated in the app.

## Checks before real use

- **Messaging rules:** TRAI rules on commercial messages and WhatsApp Business message categories. Reminders should qualify as service messages, not marketing.
- **Medical ethics:** NMC rules on doctors soliciting patients and advertising, which apply to reviews and recommend links.
- **Review platforms:** Google and Practo review policies.
- **Privacy:** DPDP Act consent for storing phone numbers and messaging.

## Out of scope for the demo

Automated WhatsApp sending, live EMR integration, logins and multiple clinics, Google profile comparison, the patient map, billing, appointment booking, and any view for chemists or labs.
