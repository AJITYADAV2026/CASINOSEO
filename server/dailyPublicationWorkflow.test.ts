import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");

describe("daily GitHub-first publication workflow", () => {
  const workflow = read(".github/workflows/daily-content-publication.yml");

  it("runs after Agent 3 and has repository write permission without embedded credentials", () => {
    expect(workflow).toContain('cron: "5 21 * * *"');
    expect(workflow).toContain("contents: write");
    expect(workflow).toContain("actions/checkout@v4");
    expect(workflow).not.toMatch(/github_pat_|ghp_|GITHUB_TOKEN\s*:/);
  });

  it("waits for all three durable Markdown artifacts and fails closed on a partial chain", () => {
    expect(workflow).toContain("/research/$digest_date.md");
    expect(workflow).toContain("/site-find/$today.md");
    expect(workflow).toContain("/url-manifests/$today.md");
    expect(workflow).toContain("SITE FIND $today.md");
    expect(workflow).toContain("URL+$today.md");
    expect(workflow).toContain('if [[ "$ready" != "true" ]]');
    expect(workflow).toContain("refusing to commit stale or partial output");
    expect(workflow).toContain('grep -Fqx \'status: "published"\'');
    expect(workflow.match(/grep -Fqx 'status: "completed"'/g)).toHaveLength(2);
    expect(workflow).toContain('sourceDigestDate: \\"$digest_date\\"');
    expect(workflow).toContain('sourceSiteFindDate: \\"$today\\"');
  });

  it("commits the sitemap snapshot and pushes main only after complete artifacts exist", () => {
    expect(workflow).toContain("publication-artifacts/sitemap.xml");
    expect(workflow).toContain("git add publication-artifacts");
    expect(workflow).toContain('git commit -m "Automated daily content update: $today"');
    expect(workflow).toContain("git push origin HEAD:main");
    expect(workflow).toContain('published_sha=$(git rev-parse HEAD)');
  });

  it("waits for Vercel to deploy the exact GitHub commit and fails if deployment does not succeed", () => {
    expect(workflow).toContain("Verify Vercel deployed the exact GitHub commit");
    expect(workflow).toContain('PUBLISHED_SHA: ${{ steps.publish.outputs.published_sha }}');
    expect(workflow).toContain('commits/$PUBLISHED_SHA/status');
    expect(workflow).toContain('select(.context == "Vercel")');
    expect(workflow).toContain('vercel_state" == "success"');
    expect(workflow).toContain("Vercel did not confirm deployment");
  });

  it("does not trigger any agent, callback, Search Console action, or indexing step", () => {
    expect(workflow).not.toContain("/api/scheduled/");
    expect(workflow).not.toMatch(/search console|indexing|sitemap submission/i);
  });
});

describe("exported 7 September pipeline evidence", () => {
  it("contains the complete dated Agent 1, Agent 2, Agent 3, and sitemap artifacts", () => {
    expect(read("publication-artifacts/research/2026-09-06.md")).toContain("Status:** Published recovery edition");
    expect(read("publication-artifacts/site-find/SITE FIND 2026-09-07.md")).toContain("CasinoVerse Site Find");
    expect(read("publication-artifacts/url-manifests/URL+2026-09-07.md")).toContain("CasinoVerse URL Manifest");
    expect(read("publication-artifacts/sitemap.xml")).toContain("<urlset");
  });
});
