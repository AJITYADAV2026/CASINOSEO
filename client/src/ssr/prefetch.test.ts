import { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { describe, expect, it, vi } from "vitest";
import { trpc } from "@/lib/trpc";
import { prefetchForPath, type SsrPrefetch } from "./prefetch";

function mockPrefetch(overrides: Partial<SsrPrefetch> = {}): SsrPrefetch {
  const story = {
    story: {
      id: 1,
      slug: "developing-story",
      title: "A developing market story",
      dek: "Verified context for a developing casino-industry story.",
      body: "Body text with sufficient editorial context.",
      contentType: "news" as const,
      status: "developing" as const,
      categoryId: 1,
      authorName: "CasinooVerse Research Desk",
      readingMinutes: 3,
      featuredImageUrl: "/manus-storage/story.jpg",
      featuredImageAlt: "Editorial scene",
      isLead: false,
      isFeatured: true,
      publishedAt: new Date("2026-09-03T06:00:00Z"),
      modifiedAt: new Date("2026-09-03T07:00:00Z"),
      createdAt: new Date("2026-09-03T06:00:00Z"),
      updatedAt: new Date("2026-09-03T07:00:00Z"),
    },
    category: {
      id: 1,
      slug: "market-intelligence",
      name: "Market Intelligence",
      description: "Market coverage",
      accent: "#C9A45C",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sources: [],
  };
  return {
    homepage: vi.fn().mockResolvedValue({ categories: [], stories: [], digests: [] }),
    storyBySlug: vi.fn().mockResolvedValue(story),
    categoryBySlug: vi.fn().mockResolvedValue(undefined),
    archive: vi.fn().mockResolvedValue([]),
    digestByDate: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue([]),
    sources: vi.fn().mockResolvedValue([]),
    sourceBySlug: vi.fn().mockResolvedValue(undefined),
    storySourceById: vi.fn().mockResolvedValue(undefined),
    support: vi.fn().mockResolvedValue([]),
    historicalArchive: vi.fn().mockResolvedValue([]),
    historicalRecordBySlug: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as SsrPrefetch;
}

describe("CasinooVerse SSR prefetch", () => {
  it("seeds homepage data under the exact tRPC query key", async () => {
    const qc = new QueryClient();
    const p = mockPrefetch();
    const head = await prefetchForPath("/", qc, p);
    expect(head.canonicalPath).toBe("/");
    expect(qc.getQueryData(getQueryKey(trpc.editorial.homepage, undefined, "query"))).toEqual({ categories: [], stories: [], digests: [] });
  });

  it("marks developing articles noindex while retaining article metadata", async () => {
    const qc = new QueryClient();
    const head = await prefetchForPath("/articles/developing-story", qc, mockPrefetch());
    expect(head.noindex).toBe(true);
    expect(head.ogType).toBe("article");
    expect(head.publishedTime).toBe("2026-09-03T06:00:00.000Z");
    expect(head.jsonLd?.["@type"]).toBe("NewsArticle");
  });

  it("returns a genuine notFound marker for a missing article", async () => {
    const qc = new QueryClient();
    const p = mockPrefetch({ storyBySlug: vi.fn().mockResolvedValue(undefined) });
    const head = await prefetchForPath("/articles/missing", qc, p);
    expect(head.notFound).toBe(true);
  });

  it("keeps internal search results non-indexable and seeds the exact query", async () => {
    const qc = new QueryClient();
    const p = mockPrefetch();
    const head = await prefetchForPath("/search?q=Macau", qc, p);
    expect(head.noindex).toBe(true);
    expect(p.search).toHaveBeenCalledWith("Macau");
    expect(qc.getQueryData(getQueryKey(trpc.editorial.search, { query: "Macau" }, "query"))).toEqual([]);
  });

  it("returns complete canonical and social metadata for every expanded editorial route", async () => {
    const routes = [
      "/articles", "/history", "/culture", "/destinations", "/facts", "/gallery",
      "/games/poker", "/games/blackjack", "/games/roulette", "/games/baccarat", "/games/slots",
      "/privacy", "/disclaimer", "/terms", "/sources", "/support",
    ];
    for (const route of routes) {
      const head = await prefetchForPath(route, new QueryClient(), mockPrefetch());
      expect(head.canonicalPath, route).toBe(route);
      expect(head.title.length, route).toBeGreaterThan(12);
      expect(head.description.length, route).toBeGreaterThan(60);
      expect(head.ogImage, route).toMatch(/^\/manus-storage\//);
      expect(head.notFound, route).not.toBe(true);
    }
  });

  it("emits Article structured data for all five individual game guides", async () => {
    for (const slug of ["poker", "blackjack", "roulette", "baccarat", "slots"]) {
      const head = await prefetchForPath(`/games/${slug}`, new QueryClient(), mockPrefetch());
      expect(head.jsonLd?.["@type"]).toBe("Article");
      expect(head.jsonLd?.headline).toContain(GAME_TITLE[slug]);
    }
    const missing = await prefetchForPath("/games/craps", new QueryClient(), mockPrefetch());
    expect(missing.notFound).toBe(true);
  });

  it("prefetches internal source records without creating outbound navigation metadata", async () => {
    const source = {
      id: 1,
      slug: "world-health-organization",
      name: "World Health Organization",
      publicationLabel: "Gambling Fact Sheet",
      description: "Global public-health overview of gambling harm and prevention.",
      sourceType: "health" as const,
      originalUrl: "https://www.who.int/news-room/fact-sheets/detail/gambling",
      accessedAt: new Date("2026-09-03T00:00:00Z"),
      status: "active" as const,
      createdAt: new Date("2026-09-03T00:00:00Z"),
      updatedAt: new Date("2026-09-03T00:00:00Z"),
    };
    const qc = new QueryClient();
    const head = await prefetchForPath("/sources/world-health-organization", qc, mockPrefetch({ sourceBySlug: vi.fn().mockResolvedValue(source) }));
    expect(head.canonicalPath).toBe("/sources/world-health-organization");
    expect(head.noindex).toBe(true);
    expect(head.title).toContain("World Health Organization");
    expect(qc.getQueryData(getQueryKey(trpc.editorial.sourceBySlug, { slug: source.slug }, "query"))).toEqual(source);
  });

  it.each(["/history/archive", "/history/archive/2010-pennsylvania-table-game-rules", "/vlogs"])("marks removed route %s as not found", async route => {
    const p = mockPrefetch();
    const head = await prefetchForPath(route, new QueryClient(), p);
    expect(head.notFound).toBe(true);
    expect(head.canonicalPath).toBeUndefined();
    expect(p.historicalArchive).not.toHaveBeenCalled();
    expect(p.historicalRecordBySlug).not.toHaveBeenCalled();
  });
});

const GAME_TITLE: Record<string, string> = { poker: "Poker", blackjack: "Blackjack", roulette: "Roulette", baccarat: "Baccarat", slots: "Slot Machines" };
