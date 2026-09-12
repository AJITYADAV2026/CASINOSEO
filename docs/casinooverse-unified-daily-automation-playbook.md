# CasinooVerse — Unified Daily Research and Publication Automation

Run this as the **only CasinooVerse recurring automation**. Do not trigger any other agent, heartbeat job, repository workflow, Agent 4, Search Console action, IndexNow request, or sitemap submission. Complete every stage below in the listed order within this one isolated task. Never run stages concurrently, never continue after a failed stage, and never claim success from schedule configuration alone.

## Stage 1 — Verified research

At task start, record the actual current timestamp in India Standard Time. The expected trigger is 12:01 AM IST. If execution begins after 12:06 AM IST, calculate and report the exact delay.

Research the immediately preceding IST calendar day, covering 00:00 through 23:59 IST. Search broadly for material casino-industry developments, prioritizing official regulators, government bodies, company filings, reputable trade publications, and established public-interest reporting. Open and verify every source page and use independent corroboration where available.

Clearly distinguish realised results from forecasts, proposals from enacted policy, company claims from audited facts, and developing litigation from final decisions. Cover material developments across market intelligence, regulation, casino operations, culture and travel, game education, and responsible entertainment.

Do not include betting picks, bonus offers, affiliate links, promotional gambling claims, winning systems, fabricated quotations, reviews, token promotion, or unsourced statistics. Write concise original CasinooVerse summaries and preserve each publisher, headline, direct URL, available publication timestamp, and access date.

Build one complete source-attributed Markdown document containing the title, published status, research window, numbered story sections, analysis, methodology note, responsible-entertainment notice, inline citations, and References section. Do not rely on the isolated filesystem for persistence.

Create one JSON payload with `digestDate`, `title`, `summary`, `body`, the complete document as `markdownArtifact`, `status` set to `published`, and a non-empty `stories` array. Each story must contain a lowercase hyphenated `slug`, `title`, `dek`, `body`, `contentType`, a `categorySlug` from `market-intelligence`, `regulation`, `casino-operations`, `culture-travel`, `game-guides`, or `responsible-entertainment`, `authorName`, `readingMinutes`, `publishedAt` as an ISO datetime, a unique `featuredImageUrl`, an accessible `featuredImageAlt`, and a non-empty `sources` array. Each source must contain `publisher`, `sourceTitle`, `sourceUrl`, optional ISO `sourcePublishedAt`, and `sourceType` from `official`, `regulator`, `filing`, `trade`, `news`, or `research`.

POST the payload once with curl to `$SCHEDULED_TASK_ENDPOINT_BASE/api/scheduled/daily-digest`, using `Content-Type: application/json` and `Cookie: app_session_id=$SCHEDULED_TASK_COOKIE`. Use `--fail-with-body`. This one callback performs the remaining website stages sequentially: it saves the research edition, creates the same-day Site Find analysis, creates or updates eligible pages, enforces unique images, writes the completed URL manifest, and refreshes the database state used by the dynamic sitemap.

Require an HTTP success response with `pipelineStatus` equal to `completed`, all three internal stage values equal to `completed`, the expected prior-day `digestDate`, and same-day `reportDate` and `manifestDate`. If the callback returns any failure or skipped stage, report the exact `failedStage` and response body and stop immediately.

## Stage 2 — GitHub-first publication

Only after the callback confirms the completed database-backed chain, use the connected GitHub account to clone `AJITYADAV2026/CASINOSEO` into a temporary directory. Download the exact durable files from `$SCHEDULED_TASK_ENDPOINT_BASE`:

- `/research/YYYY-MM-DD.md` for the prior-day digest;
- `/site-find/YYYY-MM-DD.md` for the current IST date;
- `/url-manifests/YYYY-MM-DD.md` for the current IST date;
- `/sitemap.xml` as the current dynamic sitemap snapshot.

Write them to `publication-artifacts/research/YYYY-MM-DD.md`, `publication-artifacts/site-find/SITE FIND YYYY-MM-DD.md`, `publication-artifacts/url-manifests/URL+YYYY-MM-DD.md`, and `publication-artifacts/sitemap.xml`. Verify the research status is `published`, Site Find status is `completed`, URL manifest status is `completed`, and every source date matches the expected chain. Update `publication-artifacts/latest-run.json` with the current and digest dates plus artifact paths.

Run `git add publication-artifacts`. If there is a real staged change, commit exactly `Automated daily content update: YYYY-MM-DD` and push `main`. If no files changed, do not create an empty commit; use the current `main` SHA. Never print, write, or commit credentials.

## Stage 3 — Exact-commit Vercel verification

Read the pushed/current GitHub SHA, then query the commit status for `AJITYADAV2026/CASINOSEO`. Wait up to ten minutes for the `Vercel` context. Succeed only when that exact SHA reports `success` with a Vercel deployment URL. Stop and report the exact state for `failure`, `error`, or timeout.

After Vercel succeeds, verify the stable site at `https://casinoseo.vercel.app` serves the new dated artifacts, the dynamic sitemap, the new/updated article URLs, and each assigned image. Confirm removed Vlogs and historical-archive routes remain noindex 404s. Do not perform indexing submission.

## Final report

Report the actual IST start time and delay, research edition date, saved story count, Site Find date/status, URL manifest date/status, GitHub commit SHA or no-change result, Vercel status, and all durable artifact URLs. If any stage fails, name the exact stage and blocker and do not invent downstream success.
