import { useEffect, useMemo } from "react";
import { useTranslation } from "../contexts/LanguageContext";

const BASE_URL = "https://www.besayfe.com";

function ensureMeta(attrName, attrValue, content) {
  if (!content) return;
  const selector = `meta[${attrName}="${attrValue}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function ensureLink(rel, href) {
  if (!href) return;
  const selector = `link[rel="${rel}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function clearMetaByProperty(propertyName) {
  const existing = Array.from(
    document.head.querySelectorAll(`meta[property="${propertyName}"]`)
  );
  existing.forEach((node) => node.remove());
}

function stripTags(value) {
  if (typeof value !== "string") return value;
  return value.replace(/<[^>]*>/g, "").trim();
}

function normalizeKeywords(keywords) {
  if (!keywords) return "";
  if (Array.isArray(keywords)) {
    return keywords
      .map((keyword) => stripTags(keyword))
      .filter(Boolean)
      .join(", ");
  }
  return stripTags(String(keywords));
}

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  try {
    return new URL(pathOrUrl, BASE_URL).toString();
  } catch (error) {
    return pathOrUrl;
  }
}

function Seo({
  title,
  description,
  keywords,
  image = "/logo1000.png",
  type = "website",
  canonicalPath = "/",
  siteName = "besayfe",
  noindex = false
}) {
  const { language } = useTranslation();

  const locale = language === "pt" ? "pt_PT" : "en_US";
  const alternateLocale = language === "pt" ? "en_US" : "pt_PT";

  const sanitized = useMemo(
    () => ({
      title: stripTags(title || siteName),
      description: stripTags(description),
      keywords: normalizeKeywords(keywords),
      image: toAbsoluteUrl(image),
      canonical: toAbsoluteUrl(canonicalPath)
    }),
    [title, description, keywords, image, canonicalPath, siteName]
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const suffix = siteName || "besayfe";
    const pageTitle = sanitized.title || suffix;
    const finalTitle = pageTitle.includes(suffix) ? pageTitle : `${pageTitle} | ${suffix}`;
    const robotsContent = noindex ? "noindex, nofollow" : "index, follow";

    document.title = finalTitle;

    ensureLink("canonical", sanitized.canonical);

    ensureMeta("name", "description", sanitized.description);
    ensureMeta("name", "keywords", sanitized.keywords);
    ensureMeta("name", "author", "besayfe");
    ensureMeta("name", "language", locale.replace("_", "-"));
    ensureMeta("name", "robots", robotsContent);

    ensureMeta("property", "og:title", finalTitle);
    ensureMeta("property", "og:description", sanitized.description);
    ensureMeta("property", "og:type", type);
    ensureMeta("property", "og:url", sanitized.canonical);
    ensureMeta("property", "og:image", sanitized.image);
    ensureMeta("property", "og:site_name", siteName || "besayfe");
    ensureMeta("property", "og:locale", locale);
    clearMetaByProperty("og:locale:alternate");
    ensureMeta("property", "og:locale:alternate", alternateLocale);

    ensureMeta("name", "twitter:card", "summary_large_image");
    ensureMeta("name", "twitter:title", finalTitle);
    ensureMeta("name", "twitter:description", sanitized.description);
    ensureMeta("name", "twitter:image", sanitized.image);
    ensureMeta("name", "twitter:url", sanitized.canonical);
  }, [alternateLocale, locale, noindex, sanitized, siteName, type]);

  return null;
}

export default Seo;
