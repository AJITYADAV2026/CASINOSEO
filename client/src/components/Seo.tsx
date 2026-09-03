import { useEffect } from "react";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

type SeoProps = {
  title?: string;
  description?: string;
  image?: string | null;
  path?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

export function Seo({
  title,
  description = SITE_DESCRIPTION,
  image,
  path,
  noIndex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — The world behind the games`;
    const actualPath = path ?? window.location.pathname;
    const canonical = `${window.location.origin}${actualPath}`;
    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex,follow" : "index,follow,max-image-preview:large",
    });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: jsonLd ? "article" : "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    if (image) {
      const absoluteImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: absoluteImage });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: absoluteImage });
    }

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    const id = "casino-verse-json-ld";
    document.getElementById(id)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => document.getElementById(id)?.remove();
  }, [description, image, jsonLd, noIndex, path, title]);

  return null;
}
