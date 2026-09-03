export const SITE_NAME = "CasinoVerse";
export const SITE_DESCRIPTION =
  "Independent casino-industry research, culture, regulation, destinations, and responsible-entertainment guides.";

export const HERO_IMAGE = "/manus-storage/cv-casino-editorial-home-master_dd528b70.jpg";
export const MARKET_IMAGE = "/manus-storage/cv-casino-editorial-industry_37397fe6.jpg";
export const GUIDES_IMAGE = "/manus-storage/cv-casino-editorial-guides_37c0792b.jpg";
export const CULTURE_IMAGE = "/manus-storage/cv-casino-editorial-culture_5603c3fa.jpg";
export const RESPONSIBLE_IMAGE = "/manus-storage/cv-casino-editorial-responsible-v2_56db7e17.jpg";
export const CASINO_FLOOR_IMAGE = "/manus-storage/cv-casino-editorial-floor-report_efb69f8c.jpg";
export const INDUSTRY_DESK_IMAGE = "/manus-storage/cv-casino-editorial-industry_37397fe6.jpg";
export const PLACES_DESIGN_IMAGE = "/manus-storage/cv-casino-editorial-destinations_5218f6fb.jpg";
export const RESEARCH_VAULT_IMAGE = "/manus-storage/cv-casino-editorial-archive_118ba0e9.jpg";
export const GAMES_HERO_IMAGE = "/manus-storage/cv-casino-editorial-games-v2_112c40b6.jpg";
export const GUIDES_HERO_IMAGE = "/manus-storage/cv-casino-editorial-guides_37c0792b.jpg";
export const RESPONSIBLE_HERO_IMAGE = "/manus-storage/cv-casino-editorial-responsible-v2_56db7e17.jpg";
export const ABOUT_HERO_IMAGE = "/manus-storage/cv-casino-editorial-about-v2_da3ac0f6.jpg";
export const ARCHIVE_HERO_IMAGE = "/manus-storage/cv-casino-editorial-archive_118ba0e9.jpg";
export const SEARCH_HERO_IMAGE = "/manus-storage/cv-casino-editorial-search_3c98e18c.jpg";
export const STORY_FALLBACK_IMAGE = "/manus-storage/cv-casino-editorial-floor-report_efb69f8c.jpg";

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
