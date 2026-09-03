import fs from "node:fs/promises";
import path from "node:path";
import { getUrlManifestByDate } from "../server/db";

const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
  throw new Error("Usage: pnpm exec tsx scripts/export-url-manifest.ts YYYY-MM-DD");
}

const manifest = await getUrlManifestByDate(date);
if (!manifest) throw new Error(`No URL manifest exists for ${date}`);
const directory = path.resolve(import.meta.dirname, "..", "content", "urls");
const filePath = path.join(directory, `url-${date}.md`);
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(filePath, manifest.markdownArtifact, "utf8");
console.log(JSON.stringify({ filePath, bytes: Buffer.byteLength(manifest.markdownArtifact), status: manifest.status }, null, 2));
process.exit(0);
