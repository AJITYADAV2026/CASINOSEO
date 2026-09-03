import { describe, expect, it } from "vitest";

describe("CasinoVerse production environment", () => {
  it("serves robots directives from the configured canonical origin", async () => {
    const origin = process.env.CANONICAL_ORIGIN;
    expect(origin).toBe("https://casinonews-flgw988r.manus.space");
    const response = await fetch("http://localhost:3000/robots.txt");
    expect(response.ok).toBe(true);
    const body = await response.text();
    expect(body).toContain(`Sitemap: ${origin}/sitemap.xml`);
    expect(body).toContain(`Sitemap: ${origin}/news-sitemap.xml`);
  }, 15_000);
});
