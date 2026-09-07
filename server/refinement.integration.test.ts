import { describe, expect, it } from "vitest";
import { ne } from "drizzle-orm";
import { stories } from "../drizzle/schema";
import { EXPANDED_IMAGES } from "../client/src/lib/expandedContent";
import * as site from "../client/src/lib/site";
import { getDb } from "./db";

describe("refined editorial imagery", () => {
  it("assigns a distinct feature image to every current non-archived story", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    const rows = await db!.select({ slug: stories.slug, image: stories.featuredImageUrl, alt: stories.featuredImageAlt }).from(stories).where(ne(stories.status, "archived"));
    expect(rows.length).toBeGreaterThanOrEqual(14);
    expect(rows.every(row => Boolean(row.image && row.alt))).toBe(true);
    expect(new Set(rows.map(row => row.image)).size).toBe(rows.length);
    const staticImages = [
      ...Object.entries(site).filter(([name, value]) => name.endsWith("_IMAGE") && typeof value === "string").map(([, value]) => value as string),
      ...Object.values(EXPANDED_IMAGES),
    ];
    expect(rows.filter(row => row.image && staticImages.includes(row.image))).toEqual([]);
  }, 20_000);
});
