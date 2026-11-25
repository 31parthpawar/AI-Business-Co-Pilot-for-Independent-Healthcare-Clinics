# Sample data

Sheets for a made-up pediatric clinic, in the first clinic's exact columns (visit log with the optional Source column, AP table, vaccine table). Fake names only.

The `.xlsx` files are git-ignored because they are regenerated, not edited. Make them with:

```bash
cd app/web && npm run sample            # data up to today
cd app/web && npm run sample -- 2026-12-09   # data up to a given date
```

The app's Data screen can also download them ("Sample sheets"), and "Load sample data" builds the same data in the browser.
