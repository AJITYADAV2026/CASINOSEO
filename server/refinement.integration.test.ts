import { describe, expect, it } from "vitest";
import { ne } from "drizzle-orm";
import { stories } from "../drizzle/schema";
import { getDb } from "./db";

describe("refined editorial imagery", () => {
  it("assigns a distinct feature image to every current non-archived story", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    const rows = await db!.select({ slug: stories.slug, image: stories.featuredImageUrl, alt: stories.featuredImageAlt }).from(stories).where(ne(stories.status, "archived"));
    expect(rows.length).toBeGreaterThanOrEqual(14);
    expect(rows.every(row => Boolean(row.image && row.alt))).toBe(true);
    expect(new Set(rows.map(row => row.image)).size).toBe(rows.length);
  }, 20_000);
});
