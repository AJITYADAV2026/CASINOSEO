# CasinooVerse Agent 1 — Isolated Daily Research Playbook

> **Superseded on 12 September 2026.** This research-only schedule is retained for historical audit purposes. The active recurring task uses `docs/casinooverse-unified-daily-automation-playbook.md`.

Run this task independently from all other CasinooVerse agents. Do not trigger Agent 2 or Agent 3. Agent 2 has its own 2:00 AM IST schedule and Agent 3 has its own 2:30 AM IST schedule.

At task start, record the actual current timestamp in India Standard Time. The expected trigger is 12:01 AM IST. If actual execution begins after 12:06 AM IST, state the exact delay in the final report. A configured schedule is not proof of execution.

Create and publish the CasinooVerse research edition for the immediately preceding India Standard Time calendar day, covering 00:00 through 23:59 IST. Search the web broadly for material casino-industry developments, prioritizing official regulators, government bodies, company filings, reputable casino-industry trade publications, and established public-interest reporting. Open and verify every source page; use multiple independent sources where available.

Clearly distinguish realised results from analyst forecasts, proposals from enacted policy, company claims from audited facts, and developing litigation from final decisions. Cover the most material developments across market intelligence, regulation, casino operations, culture and travel, game education, and responsible entertainment.

Do not include betting picks, bonus offers, affiliate links, promotional gambling claims, winning systems, fabricated quotations, reviews, or unsourced statistics. Write concise original CasinooVerse summaries and preserve each source publisher, headline, direct URL, publication timestamp when available, and access date.

Build one complete source-attributed Markdown document for the researched IST date, including title, status, research window, numbered story sections, analysis, methodology note, responsible-entertainment notice, inline source citations, and a References section. Do not rely on the isolated task filesystem for persistence.

POST one JSON payload with curl to `$SCHEDULED_TASK_ENDPOINT_BASE/api/scheduled/daily-digest` using headers `Content-Type: application/json` and `Cookie: app_session_id=$SCHEDULED_TASK_COOKIE`.

The payload must contain `digestDate`, `title`, `summary`, `body`, `markdownArtifact` containing the complete Markdown document, `status` set to `published`, and a `stories` array. Each story must contain a lowercase hyphenated `slug`, `title`, `dek`, `body`, `contentType`, an existing `categorySlug` from `market-intelligence`, `regulation`, `casino-operations`, `culture-travel`, `game-guides`, or `responsible-entertainment`, `authorName`, `readingMinutes`, `publishedAt` as an ISO datetime, optional `featuredImageUrl` and `featuredImageAlt`, and a non-empty `sources` array. Each source must contain `publisher`, `sourceTitle`, `sourceUrl`, optional `sourcePublishedAt` as an ISO datetime, and `sourceType` from `official`, `regulator`, `filing`, `trade`, `news`, or `research`.

If research or callback delivery fails, report the exact blocker and do not invent content. After a successful callback, report the actual execution start time in IST, edition date, number of saved stories, callback status, and durable Markdown URL `$SCHEDULED_TASK_ENDPOINT_BASE/research/YYYY-MM-DD.md`.
