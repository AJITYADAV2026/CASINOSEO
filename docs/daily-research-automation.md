# CasinoVerse Daily Research Automation

## Production Design

CasinoVerse uses an **agent-driven recurring task** because each daily edition requires fresh web discovery, browser-based source verification, comparison across multiple publishers, and editorial synthesis. The deployed website exposes a cron-only callback at:

`POST /api/scheduled/daily-digest`

The callback authenticates the platform-supplied scheduled-task identity, looks up the durable publication job by `taskUid`, validates the complete payload with a strict schema, and writes the digest, stories, sources, and ordered digest relationships in one database transaction. The handler is idempotent by digest date and story slug. Direct unauthenticated requests receive HTTP 403.

## Daily Agent Instructions

The production recurring agent should receive a self-contained prompt equivalent to the following:

> Create the CasinoVerse daily casino-industry research edition for the current calendar date. Research the preceding daily editorial window and prioritize official regulators, government bodies, company filings, reputable casino-industry trade publications, and established public-interest reporting. Verify every included story by opening the source page. Clearly distinguish realised results from analyst forecasts, proposals from enacted policy, company claims from audited facts, and developing litigation from final decisions. Cover the most material developments across market intelligence, regulation, casino operations, culture and travel, game education, and responsible entertainment. Do not include betting picks, bonus offers, promotional gambling claims, affiliate links, winning systems, fabricated quotations, customer reviews, or unsourced statistics. Prepare concise original CasinoVerse summaries rather than reproducing source text. When finished, POST one JSON payload to `$SCHEDULED_TASK_ENDPOINT_BASE/api/scheduled/daily-digest` using `curl`, with the cookie header `app_session_id=$SCHEDULED_TASK_COOKIE`. The payload must follow the contract below. Mark the edition `published` only after the defined calendar-day research window is complete; otherwise use `developing`.

## Callback Payload Contract

| Field | Type | Requirement |
| --- | --- | --- |
| `digestDate` | `YYYY-MM-DD` | Editorial archive date |
| `title` | string | Descriptive dated edition title |
| `summary` | string | 30–1,500 characters |
| `body` | string | 80–15,000 characters of original digest analysis |
| `status` | `developing` or `published` | Reflects whether the daily window is complete |
| `stories` | array | 1–30 verified stories |
| `stories[].slug` | lowercase hyphenated string | Permanent article identifier |
| `stories[].categorySlug` | existing CasinoVerse category slug | Unknown categories are rejected transactionally |
| `stories[].sources` | array | At least one visible original source per story |
| `stories[].sources[].sourceUrl` | HTTPS URL | Direct original source link |

## Deployment and Activation

The recurring task cannot be activated against the development sandbox. The website must first be published so the platform can reach the production callback. After publication, the production canonical origin must be configured for canonical tags, absolute social-share images, robots directives, and sitemap URLs.

The user’s phrase **“00:01 PM”** is ambiguous between 12:01 PM and a possible intended 00:01/12:01 AM trigger. The exact daily trigger time and timezone must be confirmed before creating the recurring task. The website code therefore contains the complete callback and durable job identity but does not create an incorrectly timed schedule.

## Suggested Timing Choices

| Interpretation | UTC cron for IST | Editorial effect |
| --- | --- | --- |
| 12:01 PM IST daily | `0 31 6 * * *` | Produces a midday developing edition and requires a later finalization pass |
| 12:01 AM IST daily | `0 31 18 * * *` | Starts a new calendar-day edition shortly after midnight |
| 11:59 PM IST daily | `0 29 18 * * *` | Best suited to finalizing the complete calendar-day edition |

All cron expressions use six fields and UTC.
