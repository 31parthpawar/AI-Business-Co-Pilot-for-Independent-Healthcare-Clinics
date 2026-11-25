# First Clinic: Record Formats

How the first clinic keeps its records today, shared by the doctor on 25 Nov 2026. **Field names and layout only.** All values were removed before committing, because this repo is public. Never add real data here; real files go in `data/` (git-ignored).

| File | What it is |
| --- | --- |
| `visit-log-fields.png` | Visit log: one row per patient visit (Date, Day, Mopd/Eopd, Name, Case No., Service, Detail, Amount, Mode, Remark) |
| `daily-summary-fields.xlsx` | Daily sheet for one month: two rows per day (morning and evening OPD), 26 per-session counts and amounts, monthly totals, weekly targets block |
| `12-month-summary-fields.xlsx` | One row per month, with max, min, average, target and total over the last 12 months |

Still to come: the AP (annual program) table and the vaccine table headers.

Full field-by-field description, and how the app calculates each column: `docs/prototype-spec.md`.
