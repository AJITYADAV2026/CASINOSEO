export const SITE_NAME = "CasinoVerse";
export const SITE_DESCRIPTION =
  "Independent casino-industry research, culture, regulation, destinations, and responsible-entertainment guides.";

export const HERO_IMAGE = "/manus-storage/cv-redesign-home-v3_48878d22.jpg";
export const MARKET_IMAGE = "/manus-storage/casinoverse-market-v2_5bad0fa2.jpg";
export const GUIDES_IMAGE = "/manus-storage/casinoverse-guides-v2_1a5f287d.jpg";
export const CULTURE_IMAGE = "/manus-storage/casinoverse-culture-v2_7edae603.jpg";
export const RESPONSIBLE_IMAGE = "/manus-storage/casinoverse-responsible-v2_6891c69c.jpg";
export const GAMES_HERO_IMAGE = "/manus-storage/cv-redesign-games-overview-v3_079b4a45.jpg";
export const GUIDES_HERO_IMAGE = "/manus-storage/cv-redesign-guides-overview-v3_1faf2fba.jpg";
export const RESPONSIBLE_HERO_IMAGE = "/manus-storage/cv-redesign-responsible-v3_34765965.jpg";
export const ABOUT_HERO_IMAGE = "/manus-storage/cv-redesign-about-v3_702d69f5.jpg";
export const ARCHIVE_HERO_IMAGE = "/manus-storage/cv-redesign-archive-v3_e67c56b4.jpg";
export const SEARCH_HERO_IMAGE = "/manus-storage/cv-redesign-search-v3_c1e83335.jpg";
export const STORY_FALLBACK_IMAGE = "/manus-storage/cv-redesign-story-fallback-v3_b668b02c.jpg";

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
