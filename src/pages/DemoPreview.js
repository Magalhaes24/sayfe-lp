import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import "./DemoPreview.css";

const DEMO_ACCESS_KEY = "sayfeDemoAccess";
const FIGMA_PROTOTYPE_URL =
  "https://www.figma.com/proto/iGXdPEvYF7wvrJGuQcUl53/besayfe?node-id=1-98&t=swqArBPsA4HaT6WA-1";

const buildEmbedUrl = (shareUrl) =>
  `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
    shareUrl
  )}`;

function DemoPreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

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

  const embedUrl = useMemo(
    () => buildEmbedUrl(FIGMA_PROTOTYPE_URL),
    []
  );

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="App">
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
            <div className="demo-preview-embed" data-embed-container>
              <iframe
                title="besayfe product demo prototype"
                src={embedUrl}
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

