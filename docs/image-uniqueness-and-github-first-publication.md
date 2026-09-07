# CasinoVerse Image Uniqueness and GitHub-First Publication

## Image assignment contract

CasinoVerse assigns each public editorial role its own image URL. The same story image may appear on that story’s listing card and detail page because those surfaces represent one editorial record; two different public stories may not share a featured image URL.

The current static registry covers homepage desks, category art, page heroes, game guides, gallery entries, and expanded-page visuals. Automated tests combine the shared site registry with the expanded-page registry and fail when one URL is assigned to two roles. A database-backed integration test separately requires every non-archived story to have a non-empty image, accessible alt description, and distinct URL, and confirms that no story image reuses a static page asset.

Generic story fallback art has been removed. If a story has no image, card and article structured-data renderers omit the image instead of repeating another page’s visual.

## Agent 3 publication gate

Before Agent 3 changes an `add` or `update` decision to `published` or `developing`, it now requires the story to have its own featured image URL and accessible alt description. It queries other public stories for the same URL. A conflict creates a `review-required` URL-manifest action and leaves the story’s existing publication state unchanged.

This gate allows an existing story to keep its own image during an update because the conflict query excludes that story’s ID. It prevents reuse across different public stories.

## GitHub-first deployment sequence

Agents remain independent and fail closed:

1. Agent 1 runs as an isolated scheduled task at 12:01 AM IST and persists the previous IST day’s published research edition.
2. The 12:15 AM IST monitor checks delivery but never invokes downstream agents.
3. Agent 2 runs at 2:00 AM IST and requires the same-day durable Agent 1 output.
4. Agent 3 runs at 2:30 AM IST and requires the same-day completed Agent 2 report.
5. The repository publisher starts at 2:35 AM IST and polls for the dated Agent 1, Agent 2, and Agent 3 Markdown artifacts.

The publisher now validates each artifact’s date linkage and terminal status before downloading the sitemap snapshot. It refuses to commit stale, missing, draft, partial, or review-required output. It stages only `publication-artifacts`, creates `Automated daily content update: YYYY-MM-DD` when those durable files changed, and pushes `HEAD:main` with the repository’s built-in automation token. No GitHub credential is stored in the website runtime.

After the push, the workflow reads the Vercel commit status for the exact published SHA. It succeeds only when the connected Vercel project reports a successful deployment for that commit; a Vercel failure, error, or ten-minute timeout fails the workflow visibly.

The publisher never invokes Agent 1, Agent 2, Agent 3, Agent 4, Search Console, IndexNow, or any indexing-submission endpoint. Agent 4 remains paused.
