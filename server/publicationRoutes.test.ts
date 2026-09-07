import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { dailyDigests, publicationJobs, stories, storySources } from "../drizzle/schema";
import { getDb } from "./db";
import { digestPayloadSchema, persistScheduledDigest, registerPublicationRoutes } from "./publicationRoutes";

const basePayload = {
  digestDate: "2026-09-03",
  title: "CasinoVerse Daily Research Digest — 3 September 2026",
  summary: "A source-attributed summary of the material casino-industry developments for the completed IST calendar day.",
  body: "This completed daily edition places verified industry developments in context and links every material statement to its original source.",
  markdownArtifact: "# CasinoVerse Daily Research Digest — 3 September 2026\n\n## Research window\n\nThis edition covers the completed India Standard Time calendar day.\n\n## Verified developments\n\nOriginal CasinoVerse analysis with visible sources.\n\n## References\n\n1. [Official source](https://example.com/source)",
  status: "published" as const,
  stories: [{
    slug: "verified-market-development",
    title: "Verified market development receives contextual analysis",
    dek: "CasinoVerse explains the reported development while preserving the original source and uncertainty labels.",
    body: "The research desk reviewed the original publication, separated reported facts from interpretation, and retained direct attribution for readers.",
    contentType: "news" as const,
    categorySlug: "market-intelligence",
    authorName: "CasinoVerse Research Desk",
    readingMinutes: 3,
    publishedAt: "2026-09-03T12:00:00.000Z",
    sources: [{
      publisher: "Official source",
      sourceTitle: "Official source material",
      sourceUrl: "https://example.com/source",
      sourcePublishedAt: "2026-09-03T11:00:00.000Z",
      sourceType: "official" as const,
    }],
  }],
};

describe("scheduled daily digest payload", () => {
  it("accepts a complete durable Markdown research artifact", () => {
    const result = digestPayloadSchema.parse(basePayload);
    expect(result.markdownArtifact).toContain("## References");
    expect(result.stories).toHaveLength(1);
  });

  it("rejects payloads that omit durable Markdown research", () => {
    const { markdownArtifact: _omitted, ...withoutMarkdown } = basePayload;
    expect(() => digestPayloadSchema.parse(withoutMarkdown)).toThrow();
  });

  it("persists a trusted scheduled edition, Markdown artifact, story, and source atomically", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;
    const [job] = await db.select().from(publicationJobs).where(eq(publicationJobs.jobKey, "casinoverse-daily-research")).limit(1);
    expect(job?.scheduleCronTaskUid).toBeTruthy();
    if (!job?.scheduleCronTaskUid) return;

    const digestDate = "2099-12-31";
    const storySlug = "scheduled-transaction-test-story";
    const payload = digestPayloadSchema.parse({
      ...basePayload,
      digestDate,
      title: "CasinoVerse scheduled transaction verification edition",
      stories: [{ ...basePayload.stories[0], slug: storySlug }],
    });
    const rollback = new Error("ROLLBACK_VERIFIED_SCHEDULE_TEST");

    await expect(db.transaction(async tx => {
      const transactionalDb = { transaction: async (callback: (inner: typeof tx) => Promise<void>) => callback(tx) } as unknown as Parameters<typeof persistScheduledDigest>[0];
      await persistScheduledDigest(transactionalDb, job, job.scheduleCronTaskUid!, payload);

      const [digest] = await tx.select().from(dailyDigests).where(eq(dailyDigests.digestDate, digestDate)).limit(1);
      expect(digest?.markdownArtifact).toContain("## References");
      const [story] = await tx.select().from(stories).where(eq(stories.slug, storySlug)).limit(1);
      expect(story?.title).toContain("Verified market development");
      const sourceRows = story ? await tx.select().from(storySources).where(eq(storySources.storyId, story.id)) : [];
      expect(sourceRows).toHaveLength(1);
      expect(sourceRows[0]?.sourceUrl).toBe("https://example.com/source");
      throw rollback;
    })).rejects.toBe(rollback);

    const [rolledBackDigest] = await db.select().from(dailyDigests).where(eq(dailyDigests.digestDate, digestDate)).limit(1);
    const [rolledBackStory] = await db.select().from(stories).where(eq(stories.slug, storySlug)).limit(1);
    expect(rolledBackDigest).toBeUndefined();
    expect(rolledBackStory).toBeUndefined();
  }, 20_000);
});

describe("durable pipeline artifact routes", () => {
  it("registers dated Markdown routes with the exact export filenames expected by the GitHub publisher", () => {
    const routes: Array<{ path: string; handler: Function }> = [];
    const app = {
      get: (path: string, handler: Function) => routes.push({ path, handler }),
      post: () => undefined,
    };

    registerPublicationRoutes(app as never);

    expect(routes.map(route => route.path)).toEqual(expect.arrayContaining([
      "/research/:date.md",
      "/site-find/:date.md",
      "/url-manifests/:date.md",
      "/sitemap.xml",
    ]));

    const source = registerPublicationRoutes.toString();
    expect(source).toContain('filename="SITE FIND ${date.data}.md"');
    expect(source).toContain('filename="URL+${date.data}.md"');
  });
});
