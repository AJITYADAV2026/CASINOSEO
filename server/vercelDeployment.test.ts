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
    expect(config.functions["server.ts"].includeFiles).toBe("{public/**,dist/server-ssr/**}");
    expect(pkg.scripts["vercel-build"]).toContain("prepare-vercel.mjs");
    expect(read("scripts/prepare-vercel.mjs")).toContain("cpSync(source, destination");
  });
});
