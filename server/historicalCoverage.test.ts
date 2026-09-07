import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getHistoricalArchive } from "./db";
import { buildSitemapDocument } from "./publicationRoutes";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("CasinoVerse historical coverage", () => {
  it("stores one verified published record for every year from 2010 through 2026", async () => {
    const records = await getHistoricalArchive();
    const years = Array.from(new Set(records.map(record => record.eventYear))).sort((a, b) => a - b);
    expect(years).toEqual(Array.from({ length: 17 }, (_, index) => 2010 + index));
    for (const year of years) {
      expect(records.filter(record => record.eventYear === year).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps all event dates inside the requested historical boundary and preserves source provenance", async () => {
    const records = await getHistoricalArchive();
    expect(records.length).toBeGreaterThanOrEqual(17);
    records.forEach(record => {
      expect(record.verificationStatus).toBe("verified");
      expect(record.isPublished).toBe(true);
      expect(record.cutoffLabel).toBe("through-2026-09-03");
      expect(record.sourceName.length).toBeGreaterThan(3);
      expect(record.sourceTitle.length).toBeGreaterThan(8);
      expect(new URL(record.sourceUrl).protocol).toBe("https:");
      if (record.eventDate) {
        expect(record.eventDate.slice(0, 4)).toBe(String(record.eventYear));
        expect(record.eventDate <= "2026-09-03").toBe(true);
      }
    });
  });

  it("retains historical records without exposing the removed public archive routes", () => {
    const app = read("client/src/App.tsx");
    expect(app).not.toContain('path={"/history/archive"}');
    expect(app).not.toContain('path={"/history/archive/:slug"}');
    expect(fs.existsSync(path.join(root, "client/src/pages/HistoricalArchive.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(root, "client/src/pages/HistoricalRecord.tsx"))).toBe(false);
  });

  it("excludes the removed archive and milestone URLs from the site-owned sitemap", async () => {
    const records = await getHistoricalArchive();
    const xml = buildSitemapDocument("https://example.test", {
      categories: [],
      stories: [],
      digests: [],
    });
    expect(xml).not.toContain("<loc>https://example.test/history/archive</loc>");
    records.forEach(record => expect(xml).not.toContain(`<loc>https://example.test/history/archive/${record.slug}</loc>`));
  });
});
