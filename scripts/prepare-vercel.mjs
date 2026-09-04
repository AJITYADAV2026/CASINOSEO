import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const source = resolve(projectRoot, "dist", "public");
const publicOutput = resolve(projectRoot, "vercel-public");
const runtimeOutput = resolve(projectRoot, "vercel-ssr");

if (!existsSync(resolve(source, "index.html"))) {
  throw new Error("Vercel preparation failed: dist/public/index.html was not built");
}

rmSync(publicOutput, { recursive: true, force: true });
rmSync(runtimeOutput, { recursive: true, force: true });
mkdirSync(publicOutput, { recursive: true });
mkdirSync(runtimeOutput, { recursive: true });

for (const entry of readdirSync(source, { withFileTypes: true })) {
  if (entry.name === "index.html") continue;
  cpSync(resolve(source, entry.name), resolve(publicOutput, entry.name), {
    recursive: true,
  });
}

cpSync(resolve(source, "index.html"), resolve(runtimeOutput, "index.html"));
cpSync(
  resolve(projectRoot, "dist", "server-ssr"),
  resolve(runtimeOutput, "server-ssr"),
  { recursive: true },
);

console.log("Prepared Vercel public assets in vercel-public/");
console.log("Prepared private SSR runtime assets in vercel-ssr/");
