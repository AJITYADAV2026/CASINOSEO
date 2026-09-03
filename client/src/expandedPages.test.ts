import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GAME_GUIDES } from "./lib/gameGuides";
import { EXPANDED_IMAGES } from "./lib/expandedContent";

const root = path.resolve(import.meta.dirname, "..", "..");
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");

describe("expanded editorial content", () => {
  it("provides complete, unique game guide records", () => {
    expect(Object.keys(GAME_GUIDES)).toEqual(["poker", "blackjack", "roulette", "baccarat", "slots"]);
    const images = Object.values(GAME_GUIDES).map(guide => guide.image);
    expect(new Set(images).size).toBe(5);
    Object.values(GAME_GUIDES).forEach(guide => {
      expect(guide.history.length).toBeGreaterThanOrEqual(4);
      expect(guide.concepts.length).toBeGreaterThanOrEqual(4);
      expect(guide.sources.length).toBeGreaterThanOrEqual(3);
      expect(guide.caveat.length).toBeGreaterThan(50);
    });
  });

  it("keeps the navigation and homepage article-led", () => {
    const shell = read("client/src/components/SiteShell.tsx");
    ["Blog", "Games", "History", "Culture", "Destinations", "Vlogs", "Facts", "Gallery", "About"].forEach(label => expect(shell).toContain(label));
    const home = read("client/src/pages/Home.tsx");
    expect(home).toContain("Editorial briefing");
    expect(home).toContain("The Blog in your inbox");
    expect(home).toContain("No bonuses, betting offers, or affiliate promotions");
  });

  it("labels written editorial work as Blog and reserves Vlog for genuine video", () => {
    const articles = read("client/src/pages/Articles.tsx");
    expect(articles).toContain('<Seo title="Blog"');
    expect(articles).toContain('<span className="format-label">Blog</span>');

    const article = read("client/src/pages/Article.tsx");
    expect(article).toContain('data.story.contentType === "video" ? "Vlog" : "Blog"');

    const vlogs = read("client/src/pages/Vlogs.tsx");
    expect(vlogs).toContain("No published episodes");
    expect(vlogs).toContain("Captions and transcripts");
  });

  it("restores Gallery focus to the originating card after the lightbox closes", () => {
    const gallery = read("client/src/pages/Gallery.tsx");
    expect(gallery).toContain("lastTriggerRef.current = event.currentTarget");
    expect(gallery).toContain("onCloseAutoFocus");
    expect(gallery).toContain("lastTriggerRef.current?.focus()");
  });

  it("keeps all twenty new image assignments unique", () => {
    const values = Object.values(EXPANDED_IMAGES);
    expect(values).toHaveLength(20);
    expect(new Set(values).size).toBe(values.length);
    ["articles", "history", "culture", "destinations", "vlogs"].forEach(key => {
      expect(EXPANDED_IMAGES[key as keyof typeof EXPANDED_IMAGES]).toContain("-v4_");
    });
  });
});
