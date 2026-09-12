import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");

describe("single CasinooVerse automation contract", () => {
  const playbook = read("docs/casinooverse-unified-daily-automation-playbook.md");
  const routes = read("server/publicationRoutes.ts");
  const exporter = read("scripts/export-current-publication-artifacts.mjs");

  it("defines one ordered fail-closed research-to-Vercel workflow", () => {
    const research = playbook.indexOf("## Stage 1 — Verified research");
    const github = playbook.indexOf("## Stage 2 — GitHub-first publication");
    const vercel = playbook.indexOf("## Stage 3 — Exact-commit Vercel verification");
    expect(research).toBeGreaterThan(-1);
    expect(github).toBeGreaterThan(research);
    expect(vercel).toBeGreaterThan(github);
    expect(playbook).toContain("Never run stages concurrently");
    expect(playbook).toContain("stop immediately");
    expect(playbook).toContain("pipelineStatus");
  });

  it("preserves durable artifacts, unique images, GitHub-first publication, and exact-SHA Vercel verification", () => {
    expect(playbook).toContain("unique `featuredImageUrl`");
    expect(playbook).toContain("wait exactly 58 seconds");
    expect(playbook).toContain("Record the wait completion");
    expect(playbook).toContain("exact rolling 24 hours");
    expect(playbook).toContain("valid `Article` or `NewsArticle` JSON-LD");
    expect(playbook).toContain("SITE FIND YYYY-MM-DD.md");
    expect(playbook).toContain("URL+YYYY-MM-DD.md");
    expect(playbook).toContain("INDEXING-URLS-YYYY-MM-DD.md");
    expect(playbook).toContain("Prepared for manual indexing; not submitted by automation");
    expect(playbook).toContain("every created or updated canonical URL appears in the dynamic sitemap");
    expect(playbook).toContain("git add publication-artifacts");
    expect(playbook).toContain("Automated daily content update: YYYY-MM-DD");
    expect(playbook).toContain("that exact SHA reports `success`");
    expect(playbook).toContain("do not attempt SSH deployment");
  });

  it("exposes only one scheduled callback route and performs no indexing", () => {
    const mountedScheduledRoutes = [...routes.matchAll(/app\.post\("(\/api\/scheduled\/[^"]+)"/g)].map(match => match[1]);
    expect(mountedScheduledRoutes).toEqual(["/api/scheduled/daily-digest"]);
    expect(playbook).toContain("Do not trigger any other agent, heartbeat job, repository workflow, Agent 4, Search Console action, IndexNow request, or sitemap submission");
    expect(playbook).toContain("Do not perform indexing submission");
  });

  it("removes the standalone repository workflow from the source tree", () => {
    expect(fs.existsSync(path.join(root, ".github/workflows/daily-content-publication.yml"))).toBe(false);
  });

  it("exports only completed durable artifacts and records sitemap plus manual-indexing metadata", () => {
    expect(exporter).toContain("Research artifact is not published");
    expect(exporter).toContain("Site Find artifact is not completed");
    expect(exporter).toContain("URL manifest is not completed");
    expect(exporter).toContain('fetchRequired("/sitemap.xml")');
    expect(exporter).toContain("INDEXING-URLS-${publicationDateIst}.md");
    expect(exporter).toContain('"latest-run.json"');
  });
});
