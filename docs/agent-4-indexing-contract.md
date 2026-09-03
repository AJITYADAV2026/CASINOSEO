# CasinoVerse Agent 4 — Search Console and Indexing Contract

## Role in the Agent Sequence

> **Current status — paused by user instruction on 3 September 2026.** Agents 1–3 continue at 12:01 AM, 2:00 AM, and 2:30 AM IST. Agent 4 must not perform URL indexing, Search Console operations, URL inspection, or sitemap submission until the user’s custom domain is live and the user explicitly authorizes Agent 4 to resume. The existing public sitemap endpoints may remain available as ordinary site infrastructure, but they are not to be submitted to Search Console during this hold.

When explicitly resumed, Agent 4 will run at **5:00 AM IST** after Agent 3’s 2:30 AM page-creation run. It will read the latest completed durable URL manifest, select newly published canonical pages, submit CasinoVerse’s XML sitemaps to the verified Google Search Console property, record per-URL discovery and inspection state, and write a dated indexing report.

Agent 4 does not research stories, analyze editorial content, create pages, rewrite article content, assign slugs, or change page publication status. Those responsibilities belong to Agents 1–3.

## Google-Compliant Submission Behavior

Google provides an authorised `sitemaps.submit` Search Console API operation for verified properties.[1] Agent 4 submits both:

| Sitemap | Purpose |
| --- | --- |
| `https://casinonews-flgw988r.manus.space/sitemap.xml` | Complete canonical site coverage |
| `https://casinonews-flgw988r.manus.space/news-sitemap.xml` | Recent completed publisher stories |

Google’s individual Indexing API is limited to `JobPosting` and `BroadcastEvent` pages and is not permitted for CasinoVerse’s ordinary news articles.[2] Agent 4 therefore never sends CasinoVerse article URLs to that API.

For each eligible new article URL, Agent 4 records `submitted-via-sitemap`. If authorised URL Inspection access is available, Agent 4 may inspect Google’s current indexed state after submission, but the URL Inspection API does not itself request indexing and reports only the version already known to Google.[3]

Manual **Request indexing** actions in the Search Console interface remain a user-authorised browser operation. They cannot be represented as an unattended public API call. Agent 4’s recurring automated path uses the compliant sitemap submission mechanism.

## Eligible URL Rules

Agent 4 reads the latest `url_manifests` artifact and accepts only HTTPS URLs under the configured CasinoVerse canonical origin. An article is eligible when its Agent 3 outcome is `created` or `updated`, its page status is `published`, its sitemap state is `Included`, and the live URL returns HTTP 200 without a `noindex` directive.

Developing, draft, archived, review-required, cross-origin, non-HTTPS, redirected, unavailable, or `noindex` URLs are skipped with an explicit reason. Agent 4 never invents URLs and never accepts a canonical origin from a callback payload.

## Duplicate Prevention

The system retains a durable URL submission ledger keyed by canonical URL. Each record stores the last Agent 3 manifest timestamp and the last known page modification timestamp. An unchanged URL already recorded as `submitted-via-sitemap` is skipped. A materially updated published page may be included again after its modification timestamp advances.

Sitemap submissions are idempotent and may be repeated after a new completed manifest. Agent 4 records the Search Console response independently for the general sitemap and news sitemap so partial failures are visible and retry-safe.

## Dated Indexing Report

Each run creates `indexing-YYYY-MM-DD.md` in durable report storage. The report contains the source manifest date, Search Console property, sitemap submission outcomes, URL eligibility counts, a per-URL status table, inspection findings when available, errors, and a policy note explaining why the restricted Indexing API was not used.

The report status is `completed` when both sitemaps are accepted and every eligible URL is recorded; `partial` when one sitemap or inspection step fails; `blocked` when credentials or verified-property access are missing; and `failed` only for unexpected internal errors.

## Credentials and Property Access

Recurring API submission requires a Google service-account credential with the Search Console API enabled and access to the verified CasinoVerse Search Console property. The JSON credential is stored only as a production secret. The expected property is the URL-prefix property `https://casinonews-flgw988r.manus.space/`, unless the user instead verifies and authorises the domain property `sc-domain:casinonews-flgw988r.manus.space`.

Authentication failures are never recorded as successful submissions. A missing credential produces a durable `blocked` report and a clear remediation message rather than a false indexing claim.

## Protected Callback and Schedule

The cron-only endpoint is `POST /api/scheduled/page-indexing`. It authenticates the platform heartbeat identity, looks up the `casinoverse-page-indexing` publication job by task UID, selects the latest completed URL manifest, performs duplicate-safe eligibility checks, submits the authorised sitemaps, persists the report and URL ledger transactionally, and returns the run status.

The permanent heartbeat uses UTC cron `0 30 23 * * *`, corresponding to **5:00 AM IST daily**.

## References

[1]: https://developers.google.com/webmaster-tools/v1/sitemaps/submit "Google Search Console API — Sitemaps: submit"
[2]: https://developers.google.com/search/apis/indexing-api/v3/quickstart "Google Search Central — Indexing API Quickstart"
[3]: https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect "Google Search Console API — URL Inspection: index.inspect"
