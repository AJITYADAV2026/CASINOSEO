import { writeFile } from "node:fs/promises";

const VERCEL_ORIGIN = process.env.VERCEL_ORIGIN || "https://casinoseo.vercel.app";
const MANUS_ORIGIN = process.env.MANUS_ORIGIN || "https://casinonews-flgw988r.manus.space";
const OUTPUT = process.env.AUDIT_OUTPUT || "/tmp/casinoverse-vercel-parity.json";
const REQUEST_TIMEOUT_MS = Number(process.env.AUDIT_TIMEOUT_MS || 30_000);

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value) {
  return decodeEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ").trim();
}

function firstTagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function attrValues(html, tag, attr) {
  const values = [];
  const tagPattern = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  for (const tagMatch of html.matchAll(tagPattern)) {
    const attrMatch = tagMatch[0].match(new RegExp(`\\b${attr}\\s*=\\s*["']([^"']+)["']`, "i"));
    if (attrMatch?.[1]) values.push(decodeEntities(attrMatch[1]));
  }
  return values;
}

function normalizePath(url) {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.search}`;
}

async function fetchResource(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          "user-agent": "CasinoVerse production parity audit/1.0",
          ...(options.headers || {}),
        },
      });
      const body = Buffer.from(await response.arrayBuffer());
      return {
        url,
        status: response.status,
        contentType: response.headers.get("content-type") || "",
        location: response.headers.get("location"),
        body,
        text: body.toString("utf8"),
      };
    } catch (error) {
      lastError = error;
      if (attempt === 1) await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

function sitemapPaths(xml) {
  const paths = [];
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
    const path = normalizePath(decodeEntities(match[1]));
    if (!paths.includes(path)) paths.push(path);
  }
  return paths;
}

function publicNavigationAudit(html, origin) {
  const failures = [];
  for (const href of attrValues(html, "a", "href")) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const resolved = new URL(href, origin);
    if (!/^https?:$/.test(resolved.protocol)) continue;
    if (resolved.origin !== origin) failures.push(href);
  }
  return failures;
}

function addAsset(assets, value, baseUrl, kind) {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return;
  const resolved = new URL(value, baseUrl);
  if (resolved.origin !== VERCEL_ORIGIN) return;
  const key = resolved.href;
  const existing = assets.get(key);
  if (!existing || existing === "other") assets.set(key, kind);
}

function collectAssets(assets, html, pageUrl) {
  for (const src of attrValues(html, "img", "src")) addAsset(assets, src, pageUrl, "image");
  for (const srcset of attrValues(html, "img", "srcset")) {
    for (const candidate of srcset.split(",")) addAsset(assets, candidate.trim().split(/\s+/)[0], pageUrl, "image");
  }
  for (const src of attrValues(html, "script", "src")) addAsset(assets, src, pageUrl, "javascript");
  for (const linkMatch of html.matchAll(/<link\b[^>]*>/gi)) {
    const href = linkMatch[0].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    const rel = linkMatch[0].match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
    if (!href) continue;
    if (rel.includes("stylesheet")) addAsset(assets, href, pageUrl, "css");
    else if (rel.includes("icon")) addAsset(assets, href, pageUrl, "image");
  }
}

function contentTypeMatches(kind, contentType) {
  if (kind === "image") return contentType.startsWith("image/");
  if (kind === "css") return contentType.includes("text/css");
  if (kind === "javascript") return /javascript|ecmascript/.test(contentType);
  return true;
}

async function mapWithConcurrency(items, concurrency, task) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        output[index] = await task(items[index], index);
      } catch (error) {
        const item = items[index];
        output[index] = {
          ...(typeof item === "string" ? { path: item } : item),
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return output;
}

const startedAt = new Date().toISOString();
const [vercelSitemap, manusSitemap] = await Promise.all([
  fetchResource(`${VERCEL_ORIGIN}/sitemap.xml`),
  fetchResource(`${MANUS_ORIGIN}/sitemap.xml`),
]);

const vercelPaths = sitemapPaths(vercelSitemap.text);
const manusPaths = sitemapPaths(manusSitemap.text);
const sitemapParity = {
  vercelCount: vercelPaths.length,
  manusCount: manusPaths.length,
  missingOnVercel: manusPaths.filter(path => !vercelPaths.includes(path)),
  extraOnVercel: vercelPaths.filter(path => !manusPaths.includes(path)),
};

const routePairs = await mapWithConcurrency(vercelPaths, 6, async path => {
  const [vercel, manus] = await Promise.all([
    fetchResource(`${VERCEL_ORIGIN}${path}`),
    fetchResource(`${MANUS_ORIGIN}${path}`),
  ]);
  const vercelText = stripTags(vercel.text);
  const manusText = stripTags(manus.text);
  const titleVercel = firstTagText(vercel.text, "title");
  const titleManus = firstTagText(manus.text, "title");
  const h1Vercel = firstTagText(vercel.text, "h1");
  const h1Manus = firstTagText(manus.text, "h1");
  return {
    path,
    vercelStatus: vercel.status,
    manusStatus: manus.status,
    vercelContentType: vercel.contentType,
    manusContentType: manus.contentType,
    titleVercel,
    titleManus,
    h1Vercel,
    h1Manus,
    vercelTextLength: vercelText.length,
    manusTextLength: manusText.length,
    titleMatches: titleVercel === titleManus && Boolean(titleVercel),
    h1Matches: h1Vercel === h1Manus && Boolean(h1Vercel),
    meaningfulContent: vercelText.length >= 300 && manusText.length >= 300,
    externalNavigationLinks: publicNavigationAudit(vercel.text, VERCEL_ORIGIN),
    vercelHtml: vercel.text,
  };
});

const routeFailures = routePairs.filter(route =>
  route.error ||
  route.vercelStatus !== 200 ||
  route.manusStatus !== 200 ||
  !route.vercelContentType?.includes("text/html") ||
  !route.manusContentType?.includes("text/html") ||
  !route.titleMatches ||
  !route.h1Matches ||
  !route.meaningfulContent ||
  route.externalNavigationLinks?.length,
);

const assets = new Map();
for (const route of routePairs) {
  if (!route.error) collectAssets(assets, route.vercelHtml, `${VERCEL_ORIGIN}${route.path}`);
}
for (const asset of ["/robots.txt", "/news-sitemap.xml", "/rss.xml"]) addAsset(assets, asset, VERCEL_ORIGIN, "other");

const assetEntries = [...assets.entries()].map(([url, kind]) => ({ url, kind }));
const assetResults = await mapWithConcurrency(assetEntries, 8, async asset => {
  const response = await fetchResource(asset.url);
  return {
    ...asset,
    status: response.status,
    contentType: response.contentType,
    bytes: response.body.length,
    validContentType: contentTypeMatches(asset.kind, response.contentType),
  };
});
const assetFailures = assetResults.filter(asset => asset.error || asset.status !== 200 || !asset.validContentType || asset.bytes === 0);

const byPath = Object.fromEntries(routePairs.filter(route => !route.error).map(route => [route.path, route]));
const historyText = stripTags(byPath["/history/archive"]?.vercelHtml || "");
const sourcesText = stripTags(byPath["/sources"]?.vercelHtml || "");
const historyMatch = historyText.match(/(\d+)\s+of\s+(\d+)\s+records/i);
const sourcesMatch = sourcesText.match(/(\d+)\s+active internal records/i);
const supportCount = (byPath["/support"]?.vercelHtml.match(/class=["'][^"']*support-directory-card/g) || []).length;
const search = await fetchResource(`${VERCEL_ORIGIN}/search?q=Macau`);
const searchText = stripTags(search.text);
const searchCountMatch = searchText.match(/(\d+)\s+stories\s+for\s+[“\"]\s*Macau\s*[”\"]/i);
const articlePath = vercelPaths.find(path => path.startsWith("/articles/"));
const imageAsset = assetResults.find(asset => asset.kind === "image" && asset.url.includes("/manus-storage/"));

const exposurePaths = [
  "/api/index.mjs",
  "/dist/index.js",
  "/vercel-ssr/index.html",
  "/vercel-public/index.html",
  "/server/_core/index.ts",
];
const exposureResults = await mapWithConcurrency(exposurePaths, 5, async path => {
  const response = await fetchResource(`${VERCEL_ORIGIN}${path}`);
  return {
    path,
    status: response.status,
    contentType: response.contentType,
    containsServerMarker: /createApp|server\/_core|init_sdk|express\(\)/.test(response.text),
  };
});

const dynamicEvidence = {
  homepageStatus: byPath["/"]?.vercelStatus,
  homepageArticleLinks: new Set(attrValues(byPath["/"]?.vercelHtml || "", "a", "href").filter(href => href.startsWith("/articles/"))).size,
  representativeArticle: articlePath,
  representativeArticleStatus: articlePath ? byPath[articlePath]?.vercelStatus : undefined,
  historicalRecordsVisible: historyMatch ? Number(historyMatch[2]) : 0,
  sourceRecordsVisible: sourcesMatch ? Number(sourcesMatch[1]) : 0,
  supportRecordsVisible: supportCount,
  searchQuery: "Macau",
  searchStatus: search.status,
  searchResultsVisible: searchCountMatch ? Number(searchCountMatch[1]) : 0,
  sitemapStatus: vercelSitemap.status,
  sitemapRoutes: vercelPaths.length,
  representativeImage: imageAsset ? { url: imageAsset.url, status: imageAsset.status, contentType: imageAsset.contentType } : null,
};

const expectedDynamicEvidence = {
  historicalRecordsVisible: 17,
  sourceRecordsVisible: 35,
  supportRecordsVisible: 5,
  searchResultsVisible: 3,
};
const dynamicFailures = Object.entries(expectedDynamicEvidence)
  .filter(([key, expected]) => dynamicEvidence[key] !== expected)
  .map(([key, expected]) => ({ key, expected, actual: dynamicEvidence[key] }));

const summary = {
  startedAt,
  completedAt: new Date().toISOString(),
  vercelOrigin: VERCEL_ORIGIN,
  manusOrigin: MANUS_ORIGIN,
  sitemapParity,
  routesChecked: routePairs.length,
  routeFailures: routeFailures.map(({ vercelHtml, ...failure }) => failure),
  assetsChecked: assetResults.length,
  publicationImagesChecked: assetResults.filter(asset => asset.kind === "image" && asset.url?.includes("/manus-storage/")).length,
  assetFailures,
  dynamicEvidence,
  dynamicFailures,
  exposureResults,
  passed:
    vercelSitemap.status === 200 &&
    manusSitemap.status === 200 &&
    sitemapParity.vercelCount === 55 &&
    sitemapParity.missingOnVercel.length === 0 &&
    sitemapParity.extraOnVercel.length === 0 &&
    routeFailures.length === 0 &&
    assetFailures.length === 0 &&
    dynamicFailures.length === 0 &&
    search.status === 200 &&
    exposureResults.every(result => !result.error && result.status === 404 && !result.containsServerMarker),
};

await writeFile(OUTPUT, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  output: OUTPUT,
  passed: summary.passed,
  routesChecked: summary.routesChecked,
  routeFailureCount: summary.routeFailures.length,
  assetsChecked: summary.assetsChecked,
  publicationImagesChecked: summary.publicationImagesChecked,
  assetFailureCount: summary.assetFailures.length,
  dynamicEvidence: summary.dynamicEvidence,
  dynamicFailureCount: summary.dynamicFailures.length,
  exposureResults: summary.exposureResults,
}, null, 2));

if (!summary.passed) process.exitCode = 1;
