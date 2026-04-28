import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
};

function setOrCreateMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOrCreateCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

function setOrCreateJsonLd(payload: Record<string, unknown> | Record<string, unknown>[]) {
  const id = "courtlane-jsonld";
  let el = document.querySelector(`script#${id}`);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("id", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload);
}

const DEFAULT_SITE_URL = "https://courtlane.us";

/**
 * Sets document title and meta/OG tags for the current view (SPA).
 * Pass a full title string; append "| Courtlane" yourself if you want it in the tab.
 */
export function PageMeta({ title, description, canonicalPath, noindex, structuredData }: PageMetaProps) {
  useEffect(() => {
    const siteUrl = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
    const normalizedPath = canonicalPath
      ? canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`
      : window.location.pathname;
    const canonicalUrl = `${siteUrl}${normalizedPath}`;

    document.title = title;
    setOrCreateCanonical(canonicalUrl);
    setOrCreateMeta("property", "og:title", title);
    setOrCreateMeta("property", "og:url", canonicalUrl);
    setOrCreateMeta("property", "og:type", "website");
    setOrCreateMeta("name", "twitter:card", "summary_large_image");
    setOrCreateMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    if (description) {
      setOrCreateMeta("name", "description", description);
      setOrCreateMeta("property", "og:description", description);
    }

    if (structuredData) {
      setOrCreateJsonLd(structuredData);
    }
  }, [title, description, canonicalPath, noindex, structuredData]);

  return null;
}
