# App

The clinic co-pilot MVP. **Read `docs/prototype-spec.md` first:** the clinic's data fields, data model, features F1 to F6, screens, tech, synthetic data, build plan and open questions.

Nothing is built yet. Demo at the poster presentation on 9 Dec 2026.

## Layout

| Path | What goes there |
| --- | --- |
| `app/web/` | The app (Vite, React, TypeScript, Tailwind). Rules in `src/logic/` as pure functions with tests |
| `app/sample-data/` | Synthetic data generator writing `.xlsx` files in the clinic's exact columns |

No real clinic data in this folder or anywhere in the repo (it's public). Real files stay in git-ignored `data/` and are only opened on the clinic's computer.

## In short

- **Base layer:** import the clinic's Excel (visit log, AP table, vaccine table), calculate its daily and 12-month summaries, export them back in its layout.
- **Six features:** who to call today (AP renewals, overdue vaccines, lapsed regulars, unused AP), cross-sell to AP, patient value, retention, target pacing, session and seasonal load.
- **No server and no AI calls.** Everything runs in the browser, so API credits aren't needed for the MVP.

## Build order

1. Setup, data model, synthetic data, import, patient card.
2. Call lists with outcome button, target pacing, Today screen.
3. Cross-sell, retention, daily summary and manual form.
4. Patient value, load, export, Settings.
5. Real data on the clinic's computer, doctor's feedback.

Dates in `docs/prototype-spec.md`.
