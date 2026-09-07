# CasinoVerse Daily Publication Artifacts

This directory is the GitHub snapshot of CasinoVerse’s durable daily pipeline. The website remains **dynamic and database-backed**; these files provide a versioned audit trail after Agent 3 completes.

| Directory or file | Durable source |
| --- | --- |
| `research/YYYY-MM-DD.md` | Agent 1 research edition for the preceding IST calendar day |
| `site-find/SITE FIND YYYY-MM-DD.md` | Agent 2 content-analysis report for the current IST day |
| `url-manifests/URL+YYYY-MM-DD.md` | Agent 3 page and URL manifest for the current IST day |
| `sitemap.xml` | Snapshot of the live database-generated sitemap after Agent 3 |
| `latest-run.json` | Dates and paths for the latest complete exported chain |

The repository workflow waits for all three Markdown artifacts and fails closed if any upstream stage is missing. It never triggers Agent 1, Agent 2, Agent 3, or Agent 4, and it performs no search-engine indexing. A successful commit to `main` is deployed automatically by the connected Vercel project.
