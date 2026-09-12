import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const origin = process.env.AUDIT_ORIGIN || "https://casinoseo.vercel.app";
const outputDir = process.env.AUDIT_OUTPUT_DIR || "/tmp/casinooverse-live-image-audit";

const decode = value => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match ? decode(match[1]) : "";
};

const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`Sitemap failed: HTTP ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map(match => new URL(match[1]).pathname)
  .filter((route, index, all) => all.indexOf(route) === index);

const inventory = new Map();

for (const route of routes) {
  const response = await fetch(new URL(route, origin));
  if (!response.ok) throw new Error(`Route failed: ${route} HTTP ${response.status}`);
  const html = await response.text();

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = attr(tag, "src");
    if (!src) continue;
    const url = new URL(src, origin).href;
    const entry = inventory.get(url) || { url, contexts: [] };
    entry.contexts.push({ route, element: "img", alt: attr(tag, "alt") });
    inventory.set(url, entry);
  }

  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const property = attr(tag, "property");
    if (property !== "og:image") continue;
    const content = attr(tag, "content");
    if (!content) continue;
    const url = new URL(content, origin).href;
    const entry = inventory.get(url) || { url, contexts: [] };
    entry.contexts.push({ route, element: "og:image", alt: "" });
    inventory.set(url, entry);
  }
}

await mkdir(outputDir, { recursive: true });
const records = [];
let index = 0;

for (const entry of inventory.values()) {
  index += 1;
  const response = await fetch(entry.url);
  if (!response.ok) throw new Error(`Image failed: ${entry.url} HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const extension = contentType.includes("png") ? "png" : contentType.includes("svg") ? "svg" : "webp";
  const fileName = `${String(index).padStart(3, "0")}.${extension}`;
  const filePath = path.join(outputDir, fileName);
  await writeFile(filePath, bytes);
  records.push({
    ...entry,
    filePath,
    contentType,
    bytes: bytes.length,
  });
}

const inventoryPath = path.join(outputDir, "inventory.json");
await writeFile(inventoryPath, `${JSON.stringify({ origin, routes, records }, null, 2)}\n`);

console.log(JSON.stringify({
  origin,
  routeCount: routes.length,
  imageCount: records.length,
  inventoryPath,
}, null, 2));
