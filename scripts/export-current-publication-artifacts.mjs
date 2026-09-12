import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceOrigin = process.env.PUBLICATION_SOURCE_ORIGIN || "http://127.0.0.1:3000";
const publicationDateIst = process.argv[2];
const digestDateIst = process.argv[3];

if (!/^\d{4}-\d{2}-\d{2}$/.test(publicationDateIst || "") || !/^\d{4}-\d{2}-\d{2}$/.test(digestDateIst || "")) {
  throw new Error("Usage: node scripts/export-current-publication-artifacts.mjs YYYY-MM-DD YYYY-MM-DD");
}

async function fetchRequired(relativePath) {
  const response = await fetch(new URL(relativePath, sourceOrigin));
  if (!response.ok) {
    throw new Error(`Failed to export ${relativePath}: HTTP ${response.status}`);
  }
  return response.text();
}

const [research, siteFind, urlManifest, sitemap] = await Promise.all([
  fetchRequired(`/research/${digestDateIst}.md`),
  fetchRequired(`/site-find/${publicationDateIst}.md`),
  fetchRequired(`/url-manifests/${publicationDateIst}.md`),
  fetchRequired("/sitemap.xml"),
]);

if (!/\*\*Status:\*\*\s*Published/i.test(research)) throw new Error("Research artifact is not published");
if (!/^status:\s*["']?completed["']?\s*$/im.test(siteFind)) throw new Error("Site Find artifact is not completed");
if (!/^status:\s*["']?completed["']?\s*$/im.test(urlManifest)) throw new Error("URL manifest is not completed");

const artifactRoot = path.join(root, "publication-artifacts");
await Promise.all([
  mkdir(path.join(artifactRoot, "research"), { recursive: true }),
  mkdir(path.join(artifactRoot, "site-find"), { recursive: true }),
  mkdir(path.join(artifactRoot, "url-manifests"), { recursive: true }),
  mkdir(path.join(artifactRoot, "indexing"), { recursive: true }),
]);

await Promise.all([
  writeFile(path.join(artifactRoot, "research", `${digestDateIst}.md`), research),
  writeFile(path.join(artifactRoot, "site-find", `SITE FIND ${publicationDateIst}.md`), siteFind),
  writeFile(path.join(artifactRoot, "url-manifests", `URL+${publicationDateIst}.md`), urlManifest),
  writeFile(path.join(artifactRoot, "sitemap.xml"), sitemap),
]);

const latestRun = {
  publicationDateIst,
  digestDateIst,
  sourceOrigin,
  researchArtifact: `publication-artifacts/research/${digestDateIst}.md`,
  siteFindArtifact: `publication-artifacts/site-find/SITE FIND ${publicationDateIst}.md`,
  urlManifestArtifact: `publication-artifacts/url-manifests/URL+${publicationDateIst}.md`,
  indexingArtifact: `publication-artifacts/indexing/INDEXING-URLS-${publicationDateIst}.md`,
  sitemapSnapshot: "publication-artifacts/sitemap.xml",
};

await writeFile(path.join(artifactRoot, "latest-run.json"), `${JSON.stringify(latestRun, null, 2)}\n`);

console.log(JSON.stringify({
  exported: true,
  publicationDateIst,
  digestDateIst,
  sourceOrigin,
  sitemapBytes: Buffer.byteLength(sitemap),
}, null, 2));
