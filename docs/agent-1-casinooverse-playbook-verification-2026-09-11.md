# CasinooVerse Agent 1 Playbook Verification

**Verification date:** 11 September 2026  
**Manual Agent 1 execution:** Not triggered

The repeated user-supplied instruction was consolidated to the first, stricter block. The authoritative playbook now uses the public **CasinooVerse** brand while preserving every timing, research-window, source-verification, payload, failure, and reporting requirement.

| Contract | Verified state |
| --- | --- |
| Agent 1 title | `CasinooVerse daily research edition` |
| Daily trigger | `0 1 0 * * *` in `Asia/Calcutta`, represented by the platform as 60 seconds after midnight |
| Execution mode | Enabled, full-auto, isolated fresh task |
| Model tier | Max |
| Expected start | 12:01 AM IST |
| Delay reporting | Exact delay required when actual start is after 12:06 AM IST |
| Research window | Immediately preceding IST calendar day, 00:00–23:59 |
| Callback | `$SCHEDULED_TASK_ENDPOINT_BASE/api/scheduled/daily-digest` |
| Durable artifact | `$SCHEDULED_TASK_ENDPOINT_BASE/research/YYYY-MM-DD.md` |
| Agent 2 | Separate at 2:00 AM IST |
| Agent 3 | Separate at 2:30 AM IST |
| Delivery monitor | Separate at 12:15 AM IST |
| GitHub publisher | Separate at 2:35 AM IST, after completed artifacts |
| Agent 4 | Absent/paused; no indexing action |

The active schedule playbook matches `docs/agent-1-isolated-daily-research-playbook.md` byte for byte. Its detail and playbook contain no old public brand wording. Existing connectors were preserved because the update omitted connector changes.

The Vercel production durable Markdown route returned HTTP 200 with CasinooVerse content, and an unauthenticated callback request returned HTTP 403. No synthetic digest or agent run was created. The Manus rollback origin was unavailable during this check, so the verification relied on the GitHub-backed Vercel production contract rather than claiming the unavailable host was healthy.
