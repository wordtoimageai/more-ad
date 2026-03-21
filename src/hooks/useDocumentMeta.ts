import { useEffect } from "react";

interface DocumentMeta {
  title: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "More.ad - AI-Powered Ad Generation";
const DEFAULT_DESCRIPTION = "Create high-converting ad copy in seconds with AI. Generate compelling headlines, body copy, hashtags, and CTAs for any product or service.";
const DEFAULT_OG_IMAGE = "https://lovable.dev/opengraph-image-p98pqg.png";
const SITE_URL = "https://more.ad";

function setMetaTag(attr: "property" | "name", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useDocumentMeta({ title, description, ogImage, ogUrl, ogType, noIndex }: DocumentMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    // Handle noindex
    if (noIndex) {
      setMetaTag("name", "robots", "noindex, nofollow");
    }
    const prevTitle = document.title;
    document.title = title;

    const desc = description || DEFAULT_DESCRIPTION;
    const image = ogImage || DEFAULT_OG_IMAGE;
    const url = ogUrl || SITE_URL;
    const type = ogType || "website";

    // Cache previous values
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    if (metaDesc) metaDesc.setAttribute("content", desc);

    // Open Graph
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", desc);
    setMetaTag("property", "og:image", image);
    setMetaTag("property", "og:url", url);
    setMetaTag("property", "og:type", type);

    // Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", desc);
    setMetaTag("name", "twitter:image", image);

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.setAttribute("content", prevDesc);
    };
  }, [title, description, ogImage, ogUrl, ogType]);
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION };
