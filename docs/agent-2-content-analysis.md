# CasinoVerse Agent 2 — Content Analysis Contract

## Role in the Agent Sequence

Agent 2 runs at **2:00 AM IST**, after Agent 1’s **12:01 AM IST** research run. It reads the latest **completed** Agent 1 digest from CasinoVerse’s durable database, evaluates how that research should affect the publication, and writes one dated **Site Find** Markdown report.

Agent 2 is a decision layer only. It does **not** create pages, assign final URLs, modify route files, publish articles, alter indexing directives, or edit `sitemap.xml`. Those responsibilities remain reserved for Agents 3 and 4.

## Input Selection

Agent 2 selects the newest `daily_digests` record that has `status = published` and a non-empty `markdownArtifact`. If the newest completed digest has already been analyzed successfully, the job returns an idempotent skip result rather than creating a duplicate report. Developing digests are never treated as complete Agent 2 inputs.

## Decision Taxonomy

| Decision | Meaning | Agent 2 output requirement |
| --- | --- | --- |
| `add` | Research supports a new editorial item that is not already represented | Proposed title, category, rationale, priority, evidence citations, and suggested content type |
| `update` | Existing CasinoVerse content should receive materially new verified information | Existing story slug when identifiable, exact change summary, evidence citations, and freshness impact |
| `retain` | Existing content remains accurate and useful without a material change | Existing story slug or topic, retention rationale, and review note |
| `archive` | Content should leave prominent/current modules but remain historically accessible | Existing story slug, reason, and suggested archival treatment |
| `remove` | Content is factually invalid, duplicated, unsafe, legally problematic, or unsupported | Existing story slug when identifiable, evidence, severity, and explicit human-review requirement |

Agent 2 never executes deletion. Every `remove` decision is a recommendation for Agent 3 or editorial review and must include `requiresHumanReview: true`.

## Analysis Rules

Agent 2 must preserve source attribution from Agent 1 and may not introduce facts that are absent from the input artifact. Forecasts must remain labeled as forecasts; proposals must remain distinguished from enacted policy; licences must be described only within their documented scope; and company statements must remain distinguished from audited results.

The analyzer checks for duplication against the current CasinoVerse story catalog supplied in its prompt. A development should normally be marked `update` rather than `add` when an existing story covers the same underlying event, organisation, jurisdiction, and material fact pattern.

Priority is assigned as `critical`, `high`, `medium`, or `low`. Priority reflects editorial importance and update urgency, not promotional value. Responsible-entertainment relevance, regulatory significance, material market impact, and correction risk raise priority. Commercial hype does not.

## Site Find Markdown Format

Each report is stored under the dated artifact name `site-find-YYYY-MM-DD.md` in durable report storage and contains:

1. Front matter with report date, source digest date, status, model, and decision counts.
2. A title in the form `CasinoVerse Site Find — YYYY-MM-DD`.
3. An executive content assessment.
4. A decision summary table.
5. Separate `Add`, `Update`, `Retain`, `Archive`, and `Remove` sections.
6. For each decision: proposed title/topic, existing slug if applicable, category, content type, priority, rationale, evidence references, confidence, and human-review flag.
7. A scope boundary stating that Agent 2 did not create pages, URLs, indexing entries, or sitemap changes.
8. References carried forward from the Agent 1 artifact.

## Durable Data Contract

The `site_find_reports` table stores one report per source digest and report date. It contains the source digest identifier/date, status, model identifier, executive summary, complete Markdown artifact, serialized structured decision payload, decision counts, schedule task UID, analysis timestamps, and an error message when a run fails.

The Agent 2 scheduled callback is `/api/scheduled/content-analysis`. It authenticates the platform task identity, looks up the owning job by `schedule_cron_task_uid`, selects the latest completed digest from the database, runs one structured server-side analysis call, validates the response, renders the Markdown artifact deterministically, and saves the report transactionally. Agent 2 does not expose a public report route; Agent 3 will own URL creation and page publication.

## Failure and Idempotency Behavior

If no completed Agent 1 digest exists, the handler returns a non-retryable successful skip result. If the newest digest is already analyzed, it also returns a successful skip. Model, validation, or database failures return JSON-encoded server errors so the platform can retry and expose diagnostics. No partially generated Site Find report is stored.
