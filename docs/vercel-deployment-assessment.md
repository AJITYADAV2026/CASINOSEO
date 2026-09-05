# CasinoVerse Vercel Parity and Dynamic-Site Audit

**Completed:** 5 September 2026  
**GitHub repository:** [AJITYADAV2026/CASINOSEO](https://github.com/AJITYADAV2026/CASINOSEO)  
**Vercel production site:** [casinoseo.vercel.app](https://casinoseo.vercel.app)  
**Manus rollback site:** [casinonews-flgw988r.manus.space](https://casinonews-flgw988r.manus.space)  
**Verified runtime source commit:** `d628f557d0b1410c936e5db83948a06f68f74a6d`  
**Steady-state verification deployment:** `dpl_HaP1qZXzSfWJFPTAgKPTCe9kMkic`

The final audit found that the Vercel production alias serves the same complete CasinoVerse publication as Manus across the full public sitemap. All **55 sitemap routes** matched on HTTP status, page title, primary heading, meaningful server-rendered content, and same-domain navigation. The crawler discovered and validated **47 referenced resources**, including all **42 publication images**, the production CSS and JavaScript bundles, `robots.txt`, `news-sitemap.xml`, and `rss.xml`. No broken page, image, script, stylesheet, or publication endpoint remained.

## Production Architecture

| Concern | Verified implementation |
| --- | --- |
| Express, tRPC, and SSR | A bundled ESM serverless function is generated at `api/index.mjs` from `vercel/entry.ts` and the shared CasinoVerse application. |
| Public routing | Vercel rewrites non-static requests to the Express function; public pages return complete route-specific SSR HTML. |
| Browser assets | Hashed CSS and JavaScript are emitted to `vercel-public` and served with their correct content types. |
| Private SSR files | The HTML template and server-render bundle remain inside the function package; private paths return genuine CasinoVerse 404 HTML. |
| Database | The existing MySQL-compatible database remains the live source for stories, historical records, sources, support resources, search, and sitemap entries. |
| Publication images | `/manus-storage/*` securely proxies public CasinoVerse media from the Manus origin without exporting privileged Forge credentials. |
| Public authentication path | Ordinary public requests do not initialize the Manus OAuth SDK. Session-cookie and Bearer-token requests retain the protected dynamic import path. |
| OAuth transport | Protected OAuth calls use native `fetch`; Axios and `follow-redirects` are absent from the Vercel bundle. |
| Vercel request normalization | `vercel/query.ts` parses the request URL with the WHATWG `URL` API and installs `req.query` before Express middleware accesses Vercel’s legacy getter. |
| Scheduled agents | Agents 1–3 and the Agent 1 delivery monitor remain on Manus and were not duplicated on Vercel. |
| Indexing | Agent 4 remains paused; no Search Console action, URL indexing, or sitemap submission occurred. |

## Defects Found and Repaired

| Verified defect | Repair and proof |
| --- | --- |
| Vercel initially served a compiled server artifact instead of executing the site. | The deployment now uses a generated Express serverless function and a catch-all rewrite. Root serves CasinoVerse SSR HTML, while server-source paths return 404. |
| Extensionless local ESM imports failed in the serverless function. | Local server modules are bundled into `api/index.mjs`; production starts without unresolved imports. |
| Database-backed pages and publication images lacked external-host settings. | The required database, canonical-origin, site-name, and public Manus asset-origin settings are present in Vercel; all database pages and images return successfully. |
| Public requests emitted a missing-`OAUTH_SERVER_URL` error because the SDK initialized eagerly. | Request context, OAuth callback handling, and all four protected scheduled callbacks now load the SDK only when authentication is actually required. No Manus OAuth credential was copied to Vercel. |
| Public requests emitted Node `[DEP0169]` `url.parse()` warnings. | Trace diagnostics located the call in Vercel’s `/opt/rust/nodejs.js` `IncomingMessage` query getter, reached by Express query middleware. The serverless entry now installs a WHATWG-URL-parsed own `req.query` property first. A full trace-enabled crawl then produced zero runtime errors. |

> The final steady-state deployment was rebuilt after the temporary trace setting was removed. Its production error log remained empty after a new full-site crawl.

## Final Verification Matrix

| Check | Final result |
| --- | --- |
| Deployment | `dpl_HaP1qZXzSfWJFPTAgKPTCe9kMkic`, Production, Ready |
| Stable aliases | `casinoseo.vercel.app`, project alias, and Git branch alias assigned |
| GitHub-first source | Runtime repair commit `d628f557d0b1410c936e5db83948a06f68f74a6d` was pushed to `AJITYADAV2026/CASINOSEO` before the verified Vercel build |
| Sitemap parity | 55 Vercel routes and 55 Manus routes; no missing or extra paths |
| Route parity | 55/55 matched on status, title, primary heading, meaningful content, and internal navigation |
| Server-rendered HTML | Homepage, Blog and detail pages, daily and historical archives, sources, support, search, legal pages, and 404 responses contain complete initial HTML |
| Static resources | Production CSS and JavaScript returned HTTP 200 with correct content types |
| Publication media | 42/42 unique `/manus-storage/*` images returned HTTP 200 with image content types |
| Dynamic Blog | Homepage exposed nine current internal article links; representative database story detail returned HTTP 200 |
| Historical database | `/history/archive` rendered 17 of 17 records; selecting 2020 hydrated to 1 of 17 and opened its internal detail page |
| Source database | `/sources` rendered 35 active internal source records |
| Support database | `/support` rendered five stored support resources |
| Dynamic search | `/search?q=Macau` rendered three current story results in SSR HTML and the hydrated browser |
| Dynamic sitemap | `/sitemap.xml` returned the current 55 database and static routes as XML |
| Genuine missing route | Nonexistent paths returned HTTP 404 with CasinoVerse not-found HTML |
| Source-code isolation | `/api/index.mjs`, `/dist/index.js`, `/vercel-ssr/index.html`, `/vercel-public/index.html`, and `/server/_core/index.ts` all returned 404 without source markers |
| Browser hydration | Search, the 2020 archive filter, and internal detail navigation worked with no console output or hydration error |
| Consent | Essential-only remained persisted under `casinoverse_cookie_consent_v1`; optional analytics script count remained zero |
| Responsive review | Homepage, historical archive, and Macau search retained their established desktop and mobile layouts after server-only repairs |
| Runtime logs | Zero error entries for the final deployment after the complete route-and-asset crawl; no OAuth, `url.parse`, SSR, or storage-proxy error remained |
| Automated validation | 22 test files and 103 tests passed; TypeScript and the Vercel production build passed |
| Manus rollback | Manus production remained HTTP 200 and available at its existing domain |

## Final Vercel Environment Boundary

The steady-state Vercel production environment contains `DATABASE_URL`, `CANONICAL_ORIGIN`, `SITE_NAME`, and `MANUS_ASSET_ORIGIN`. The temporary `NODE_OPTIONS=--trace-deprecation` diagnostic was removed before the final deployment. No `OAUTH_SERVER_URL`, Forge key, Search Console credential, or previously exposed chat credential was added or committed.

## Automation Safeguards

| Workflow | Current schedule | State | Boundary |
| --- | --- | --- | --- |
| Agent 1 research | 12:01 AM IST (`0 31 18 * * *` UTC) | Active, isolated new-task execution | Produces prior-IST-day source-verified Markdown; does not run Agents 2 or 3 |
| Agent 1 delivery monitor | 12:15 AM IST (`0 45 18 * * *` UTC) | Active | Alerts on missing prior-day durable output; never invokes downstream agents |
| Agent 2 content analysis | 2:00 AM IST (`0 30 20 * * *` UTC) | Active | Reads only completed same-day Agent 1 output and stores Site Find analysis |
| Agent 3 page creation | 2:30 AM IST (`0 0 21 * * *` UTC) | Active | Reads only completed same-day Agent 2 output, updates pages, and stores URL manifest |
| Agent 4 indexing | Not scheduled | Paused | No indexing or sitemap submission until the user explicitly resumes it |

The schedule inspection reported one active isolated Agent task and three active Heartbeat jobs: the Agent 1 delivery monitor, Agent 2, and Agent 3. No Agent 4 job was present. No schedule was triggered, edited, paused, or duplicated during the Vercel audit.

## Reproducibility

`node scripts/audit-vercel-parity.mjs` performs the sitemap comparison, full-route SSR checks, internal-link audit, asset discovery, publication-image validation, dynamic record-count checks, search verification, and private-source exposure probes. It writes a machine-readable summary to `/tmp/casinoverse-vercel-parity.json` by default and exits nonzero on a verified discrepancy.

## References

[1]: https://vercel.com/docs/frameworks/backend/express "Express on Vercel"
[2]: https://vercel.com/docs/project-configuration/vercel-json "Vercel project configuration"
[3]: https://nodejs.org/api/url.html#the-whatwg-url-api "Node.js WHATWG URL API"
