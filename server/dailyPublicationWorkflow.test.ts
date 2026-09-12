import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");

describe("unified GitHub-first publication stage", () => {
  const playbook = read("docs/casinooverse-unified-daily-automation-playbook.md");

  it("exports only completed same-day durable artifacts", () => {
    expect(playbook).toContain("/research/YYYY-MM-DD.md");
    expect(playbook).toContain("/site-find/YYYY-MM-DD.md");
    expect(playbook).toContain("/url-manifests/YYYY-MM-DD.md");
    expect(playbook).toContain("research status is `published`");
    expect(playbook).toContain("Site Find status is `completed`");
    expect(playbook).toContain("URL manifest status is `completed`");
  });

  it("commits only real artifact changes and verifies the exact Vercel SHA", () => {
    expect(playbook).toContain("git add publication-artifacts");
    expect(playbook).toContain("do not create an empty commit");
    expect(playbook).toContain("push `main`");
    expect(playbook).toContain("that exact SHA reports `success`");
    expect(playbook).toContain("up to ten minutes");
  });

  it("contains no standalone schedule, second agent trigger, or indexing action", () => {
    expect(fs.existsSync(path.join(root, ".github/workflows/daily-content-publication.yml"))).toBe(false);
    expect(playbook).toContain("only CasinooVerse recurring automation");
    expect(playbook).toContain("Do not perform indexing submission");
  });
});
