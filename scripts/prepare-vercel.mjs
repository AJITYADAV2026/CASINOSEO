import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const source = resolve(projectRoot, "dist", "public");
const destination = resolve(projectRoot, "public");

if (!existsSync(resolve(source, "index.html"))) {
  throw new Error("Vercel preparation failed: dist/public/index.html was not built");
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });

console.log("Prepared Vercel CDN assets in public/");
