# CasinooVerse Unified Automation Migration

**Migration date:** 12 September 2026 IST  
**Scheduled execution triggered during migration:** No

The former five-part recurring setup has been replaced by one isolated daily automation. The unified task performs each stage sequentially and stops at the first failure.

| Automation surface | Before | After |
| --- | ---: | ---: |
| Isolated Manus Agent schedules | 1 | 1 |
| Website Heartbeat jobs | 3 | 0 |
| Scheduled GitHub Actions publishers | 1 | 0 |
| Agent 4 or indexing jobs | 0 | 0 |
| **Total enabled recurring automations** | **5** | **1** |

## Active automation

| Field | Verified value |
| --- | --- |
| Name | `CasinooVerse unified daily publication` |
| Task UID | `2QvHU9jj3ngh2WzxrJ6NQ4` |
| Schedule | `0 1 0 * * *` in `Asia/Calcutta` |
| Human time | 12:01 AM IST daily |
| Execution | Full-auto, fresh isolated task, Max tier |
| Connector | GitHub connector `bbb0df76-66bd-4a24-ae4f-2aac4750d90b` |
| Agent 4 | Absent; no indexing action |

The active playbook matches `docs/casinooverse-unified-daily-automation-playbook.md`. Its ordered stages are verified research, one authenticated website callback that performs durable research persistence plus content analysis plus page creation, GitHub-first artifact publication, and exact-commit Vercel verification. No stage is allowed to run concurrently.

## Removed automation surfaces

The delivery-monitor, content-analysis, and page-creation heartbeat jobs were deleted from the platform. Their historical `publication_jobs` rows were retained non-destructively but changed to `paused` with no task UID. The standalone `.github/workflows/daily-content-publication.yml` schedule was deleted locally and from GitHub. The three obsolete callback routes are no longer mounted; Vercel returns HTTP 404 for them. The single callback remains protected and returns HTTP 403 without scheduled credentials.

## Validation

The unified callback enforces the immediately preceding IST digest date, published status, strict research → analysis → page-creation order, completed durable Site Find and URL manifest records, unique featured images, and an explicit `failedStage` response. The complete suite passed **150 tests across 27 files**, TypeScript validation, and the Vercel production build. GitHub commit `7fa3b0e6ea2cba3a351de191421adfae51267a63` deployed successfully to Vercel before the live schedules were migrated.

No manual automation run was started, so this migration does not claim a new research edition, Site Find report, URL manifest, GitHub artifact commit, or Vercel publication produced by the schedule itself. The next real run must provide that evidence.

## Final deployment verification

The completed migration and authentication-noise repair were saved as checkpoint and GitHub commit `011a8e05f00ece522930671dfb4b403956a000fe`. GitHub `main` matched that SHA before Vercel reported a successful deployment for the same commit.

The final production audit passed across **38 routes**, **49 assets**, and **44 publication images**, including dynamic database evidence and private-source boundaries. The unified callback returned HTTP 403 with `{"error":"cron-only"}` when probed without scheduled credentials. The obsolete monitor, content-analysis, and page-creation endpoints each returned HTTP 404. The fresh Vercel error-log query returned no entries, confirming that unauthenticated probes no longer initialize the OAuth SDK or emit missing-configuration errors.
