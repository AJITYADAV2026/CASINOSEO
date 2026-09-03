import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import { trpc } from "@/lib/trpc";
import { ABOUT_HERO_IMAGE, ARCHIVE_HERO_IMAGE, GAMES_HERO_IMAGE, GUIDES_HERO_IMAGE, HERO_IMAGE, RESPONSIBLE_HERO_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { GAME_GUIDES } from "@/lib/gameGuides";
import { EXPANDED_IMAGES } from "@/lib/expandedContent";

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
  sources: () => Promise<RO["editorial"]["sources"]>;
  sourceBySlug: (slug: string) => Promise<RO["editorial"]["sourceBySlug"]>;
  storySourceById: (id: number) => Promise<RO["editorial"]["storySourceById"]>;
  support: () => Promise<RO["editorial"]["support"]>;
  historicalArchive: () => Promise<RO["editorial"]["historicalArchive"]>;
  historicalRecordBySlug: (slug: string) => Promise<RO["editorial"]["historicalRecordBySlug"]>;
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
      ogImageAlt: "A brass world map with research pins and archival source material on a dark editorial desk",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: "/",
      },
    };
  }

  if (clean === "/articles") {
    const data = await p.homepage();
    seed(qc, getQueryKey(trpc.editorial.homepage, undefined, "query"), data);
    return {
      title: withSite("Blog"),
      description: "Explore CasinoVerse Blog reporting and explainers on casino markets, regulation, operations, culture, travel, game literacy, and responsible entertainment.",
      canonicalPath: "/articles",
      ogImage: EXPANDED_IMAGES.articles,
      ogImageAlt: "CasinoVerse research dossiers and source cards on an editorial desk",
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
    return { title: withSite("Daily research archive"), description: "Browse CasinoVerse casino-industry research editions by publication date, with clear sourcing and developing-story labels.", canonicalPath: "/archive", ogImage: ARCHIVE_HERO_IMAGE };
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
      ogImage: data.stories[0]?.story.featuredImageUrl ?? ARCHIVE_HERO_IMAGE,
      noindex: data.digest.status === "developing",
    };
  }

  if (clean === "/guides") {
    const data = await p.homepage();
    seed(qc, getQueryKey(trpc.editorial.homepage, undefined, "query"), data);
    return { title: withSite("Casino guides"), description: "Beginner-friendly guides to game history, terminology, probability, etiquette, and responsible entertainment.", canonicalPath: "/guides", ogImage: GUIDES_HERO_IMAGE };
  }
  if (clean === "/games") return { title: withSite("Casino game guides"), description: "Learn the history, terminology, probability, and risk fundamentals of poker, blackjack, roulette, baccarat, and slots.", canonicalPath: "/games", ogImage: GAMES_HERO_IMAGE };
  const gameMatch = clean.match(/^\/games\/([^/]+)$/i);
  if (gameMatch) {
    const guide = GAME_GUIDES[gameMatch[1]];
    if (!guide) return { title: withSite("Game guide not found"), description: SITE_DESCRIPTION, notFound: true };
    return { title: withSite(`${guide.name} guide`), description: guide.dek, canonicalPath: `/games/${guide.slug}`, ogImage: guide.image, ogImageAlt: guide.imageAlt, jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: `${guide.name}: history, concepts and probability`, description: guide.dek, articleSection: "Game Guides", author: { "@type": "Organization", name: "CasinoVerse Research Desk" }, publisher: { "@type": "Organization", name: SITE_NAME } } };
  }
  if (clean === "/history/archive") {
    const data = await p.historicalArchive();
    seed(qc, getQueryKey(trpc.editorial.historicalArchive, undefined, "query"), data);
    return { title: withSite("Casino industry timeline: 2010–2026"), description: "Browse CasinoVerse’s verified year-by-year record of casino regulation, operations, technology, destinations, and gambling-harm policy from 2010 through 3 September 2026.", canonicalPath: clean, ogImage: EXPANDED_IMAGES.history, ogImageAlt: "Casino archive desk with dated ledgers, gaming tokens, and regulatory documents" };
  }
  const historicalRecordMatch = clean.match(/^\/history\/archive\/([^/]+)$/i);
  if (historicalRecordMatch) {
    const slug = historicalRecordMatch[1];
    const data = await p.historicalRecordBySlug(slug);
    if (!data) return { title: withSite("Historical record not found"), description: SITE_DESCRIPTION, notFound: true };
    seed(qc, getQueryKey(trpc.editorial.historicalRecordBySlug, { slug }, "query"), data);
    const eventDate = data.eventDate ?? `${data.eventYear}`;
    return {
      title: withSite(data.title),
      description: data.summary,
      canonicalPath: clean,
      ogType: "article",
      ogImage: EXPANDED_IMAGES.history,
      ogImageAlt: "Casino archive desk with dated ledgers, gaming tokens, and regulatory documents",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.title,
        description: data.summary,
        datePublished: eventDate,
        articleSection: "Casino Industry History",
        author: { "@type": "Organization", name: "CasinoVerse Research Desk" },
        publisher: { "@type": "Organization", name: SITE_NAME },
      },
    };
  }
  if (clean === "/history") return { title: withSite("Casino history"), description: "Trace the documented evolution of casinos, card and wheel games, mechanical machines, regulation, and destination architecture without turning folklore into fact.", canonicalPath: clean, ogImage: EXPANDED_IMAGES.history };
  if (clean === "/culture") return { title: withSite("Casino culture"), description: "Explore casino architecture, interior design, art, entertainment, etiquette, fashion, and film as cultural subjects rather than promotional spectacle.", canonicalPath: clean, ogImage: EXPANDED_IMAGES.culture };
  if (clean === "/destinations") return { title: withSite("Casino destinations"), description: "Research Las Vegas, Macau, Monte Carlo, Singapore, and Atlantic City through history, architecture, culture, infrastructure, and regulation—not promotional rankings.", canonicalPath: clean, ogImage: EXPANDED_IMAGES.destinations };
  if (clean === "/vlogs") return { title: withSite("Vlogs and video desk"), description: "CasinoVerse’s transparent video desk: planned research-led formats, caption and transcript standards, source disclosure, and current written coverage.", canonicalPath: clean, ogImage: EXPANDED_IMAGES.vlogs };
  if (clean === "/facts") return { title: withSite("Casino facts"), description: "Verify casino history, game mathematics, regulation, markets, technology, architecture, and risk with dated sources and interpretation cautions.", canonicalPath: clean, ogImage: EXPANDED_IMAGES.facts };
  if (clean === "/gallery") return { title: withSite("Visual gallery"), description: "Explore CasinoVerse editorial illustrations of architecture, interiors, games, entertainment, destinations, inclusive design, and archival research.", canonicalPath: clean, ogImage: EXPANDED_IMAGES.gallery };
  if (clean === "/sources") {
    const data = await p.sources();
    seed(qc, getQueryKey(trpc.editorial.sources, undefined, "query"), data);
    return { title: withSite("Source library"), description: "Browse CasinoVerse-owned source records with publisher, publication, source type, retrieval date, and stored provenance address.", canonicalPath: clean, ogImage: ARCHIVE_HERO_IMAGE };
  }
  const storySourceMatch = clean.match(/^\/sources\/story\/(\d+)$/i);
  if (storySourceMatch) {
    const id = Number(storySourceMatch[1]);
    const data = await p.storySourceById(id);
    if (!data) return { title: withSite("Source record not found"), description: SITE_DESCRIPTION, notFound: true };
    seed(qc, getQueryKey(trpc.editorial.storySourceById, { id }, "query"), data);
    return { title: withSite(`${data.source.publisher} — source record`), description: `CasinoVerse internal provenance record for ${data.source.sourceTitle}.`, canonicalPath: clean, noindex: true };
  }
  const sourceMatch = clean.match(/^\/sources\/([^/]+)$/i);
  if (sourceMatch) {
    const slug = sourceMatch[1];
    const data = await p.sourceBySlug(slug);
    if (!data) return { title: withSite("Source record not found"), description: SITE_DESCRIPTION, notFound: true };
    seed(qc, getQueryKey(trpc.editorial.sourceBySlug, { slug }, "query"), data);
    return { title: withSite(`${data.name} source record`), description: data.description, canonicalPath: clean, noindex: true };
  }
  if (clean === "/support") {
    const data = await p.support();
    seed(qc, getQueryKey(trpc.editorial.support, undefined, "query"), data);
    return { title: withSite("Gambling-harm support directory"), description: "CasinoVerse internal directory of emergency guidance, helplines, counselling, self-exclusion, and financial-blocking information.", canonicalPath: clean, ogImage: RESPONSIBLE_HERO_IMAGE };
  }
  if (clean === "/privacy") return { title: withSite("Privacy Policy"), description: "How CasinoVerse handles cookie choices, consent-gated analytics, newsletter email addresses, infrastructure records, and privacy requests.", canonicalPath: clean, ogImage: HERO_IMAGE };
  if (clean === "/disclaimer") return { title: withSite("Disclaimer"), description: "CasinoVerse is an informational publication, not a casino, wagering service, financial adviser, legal adviser, or treatment provider.", canonicalPath: clean, ogImage: HERO_IMAGE };
  if (clean === "/terms") return { title: withSite("Terms of Use"), description: "Terms governing access to CasinoVerse articles, research archives, newsletter signup, internal source records, and publication-owned material.", canonicalPath: clean, ogImage: HERO_IMAGE };
  if (clean === "/responsible-entertainment") return { title: withSite("Responsible entertainment"), description: "Practical information about gambling risk, time and spending limits, warning signs, blocking tools, self-exclusion, and support.", canonicalPath: clean, ogImage: RESPONSIBLE_HERO_IMAGE };
  if (clean === "/about") return { title: withSite("About CasinoVerse"), description: "Learn how CasinoVerse researches casino-industry news, attributes sources, handles developing stories, and maintains an informational-only editorial standard.", canonicalPath: clean, ogImage: ABOUT_HERO_IMAGE };

  if (clean === "/search") {
    const query = new URLSearchParams(rawSearch).get("q")?.trim() ?? "";
    if (query.length >= 2) {
      const data = await p.search(query);
      seed(qc, getQueryKey(trpc.editorial.search, { query }, "query"), data);
    }
    return { title: withSite("Search"), description: "Search CasinoVerse research, regulation, culture, game guides, and responsible-entertainment coverage.", canonicalPath: clean, noindex: true };
  }

  return { title: withSite("Page not found"), description: SITE_DESCRIPTION, notFound: true };
}
