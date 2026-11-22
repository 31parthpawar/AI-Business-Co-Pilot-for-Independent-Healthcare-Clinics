# Demo App

The working demo of the design in `docs/demo-plan.md`. Nothing is built yet. This file sets the build scope so we can pick a tier based on how much build time (Claude credits) we have.

## Layout

| Path | What goes there |
| --- | --- |
| `app/web/` | The website: clinic screens and patient pages (Vite, React, TypeScript, Tailwind) |
| `app/api/` | Small serverless functions that call the AI model: register reading, review drafting, Ask |
| `app/sample-data/` | Synthetic clinic data generator, and register pages we handwrite ourselves for the demo |

No real patient data goes in this folder. Real clinic files stay in git-ignored `data/`.

## Credits

1. **Build credits:** Claude Code usage to write the app. This is what the tiers below are sized by.
2. **Run credits:** an API key for the AI features when the demo runs. **We have none for now.** Until we find a source, every AI feature appears in the app as a **"Coming soon"** card that describes what it will do. Everything else works fully.

### AI features shown as "Coming soon"

| Feature | What the card says it will do |
| --- | --- |
| Snap the register | Photograph a register page and AI reads the handwriting (English and Hindi) into a table, highlights entries it is unsure about, and exports to Excel. Old registers can be backfilled so trends work from day one |
| Review writing help | Turns the patient's own star rating, tags and words into a short review in English, Hindi or Hinglish, which they can edit before posting |
| Ask about your clinic | Answers questions like "Why were new patients down in October?" from the clinic's own numbers, in the app or by replying to the weekly WhatsApp summary |
| Written weekly summary | Explains in plain language what changed this week and why. Until then the summary uses fixed templates |

Where run credits might come from: IIITD-IC or the advisor (research or startup credit programs), or a free tier of a model provider. To find out.

## Build tiers

Each tier includes the one before it. Sizes are relative; Tier 1 is roughly a third of Tier 3.

### Tier 1: core demo (smallest)

What we need for the professor. Covers the three ideas the team liked most.

| Piece | What it does |
| --- | --- |
| Review helper (patient page) | Stars and tags or free text, one-tap copy, buttons that open Google, Practo or Justdial. AI drafting shows as "Coming soon" |
| Snap the register | "Coming soon" screen describing the feature, with a sample of the table it will produce |
| Home, "This week" | New patients vs usual, where they came from, up to three nudges, on synthetic data |
| Due list | Vaccines and tests due, each with a prefilled WhatsApp reminder in the clinic's name |
| Synthetic data | Generator for a 3-year pediatric clinic with planted patterns (Google drop, vaccine wave, monsoon peak) |

Demo story it supports: show the register-reading feature that's coming, see the drop in new patients, play the patient writing a review, send a vaccine reminder.

### Tier 2: full story

| Piece | What it does |
| --- | --- |
| Get found screen | Reviews this month, recommend-link shares, new patients by source |
| Recommend card (patient page) | Shareable clinic card with a tagged link, counted when a new patient arrives through it |
| Self check-in (patient page) | New patient enters details, source and messaging consent |
| Weekly summary preview | The WhatsApp message the doctor would get |
| Nudges toggle | Turns suggestions on or off (open decision with the advisor) |
| Trends | Monthly visits, services used, seasonal peaks |

### Tier 3: polished

| Piece | What it does |
| --- | --- |
| Ask about your clinic | "Coming soon" until we have run credits; then chat with suggested questions, answered from aggregate numbers |
| Settings | Doctor's own reminder rules ("TSH every 6 months"), earnings on or off, printable QR codes |
| Vaccine stock forecast | Doses needed next month from the due list |
| Deploy and polish | Public link, mobile layout pass, demo reset button |

## Recommendation

- **Build Tier 1 first, whatever the credits.** It covers the top survey problems (new patients, staying in touch, paper records) and the strongest demo moments.
- **Add Tier 2** if credits allow before the report.
- **Leave Tier 3 for after the report** unless it's cheap by then.

Build order inside Tier 1: review helper, then snap the register, then synthetic data, then home and due list.

## Decided

- Stack: Vite, React, TypeScript, Tailwind, a chart library; serverless functions for AI calls; static deploy.
- Clinic data stays in the browser for the demo. Only aggregated numbers go to the Ask feature.
- WhatsApp through `wa.me` links with prefilled text; no WhatsApp API in the demo.

## Waiting on

- [ ] Tier choice, after checking Parth's credits.
- [ ] A source of run credits for the AI features. Until then they show as "Coming soon".
- [ ] 3 to 4 handwritten sample register pages with fake patients, ideally in the clinic's real register format.
