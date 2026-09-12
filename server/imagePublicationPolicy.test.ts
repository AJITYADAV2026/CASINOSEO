import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { KNOWN_TYPOGRAPHY_IMAGE_URLS, isKnownTypographyImage } from "./imagePublicationPolicy";

describe("public image typography policy", () => {
  const mappingPath = path.resolve(process.cwd(), "scripts/textfree-image-replacements.json");
  const replacements = JSON.parse(fs.readFileSync(mappingPath, "utf8")) as Record<string, string>;

  it("blocks every visually verified typography-bearing legacy image", () => {
    expect(KNOWN_TYPOGRAPHY_IMAGE_URLS.size).toBeGreaterThanOrEqual(30);
    expect(Object.keys(replacements)).toHaveLength(30);
    for (const oldUrl of Object.keys(replacements)) {
      expect(isKnownTypographyImage(oldUrl)).toBe(true);
    }
  });

  it("allows every unique text-free replacement URL", () => {
    const replacementUrls = Object.values(replacements);
    expect(new Set(replacementUrls).size).toBe(replacementUrls.length);
    for (const url of replacementUrls) {
      expect(url).toContain("casinooverse-textfree-");
      expect(isKnownTypographyImage(url)).toBe(false);
    }
  });

  it("keeps the Agent 3 fail-closed typography check before duplicate-image publication", () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), "server/pageCreation.ts"), "utf8");
    expect(source).toContain("isKnownTypographyImage(resolved.story.featuredImageUrl)");
    expect(source.indexOf("isKnownTypographyImage(resolved.story.featuredImageUrl)")).toBeLessThan(source.indexOf("const [imageConflict]"));
    expect(source).toContain("verified embedded-typography blocklist");
  });
});
