import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("CasinooVerse public branding", () => {
  it("uses the new brand in central client and SSR metadata", () => {
    expect(read("client/src/lib/site.ts")).toContain('export const SITE_NAME = "CasinooVerse"');
    expect(read("server/_core/staticSsr.ts")).toContain('const SITE_NAME = process.env.SITE_NAME ?? "CasinooVerse"');
    expect(read("client/index.html")).toContain('title="CasinooVerse RSS"');
  });

  it("publishes Sikkim, India without retaining the superseded regional location", () => {
    const locationSurfaces = [
      read("client/src/components/SiteShell.tsx"),
      read("client/src/pages/About.tsx"),
      read("client/src/pages/LegalPages.tsx"),
    ].join("\n");
    const supersededLocation = ["As", "sam"].join("");
    expect(locationSurfaces).toContain("Sikkim, India");
    expect(locationSurfaces).not.toContain(supersededLocation);
  });

  it("keeps the public runtime free of the old display brand", () => {
    const publicRuntime = [
      read("client/src/components/SiteShell.tsx"),
      read("client/src/components/PageDepth.tsx"),
      read("client/src/pages/Home.tsx"),
      read("client/src/ssr/prefetch.ts"),
      read("server/publicationRoutes.ts"),
    ].join("\n");
    expect(publicRuntime).not.toMatch(/CasinoVerse(?!App)/);
  });
});
