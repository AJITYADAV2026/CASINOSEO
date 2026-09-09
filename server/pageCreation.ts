import { and, desc, eq, ne, or } from "drizzle-orm";
import { z } from "zod";
import { categories, dailyDigests, digestStories, siteFindReports, stories, urlManifests } from "../drizzle/schema";
import { contentAnalysisSchema, previousIsoCalendarDate } from "./contentAnalysis";
import { getDb, getLatestSiteFindForPublishing } from "./db";

const outcomes = ["created", "updated", "retained", "archived", "review-required"] as const;

export const pageActionSchema = z.object({
  decision: z.enum(["add", "update", "retain", "archive", "remove"]),
  outcome: z.enum(outcomes),
  title: z.string().min(1).max(280),
  storySlug: z.string().max(180).nullable(),
  canonicalUrl: z.string().url().nullable(),
  pageStatus: z.enum(["draft", "developing", "published", "archived"]).nullable(),
  sitemapIncluded: z.boolean(),
  note: z.string().min(1).max(1000),
});

export type PageAction = z.infer<typeof pageActionSchema>;
type EditorialDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type SiteFindInput = NonNullable<Awaited<ReturnType<typeof getLatestSiteFindForPublishing>>>;

const origin = () => (process.env.CANONICAL_ORIGIN || "http://localhost:3000").replace(/\/$/, "");

function formatIstDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const tableCell = (value: string) => value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

export function renderUrlManifest(input: {
  manifestDate: string;
  sourceReportDate: string;
  sourceReportStatus: string;
  actions: PageAction[];
}) {
  const count = (outcome: PageAction["outcome"]) => input.actions.filter(action => action.outcome === outcome).length;
  const rows = input.actions.length
    ? input.actions.map(action => `| ${action.decision} | ${action.outcome} | ${tableCell(action.title)} | ${action.storySlug ? `\`${tableCell(action.storySlug)}\`` : "Not resolved"} | ${action.canonicalUrl ? `[Open page](${action.canonicalUrl})` : "Not created"} | ${action.pageStatus ?? "Not changed"} | ${action.sitemapIncluded ? "Included" : "Not included"} | ${tableCell(action.note)} |`).join("\n")
    : "| — | retained | No material page actions | — | — | — | Not changed | Agent 2 supplied no actionable page decision. |";
  const status = input.sourceReportStatus === "completed" && count("review-required") === 0 ? "completed" : "partial";
  return `---\ntitle: "CasinooVerse URL Manifest — ${input.manifestDate}"\nmanifestDate: "${input.manifestDate}"\nsourceSiteFindDate: "${input.sourceReportDate}"\nstatus: "${status}"\ncreatedCount: ${count("created")}\nupdatedCount: ${count("updated")}\nretainedCount: ${count("retained")}\narchivedCount: ${count("archived")}\nreviewCount: ${count("review-required")}\n---\n\n# CasinooVerse URL Manifest — ${input.manifestDate}\n\n> **Agent 3 scope:** Page creation, page updates, permanent URL recording, and dynamic sitemap state only. No search-engine indexing submission was performed.\n\n## Processing Summary\n\n| Outcome | Count |\n| --- | ---: |\n| Created | ${count("created")} |\n| Updated | ${count("updated")} |\n| Retained | ${count("retained")} |\n| Archived | ${count("archived")} |\n| Review required | ${count("review-required")} |\n\n## Page and URL Actions\n\n| Decision | Outcome | Title | Story slug | Canonical URL | Page status | Sitemap | Note |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${rows}\n\n## Sitemap Result\n\nCasinooVerse generates \`sitemap.xml\` dynamically from durable publication data. Published pages are included automatically, archived pages are excluded, and updated pages receive a refreshed modification timestamp.\n\n## Indexing Boundary\n\nAgent 3 did not submit URLs to Google, Bing, IndexNow, Search Console, or any other indexing service. Indexing submission remains reserved for Agent 4.\n`;
}

