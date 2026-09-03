import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;
const ctx = {
  user: null,
  req: { protocol: "https", headers: {} },
  res: {},
} as TrpcContext;

describeWithDb("CasinoVerse public editorial data", () => {
  it("returns categories, current stories, and dated digests for the homepage", async () => {
    const data = await appRouter.createCaller(ctx).editorial.homepage();
    expect(data.categories.length).toBeGreaterThanOrEqual(6);
    expect(data.stories.some(item => item.story.isLead)).toBe(true);
    expect(data.digests.map(item => item.digestDate)).toContain("2026-09-02");
  });

  it("preserves visible outbound source attribution on a research article", async () => {
    const data = await appRouter.createCaller(ctx).editorial.storyBySlug({
      slug: "prediction-markets-state-authority-supreme-court",
    });
    expect(data?.category.slug).toBe("regulation");
    expect(data?.sources.length).toBeGreaterThanOrEqual(2);
    expect(data?.sources.every(source => source.sourceUrl.startsWith("https://"))).toBe(true);
  });

  it("returns the ordered story collection for a daily archive edition", async () => {
    const data = await appRouter.createCaller(ctx).editorial.digestByDate({ date: "2026-09-02" });
    expect(data?.digest.status).toBe("published");
    expect(data?.stories.length).toBeGreaterThanOrEqual(5);
    expect(data?.stories[0]?.position).toBe(1);
  });

  it("searches across story titles and summaries", async () => {
    const data = await appRouter.createCaller(ctx).editorial.search({ query: "Macau" });
    expect(data.length).toBeGreaterThan(0);
    expect(data.some(item => `${item.story.title} ${item.story.dek}`.includes("Macau"))).toBe(true);
  });
});
