# AI Business Co-Pilot for Independent Healthcare Clinics

B.Tech Project (Entrepreneurship track), IIIT Delhi. Advisor: Prof. Pankaj Vajpayee.

Small clinic owners are doctors first, but growing the clinic forces them to think like business owners with scattered data and no business support. We are validating and prototyping a growth monitor that tracks a clinic's key metrics from patient and visit data and shows clearly what is changing.

## Repo layout

| Path | What's there |
| --- | --- |
| `CLAUDE.md` | Full project context and working rules. Read this first. |
| `docs/questionnaire.md` | Validation questionnaire sent to doctors |
| `docs/decisions.md` | Log of decisions and why they were made |
| `research/findings.md` | Survey findings from 66 doctors |
| `research/responses.csv` | Anonymous survey responses (Google Form export, all 66, 18 to 20 Nov 2026) |
| `research/analyze.py` | Reproduces every number in the findings, including segments and pick-limit checks: `python3 research/analyze.py research/responses.csv` |
| `data/` | Real clinic data. Git-ignored, never committed |

## Working together

- Work on your own branch and merge through pull requests.
- Any change in direction goes into `CLAUDE.md` and `docs/decisions.md` in the same commit.
- Never commit patient data. Use synthetic samples for anything in the repo.
