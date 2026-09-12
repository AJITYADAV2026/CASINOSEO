# CasinoVerse Daily Three-Agent GitHub Pipeline

> **Superseded on 12 September 2026.** This multi-schedule architecture is retained only as historical documentation. The active design is the single sequential automation in `docs/casinooverse-unified-daily-automation-playbook.md` and `docs/unified-automation-migration-2026-09-12.md`.

**Status:** Historical; previously verified on 7 September 2026 IST  
**Author:** Manus AI

## Architecture decision

CasinoVerse keeps its website **dynamic and database-backed**. Agent 1, Agent 2, and Agent 3 write durable records to the project-owned database. After Agent 3 completes, a repository-hosted publisher exports exact Markdown snapshots and the live sitemap into GitHub. A normal commit to `main` then triggers the already-connected Vercel production deployment.

| Approach | Security and reliability | Cost | Decision |
| --- | --- | --- | --- |
| Repository-hosted publisher after Agent 3 | Uses the repository’s scoped workflow permission, keeps a GitHub token out of the application runtime, and refuses partial chains | Standard GitHub Actions usage | **Selected** |
| Website runtime pushes Git directly | Requires a write credential inside the production runtime and couples publishing to stateless autoscaling instances | Hosting plus secret-management overhead | Rejected |

## Daily sequence

| Stage | Schedule | Durable input | Durable output | Failure behavior |
| --- | --- | --- | --- | --- |
| Agent 1 | 12:01 AM IST | Previous IST day’s verified web sources | `dailyDigests` row and `/research/YYYY-MM-DD.md` | Reports the blocker; never invents content |
| Delivery monitor | 12:15 AM IST | Expected Agent 1 digest date | Health record and owner notification on failure | Does not create a digest |
| Agent 2 | 2:00 AM IST | Same-day expected Agent 1 digest | `siteFindReports` row and `/site-find/YYYY-MM-DD.md` | Fails closed if Agent 1 is missing or stale |
| Agent 3 | 2:30 AM IST | Same-day completed Agent 2 report | Published/updated database pages, `urlManifests` row, dynamic sitemap, and `/url-manifests/YYYY-MM-DD.md` | Fails closed if Agent 2 is missing or stale |
| GitHub publisher | 2:35 AM IST | All three durable Markdown artifacts | Versioned files under `publication-artifacts/` and a commit to `main` | Polls for 25 minutes, then exits with failure rather than committing partial output |
| Vercel | Automatic after GitHub push | GitHub `main` commit | Production deployment | Deployment status remains visible in GitHub and Vercel |

The repository publisher **does not trigger any agent**, so it cannot collapse the separated schedule into one concurrent run. Agent 4 remains absent/paused and no indexing or Search Console submission is performed.

## Versioned GitHub artifacts

| File | Meaning |
| --- | --- |
| `publication-artifacts/research/YYYY-MM-DD.md` | Agent 1 research edition, named for the researched IST calendar day |
| `publication-artifacts/site-find/SITE FIND YYYY-MM-DD.md` | Agent 2 content-analysis report, named for its IST execution/report day |
| `publication-artifacts/url-manifests/URL+YYYY-MM-DD.md` | Agent 3 page and URL log, named for its IST execution/manifest day |
| `publication-artifacts/sitemap.xml` | Snapshot of the live database-generated sitemap after Agent 3 |
| `publication-artifacts/latest-run.json` | Machine-readable dates and paths for the latest complete export |

The website serves the Markdown exports through unlinked, date-validated routes. They are intentionally excluded from navigation, `robots.txt`, and sitemap feeds. Public article pages remain semantic SSR HTML, and the sitemap continues to be generated from current database state rather than a static file.

## GitHub and Vercel configuration

The workflow is stored at `.github/workflows/daily-content-publication.yml`. It has only `contents: write` repository permission, uses the standard checkout action, embeds no personal token, and pushes `HEAD:main` only after all artifact downloads succeed. The commit message format is:

> `Automated daily content update: YYYY-MM-DD`

GitHub repository: `AJITYADAV2026/CASINOSEO`  
Vercel production alias: `https://casinoseo.vercel.app`

## Operating notes

GitHub-hosted schedules can start a few minutes late under platform load. The workflow’s durable-date validation and fail-closed polling are therefore more important than exact second-level dispatch. The authoritative proof of each run is the dated database record, exported artifact, Git commit, and matching Vercel deployment—not the existence of a configured schedule alone.
