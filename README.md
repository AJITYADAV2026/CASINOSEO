# CasinoVerse

CasinoVerse is a premium, dark, article-first casino-industry publication. It combines server-rendered React pages, a project-owned editorial database, internal source records, responsible-entertainment safeguards, and separate daily research, analysis, and page-creation agents.

## Application Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Tailwind CSS 4, Wouter |
| Server | Express 4, tRPC 11, server-side rendering |
| Data | Drizzle ORM with MySQL-compatible storage |
| Validation | Vitest, TypeScript, SSR response tests |
| Package manager | pnpm |

## Local Setup

Install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Before running database-backed or authenticated features, configure the required environment variables through a secure deployment secret manager. **Never commit secret values to GitHub.**

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL-compatible database connection |
| `JWT_SECRET` | Session-cookie signing secret |
| `VITE_APP_ID` | OAuth application identifier |
| `OAUTH_SERVER_URL` | OAuth service base URL |
| `VITE_OAUTH_PORTAL_URL` | Client OAuth portal URL |
| `OWNER_OPEN_ID` | Project owner identity |
| `OWNER_NAME` | Project owner display name |
| `BUILT_IN_FORGE_API_URL` | Server integration gateway |
| `BUILT_IN_FORGE_API_KEY` | Server integration authorization |
| `VITE_FRONTEND_FORGE_API_URL` | Browser integration gateway |
| `VITE_FRONTEND_FORGE_API_KEY` | Browser integration authorization |
| `CANONICAL_ORIGIN` | Public canonical website origin |
| `SITE_NAME` | Publication name |
| `MANUS_ASSET_ORIGIN` | Optional non-secret fallback origin for proxying existing `/manus-storage/*` publication images on external hosts without exporting Manus storage credentials |

## Quality Checks

```bash
pnpm test
pnpm check
pnpm build
```

The production build creates the browser bundle, SSR bundle, and Express server bundle. Start it with:

```bash
pnpm start
```

## Editorial Automation

The production workflow runs separately and sequentially in India Standard Time:

| Agent | Responsibility | Time |
| --- | --- | ---: |
| Agent 1 | Research the immediately preceding IST day | 12:01 AM IST |
| Agent 1 monitor | Detect a missing daily digest; never triggers downstream agents | 12:15 AM IST |
| Agent 2 | Analyze the completed same-day Agent 1 digest | 2:00 AM IST |
| Agent 3 | Create or update pages from the completed Agent 2 report | 2:30 AM IST |

Agents 2 and 3 fail closed when their required upstream artifact is missing or stale. Agent 4 indexing and sitemap submission remain paused until explicitly authorized.

## Hosting Note

The working production deployment uses Manus hosting, managed secrets, database connectivity, storage proxying, and platform schedules. An external host such as Vercel requires its own secrets, database access, storage compatibility, serverless entry configuration, and independent scheduling decisions. Keep the Manus deployment available as the rollback path until the external deployment passes full SSR and route validation.

## Security

This repository must not contain passwords, personal access tokens, session cookies, database credentials, private keys, service-account files, or production secret values. If a credential is ever pasted into chat or committed to version control, revoke and replace it immediately.
