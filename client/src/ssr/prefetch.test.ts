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
      authorName: "CasinoVerse Research Desk",
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
    ...overrides,
  } as SsrPrefetch;
}

describe("CasinoVerse SSR prefetch", () => {
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
});
