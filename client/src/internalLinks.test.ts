import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { internalReferencePath } from "@/lib/internalSources";

const projectRoot = path.resolve(import.meta.dirname, "../..");

function tsxFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return tsxFiles(absolute);
    return entry.name.endsWith(".tsx") ? [absolute] : [];
  });
}

describe("CasinoVerse same-domain navigation", () => {
  it("maps representative external provenance addresses to internal source records", () => {
    const examples = [
      ["World Health Organization", "https://www.who.int/news-room/fact-sheets/detail/gambling", "/sources/world-health-organization"],
      ["UK Gambling Commission", "https://www.gamblingcommission.gov.uk/statistics-and-research/publication/industry-statistics", "/sources/uk-gambling-commission-statistics"],
      ["W3C Web Accessibility Initiative", "https://www.w3.org/WAI/media/av/", "/sources/w3c-media-accessibility"],
      ["CasinoVerse editorial standards", "/about#standards", "/about#standards"],
    ] as const;
    examples.forEach(([name, address, expected]) => expect(internalReferencePath(name, address)).toBe(expected));
  });

  it("contains no public outbound anchor, blank-target redirect, or external form action", () => {
    const directories = [path.join(projectRoot, "client/src/pages"), path.join(projectRoot, "client/src/components")];
    const violations = directories.flatMap(tsxFiles).flatMap(file => {
      const source = fs.readFileSync(file, "utf8");
      const patterns = [/<a\b[^>]*href=["']https?:\/\//i, /target=["']_blank["']/i, /<form\b[^>]*action=["']https?:\/\//i];
      return patterns.some(pattern => pattern.test(source)) ? [path.relative(projectRoot, file)] : [];
    });
    expect(violations).toEqual([]);
  });

  it("registers the database-backed internal source and support routes", () => {
    const app = fs.readFileSync(path.join(projectRoot, "client/src/App.tsx"), "utf8");
    ["/sources", "/sources/:slug", "/sources/story/:id", "/support"].forEach(route => expect(app).toContain(route));
    const schema = fs.readFileSync(path.join(projectRoot, "drizzle/schema.ts"), "utf8");
    expect(schema).toContain('"source_catalog"');
    expect(schema).toContain('"support_resources"');
  });
});
