import type { Express, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  categories,
  dailyDigests,
  digestStories,
  publicationJobs,
  stories,
  storySources,
} from "../drizzle/schema";
import {
  getArchive,
  getDb,
  getDigestByDate,
  getHomepageContent,
  getSiteFindReportByDate,
  getUrlManifestByDate,
} from "./db";
import { previousIsoCalendarDate, runContentAnalysis } from "./contentAnalysis";
import { runPageCreation } from "./pageCreation";

const xml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

function publicationOrigin() {
  return (process.env.CANONICAL_ORIGIN || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")).replace(/\/$/, "");
}

export function buildSitemapDocument(origin: string, data: {
  categories: Array<{ slug: string; updatedAt: Date }>;
  stories: Array<{ story: { slug: string; status: string; modifiedAt: Date | null; publishedAt: Date | null } }>;
  digests: Array<{ digestDate: string; status: string; modifiedAt: Date | null; publishedAt: Date | null }>;
}) {
  const staticPaths = [
    "/",
    "/articles",
    "/archive",
    "/games",
    "/games/poker",
    "/games/blackjack",
    "/games/roulette",
    "/games/baccarat",
    "/games/slots",
    "/guides",
    "/history",
    "/culture",
    "/destinations",
    "/facts",
    "/gallery",
    "/sources",
    "/support",
    "/responsible-entertainment",
    "/about",
    "/privacy",
    "/disclaimer",
    "/terms",
  ];
  const urls = [
    ...staticPaths.map(path => ({ path, modified: undefined as Date | undefined })),
    ...data.categories.map(category => ({ path: `/category/${category.slug}`, modified: category.updatedAt })),
    ...data.stories.filter(item => item.story.status === "published").map(item => ({ path: `/articles/${item.story.slug}`, modified: item.story.modifiedAt ?? item.story.publishedAt ?? undefined })),
    ...data.digests.filter(digest => digest.status !== "developing").map(digest => ({ path: `/archive/${digest.digestDate}`, modified: digest.modifiedAt ?? digest.publishedAt ?? undefined })),
  ];
  const body = urls.map(item => `<url><loc>${xml(origin + item.path)}</loc>${item.modified ? `<lastmod>${item.modified.toISOString()}</lastmod>` : ""}</url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

const sourceSchema = z.object({
  publisher: z.string().trim().min(1).max(180),
  sourceTitle: z.string().trim().min(1).max(1000),
  sourceUrl: z.string().url().max(2000),
  sourcePublishedAt: z.string().datetime().optional(),
  sourceType: z.enum(["official", "regulator", "filing", "trade", "news", "research"]).default("news"),
});

const storySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  title: z.string().trim().min(8).max(280),
  dek: z.string().trim().min(20).max(1200),
  body: z.string().trim().min(80).max(20000),
  contentType: z.enum(["news", "analysis", "guide", "culture", "video"]).default("news"),
  categorySlug: z.string().trim().min(1).max(96),
  authorName: z.string().trim().min(2).max(160).default("CasinooVerse Research Desk"),
  readingMinutes: z.number().int().min(1).max(30).default(4),
  featuredImageUrl: z.string().max(2000).optional(),
  featuredImageAlt: z.string().max(280).optional(),
  publishedAt: z.string().datetime(),
  sources: z.array(sourceSchema).min(1).max(12),
});

export const digestPayloadSchema = z.object({
  digestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(8).max(280),
  summary: z.string().trim().min(30).max(1500),
  body: z.string().trim().min(80).max(15000),
  markdownArtifact: z.string().trim().min(200).max(500000),
  status: z.enum(["developing", "published"]),
  stories: z.array(storySchema).min(1).max(30),
});

export type DigestPayload = z.infer<typeof digestPayloadSchema>;
type EditorialDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type PublicationJob = typeof publicationJobs.$inferSelect;

function formatIstDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function assessAgent1Delivery(currentIstDate: string, digest?: { digestDate: string; status: string; markdownArtifact: string | null }) {
  const expectedDigestDate = previousIsoCalendarDate(currentIstDate);
  const delivered = digest?.digestDate === expectedDigestDate && digest.status === "published" && Boolean(digest.markdownArtifact?.trim());
  return {
    delivered,
    expectedDigestDate,
    reason: delivered ? "delivered" as const : "required-agent-1-digest-missing" as const,
  };
}

export async function persistScheduledDigest(db: EditorialDb, job: PublicationJob, cronTaskUid: string, payload: DigestPayload) {
  await db.transaction(async tx => {
    await tx.insert(dailyDigests).values({
      digestDate: payload.digestDate,
      slug: `daily-digest-${payload.digestDate}`,
      title: payload.title,
      summary: payload.summary,
      body: payload.body,
      markdownArtifact: payload.markdownArtifact,
      status: payload.status,
      publishedAt: payload.status === "published" ? new Date() : null,
      modifiedAt: new Date(),
    }).onDuplicateKeyUpdate({ set: {
      title: payload.title,
      summary: payload.summary,
      body: payload.body,
      markdownArtifact: payload.markdownArtifact,
      status: payload.status,
      publishedAt: payload.status === "published" ? new Date() : null,
      modifiedAt: new Date(),
    } });

    const [digest] = await tx.select().from(dailyDigests).where(eq(dailyDigests.digestDate, payload.digestDate)).limit(1);
    if (!digest) throw new Error("Digest upsert did not return a durable record");
    await tx.delete(digestStories).where(eq(digestStories.digestId, digest.id));

    for (let position = 0; position < payload.stories.length; position += 1) {
      const item = payload.stories[position]!;
      const [category] = await tx.select().from(categories).where(eq(categories.slug, item.categorySlug)).limit(1);
      if (!category) throw new Error(`Unknown category slug: ${item.categorySlug}`);
      await tx.insert(stories).values({
        slug: item.slug,
        title: item.title,
        dek: item.dek,
        body: item.body,
        contentType: item.contentType,
        status: payload.status,
        categoryId: category.id,
        authorName: item.authorName,
        readingMinutes: item.readingMinutes,
        featuredImageUrl: item.featuredImageUrl ?? null,
        featuredImageAlt: item.featuredImageAlt ?? null,
        isLead: false,
        isFeatured: position < 4,
        publishedAt: new Date(item.publishedAt),
        modifiedAt: new Date(),
      }).onDuplicateKeyUpdate({ set: {
        title: item.title,
        dek: item.dek,
        body: item.body,
        contentType: item.contentType,
        status: payload.status,
        categoryId: category.id,
        authorName: item.authorName,
        readingMinutes: item.readingMinutes,
        featuredImageUrl: item.featuredImageUrl ?? null,
        featuredImageAlt: item.featuredImageAlt ?? null,
        isFeatured: position < 4,
        publishedAt: new Date(item.publishedAt),
        modifiedAt: new Date(),
      } });
      const [story] = await tx.select().from(stories).where(eq(stories.slug, item.slug)).limit(1);
      if (!story) throw new Error(`Story upsert failed: ${item.slug}`);
      await tx.delete(storySources).where(eq(storySources.storyId, story.id));
      await tx.insert(storySources).values(item.sources.map(source => ({
        storyId: story.id,
        publisher: source.publisher,
        sourceTitle: source.sourceTitle,
        sourceUrl: source.sourceUrl,
        sourcePublishedAt: source.sourcePublishedAt ? new Date(source.sourcePublishedAt) : null,
        accessedAt: new Date(),
        sourceType: source.sourceType,
      })));
      await tx.insert(digestStories).values({ digestId: digest.id, storyId: story.id, position: position + 1 });
    }

    await tx.update(publicationJobs).set({
      status: "active",
      lastCompletedDigestDate: payload.status === "published" ? payload.digestDate : job.lastCompletedDigestDate,
      lastRunAt: new Date(),
    }).where(and(eq(publicationJobs.id, job.id), eq(publicationJobs.scheduleCronTaskUid, cronTaskUid)));
  });
}

export type UnifiedPipelineStage = "research" | "content-analysis" | "page-creation";

export class UnifiedPipelineStageError extends Error {
  constructor(public readonly stage: UnifiedPipelineStage, message: string) {
    super(message);
    this.name = "UnifiedPipelineStageError";
  }
}

type UnifiedPipelineDependencies = {
  persistDigest: typeof persistScheduledDigest;
  analyze: typeof runContentAnalysis;
  publishPages: typeof runPageCreation;
};

const unifiedPipelineDependencies: UnifiedPipelineDependencies = {
  persistDigest: persistScheduledDigest,
  analyze: runContentAnalysis,
  publishPages: runPageCreation,
};

export async function runUnifiedDailyPipeline(options: {
  db: EditorialDb;
  job: PublicationJob;
  taskUid: string;
  payload: DigestPayload;
  currentIstDate?: string;
  dependencies?: UnifiedPipelineDependencies;
}) {
  const currentIstDate = options.currentIstDate ?? formatIstDate();
  const expectedDigestDate = previousIsoCalendarDate(currentIstDate);
  const dependencies = options.dependencies ?? unifiedPipelineDependencies;

  if (options.payload.status !== "published") {
    throw new UnifiedPipelineStageError("research", "unified-pipeline-requires-published-digest");
  }
  if (options.payload.digestDate !== expectedDigestDate) {
    throw new UnifiedPipelineStageError(
      "research",
      `required-digest-date-${expectedDigestDate}-received-${options.payload.digestDate}`,
    );
  }

  try {
    await dependencies.persistDigest(options.db, options.job, options.taskUid, options.payload);
  } catch (error) {
    throw new UnifiedPipelineStageError(
      "research",
      error instanceof Error ? error.message : "digest-persistence-failed",
    );
  }

  const analysis = await dependencies.analyze({
    taskUid: options.taskUid,
    db: options.db,
    reportDate: currentIstDate,
    enforceSequence: true,
  });
  if (!("report" in analysis) || !analysis.report || analysis.report.status !== "completed") {
    throw new UnifiedPipelineStageError(
      "content-analysis",
      ("skipped" in analysis ? analysis.skipped : undefined) ?? "completed-site-find-not-persisted",
    );
  }

  const publication = await dependencies.publishPages({
    taskUid: options.taskUid,
    db: options.db,
    manifestDate: currentIstDate,
    enforceSequence: true,
  });
  if (!("manifest" in publication) || !publication.manifest || publication.manifest.status !== "completed") {
    throw new UnifiedPipelineStageError(
      "page-creation",
      ("skipped" in publication ? publication.skipped : undefined) ?? "completed-url-manifest-not-persisted",
    );
  }

  return {
    pipelineStatus: "completed" as const,
    currentIstDate,
    digestDate: options.payload.digestDate,
    storiesSaved: options.payload.stories.length,
    reportDate: analysis.report.reportDate,
    manifestDate: publication.manifest.manifestDate,
    stages: {
      research: "completed" as const,
      contentAnalysis: "completed" as const,
      pageCreation: "completed" as const,
    },
  };
}

async function scheduledDailyDigest(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    let user;
    try {
      const { sdk } = await import("./_core/sdk");
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(403).json({ error: "cron-only" });
    }
    const cronTaskUid = user.taskUid;
    taskUid = cronTaskUid;
    if (!user.isCron || !cronTaskUid) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });
    const [job] = await db.select().from(publicationJobs).where(eq(publicationJobs.scheduleCronTaskUid, cronTaskUid)).limit(1);
    if (!job || job.jobKey !== "casinoverse-daily-research") return res.json({ ok: true, skipped: "orphan" });

    const payload = digestPayloadSchema.parse(req.body);
    const result = await runUnifiedDailyPipeline({ db, job, taskUid: cronTaskUid, payload });

    return res.json({
      ok: true,
      ...result,
      artifacts: {
        research: `/research/${result.digestDate}.md`,
        siteFind: `/site-find/${result.reportDate}.md`,
        urlManifest: `/url-manifests/${result.manifestDate}.md`,
        sitemap: "/sitemap.xml",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown unified daily pipeline error";
    const status = error instanceof z.ZodError ? 400 : error instanceof UnifiedPipelineStageError ? 409 : 500;
    return res.status(status).json({
      error: message,
      pipelineStatus: "failed",
      failedStage: error instanceof UnifiedPipelineStageError ? error.stage : "unknown",
      details: error instanceof z.ZodError ? error.issues : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      context: { url: req.originalUrl, taskUid },
      timestamp: new Date().toISOString(),
    });
  }
}

export function registerPublicationRoutes(app: Express) {
  app.get("/robots.txt", (_req, res) => {
    const origin = publicationOrigin();
    const sitemap = origin ? `\nSitemap: ${origin}/sitemap.xml\nSitemap: ${origin}/news-sitemap.xml` : "";
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /search${sitemap}\n`);
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const origin = publicationOrigin();
    if (!origin) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const [{ categories: categoryRows, stories: storyRows }, digests] = await Promise.all([getHomepageContent(), getArchive()]);
    res.set("Cache-Control", "public, max-age=900").type("application/xml").send(buildSitemapDocument(origin, { categories: categoryRows, stories: storyRows, digests }));
  });

  app.get("/news-sitemap.xml", async (_req, res) => {
    const origin = publicationOrigin();
    if (!origin) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const { stories: storyRows } = await getHomepageContent();
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const recent = storyRows.filter(item => item.story.status === "published" && item.story.publishedAt && item.story.publishedAt.getTime() >= cutoff);
    const body = recent.map(item => `<url><loc>${xml(origin + `/articles/${item.story.slug}`)}</loc><news:news><news:publication><news:name>CasinooVerse</news:name><news:language>en</news:language></news:publication><news:publication_date>${item.story.publishedAt!.toISOString()}</news:publication_date><news:title>${xml(item.story.title)}</news:title></news:news></url>`).join("");
    res.set("Cache-Control", "public, max-age=900").type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${body}</urlset>`);
  });

  app.get("/rss.xml", async (_req, res) => {
    const origin = publicationOrigin();
    if (!origin) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const { stories: storyRows } = await getHomepageContent();
    const items = storyRows.filter(item => item.story.status === "published").slice(0, 30).map(item => `<item><title>${xml(item.story.title)}</title><link>${xml(origin + `/articles/${item.story.slug}`)}</link><guid>${xml(origin + `/articles/${item.story.slug}`)}</guid><description>${xml(item.story.dek)}</description>${item.story.publishedAt ? `<pubDate>${item.story.publishedAt.toUTCString()}</pubDate>` : ""}<category>${xml(item.category.name)}</category></item>`).join("");
    res.set("Cache-Control", "public, max-age=900").type("application/rss+xml").send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CasinooVerse</title><link>${xml(origin)}</link><description>${xml("Independent casino-industry research, culture, regulation, and responsible entertainment.")}</description>${items}</channel></rss>`);
  });

  app.get("/research/:date.md", async (req, res) => {
    const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(req.params.date);
    if (!date.success) return res.status(404).type("text/plain").send("Research edition not found");
    const data = await getDigestByDate(date.data);
    if (!data?.digest.markdownArtifact) return res.status(404).type("text/plain").send("Research edition not found");
    res
      .set("Cache-Control", data.digest.status === "developing" ? "no-cache" : "public, max-age=900")
      .set("Content-Disposition", `inline; filename="CasinooVerse-${date.data}.md"`)
      .type("text/markdown; charset=utf-8")
      .send(data.digest.markdownArtifact);
  });

  app.get("/site-find/:date.md", async (req, res) => {
    const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(req.params.date);
    if (!date.success) return res.status(404).type("text/plain").send("Site Find report not found");
    const report = await getSiteFindReportByDate(date.data);
    if (!report?.markdownArtifact) return res.status(404).type("text/plain").send("Site Find report not found");
    return res
      .set("Cache-Control", report.status === "completed" ? "public, max-age=900" : "no-cache")
      .set("Content-Disposition", `inline; filename="SITE FIND ${date.data}.md"`)
      .type("text/markdown; charset=utf-8")
      .send(report.markdownArtifact);
  });

  app.get("/url-manifests/:date.md", async (req, res) => {
    const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(req.params.date);
    if (!date.success) return res.status(404).type("text/plain").send("URL manifest not found");
    const manifest = await getUrlManifestByDate(date.data);
    if (!manifest?.markdownArtifact) return res.status(404).type("text/plain").send("URL manifest not found");
    return res
      .set("Cache-Control", manifest.status === "completed" ? "public, max-age=900" : "no-cache")
      .set("Content-Disposition", `inline; filename="URL+${date.data}.md"`)
      .type("text/markdown; charset=utf-8")
      .send(manifest.markdownArtifact);
  });

  app.post("/api/scheduled/daily-digest", scheduledDailyDigest);
}
