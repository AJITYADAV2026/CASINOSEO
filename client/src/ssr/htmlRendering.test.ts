import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { composeHtml } from "../../../server/_core/vite";
import { render } from "../entry-server";
import type { SsrPrefetch } from "./prefetch";

const now = new Date("2026-09-03T12:00:00.000Z");

const category = {
  id: 1,
  slug: "market-intelligence",
  name: "Market Intelligence",
  description: "Verified casino-market reporting and analysis.",
  accent: "#c9a45c",
  createdAt: now,
  updatedAt: now,
};

const story = {
  story: {
    id: 1,
    slug: "verified-casino-market-record",
    title: "Verified casino market record",
    dek: "A source-attributed CasinoVerse article rendered in the initial HTML response.",
    body: "This complete article body is present before client-side JavaScript executes.",
    contentType: "news",
    status: "published",
    categoryId: 1,
    authorName: "CasinoVerse Research Desk",
    readingMinutes: 3,
    featuredImageUrl: "/manus-storage/story.jpg",
    featuredImageAlt: "Casino research desk",
    isLead: true,
    isFeatured: true,
    publishedAt: now,
    modifiedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  category,
  sources: [{
    id: 1,
    storyId: 1,
    publisher: "Casino regulator",
    sourceTitle: "Official market record",
    sourceUrl: "https://example.test/source",
    sourcePublishedAt: now,
    sourceType: "regulator",
    createdAt: now,
  }],
};

const digest = {
  digest: {
    id: 1,
    digestDate: "2026-09-03",
    title: "CasinoVerse research edition — 3 September 2026",
    summary: "A complete source-attributed daily research edition.",
    body: "Daily research body rendered into HTML.",
    markdownArtifact: "# CasinoVerse research edition",
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  stories: [story],
};

const source = {
  id: 1,
  slug: "casino-regulator",
  name: "Casino Regulator",
  publicationLabel: "Official records",
  description: "An internal CasinoVerse provenance record.",
  sourceType: "regulator",
  originalUrl: "https://example.test/source",
  accessedAt: now,
  status: "active",
  createdAt: now,
  updatedAt: now,
};

const historicalRecord = {
  id: 1,
  slug: "2010-verified-casino-milestone",
  eventYear: 2010,
  eventDate: "2010-01-01",
  datePrecision: "exact",
  title: "Verified 2010 casino-industry milestone",
  desk: "industry_and_regulation",
  jurisdiction: "International",
  summary: "A verified milestone in the CasinoVerse historical database.",
  significance: "It establishes the beginning of the year-by-year archive.",
  sourceCatalogId: 1,
  sourceName: "Casino Regulator",
  sourceTitle: "Official 2010 record",
  sourceUrl: "https://example.test/history",
  sourcePublishedDate: "2010-01-01",
  sourceType: "regulator",
  confidence: "high",
  verificationStatus: "verified",
  cutoffLabel: "through-2026-09-03",
  isPublished: true,
  accessedAt: now,
  createdAt: now,
  updatedAt: now,
};

function prefetch(): SsrPrefetch {
  return {
    homepage: vi.fn().mockResolvedValue({ categories: [category], stories: [story], digests: [digest.digest] }),
    storyBySlug: vi.fn().mockImplementation(async slug => slug === story.story.slug ? story : undefined),
    categoryBySlug: vi.fn().mockImplementation(async slug => slug === category.slug ? { category, stories: [story] } : undefined),
    archive: vi.fn().mockResolvedValue([digest.digest]),
    digestByDate: vi.fn().mockImplementation(async date => date === digest.digest.digestDate ? digest : undefined),
    search: vi.fn().mockResolvedValue([story]),
    sources: vi.fn().mockResolvedValue([source]),
    sourceBySlug: vi.fn().mockImplementation(async slug => slug === source.slug ? source : undefined),
    storySourceById: vi.fn().mockImplementation(async id => id === 1 ? { source: story.sources[0], story: story.story } : undefined),
    support: vi.fn().mockResolvedValue([]),
    historicalArchive: vi.fn().mockResolvedValue([historicalRecord]),
    historicalRecordBySlug: vi.fn().mockImplementation(async slug => slug === historicalRecord.slug ? historicalRecord : undefined),
  } as SsrPrefetch;
}

const template = fs.readFileSync(path.resolve(process.cwd(), "client/index.html"), "utf8");

async function htmlFor(url: string) {
  const result = await render(url, prefetch());
  return { ...result, document: composeHtml(template, result.html, result.head, result.dehydratedState) };
}

describe("CasinoVerse HTML-first rendering", () => {
  it.each([
    ["/", "Inside the house"],
    ["/articles", "Casino reporting beyond the lights"],
    ["/category/market-intelligence", "Market Intelligence"],
    ["/archive", "The daily casino archive"],
    ["/games", "Learn the rules"],
    ["/games/poker", "Poker"],
    ["/guides", "Curiosity"],
    ["/history", "How casinos became institutions"],
    ["/history/archive", "2010"],
    ["/culture", "Casino culture beyond the gaming floor"],
    ["/destinations", "Five destinations, five different systems"],
    ["/vlogs", "A transparent studio"],
    ["/facts", "Interesting does not mean context-free"],
    ["/gallery", "Images that explain"],
    ["/responsible-entertainment", "Keep the game"],
    ["/about", "Context before"],
    ["/sources", "The evidence stays in the house"],
    ["/support", "Create distance"],
    ["/privacy", "Privacy Policy"],
    ["/disclaimer", "Disclaimer"],
    ["/terms", "Terms of Use"],
    ["/search?q=casino", "Search CasinoVerse"],
  ])("renders primary %s content inside the initial HTML document", async (url, needle) => {
    const result = await htmlFor(url);
    expect(result.head.notFound).not.toBe(true);
    expect(result.document).toContain('<div id="root">');
    expect(result.document).toContain(needle);
    expect(result.document).toContain("window.__RQ_STATE__");
    expect(result.document.match(/<title>/g)).toHaveLength(1);
    expect(result.document.match(/rel="canonical"/g)).toHaveLength(1);
  });

  it("renders complete dynamic article, digest, source, and history records before hydration", async () => {
    const cases = [
      [`/articles/${story.story.slug}`, story.story.body],
      [`/archive/${digest.digest.digestDate}`, digest.digest.title],
      [`/sources/${source.slug}`, source.description],
      ["/sources/story/1", story.sources[0].sourceTitle],
      [`/history/archive/${historicalRecord.slug}`, historicalRecord.significance],
    ];
    for (const [url, needle] of cases) {
      const result = await htmlFor(url);
      expect(result.head.notFound, url).not.toBe(true);
      expect(result.document, url).toContain(needle);
      expect(result.document, url).toContain("window.__RQ_STATE__");
    }
  });

  it("marks missing HTML routes as genuine noindex 404 responses", async () => {
    const result = await htmlFor("/missing-html-page");
    expect(result.head.notFound).toBe(true);
    expect(result.document).toContain("Page not found");
    expect(result.document).toContain('name="robots" content="noindex, follow"');
  });
});
