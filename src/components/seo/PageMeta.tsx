import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description?: string;
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

/**
 * Sets document title and meta/OG tags for the current view (SPA).
 * Pass a full title string; append "| Courtlane" yourself if you want it in the tab.
 */
export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setOrCreateMeta("name", "description", description);
      setOrCreateMeta("property", "og:title", title);
      setOrCreateMeta("property", "og:description", description);
    }
  }, [title, description]);

  return null;
}
