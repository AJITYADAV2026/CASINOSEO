export const SITE_NAME = "CasinoVerse";
export const SITE_DESCRIPTION =
  "Independent casino-industry research, culture, regulation, destinations, and responsible-entertainment guides.";

export const HERO_IMAGE = "/manus-storage/casinoverse-hero_ae0f73ca.jpg";
export const MARKET_IMAGE = "/manus-storage/casinoverse-market-v2_5bad0fa2.jpg";
export const GUIDES_IMAGE = "/manus-storage/casinoverse-guides-v2_1a5f287d.jpg";
export const CULTURE_IMAGE = "/manus-storage/casinoverse-culture-v2_7edae603.jpg";
export const RESPONSIBLE_IMAGE = "/manus-storage/casinoverse-responsible-v2_6891c69c.jpg";

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
