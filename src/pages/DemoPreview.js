import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import "./DemoPreview.css";
import Seo from "../components/Seo";

const DEMO_ACCESS_KEY = "sayfeDemoAccess";
// Use the embed.figma.com endpoint so the prototype opens without requiring sign-in.
const FIGMA_PROTOTYPE_URL =
  "https://www.figma.com/proto/mLfhnggAEYUU5JPKXK4na6/besayfe-app?node-id=1-1641&t=0ju3ZqVWVdUtfp30-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A1637";
const FIGMA_EMBED_URL =
  "https://embed.figma.com/proto/mLfhnggAEYUU5JPKXK4na6/besayfe-app?node-id=1-1641&t=0ju3ZqVWVdUtfp30-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A1637&embed-host=share";

function DemoPreview() {
  const { t } = useTranslation();
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.demoPreview") || {};
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const isAllowed = (() => {
      if (typeof window === "undefined") return false;
      try {
        return sessionStorage.getItem(DEMO_ACCESS_KEY) === "true";
      } catch (error) {
        console.warn("Unable to read demo access flag:", error);
        return false;
      }
    })();

    if (!isAllowed) {
      navigate("/", { replace: true });
      return;
    }

    setIsAuthorized(true);

    try {
      sessionStorage.removeItem(DEMO_ACCESS_KEY);
    } catch (error) {
      console.warn("Unable to reset demo access flag:", error);
    }
  }, [navigate]);

  const embedUrl = useMemo(() => FIGMA_EMBED_URL, []);

  useEffect(() => {
    if (!isAuthorized) return undefined;
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthorized, isExpanded]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="App">
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/demo"
        siteName={siteName}
      />
      <main className="page-main demo-preview-main">
        <section className="demo-preview-hero">
          <div className="section-shell demo-preview-shell">
            <span className="demo-preview-tag">
              {t("demoPreview.tag")}
            </span>
            <h1 className="demo-preview-title" dangerouslySetInnerHTML={{ __html: t("demoPreview.title") }}>
            </h1>
            <p className="demo-preview-subtitle" dangerouslySetInnerHTML={{ __html: t("demoPreview.subtitle") }}>
            </p>
            <div className="demo-preview-actions">
              <Link to="/" className="demo-preview-action secondary">
                {t("demoPreview.backHome")}
              </Link>
              <a
                href={FIGMA_PROTOTYPE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="demo-preview-action primary"
              >
                {t("demoPreview.openInFigma")}
              </a>
            </div>
          </div>
        </section>

        <section className="demo-preview-frame">
          <div className="section-shell demo-preview-shell">
            <div
              className={`demo-preview-embed${isExpanded ? " demo-preview-embed--expanded" : ""}`}
              data-embed-container
            >
              <button
                type="button"
                className="demo-preview-zoom-btn"
                onClick={() => setIsExpanded(prev => !prev)}
                aria-pressed={isExpanded}
              >
                {isExpanded ? "Close" : "Full screen"}
              </button>
              <iframe
                title="besayfe product demo prototype"
                src={embedUrl}
                style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                data-skip-preload
              />
            </div>
            <p className="demo-preview-tip">
              {t("demoPreview.tip")}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DemoPreview;
