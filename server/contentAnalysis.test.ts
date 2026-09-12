import express from "express";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { siteFindReports } from "../drizzle/schema";
import { getDb, getDigestByDate, getLatestDigestForAnalysis, selectLatestAnalyzableDigest } from "./db";
import { buildDeterministicAnalysis, contentAnalysisSchema, previousIsoCalendarDate, renderSiteFindMarkdown, runContentAnalysis } from "./contentAnalysis";
import { registerPublicationRoutes } from "./publicationRoutes";

const analysisFixture = {
  executiveSummary: "Agent 2 identified one material content update while preserving the publication boundary and retaining source uncertainty.",
  sourceAssessment: "The recommendation relies only on the source-attributed Agent 1 digest and keeps forecasts distinct from realised outcomes.",
  decisions: [{
    action: "update" as const,
    proposedTitle: "Verified market development receives a contextual update",
    existingSlug: "verified-market-development",
    categorySlug: "market-intelligence" as const,
    contentType: "analysis" as const,
    priority: "high" as const,
    rationale: "The current article should incorporate the newly reported figures while retaining explicit forecast and sourcing labels.",
    evidence: ["Agent 1 digest section and its original source reference."],
    confidence: 0.91,
    requiresHumanReview: true,
  }],
  warnings: ["Agent 3 must review the recommendation before page-level changes."],
};

describe("Agent 2 content analysis", () => {
  it("selects the newest eligible durable digest and respects published-only mode", () => {
    const rows = [
      { digestDate: "2026-09-04", status: "published", markdownArtifact: null, updatedAt: new Date("2026-09-04T02:00:00Z") },
      { digestDate: "2026-09-03", status: "developing", markdownArtifact: "# Developing research", updatedAt: new Date("2026-09-03T18:00:00Z") },
      { digestDate: "2026-09-02", status: "published", markdownArtifact: "# Published research", updatedAt: new Date("2026-09-03T00:00:00Z") },
    ];
    expect(selectLatestAnalyzableDigest(rows, true)?.digestDate).toBe("2026-09-03");
    expect(selectLatestAnalyzableDigest(rows, false)?.digestDate).toBe("2026-09-02");
    expect(selectLatestAnalyzableDigest(rows.slice(0, 1), true)).toBeUndefined();
    expect(previousIsoCalendarDate("2026-01-01")).toBe("2025-12-31");
  });

  it("stops instead of analyzing stale Agent 1 output", async () => {
    const db = await getDb();
    const digest = await getLatestDigestForAnalysis(true);
    expect(db).toBeTruthy();
    expect(digest).toBeTruthy();
    if (!db || !digest) return;
    const result = await runContentAnalysis({
      db,
      digest,
      reportDate: "2099-12-31",
      enforceSequence: true,
    });
    expect(result.skipped).toBe("required-agent-1-digest-missing");
    expect("expectedDigestDate" in result && result.expectedDigestDate).toBe("2099-12-30");
  });

  it("requires human review for every removal recommendation", () => {
    const unsafe = {
      ...analysisFixture,
      decisions: [{ ...analysisFixture.decisions[0], action: "remove" as const, requiresHumanReview: false }],
    };
    expect(() => contentAnalysisSchema.parse(unsafe)).toThrow("Removal recommendations always require human review");
  });

  it("builds a source-linked fallback when structured model output is unavailable", async () => {
    const digest = await getLatestDigestForAnalysis(true);
    expect(digest).toBeTruthy();
    if (!digest) return;
    const data = await getDigestByDate(digest.digestDate);
    expect(data?.stories.length).toBeGreaterThan(0);
    const fallback = buildDeterministicAnalysis(digest.digestDate, digest.status, data?.stories ?? []);
    expect(fallback.decisions.length).toBe(data?.stories.length);
    expect(fallback.decisions.every(decision => decision.existingSlug && decision.evidence.length === 1)).toBe(true);
    expect(fallback.warnings.join(" ")).toContain("deterministic");
  });

  it("renders a dated Site Find artifact with Agent 3 and Agent 4 boundaries", () => {
    const markdown = renderSiteFindMarkdown({
      reportDate: "2026-09-03",
      sourceDigestDate: "2026-09-03",
      sourceDigestStatus: "developing",
      modelId: "gpt-5-mini",
      analysis: contentAnalysisSchema.parse(analysisFixture),
      sourceMarkdown: "# Research\n\n## References\n\n[1]: https://example.com/source",
    });
    expect(markdown).toContain('title: "CasinooVerse Site Find — 2026-09-03"');
    expect(markdown).toContain('status: "draft"');
    expect(markdown).toContain("Content analysis only");
    expect(markdown).toContain("does not create pages or URLs");
    expect(markdown).toContain("## References");
  });

  it("persists the Site Find artifact atomically without leaving test data", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;
    const digest = await getLatestDigestForAnalysis(true);
    expect(digest?.markdownArtifact).toBeTruthy();
    if (!digest?.markdownArtifact) return;
    const reportDate = "2099-12-30";
    const rollback = new Error("ROLLBACK_AGENT_2_TEST");

    await expect(db.transaction(async tx => {
      const result = await runContentAnalysis({
        db: tx as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>,
        digest,
        storyCatalog: [],
        analyzer: async () => contentAnalysisSchema.parse(analysisFixture),
        reportDate,
        taskUid: "agent-2-test-task",
        force: true,
      });
      expect("report" in result && result.report?.markdownArtifact).toContain("CasinooVerse Site Find");
      const [stored] = await tx.select().from(siteFindReports).where(eq(siteFindReports.reportDate, reportDate)).limit(1);
      expect(stored?.updateCount).toBe(1);
      expect(stored?.sourceDigestId).toBe(digest.id);
      throw rollback;
    })).rejects.toBe(rollback);

    const [rolledBack] = await db.select().from(siteFindReports).where(eq(siteFindReports.reportDate, reportDate)).limit(1);
    expect(rolledBack).toBeUndefined();
  }, 20_000);

  it("registers the dated Site Find export route without creating a navigable HTML page", () => {
    const app = express();
    registerPublicationRoutes(app);
    const paths = (app as unknown as { _router?: { stack?: Array<{ route?: { path?: string } }> } })._router?.stack?.map(layer => layer.route?.path).filter(Boolean) ?? [];
    expect(paths).toContain("/site-find/:date.md");
    expect(paths).not.toContain("/site-find/:date");
    expect(paths).toContain("/api/scheduled/daily-digest");
    expect(paths).not.toContain("/api/scheduled/content-analysis");
  });

  it("keeps Site Find artifacts out of robots and both sitemap feeds", async () => {
    const app = express();
    registerPublicationRoutes(app);
    const server = app.listen(0);
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Test server did not expose a numeric port");
      const base = `http://127.0.0.1:${address.port}`;
      const [robots, sitemap, newsSitemap, siteFind] = await Promise.all([
        fetch(`${base}/robots.txt`),
        fetch(`${base}/sitemap.xml`),
        fetch(`${base}/news-sitemap.xml`),
        fetch(`${base}/site-find/2026-09-03.md`),
      ]);
      expect(robots.status).toBe(200);
      expect(sitemap.status).toBe(200);
      expect(newsSitemap.status).toBe(200);
      expect(siteFind.status).toBe(200);
      expect(siteFind.headers.get("content-type")).toContain("text/markdown");
      expect(await robots.text()).not.toContain("site-find");
      expect(await sitemap.text()).not.toContain("site-find");
      expect(await newsSitemap.text()).not.toContain("site-find");
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  }, 20_000);
});
