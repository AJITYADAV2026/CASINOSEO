# CasinoVerse Agent 3 — Page Creation and URL Manifest Contract

## Role in the Agent Sequence

Agent 3 runs at **2:30 AM IST**, after Agent 1’s 12:01 AM research run and Agent 2’s 2:00 AM content analysis. It reads the latest completed durable `site_find_reports` record, applies safe page-level actions to CasinoVerse’s data-driven article system, and saves one dated URL manifest named `url-YYYY-MM-DD.md`.

Agent 3 may create, publish, update, retain, or archive pages. It does not submit URLs to search engines or external indexing services. Agent 4 remains responsible for indexing submission. Agent 3 refreshes `sitemap.xml` only through the existing dynamic sitemap’s story data source; it never overwrites a static XML file.

## Input Selection and Idempotency

The scheduled run selects the newest Site Find report with `status = completed`. A controlled verification run may include the current draft report without changing the permanent published-only behavior. If the selected report and its `updatedAt` timestamp have already been processed into the same dated URL manifest, Agent 3 returns a successful idempotent skip.

## Action Rules

| Agent 2 decision | Agent 3 behavior | URL behavior | Sitemap behavior |
| --- | --- | --- | --- |
| `add` | Resolve the matching source-digest story by existing slug or normalized title; publish it when a full sourced story exists, otherwise record `review-required` without inventing content | Preserve or assign `/articles/{slug}` | Included when status becomes `published` |
| `update` | Resolve the existing story; preserve its title, body, source relationships, and slug; update publication state and modification timestamp without duplicating the page | Existing permanent URL is retained | Existing entry receives a refreshed `lastmod` |
| `retain` | Make no content mutation and record the existing URL | Existing URL retained | No change |
| `archive` | Set the existing story to `archived`; never delete the database row or its sources | URL is recorded as archived | Removed automatically because the dynamic sitemap includes only published stories |
| `remove` | Never hard-delete automatically; record `review-required` with the existing URL when known | No automatic URL deletion | No automatic change until a later reviewed action |

Agent 3 does not use Agent 2’s concise rationale as article copy. It treats the Site Find decision as a publication instruction and relies on Agent 1’s already sourced story content. This prevents instruction text from appearing as editorial prose and avoids fabricating details.

## Dated URL Manifest

Each durable manifest is stored in `url_manifests` and exported under `content/urls/url-YYYY-MM-DD.md`. It contains front matter, source Site Find metadata, action counts, a canonical URL table, notes for review-required items, and an explicit statement that no indexing submission occurred.

Each URL row includes the action, outcome, title, story slug, canonical URL, page status, sitemap inclusion status, and a concise note. The canonical origin is derived from `CANONICAL_ORIGIN`; payload values cannot override it.

## Durable Data Contract

The `url_manifests` table stores `id`, `manifestDate`, `sourceSiteFindId`, `sourceSiteFindUpdatedAt`, `sourceReportDate`, `status`, `actionsJson`, `markdownArtifact`, `createdCount`, `updatedCount`, `retainedCount`, `archivedCount`, `reviewCount`, `scheduleCronTaskUid`, `processedAt`, `errorMessage`, and normal audit timestamps. One manifest is retained per calendar date and updated idempotently when its source Site Find report is refreshed. Manifest outcomes are limited to `created`, `updated`, `retained`, `archived`, and `review-required`.

The cron-only callback is `POST /api/scheduled/page-creation`. It authenticates the platform-issued task identity, looks up the `casinoverse-page-creation` publication job by task UID, processes the report transactionally, updates the publication job, and returns action counts. Unauthenticated requests receive HTTP 403.

The permanent Agent 3 heartbeat uses UTC cron `0 0 21 * * *`, which corresponds to **2:30 AM IST**. A scheduled run processes completed Site Find reports only; an explicitly authenticated verification payload may include the current draft report without changing normal behavior.

## Sitemap and Indexing Boundary

The existing `/sitemap.xml` route queries current category, story, and digest rows on every request. Published stories become sitemap entries at `/articles/{slug}`, archived stories are excluded, and modified stories receive their current `modifiedAt` value as `<lastmod>`. Consequently, Agent 3 updates sitemap output by committing page state, not by editing XML text.

Agent 3 contains no Search Console, IndexNow, Google Indexing API, sitemap-ping, or external crawler-submission code. Those actions are reserved for Agent 4.
