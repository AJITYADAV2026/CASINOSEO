export type CookieConsentChoice = "accepted" | "essential";

export const COOKIE_CONSENT_KEY = "casinoverse_cookie_consent_v1";
export const COOKIE_SETTINGS_EVENT = "casinoverse:cookie-settings";

type StoredConsent = {
  choice: CookieConsentChoice;
  version: 1;
  updatedAt: string;
};

export function parseCookieConsent(raw: string | null): CookieConsentChoice | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    return parsed.version === 1 && (parsed.choice === "accepted" || parsed.choice === "essential")
      ? parsed.choice
      : null;
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;
  return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY));
}

export function persistCookieConsent(choice: CookieConsentChoice) {
  if (typeof window === "undefined") return;
  const value: StoredConsent = { choice, version: 1, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
}

export function shouldLoadAnalytics(choice: CookieConsentChoice | null) {
  return choice === "accepted";
}

export function loadConsentGatedAnalytics(endpoint?: string, websiteId?: string) {
  if (typeof document === "undefined" || !endpoint || !websiteId) return false;
  if (document.querySelector("script[data-casinoverse-analytics]")) return true;
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = websiteId;
  script.dataset.casinoverseAnalytics = "true";
  document.head.appendChild(script);
  return true;
}