export async function runPageCreation(options: {
  includeDraft?: boolean;
  force?: boolean;
  manifestDate?: string;
  taskUid?: string | null;
  enforceSequence?: boolean;
  db?: EditorialDb;
  siteFind?: SiteFindInput;
} = {}) {
  const db = options.db ?? await getDb();
  if (!db) throw new Error("Database unavailable for Agent 3");
  const manifestDate = options.manifestDate ?? formatIstDate();
  const expectedDigestDate = previousIsoCalendarDate(manifestDate);
  const siteFind = options.siteFind ?? await getLatestSiteFindForPublishing(options.includeDraft ?? false);
  if (!siteFind) return { skipped: "no-publishable-site-find" as const };
  const enforceSequence = options.enforceSequence ?? options.siteFind === undefined;
  if (enforceSequence && (siteFind.reportDate !== manifestDate || siteFind.sourceDigestDate !== expectedDigestDate || siteFind.status !== "completed")) {
    return {
      skipped: "required-agent-2-report-missing" as const,
      manifestDate,
      expectedReportDate: manifestDate,
      expectedDigestDate,
      latestReportDate: siteFind.reportDate,
      latestSourceDigestDate: siteFind.sourceDigestDate,
      latestReportStatus: siteFind.status,
    };
  }
  const [existing] = await db.select().from(urlManifests).where(eq(urlManifests.manifestDate, manifestDate)).limit(1);
  if (!options.force && existing && existing.sourceSiteFindId === siteFind.id && existing.sourceSiteFindUpdatedAt.getTime() >= siteFind.updatedAt.getTime()) {
    return { skipped: "already-current" as const, manifest: existing };
  }

  const analysis = contentAnalysisSchema.parse(JSON.parse(siteFind.decisionsJson));
  const [sourceDigest] = await db.select().from(dailyDigests).where(eq(dailyDigests.id, siteFind.sourceDigestId)).limit(1);
  if (!sourceDigest) throw new Error(`Agent 3 source digest not found: ${siteFind.sourceDigestId}`);

  const result = await db.transaction(async tx => {
    const digestStoryRows = await tx
      .select({ story: stories, category: categories })
      .from(digestStories)
      .innerJoin(stories, eq(digestStories.storyId, stories.id))
      .innerJoin(categories, eq(stories.categoryId, categories.id))
      .where(eq(digestStories.digestId, sourceDigest.id))
      .orderBy(digestStories.position);
    const bySlug = new Map(digestStoryRows.map(item => [item.story.slug, item]));
    const byTitle = new Map(digestStoryRows.map(item => [item.story.title.trim().toLowerCase(), item]));
    const actions: PageAction[] = [];

    for (const decision of analysis.decisions) {
      const resolved = (decision.existingSlug ? bySlug.get(decision.existingSlug) : undefined) ?? byTitle.get(decision.proposedTitle.trim().toLowerCase());
      if (decision.action === "remove") {
        actions.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: decision.proposedTitle,
          storySlug: resolved?.story.slug ?? decision.existingSlug,
          canonicalUrl: resolved ? `${origin()}/articles/${resolved.story.slug}` : null,
          pageStatus: resolved?.story.status ?? null,
          sitemapIncluded: resolved?.story.status === "published",
          note: "No deletion performed. Removal decisions require downstream editorial review.",
        }));
        continue;
      }
      if (!resolved) {
        actions.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: decision.proposedTitle,
          storySlug: decision.existingSlug,
          canonicalUrl: null,
          pageStatus: null,
          sitemapIncluded: false,
          note: "No sourced Agent 1 story record matched this decision, so Agent 3 did not invent a page.",
        }));
        continue;
      }

      if (decision.action === "archive") {
        if (siteFind.status !== "completed") {
          actions.push(pageActionSchema.parse({
            decision: decision.action,
            outcome: "review-required",
            title: resolved.story.title,
            storySlug: resolved.story.slug,
            canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
            pageStatus: resolved.story.status,
            sitemapIncluded: resolved.story.status === "published",
            note: "Draft Site Find reports cannot archive public pages.",
          }));
          continue;
        }
        await tx.update(stories).set({ status: "archived", modifiedAt: new Date() }).where(eq(stories.id, resolved.story.id));
        actions.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "archived",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: "archived",
          sitemapIncluded: false,
          note: "Archived without deleting the story or its source records.",
        }));
        continue;
      }

      if (decision.action === "retain") {
        actions.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "retained",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: resolved.story.status,
          sitemapIncluded: resolved.story.status === "published",
          note: "No page mutation was required.",
        }));
        continue;
      }

      const targetStatus = siteFind.status === "completed" ? "published" as const : "developing" as const;
      if (!resolved.story.featuredImageUrl || !resolved.story.featuredImageAlt) {
        actions.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: resolved.story.status,
          sitemapIncluded: resolved.story.status === "published",
          note: "Publication stopped because this story does not have its own featured image and accessible alt description.",
        }));
        continue;
      }
      const [imageConflict] = await tx
        .select({ id: stories.id, slug: stories.slug })
        .from(stories)
        .where(and(
          eq(stories.featuredImageUrl, resolved.story.featuredImageUrl),
          ne(stories.id, resolved.story.id),
          or(eq(stories.status, "published"), eq(stories.status, "developing")),
        ))
        .limit(1);
      if (imageConflict) {
        actions.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: resolved.story.status,
          sitemapIncluded: resolved.story.status === "published",
          note: `Publication stopped because the featured image is already assigned to /articles/${imageConflict.slug}.`,
        }));
        continue;
      }
      await tx.update(stories).set({
        status: targetStatus,
        modifiedAt: new Date(),
        publishedAt: resolved.story.publishedAt ?? (targetStatus === "published" ? new Date() : null),
      }).where(eq(stories.id, resolved.story.id));
      actions.push(pageActionSchema.parse({
        decision: decision.action,
        outcome: decision.action === "add" ? "created" : "updated",
        title: resolved.story.title,
        storySlug: resolved.story.slug,
        canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
        pageStatus: targetStatus,
        sitemapIncluded: targetStatus === "published",
        note: decision.action === "add"
          ? "Published the full source-attributed Agent 1 story without creating a duplicate slug."
          : "Preserved the permanent slug and sourced story body while refreshing publication state and modification time.",
      }));
    }

    const markdownArtifact = renderUrlManifest({
      manifestDate,
      sourceReportDate: siteFind.reportDate,
      sourceReportStatus: siteFind.status,
      actions,
    });
    const outcomeCount = (outcome: PageAction["outcome"]) => actions.filter(action => action.outcome === outcome).length;
    const values = {
      manifestDate,
      sourceSiteFindId: siteFind.id,
      sourceSiteFindUpdatedAt: siteFind.updatedAt,
      sourceReportDate: siteFind.reportDate,
      status: siteFind.status === "completed" && outcomeCount("review-required") === 0 ? "completed" as const : "partial" as const,
      actionsJson: JSON.stringify(actions),
      markdownArtifact,
      createdCount: outcomeCount("created"),
      updatedCount: outcomeCount("updated"),
      retainedCount: outcomeCount("retained"),
      archivedCount: outcomeCount("archived"),
      reviewCount: outcomeCount("review-required"),
      scheduleCronTaskUid: options.taskUid ?? null,
      processedAt: new Date(),
      errorMessage: null,
    };
    await tx.insert(urlManifests).values(values).onDuplicateKeyUpdate({ set: values });
    return { actions, markdownArtifact };
  });

  const [manifest] = await db.select().from(urlManifests).where(and(eq(urlManifests.manifestDate, manifestDate), eq(urlManifests.sourceSiteFindId, siteFind.id))).limit(1);
  if (!manifest) throw new Error("Agent 3 URL manifest was not persisted");
  return { manifest, actions: result.actions, markdownArtifact: result.markdownArtifact };
}

export async function getLatestPublishedPageSlugs() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: stories.slug }).from(stories).where(eq(stories.status, "published")).orderBy(desc(stories.modifiedAt));
}
