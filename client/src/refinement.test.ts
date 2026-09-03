import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("multi-page refinement", () => {
  it("uses distinct generated hero images for every major page family", () => {
    const source = read("client/src/lib/site.ts");
    const heroNames = ["HERO_IMAGE", "GAMES_HERO_IMAGE", "GUIDES_HERO_IMAGE", "RESPONSIBLE_HERO_IMAGE", "ABOUT_HERO_IMAGE", "ARCHIVE_HERO_IMAGE", "SEARCH_HERO_IMAGE"];
    const urls = heroNames.map(name => source.match(new RegExp(`export const ${name} = \"([^\"]+)\"`))?.[1]);
    expect(urls.every(Boolean)).toBe(true);
    expect(new Set(urls).size).toBe(heroNames.length);
  });

  it("connects major evergreen pages to authoritative research references", () => {
    const combined = ["Home.tsx", "Games.tsx", "Guides.tsx", "ResponsibleEntertainment.tsx", "About.tsx", "Archive.tsx", "Category.tsx"]
      .map(file => read(`client/src/pages/${file}`))
      .join("\n");
    for (const authority of ["who.int", "ncpgambling.org", "gaming.az.gov", "gamblingcommission.gov.uk", "gaming.nv.gov", "fincen.gov", "thetrustproject.org", "spj.org"]) {
      expect(combined).toContain(authority);
    }
  });

  it("keeps consent UI global and analytics absent from the static HTML shell", () => {
    expect(read("client/src/components/SiteShell.tsx")).toContain("<CookieConsent />");
    expect(read("client/index.html")).not.toContain("data-website-id");
    expect(read("client/src/components/CookieConsent.tsx")).toContain("Accept analytics");
    expect(read("client/src/components/CookieConsent.tsx")).toContain("Essential only");
  });
});
