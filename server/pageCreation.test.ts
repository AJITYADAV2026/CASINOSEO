import express from "express";
import { eq, ne } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { siteFindReports, stories, urlManifests } from "../drizzle/schema";
import { contentAnalysisSchema } from "./contentAnalysis";
import { getDb, getDigestByDate, selectLatestSiteFindForPublishing } from "./db";
import { renderUrlManifest, runPageCreation } from "./pageCreation";
import { buildSitemapDocument, registerPublicationRoutes } from "./publicationRoutes";

describe("Agent 3 page creation", () => {
  it("selects only the latest completed Site Find during normal scheduled runs", () => {
    const rows = [
      { reportDate: "2026-09-04", status: "draft", markdownArtifact: "# Draft", updatedAt: new Date("2026-09-04T02:00:00Z") },
      { reportDate: "2026-09-03", status: "completed", markdownArtifact: "# Complete", updatedAt: new Date("2026-09-03T02:00:00Z") },
      { reportDate: "2026-09-02", status: "completed", markdownArtifact: "", updatedAt: new Date("2026-09-02T02:00:00Z") },
    ];
    expect(selectLatestSiteFindForPublishing(rows, false)?.reportDate).toBe("2026-09-03");
    expect(selectLatestSiteFindForPublishing(rows, true)?.reportDate).toBe("2026-09-04");
    expect(selectLatestSiteFindForPublishing(rows.slice(2), true)).toBeUndefined();
  });

  it("stops instead of processing stale Agent 2 output", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;
    const [siteFind] = await db.select().from(siteFindReports).orderBy(siteFindReports.reportDate).limit(1);
    expect(siteFind).toBeTruthy();
    if (!siteFind) return;
    const result = await runPageCreation({
      db,
      siteFind,
      manifestDate: "2099-12-31",
      enforceSequence: true,
    });
    expect(result.skipped).toBe("required-agent-2-report-missing");
    expect("expectedDigestDate" in result && result.expectedDigestDate).toBe("2099-12-30");
  });

  it("renders permanent URLs, sitemap state, and an explicit no-indexing boundary", () => {
    const markdown = renderUrlManifest({
      manifestDate: "2026-09-03",
      sourceReportDate: "2026-09-03",
      sourceReportStatus: "completed",
      actions: [{
        decision: "update",
        outcome: "updated",
        title: "Verified market development",
        storySlug: "verified-market-development",
        canonicalUrl: "https://casinonews-flgw988r.manus.space/articles/verified-market-development",
        pageStatus: "published",
        sitemapIncluded: true,
        note: "Permanent page updated from sourced Agent 1 content.",
      }],
    });
    expect(markdown).toContain('title: "CasinooVerse URL Manifest — 2026-09-03"');
    expect(markdown).toContain("[Open page](https://casinonews-flgw988r.manus.space/articles/verified-market-development)");
    expect(markdown).toContain("Included");
    expect(markdown).toContain("No search-engine indexing submission was performed");
  });

  it("publishes a matched add decision once and includes its canonical URL and lastmod in sitemap output", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;
    const [siteFind] = await db.select().from(siteFindReports).orderBy(siteFindReports.reportDate).limit(1);
    if (!siteFind) return;
    const digest = await getDigestByDate(siteFind.sourceDigestDate);
    expect(digest?.stories.length).toBeGreaterThan(0);
    if (!digest?.stories[0]) return;
    const sourceItem = digest.stories[0];
    const analysis = contentAnalysisSchema.parse({
      executiveSummary: "Agent 3 test verifies a matched add decision publishes an existing full Agent 1 story exactly once.",
      sourceAssessment: "The page uses the durable digest story and its existing source relationships.",
      decisions: [{
        action: "add",
        proposedTitle: sourceItem.story.title,
        existingSlug: null,
        categorySlug: sourceItem.category.slug,
        contentType: sourceItem.story.contentType,
        priority: "high",
        rationale: "Publish the complete source-attributed Agent 1 story without creating another record or changing its permanent slug.",
        evidence: ["Exact source digest title match."],
        confidence: 0.95,
        requiresHumanReview: false,
      }],
      warnings: [],
    });
    const syntheticSiteFind = {
      ...siteFind,
      reportDate: "2037-12-29",
      status: "completed" as const,
      decisionsJson: JSON.stringify(analysis),
      updatedAt: new Date("2037-12-29T02:00:00Z"),
    };
    const rollback = new Error("ROLLBACK_AGENT_3_ADD_TEST");

    await expect(db.transaction(async tx => {
      await tx.update(stories).set({ status: "draft", publishedAt: null, modifiedAt: null }).where(eq(stories.id, sourceItem.story.id));
      const result = await runPageCreation({
        db: tx as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>,
        siteFind: syntheticSiteFind,
        manifestDate: "2037-12-29",
        taskUid: "agent-3-add-test",
        force: true,
      });
      expect("manifest" in result && result.manifest?.createdCount).toBe(1);
      expect("actions" in result && result.actions?.[0]?.outcome).toBe("created");
      const matching = await tx.select().from(stories).where(eq(stories.slug, sourceItem.story.slug));
      expect(matching).toHaveLength(1);
      expect(matching[0]?.status).toBe("published");
      expect(matching[0]?.modifiedAt).toBeInstanceOf(Date);
      const sitemap = buildSitemapDocument("https://casinonews-flgw988r.manus.space", {
        categories: [],
        stories: [{ story: matching[0]! }],
        digests: [],
      });
      expect(sitemap).toContain(`https://casinonews-flgw988r.manus.space/articles/${sourceItem.story.slug}`);
      expect(sitemap).toContain(`<lastmod>${matching[0]!.modifiedAt!.toISOString()}</lastmod>`);
      throw rollback;
    })).rejects.toBe(rollback);

    const [rolledBack] = await db.select().from(urlManifests).where(eq(urlManifests.manifestDate, "2037-12-29")).limit(1);
    expect(rolledBack).toBeUndefined();
  }, 30_000);

  it("applies updates and archives safely, never hard-deletes, and rolls back test data", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;
    const [siteFind] = await db.select().from(siteFindReports).orderBy(siteFindReports.reportDate).limit(1);
    expect(siteFind).toBeTruthy();
    if (!siteFind) return;
    const digest = await getDigestByDate(siteFind.sourceDigestDate);
    expect(digest?.stories.length).toBeGreaterThanOrEqual(4);
    if (!digest || digest.stories.length < 4) return;
    const [updateStory, retainStory, archiveStory, removeStory] = digest.stories;
    const analysis = contentAnalysisSchema.parse({
      executiveSummary: "Agent 3 test decisions cover safe publishing, retaining, archiving, and non-destructive removal review.",
      sourceAssessment: "Every resolved action points to an existing source-linked Agent 1 story.",
      decisions: [
        { action: "update", proposedTitle: updateStory.story.title, existingSlug: updateStory.story.slug, categorySlug: updateStory.category.slug, contentType: updateStory.story.contentType, priority: "high", rationale: "Publish the sourced update while retaining the permanent story slug and source relationships.", evidence: ["Existing Agent 1 digest relationship."], confidence: 0.95, requiresHumanReview: false },
        { action: "retain", proposedTitle: retainStory.story.title, existingSlug: retainStory.story.slug, categorySlug: retainStory.category.slug, contentType: retainStory.story.contentType, priority: "low", rationale: "Retain the current sourced story because no page-level mutation is required for this decision.", evidence: [], confidence: 0.9, requiresHumanReview: false },
        { action: "archive", proposedTitle: archiveStory.story.title, existingSlug: archiveStory.story.slug, categorySlug: archiveStory.category.slug, contentType: archiveStory.story.contentType, priority: "medium", rationale: "Archive the durable page without deleting its story record, slug, body, or source relationships.", evidence: ["Existing Agent 1 digest relationship."], confidence: 0.9, requiresHumanReview: false },
        { action: "remove", proposedTitle: removeStory.story.title, existingSlug: removeStory.story.slug, categorySlug: removeStory.category.slug, contentType: removeStory.story.contentType, priority: "critical", rationale: "Flag this URL for downstream review without deleting or mutating the durable story record.", evidence: ["Existing Agent 1 digest relationship."], confidence: 0.9, requiresHumanReview: true },
        { action: "add", proposedTitle: "Unmatched proposed story", existingSlug: null, categorySlug: "market-intelligence", contentType: "news", priority: "medium", rationale: "Do not create content because no full source-attributed Agent 1 story matches this proposal.", evidence: ["No matching Agent 1 story record."], confidence: 0.7, requiresHumanReview: true },
      ],
      warnings: [],
    });
    const syntheticSiteFind = {
      ...siteFind,
      reportDate: "2037-12-30",
      status: "completed" as const,
      decisionsJson: JSON.stringify(analysis),
      updatedAt: new Date("2037-12-30T02:00:00Z"),
    };
    const rollback = new Error("ROLLBACK_AGENT_3_TEST");

    await expect(db.transaction(async tx => {
      const result = await runPageCreation({
        db: tx as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>,
        siteFind: syntheticSiteFind,
        manifestDate: "2037-12-30",
        taskUid: "agent-3-test-task",
        force: true,
      });
      expect("manifest" in result && result.manifest?.updatedCount).toBe(1);
      expect("manifest" in result && result.manifest?.archivedCount).toBe(1);
      expect("manifest" in result && result.manifest?.reviewCount).toBe(2);
      const [published] = await tx.select().from(stories).where(eq(stories.id, updateStory.story.id)).limit(1);
      const [archived] = await tx.select().from(stories).where(eq(stories.id, archiveStory.story.id)).limit(1);
      const [notDeleted] = await tx.select().from(stories).where(eq(stories.id, removeStory.story.id)).limit(1);
      expect(published?.status).toBe("published");
      expect(archived?.status).toBe("archived");
      expect(notDeleted?.id).toBe(removeStory.story.id);

      const second = await runPageCreation({
        db: tx as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>,
        siteFind: syntheticSiteFind,
        manifestDate: "2037-12-30",
      });
      expect(second.skipped).toBe("already-current");
      throw rollback;
    })).rejects.toBe(rollback);

    const [rolledBack] = await db.select().from(urlManifests).where(eq(urlManifests.manifestDate, "2037-12-30")).limit(1);
    expect(rolledBack).toBeUndefined();
  }, 30_000);

  it("fails closed when Agent 3 would publish a featured image already used by another public story", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;
    const [siteFind] = await db.select().from(siteFindReports).orderBy(siteFindReports.reportDate).limit(1);
    if (!siteFind) return;
    const digest = await getDigestByDate(siteFind.sourceDigestDate);
    if (!digest?.stories[0]) return;
    const sourceItem = digest.stories[0];
    const candidates = await db.select().from(stories).where(ne(stories.status, "archived"));
    const conflictStory = candidates.find(item => item.id !== sourceItem.story.id && item.featuredImageUrl);
    expect(conflictStory?.featuredImageUrl).toBeTruthy();
    if (!conflictStory?.featuredImageUrl) return;
    const analysis = contentAnalysisSchema.parse({
      executiveSummary: "Verify duplicate featured images stop publication.",
      sourceAssessment: "The sourced story is complete but its image assignment conflicts with another public story.",
      decisions: [{
        action: "add",
        proposedTitle: sourceItem.story.title,
        existingSlug: sourceItem.story.slug,
        categorySlug: sourceItem.category.slug,
        contentType: sourceItem.story.contentType,
        priority: "high",
        rationale: "Attempt publication only if the story has a distinct visual assignment.",
        evidence: ["Durable Agent 1 story record."],
        confidence: 0.95,
        requiresHumanReview: false,
      }],
      warnings: [],
    });
    const syntheticSiteFind = {
      ...siteFind,
      reportDate: "2037-12-28",
      status: "completed" as const,
      decisionsJson: JSON.stringify(analysis),
      updatedAt: new Date("2037-12-28T02:00:00Z"),
    };
    const rollback = new Error("ROLLBACK_AGENT_3_IMAGE_CONFLICT_TEST");

    await expect(db.transaction(async tx => {
      await tx.update(stories).set({
        status: "draft",
        featuredImageUrl: conflictStory.featuredImageUrl,
      }).where(eq(stories.id, sourceItem.story.id));
      const result = await runPageCreation({
        db: tx as unknown as NonNullable<Awaited<ReturnType<typeof getDb>>>,
        siteFind: syntheticSiteFind,
        manifestDate: "2037-12-28",
        taskUid: "agent-3-image-conflict-test",
        force: true,
      });
      expect("manifest" in result && result.manifest?.reviewCount).toBe(1);
      expect("actions" in result && result.actions?.[0]?.outcome).toBe("review-required");
      expect("actions" in result && result.actions?.[0]?.note).toContain("featured image is already assigned");
      const [blocked] = await tx.select().from(stories).where(eq(stories.id, sourceItem.story.id)).limit(1);
      expect(blocked?.status).toBe("draft");
      throw rollback;
    })).rejects.toBe(rollback);
  }, 30_000);

  it("keeps page creation inside the unified scheduler and exposes no indexing-submission route", () => {
    const app = express();
    registerPublicationRoutes(app);
    const paths = (app as unknown as { _router?: { stack?: Array<{ route?: { path?: string } }> } })._router?.stack?.map(layer => layer.route?.path).filter(Boolean) ?? [];
    expect(paths).toContain("/api/scheduled/daily-digest");
    expect(paths).not.toContain("/api/scheduled/page-creation");
    expect(paths.some(path => /indexnow|search-console|indexing-submit/i.test(String(path)))).toBe(false);
  });
});
