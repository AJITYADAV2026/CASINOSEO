import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import { trpc } from "@/lib/trpc";
import { HERO_IMAGE, MARKET_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export type HeadMeta = {
  title: string;
  description: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalPath?: string;
  noindex?: boolean;
  notFound?: boolean;
  jsonLd?: Record<string, unknown>;
};

type RO = inferRouterOutputs<AppRouter>;
export type SsrPrefetch = {
  homepage: () => Promise<RO["editorial"]["homepage"]>;
  storyBySlug: (slug: string) => Promise<RO["editorial"]["storyBySlug"]>;
  categoryBySlug: (slug: string) => Promise<RO["editorial"]["categoryBySlug"]>;
  archive: () => Promise<RO["editorial"]["archive"]>;
  digestByDate: (date: string) => Promise<RO["editorial"]["digestByDate"]>;
  search: (query: string) => Promise<RO["editorial"]["search"]>;
};

const withSite = (title: string) => `${title} | ${SITE_NAME}`;
const seed = (qc: QueryClient, key: unknown, data: unknown) => qc.setQueryData(key as any, data);

export async function prefetchForPath(url: string, qc: QueryClient, p: SsrPrefetch): Promise<HeadMeta> {
  const queryIndex = url.indexOf("?");
  const rawPath = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const rawSearch = queryIndex === -1 ? "" : url.slice(queryIndex + 1);
  let pathOnly = rawPath;
  try { pathOnly = decodeURI(rawPath); } catch { /* Mirror wouter malformed-path handling. */ }
  const clean = pathOnly.replace(/\/+$/, "") || "/";

  if (clean === "/") {
    const data = await p.homepage();
    seed(qc, getQueryKey(trpc.editorial.homepage, undefined, "query"), data);
    return {
      title: `${SITE_NAME} — The world behind the games`,
      description: SITE_DESCRIPTION,
      canonicalPath: "/",
      ogImage: HERO_IMAGE,
      ogImageAlt: "A cinematic contemporary integrated-resort interior",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: "/",
      },
    };
  }

  const articleMatch = clean.match(/^\/articles\/([^/]+)$/i);
  if (articleMatch) {
    const slug = articleMatch[1];
    const [article, homepage] = await Promise.all([p.storyBySlug(slug), p.homepage()]);
    if (!article) return { title: withSite("Article not found"), description: SITE_DESCRIPTION, notFound: true };
    seed(qc, getQueryKey(trpc.editorial.storyBySlug, { slug }, "query"), article);
    seed(qc, getQueryKey(trpc.editorial.homepage, undefined, "query"), homepage);
    const canonicalPath = `/articles/${article.story.slug}`;
    return {
      title: withSite(article.story.title),
      description: article.story.dek,
      canonicalPath,
      ogType: "article",
      ogImage: article.story.featuredImageUrl ?? HERO_IMAGE,
      ogImageAlt: article.story.featuredImageAlt ?? article.story.title,
      publishedTime: article.story.publishedAt?.toISOString(),
      modifiedTime: (article.story.modifiedAt ?? article.story.publishedAt)?.toISOString(),
      noindex: article.story.status === "developing",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": article.story.contentType === "news" ? "NewsArticle" : "Article",
        headline: article.story.title,
        description: article.story.dek,
        datePublished: article.story.publishedAt?.toISOString(),
        dateModified: (article.story.modifiedAt ?? article.story.publishedAt)?.toISOString(),
        mainEntityOfPage: canonicalPath,
        image: article.story.featuredImageUrl ? [article.story.featuredImageUrl] : undefined,
        articleSection: article.category.name,
        author: { "@type": "Organization", name: article.story.authorName },
        publisher: { "@type": "Organization", name: SITE_NAME },
      },
    };
  }

  const categoryMatch = clean.match(/^\/category\/([^/]+)$/i);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const data = await p.categoryBySlug(slug);
    if (!data) return { title: withSite("Topic not found"), description: SITE_DESCRIPTION, notFound: true };
    seed(qc, getQueryKey(trpc.editorial.categoryBySlug, { slug }, "query"), data);
    return { title: withSite(data.category.name), description: data.category.description, canonicalPath: `/category/${data.category.slug}`, ogImage: data.stories[0]?.story.featuredImageUrl ?? HERO_IMAGE };
  }

  if (clean === "/archive") {
    const data = await p.archive();
    seed(qc, getQueryKey(trpc.editorial.archive, undefined, "query"), data);
    return { title: withSite("Daily research archive"), description: "Browse CasinoVerse casino-industry research editions by publication date, with clear sourcing and developing-story labels.", canonicalPath: "/archive", ogImage: MARKET_IMAGE };
  }

  const digestMatch = clean.match(/^\/archive\/(\d{4}-\d{2}-\d{2})$/i);
  if (digestMatch) {
    const date = digestMatch[1];
    const data = await p.digestByDate(date);
    if (!data) return { title: withSite("Edition not found"), description: SITE_DESCRIPTION, notFound: true };
    seed(qc, getQueryKey(trpc.editorial.digestByDate, { date }, "query"), data);
    return {
      title: withSite(data.digest.title),
      description: data.digest.summary,
      canonicalPath: `/archive/${data.digest.digestDate}`,
      ogImage: data.stories[0]?.story.featuredImageUrl ?? MARKET_IMAGE,
      noindex: data.digest.status === "developing",
    };
  }

  if (clean === "/guides") {
    const data = await p.homepage();
    seed(qc, getQueryKey(trpc.editorial.homepage, undefined, "query"), data);
    return { title: withSite("Casino guides"), description: "Beginner-friendly guides to game history, terminology, probability, etiquette, and responsible entertainment.", canonicalPath: "/guides", ogImage: "/manus-storage/casinoverse-guides-v2_1a5f287d.jpg" };
  }
  if (clean === "/games") return { title: withSite("Casino game guides"), description: "Learn the history, terminology, probability, and risk fundamentals of poker, blackjack, roulette, baccarat, and slots.", canonicalPath: "/games", ogImage: "/manus-storage/casinoverse-guides-v2_1a5f287d.jpg" };
  if (clean === "/responsible-entertainment") return { title: withSite("Responsible entertainment"), description: "Practical information about gambling risk, time and spending limits, warning signs, blocking tools, self-exclusion, and support.", canonicalPath: clean, ogImage: "/manus-storage/casinoverse-responsible-v2_6891c69c.jpg" };
  if (clean === "/about") return { title: withSite("About CasinoVerse"), description: "Learn how CasinoVerse researches casino-industry news, attributes sources, handles developing stories, and maintains an informational-only editorial standard.", canonicalPath: clean, ogImage: HERO_IMAGE };

  if (clean === "/search") {
    const query = new URLSearchParams(rawSearch).get("q")?.trim() ?? "";
    if (query.length >= 2) {
      const data = await p.search(query);
      seed(qc, getQueryKey(trpc.editorial.search, { query }, "query"), data);
    }
    return { title: withSite("Search"), description: "Search CasinoVerse research, regulation, culture, game guides, and responsible-entertainment coverage.", noindex: true };
  }

  return { title: withSite("Page not found"), description: SITE_DESCRIPTION, notFound: true };
}
