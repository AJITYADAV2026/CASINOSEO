import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildSitemapDocument } from "./publicationRoutes";
import { getDb } from "./db";
import { editorialInquiries, newsletterSubscribers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");

describe("expanded multi-page publication", () => {
  it("registers every expanded route and article-led page", () => {
    const app = read("client/src/App.tsx");
    const routes = ["/articles", "/games/:slug", "/history", "/culture", "/destinations", "/vlogs", "/facts", "/gallery", "/privacy", "/disclaimer", "/terms"];
    routes.forEach(route => expect(app).toContain(`path={\"${route}\"}`));
  });

  it("includes every expanded public route in the dynamic sitemap", () => {
    const xml = buildSitemapDocument("https://example.test", { categories: [], stories: [], digests: [] });
    const routes = ["/articles", "/games/poker", "/games/blackjack", "/games/roulette", "/games/baccarat", "/games/slots", "/history", "/culture", "/destinations", "/vlogs", "/facts", "/gallery", "/privacy", "/disclaimer", "/terms"];
    routes.forEach(route => expect(xml).toContain(`<loc>https://example.test${route}</loc>`));
    expect(xml).not.toContain("/search</loc>");
  });

  it("uses distinct expanded hero and gallery assets", () => {
    const assets = read("client/src/lib/expandedContent.ts");
    const values = [...assets.matchAll(/:\s*"(\/manus-storage\/[^"]+)"/g)].map(match => match[1]);
    expect(values).toHaveLength(20);
    expect(new Set(values).size).toBe(values.length);
  });

  it("keeps every expanded page informative and source-visible", () => {
    const pages = ["Articles", "GameDetail", "History", "Culture", "Destinations", "Vlogs", "Facts", "Gallery"];
    pages.forEach(page => {
      const source = read(`client/src/pages/${page}.tsx`);
      expect(source).toContain("<h1");
      expect(source).toContain("ResearchReferences");
    });
    const vlogs = read("client/src/pages/Vlogs.tsx");
    expect(vlogs).toContain("has not published original video episodes yet");
    expect(vlogs).not.toMatch(/views|subscribers/i);
    const gallery = read("client/src/pages/Gallery.tsx");
    expect(gallery.match(/Editorial illustration/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("implements the required article-led composition on every new page family", () => {
    const articles = read("client/src/pages/Articles.tsx");
    ["Editor’s selection", "Complete desk", "filter-chip", "Search the publication"].forEach(value => expect(articles).toContain(value));

    const game = read("client/src/pages/GameDetail.tsx");
    ["A measured history", "Concepts before terminology", "Plain-language glossary", "What the numbers mean", "Related reading", "Responsible entertainment"].forEach(value => expect(game).toContain(value));

    const history = read("client/src/pages/History.tsx");
    expect(history).toContain("timeline.map");
    expect(history).toContain("index % 2");
    expect(history).toContain("What the timeline does not claim");

    const culture = read("client/src/pages/Culture.tsx");
    ["Architecture as identity", "Art and atmosphere", "Dress and etiquette", "Film and mythology", "Places that shaped the visual language"].forEach(value => expect(culture).toContain(value));

    const destinations = read("client/src/pages/Destinations.tsx");
    ["Las Vegas", "Macau", "Monte Carlo", "Singapore", "Atlantic City", "Related reporting"].forEach(value => expect(destinations).toContain(value));

    const vlogs = read("client/src/pages/Vlogs.tsx");
    ["Video desk", "Planned formats", "No published episodes", "Captions and transcripts", "Source disclosure"].forEach(value => expect(vlogs).toContain(value));
  });

  it("implements gallery filtering and an accessible controlled lightbox", () => {
    const gallery = read("client/src/pages/Gallery.tsx");
    expect(gallery).toContain("setFilter(category)");
    expect(gallery).toContain("setSelected(item)");
    expect(gallery).toContain("<Dialog open={Boolean(selected)}");
    expect(gallery).toContain("onOpenChange");
    expect(gallery).toContain("DialogDescription");
    expect(gallery).toContain("Escape closes the dialog");
  });

  it("documents analytics, newsletter, informational-only, and external-link boundaries", () => {
    const legal = read("client/src/pages/LegalPages.tsx");
    expect(legal).toContain("does not load until a visitor selects Accept analytics");
    expect(legal).toContain("not a casino, wagering service");
    expect(legal).toContain("Links are provided for evidence");
    expect(legal).toContain("newsletter email address");
    expect(legal).not.toContain("casinoverse.example");
  });

  it("renders five separate game guides with unique visuals and responsible language", () => {
    const source = read("client/src/lib/gameGuides.ts");
    ["poker", "blackjack", "roulette", "baccarat", "slots"].forEach(slug => expect(source).toContain(`${slug}: {`));
    expect(source.match(/image: EXPANDED_IMAGES\./g)).toHaveLength(5);
    expect(source.match(/caveat:/g)?.length).toBeGreaterThanOrEqual(5);
  });
});

describe("newsletter persistence", () => {
  it("stores normalized consented subscriptions without duplicate rows", async () => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_URL is required for this test");
    const email = `expanded-test-${Date.now()}@example.test`;
    await db.transaction(async tx => {
      await tx.insert(newsletterSubscribers).values({ email, status: "active", source: "homepage-editorial-briefing" });
      await tx.insert(newsletterSubscribers).values({ email, status: "active", source: "homepage-editorial-briefing" }).onDuplicateKeyUpdate({ set: { status: "active", consentAt: new Date() } });
      const rows = await tx.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
      expect(rows).toHaveLength(1);
      expect(rows[0]?.status).toBe("active");
      throw new Error("ROLLBACK_EXPANDED_NEWSLETTER_TEST");
    }).catch(error => {
      if (!(error instanceof Error) || error.message !== "ROLLBACK_EXPANDED_NEWSLETTER_TEST") throw error;
    });
    const persisted = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    expect(persisted).toHaveLength(0);
  }, 15_000);
});

describe("editorial contact persistence", () => {
  it("stores one consented inquiry and rejects an exact duplicate key", async () => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_URL is required for this test");
    const seed = `${Date.now()}-contact`;
    const dedupeKey = seed.padEnd(64, "0").slice(0, 64);
    await db.transaction(async tx => {
      await tx.insert(editorialInquiries).values({ name: "Expanded Test", email: `${seed}@example.test`, topic: "correction", message: "A sufficiently detailed editorial correction message for rollback validation.", dedupeKey });
      const rows = await tx.select().from(editorialInquiries).where(eq(editorialInquiries.dedupeKey, dedupeKey));
      expect(rows).toHaveLength(1);
      expect(rows[0]?.status).toBe("new");
      await expect(tx.insert(editorialInquiries).values({ name: "Expanded Test", email: `${seed}@example.test`, topic: "correction", message: "A duplicate message.", dedupeKey })).rejects.toThrow();
      throw new Error("ROLLBACK_EXPANDED_CONTACT_TEST");
    }).catch(error => {
      if (!(error instanceof Error) || error.message !== "ROLLBACK_EXPANDED_CONTACT_TEST") throw error;
    });
    const persisted = await db.select().from(editorialInquiries).where(eq(editorialInquiries.dedupeKey, dedupeKey));
    expect(persisted).toHaveLength(0);
  }, 15_000);
});
