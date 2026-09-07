import { describe, expect, it } from "vitest";
import { getPageDepth } from "./components/PageDepth";

const retainedRoutes = [
  "/", "/articles", "/articles/example-story", "/category/regulation", "/archive", "/archive/2026-09-07",
  "/games", "/games/roulette", "/guides", "/history", "/culture", "/destinations", "/facts", "/gallery",
  "/about", "/search?q=Macau", "/sources", "/sources/regulator", "/sources/story/1", "/support",
  "/responsible-entertainment", "/privacy", "/disclaimer", "/terms", "/missing-page",
];

describe("route-aware detailed editorial context", () => {
  it.each(retainedRoutes)("provides substantial, internal-only depth for %s", route => {
    const entry = getPageDepth(route);
    expect(entry.eyebrow.length).toBeGreaterThan(5);
    expect(entry.title.length).toBeGreaterThan(20);
    expect(entry.intro.length).toBeGreaterThan(120);
    expect(entry.cards).toHaveLength(3);
    entry.cards.forEach(card => {
      expect(card.title.length).toBeGreaterThan(3);
      expect(card.body.length).toBeGreaterThan(110);
    });
    expect(entry.checklist).toHaveLength(3);
    expect(entry.links).toHaveLength(3);
    entry.links.forEach(link => expect(link.href).toMatch(/^\/(?!\/)/));
  });

  it("never restores removed historical or Vlogs content in fallback guidance", () => {
    for (const route of ["/history/archive", "/history/archive/legacy", "/vlogs"]) {
      const serialized = JSON.stringify(getPageDepth(route));
      expect(serialized).not.toMatch(/2010|2026|vlog|video desk/i);
      expect(serialized).toContain("Active publication directory");
    }
  });
});
