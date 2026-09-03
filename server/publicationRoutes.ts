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
import { getArchive, getDb, getHomepageContent } from "./db";
import { sdk } from "./_core/sdk";

const xml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

function publicationOrigin() {
  return (process.env.CANONICAL_ORIGIN || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")).replace(/\/$/, "");
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
  authorName: z.string().trim().min(2).max(160).default("CasinoVerse Research Desk"),
  readingMinutes: z.number().int().min(1).max(30).default(4),
  featuredImageUrl: z.string().max(2000).optional(),
  featuredImageAlt: z.string().max(280).optional(),
  publishedAt: z.string().datetime(),
  sources: z.array(sourceSchema).min(1).max(12),
});

const digestPayloadSchema = z.object({
  digestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(8).max(280),
  summary: z.string().trim().min(30).max(1500),
  body: z.string().trim().min(80).max(15000),
  status: z.enum(["developing", "published"]),
  stories: z.array(storySchema).min(1).max(30),
});

async function scheduledDailyDigest(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    let user;
    try {
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
    if (!job) return res.json({ ok: true, skipped: "orphan" });

    const payload = digestPayloadSchema.parse(req.body);
    await db.transaction(async tx => {
      await tx.insert(dailyDigests).values({
        digestDate: payload.digestDate,
        slug: `daily-digest-${payload.digestDate}`,
        title: payload.title,
        summary: payload.summary,
        body: payload.body,
        status: payload.status,
        publishedAt: payload.status === "published" ? new Date() : null,
        modifiedAt: new Date(),
      }).onDuplicateKeyUpdate({ set: {
        title: payload.title,
        summary: payload.summary,
        body: payload.body,
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

    return res.json({ ok: true, digestDate: payload.digestDate, status: payload.status, storiesSaved: payload.stories.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduled digest error";
    const status = error instanceof z.ZodError ? 400 : 500;
    return res.status(status).json({
      error: message,
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
    const staticPaths = ["/", "/archive", "/games", "/guides", "/responsible-entertainment", "/about"];
    const urls = [
      ...staticPaths.map(path => ({ path, modified: undefined as Date | undefined })),
      ...categoryRows.map(category => ({ path: `/category/${category.slug}`, modified: category.updatedAt })),
      ...storyRows.filter(item => item.story.status === "published").map(item => ({ path: `/articles/${item.story.slug}`, modified: item.story.modifiedAt ?? item.story.publishedAt ?? undefined })),
      ...digests.filter(digest => digest.status !== "developing").map(digest => ({ path: `/archive/${digest.digestDate}`, modified: digest.modifiedAt ?? digest.publishedAt ?? undefined })),
    ];
    const body = urls.map(item => `<url><loc>${xml(origin + item.path)}</loc>${item.modified ? `<lastmod>${item.modified.toISOString()}</lastmod>` : ""}</url>`).join("");
    res.set("Cache-Control", "public, max-age=900").type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
  });

  app.get("/news-sitemap.xml", async (_req, res) => {
    const origin = publicationOrigin();
    if (!origin) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const { stories: storyRows } = await getHomepageContent();
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const recent = storyRows.filter(item => item.story.status === "published" && item.story.publishedAt && item.story.publishedAt.getTime() >= cutoff);
    const body = recent.map(item => `<url><loc>${xml(origin + `/articles/${item.story.slug}`)}</loc><news:news><news:publication><news:name>CasinoVerse</news:name><news:language>en</news:language></news:publication><news:publication_date>${item.story.publishedAt!.toISOString()}</news:publication_date><news:title>${xml(item.story.title)}</news:title></news:news></url>`).join("");
    res.set("Cache-Control", "public, max-age=900").type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${body}</urlset>`);
  });

  app.get("/rss.xml", async (_req, res) => {
    const origin = publicationOrigin();
    if (!origin) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const { stories: storyRows } = await getHomepageContent();
    const items = storyRows.filter(item => item.story.status === "published").slice(0, 30).map(item => `<item><title>${xml(item.story.title)}</title><link>${xml(origin + `/articles/${item.story.slug}`)}</link><guid>${xml(origin + `/articles/${item.story.slug}`)}</guid><description>${xml(item.story.dek)}</description>${item.story.publishedAt ? `<pubDate>${item.story.publishedAt.toUTCString()}</pubDate>` : ""}<category>${xml(item.category.name)}</category></item>`).join("");
    res.set("Cache-Control", "public, max-age=900").type("application/rss+xml").send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CasinoVerse</title><link>${xml(origin)}</link><description>${xml("Independent casino-industry research, culture, regulation, and responsible entertainment.")}</description>${items}</channel></rss>`);
  });

  app.post("/api/scheduled/daily-digest", scheduledDailyDigest);
}
