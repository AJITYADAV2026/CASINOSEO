import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { dailyDigests, publicationJobs, stories, storySources } from "../drizzle/schema";
import { getDb } from "./db";
import {
  digestPayloadSchema,
  persistScheduledDigest,
  registerPublicationRoutes,
  runUnifiedDailyPipeline,
  UnifiedPipelineStageError,
} from "./publicationRoutes";

const basePayload = {
  digestDate: "2026-09-03",
  title: "CasinooVerse Daily Research Digest — 3 September 2026",
  summary: "A source-attributed summary of the material casino-industry developments for the completed IST calendar day.",
  body: "This completed daily edition places verified industry developments in context and links every material statement to its original source.",
  markdownArtifact: "# CasinooVerse Daily Research Digest — 3 September 2026\n\n## Research window\n\nThis edition covers the completed India Standard Time calendar day.\n\n## Verified developments\n\nOriginal CasinooVerse analysis with visible sources.\n\n## References\n\n1. [Official source](https://example.com/source)",
  status: "published" as const,
  stories: [{
    slug: "verified-market-development",
    title: "Verified market development receives contextual analysis",
    dek: "CasinooVerse explains the reported development while preserving the original source and uncertainty labels.",
    body: "The research desk reviewed the original publication, separated reported facts from interpretation, and retained direct attribution for readers.",
    contentType: "news" as const,
    categorySlug: "market-intelligence",
    authorName: "CasinooVerse Research Desk",
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
      title: "CasinooVerse scheduled transaction verification edition",
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

describe("unified daily publication pipeline", () => {
  const unifiedPayload = digestPayloadSchema.parse({
    ...basePayload,
    digestDate: "2026-09-11",
    stories: [{ ...basePayload.stories[0], publishedAt: "2026-09-11T12:00:00.000Z" }],
  });

  it("runs research, analysis, and page creation strictly in sequence", async () => {
    const events: string[] = [];
    const result = await runUnifiedDailyPipeline({
      db: {} as never,
      job: {} as never,
      taskUid: "unified-task",
      payload: unifiedPayload,
      currentIstDate: "2026-09-12",
      dependencies: {
        persistDigest: (async () => { events.push("research"); }) as typeof persistScheduledDigest,
        analyze: (async () => {
          events.push("content-analysis");
          return { report: { reportDate: "2026-09-12", sourceDigestDate: "2026-09-11", status: "completed" } } as never;
        }) as never,
        publishPages: (async () => {
          events.push("page-creation");
          return { manifest: { manifestDate: "2026-09-12", sourceReportDate: "2026-09-12", status: "completed" } } as never;
        }) as never,
      },
    });

    expect(events).toEqual(["research", "content-analysis", "page-creation"]);
    expect(result.pipelineStatus).toBe("completed");
    expect(result.digestDate).toBe("2026-09-11");
    expect(result.reportDate).toBe("2026-09-12");
    expect(result.manifestDate).toBe("2026-09-12");
  });

  it("fails closed before page creation when content analysis is incomplete", async () => {
    const events: string[] = [];
    await expect(runUnifiedDailyPipeline({
      db: {} as never,
      job: {} as never,
      taskUid: "unified-task",
      payload: unifiedPayload,
      currentIstDate: "2026-09-12",
      dependencies: {
        persistDigest: (async () => { events.push("research"); }) as typeof persistScheduledDigest,
        analyze: (async () => {
          events.push("content-analysis");
          return { skipped: "required-agent-1-digest-missing" } as never;
        }) as never,
        publishPages: (async () => {
          events.push("page-creation");
          return {} as never;
        }) as never,
      },
    })).rejects.toMatchObject<Partial<UnifiedPipelineStageError>>({ stage: "content-analysis" });
    expect(events).toEqual(["research", "content-analysis"]);
  });

  it("rejects a stale or future research edition before any durable stage runs", async () => {
    const events: string[] = [];
    await expect(runUnifiedDailyPipeline({
      db: {} as never,
      job: {} as never,
      taskUid: "unified-task",
      payload: { ...unifiedPayload, digestDate: "2026-09-10" },
      currentIstDate: "2026-09-12",
      dependencies: {
        persistDigest: (async () => { events.push("research"); }) as typeof persistScheduledDigest,
        analyze: (async () => ({})) as never,
        publishPages: (async () => ({})) as never,
      },
    })).rejects.toMatchObject<Partial<UnifiedPipelineStageError>>({ stage: "research" });
    expect(events).toEqual([]);
  });
});

describe("durable pipeline artifact routes", () => {
  it("registers dated Markdown routes and only one scheduled callback", () => {
    const routes: Array<{ method: "get" | "post"; path: string }> = [];
    const app = {
      get: (path: string) => routes.push({ method: "get", path }),
      post: (path: string) => routes.push({ method: "post", path }),
    };

    registerPublicationRoutes(app as never);

    expect(routes.map(route => route.path)).toEqual(expect.arrayContaining([
      "/research/:date.md",
      "/site-find/:date.md",
      "/url-manifests/:date.md",
      "/sitemap.xml",
      "/api/scheduled/daily-digest",
    ]));
    expect(routes.filter(route => route.method === "post")).toEqual([
      { method: "post", path: "/api/scheduled/daily-digest" },
    ]);

    const source = registerPublicationRoutes.toString();
    expect(source).toContain('filename="SITE FIND ${date.data}.md"');
    expect(source).toContain('filename="URL+${date.data}.md"');
  });
});
