export const SITE_NAME = "CasinoVerse";
export const SITE_DESCRIPTION =
  "Independent casino-industry research, culture, regulation, destinations, and responsible-entertainment guides.";

export const HERO_IMAGE = "/manus-storage/cv-home-world-map_9f30c48e.jpg";
export const MARKET_IMAGE = "/manus-storage/casinoverse-market-v2_5bad0fa2.jpg";
export const GUIDES_IMAGE = "/manus-storage/casinoverse-guides-v2_1a5f287d.jpg";
export const CULTURE_IMAGE = "/manus-storage/casinoverse-culture-v2_7edae603.jpg";
export const RESPONSIBLE_IMAGE = "/manus-storage/casinoverse-responsible-v2_6891c69c.jpg";
export const GAMES_HERO_IMAGE = "/manus-storage/cv-games-study-table-v2_4a39a025.jpg";
export const GUIDES_HERO_IMAGE = "/manus-storage/cv-guides-library-v2_58df9d26.jpg";
export const RESPONSIBLE_HERO_IMAGE = "/manus-storage/cv-responsible-boundaries-v2_a251cb58.jpg";
export const ABOUT_HERO_IMAGE = "/manus-storage/cv-about-newsroom-v2_50d2fa6e.jpg";
export const ARCHIVE_HERO_IMAGE = "/manus-storage/cv-archive-dossiers-v2_2a191777.jpg";
export const SEARCH_HERO_IMAGE = "/manus-storage/cv-search-index-v2_77cfe990.jpg";
export const STORY_FALLBACK_IMAGE = "/manus-storage/casinoverse-hero_ae0f73ca.jpg";

export function formatDate(value?: Date | string | null, withTime = false) {
  if (!value) return "Date pending";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function bodyParagraphs(body: string) {
  return body.split(/\n\s*\n/).filter(Boolean);
}
