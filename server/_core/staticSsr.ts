import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import superjson from "superjson";
import type { HeadMeta } from "../../client/src/ssr/prefetch";
import { buildSsrPrefetch } from "./ssrCaller";

const CANONICAL_ORIGIN = (process.env.CANONICAL_ORIGIN ?? "").replace(/\/$/, "");
const SITE_NAME = process.env.SITE_NAME ?? "CasinooVerse";
const DEFAULT_DESCRIPTION = "Independent casino-industry research, culture, regulation, destinations, and responsible-entertainment guides.";

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const clampText = (value: string, max: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return `${text.slice(0, cut > max * .6 ? cut : max)}…`;
};

function absoluteUrl(value?: string) {
  if (!value) return undefined;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return CANONICAL_ORIGIN ? `${CANONICAL_ORIGIN}${value}` : undefined;
  return value;
}

export function buildHeadTags(head: HeadMeta) {
  const title = escapeHtml(clampText(head.title, 70) || SITE_NAME);
  const description = escapeHtml(clampText(head.description.replace(/[#*_`~]+/g, ""), 200));
  const canonical = head.canonicalPath && CANONICAL_ORIGIN ? `${CANONICAL_ORIGIN}${head.canonicalPath}` : undefined;
  const image = absoluteUrl(head.ogImage);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="${head.ogType ?? "website"}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ];
  if (canonical) {
    const safe = escapeHtml(canonical);
    tags.push(`<meta property="og:url" content="${safe}" />`, `<link rel="canonical" href="${safe}" />`);
  }
  if (image) {
    const safe = escapeHtml(image);
    tags.push(`<meta property="og:image" content="${safe}" />`, `<meta name="twitter:image" content="${safe}" />`);
    if (head.ogImageAlt) tags.push(`<meta property="og:image:alt" content="${escapeHtml(head.ogImageAlt)}" />`);
  }
  if (head.ogType === "article") {
    if (head.publishedTime) tags.push(`<meta property="article:published_time" content="${escapeHtml(head.publishedTime)}" />`);
    if (head.modifiedTime) tags.push(`<meta property="article:modified_time" content="${escapeHtml(head.modifiedTime)}" />`);
  }
  if (head.noindex || head.notFound) tags.push(`<meta name="robots" content="noindex, follow" />`);
  else tags.push(`<meta name="robots" content="index, follow, max-image-preview:large" />`);
  if (head.jsonLd) {
    const json = JSON.stringify(head.jsonLd).replace(/</g, "\\u003c");
    tags.push(`<script id="casino-verse-json-ld" type="application/ld+json">${json}</script>`);
  }
  return tags.join("\n");
}

export function composeHtml(template: string, appHtml: string, head: HeadMeta, dehydratedState: unknown) {
  const state = JSON.stringify(superjson.serialize(dehydratedState)).replace(/</g, "\\u003c");
  const stateScript = `<script>window.__RQ_STATE__ = ${state}</script>`;
  return template
    .replace("</body>", () => `${stateScript}</body>`)
    .replace("<!--app-head-->", () => buildHeadTags(head))
    .replace("<!--app-html-->", () => appHtml);
}

export function serveStatic(app: Express) {
  const publicCandidates = [
    path.resolve(process.cwd(), "vercel-public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(import.meta.dirname, "public"),
    path.resolve(import.meta.dirname, "../..", "dist", "public"),
  ];
  const publicPath = publicCandidates.find(candidate => fs.existsSync(candidate)) ?? publicCandidates[0];
  if (!fs.existsSync(publicPath)) console.error(`Could not find the public asset directory: ${publicPath}`);

  app.use((req, res, next) => {
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (req.path !== "/" && /\/+$/g.test(req.path)) {
      const query = req.originalUrl.slice(req.path.length);
      const target = (req.path.replace(/\/+$/, "") || "/").replace(/^\/{2,}/, "/");
      return res.redirect(301, `${target}${query}`);
    }
    next();
  });

  app.use(express.static(publicPath, { index: false, redirect: false }));
  const templateCandidates = [
    path.resolve(process.cwd(), "vercel-ssr", "index.html"),
    path.resolve(process.cwd(), "dist", "public", "index.html"),
    path.resolve(process.cwd(), "public", "index.html"),
    path.resolve(import.meta.dirname, "index.html"),
    path.resolve(import.meta.dirname, "../..", "dist", "public", "index.html"),
  ];
  const templatePath = templateCandidates.find(candidate => fs.existsSync(candidate)) ?? templateCandidates[0];
  const serverEntryCandidates = [
    path.resolve(process.cwd(), "vercel-ssr", "server-ssr", "entry-server.js"),
    path.resolve(process.cwd(), "dist", "server-ssr", "entry-server.js"),
    path.resolve(import.meta.dirname, "server-ssr", "entry-server.js"),
    path.resolve(import.meta.dirname, "../..", "dist", "server-ssr", "entry-server.js"),
  ];
  const serverEntryPath = serverEntryCandidates.find(candidate => fs.existsSync(candidate)) ?? serverEntryCandidates[0];

  app.use("*", async (req, res) => {
    try {
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const { render } = await import(serverEntryPath);
      const prefetch = await buildSsrPrefetch(req, res);
      const { html, dehydratedState, head } = await render(req.originalUrl, prefetch);
      res.status(head.notFound ? 404 : 200).set("Cache-Control", "no-cache").type("html").end(composeHtml(template, html, head, dehydratedState));
    } catch (error) {
      console.error("[SSR] render failed, serving shell:", error);
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const fallback = buildHeadTags({ title: SITE_NAME, description: DEFAULT_DESCRIPTION });
      res.status(200).set("Cache-Control", "no-cache").type("html").end(template.replace("<!--app-head-->", () => fallback).replace("<!--app-html-->", () => ""));
    }
  });
}
