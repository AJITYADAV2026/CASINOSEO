import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Vercel deployment contract", () => {
  it("exports the reusable Express application without replacing the Manus listener", () => {
    expect(read("server.ts")).toContain("export default app");
    expect(read("server/_core/app.ts")).toContain("createCasinoVerseApp");
    expect(read("server/_core/index.ts")).toContain("server.listen");
  });

  it("builds browser, SSR, and function assets for the Vercel runtime", () => {
    const config = JSON.parse(read("vercel.json"));
    const pkg = JSON.parse(read("package.json"));

    expect(config.framework).toBeNull();
    expect(config.buildCommand).toBe("pnpm vercel-build");
    expect(config.outputDirectory).toBe("vercel-public");
    expect(config.functions["api/index.mjs"].includeFiles).toBe(
      "{vercel-public/**,vercel-ssr/**}",
    );
    expect(config.rewrites).toContainEqual({
      source: "/(.*)",
      destination: "/api/index",
    });
    expect(pkg.scripts["vercel-build"]).toContain("prepare-vercel.mjs");
    expect(pkg.scripts["vercel-build"]).toContain("build-vercel-function.mjs");
    expect(read("scripts/prepare-vercel.mjs")).toContain("entry.name === \"index.html\"");
    expect(read("scripts/prepare-vercel.mjs")).toContain("vercel-ssr");
    expect(read("scripts/build-vercel-function.mjs")).toContain("--packages=external");
    expect(read("vercel/entry.ts")).toContain("createCasinoVerseApp");
    expect(read("vercel/entry.ts")).toContain("server/_core/staticSsr");
  });

  it("keeps the production parity audit aligned with intentionally removed public sections", () => {
    const audit = read("scripts/audit-vercel-parity.mjs");
    expect(audit).toContain('const removedSurfacePaths = ["/vlogs", "/history/archive", "/history/archive/2020-nevada-casino-shutdown"]');
    expect(audit).toContain("result.status === 404 && result.noindex");
    expect(audit).toContain("!vercelPaths.includes(path)");
    expect(audit).toContain("dynamicEvidence.searchResultsVisible < 1");
    expect(audit).not.toContain("searchResultsVisible: 3");
    expect(audit).not.toContain("historicalRecordsVisible: 17");
  });
});
