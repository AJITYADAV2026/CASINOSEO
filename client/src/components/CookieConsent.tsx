import { Cookie, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  COOKIE_SETTINGS_EVENT,
  CookieConsentChoice,
  loadConsentGatedAnalytics,
  persistCookieConsent,
  readCookieConsent,
  shouldLoadAnalytics,
} from "@/lib/consent";

export function CookieConsent() {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedChoice = readCookieConsent();
    setChoice(storedChoice);
    setOpen(storedChoice === null);
    setReady(true);
    if (shouldLoadAnalytics(storedChoice)) {
      loadConsentGatedAnalytics(import.meta.env.VITE_ANALYTICS_ENDPOINT, import.meta.env.VITE_ANALYTICS_WEBSITE_ID);
    }

    const showSettings = () => setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, showSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, showSettings);
  }, []);

  function save(nextChoice: CookieConsentChoice) {
    const wasAccepted = choice === "accepted";
    persistCookieConsent(nextChoice);
    setChoice(nextChoice);
    setOpen(false);
    if (nextChoice === "accepted") {
      loadConsentGatedAnalytics(import.meta.env.VITE_ANALYTICS_ENDPOINT, import.meta.env.VITE_ANALYTICS_WEBSITE_ID);
    } else if (wasAccepted) {
      window.location.reload();
    }
  }

  if (!ready || !open) return null;

  return (
    <aside className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description">
      <div className="cookie-consent__icon" aria-hidden="true"><Cookie /></div>
      <div className="cookie-consent__copy">
        <p className="eyebrow text-gold">Your privacy</p>
        <h2 id="cookie-consent-title">Choose how CasinooVerse measures visits</h2>
        <p id="cookie-consent-description">
          Essential storage remembers this choice. Optional, privacy-focused analytics helps us understand which research pages are useful; it loads only if you accept.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-ivory/50">
          <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" /> No advertising cookies or personalised gambling offers.
        </div>
      </div>
      <div className="cookie-consent__actions">
        <button type="button" className="button-gold" onClick={() => save("accepted")}>Accept analytics</button>
        <button type="button" className="button-ghost" onClick={() => save("essential")}>Essential only</button>
      </div>
    </aside>
  );
}

export function openCookieSettings() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
