import React from "react";
import { Link } from "react-router-dom";
import DotGrid from "../components/DotGrid";
import { useTranslation } from "../contexts/LanguageContext";

function Home() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <main className="page-main home-main">

        <section className="hero">
          <div className="section-shell">
            <h2 className="hero-title">{t("home.heroTitle")}</h2>
            <p className="hero-text">{t("home.heroText")}</p>
            <Link to="/waitlist" className="cta-btn">
              {t("home.heroCta")}
            </Link>
          </div>
        </section>

        <DotGrid
          className="dotGrid-background"
          dotSize={12}
          gap={18}
          baseColor="#73ac84"
          activeColor="#73ac84"
          baseOpacity={0.12}
          activeOpacity={0.26}
          proximity={140}
          shockRadius={260}
          shockStrength={4.2}
          resistance={820}
          returnDuration={1.45}
          style={{ width: "100%", height: "100%" }}
        />
        <section className="features">
          <div className="section-shell">
            <h3>{t("home.featuresTitle")}</h3>
            <div className="feature-grid">
              <div className="feature-card">
                <h4>{t("home.features.realtime.title")}</h4>
                <p>{t("home.features.realtime.text")}</p>
              </div>
              <div className="feature-card">
                <h4>{t("home.features.ai.title")}</h4>
                <p>{t("home.features.ai.text")}</p>
              </div>
              <div className="feature-card">
                <h4>{t("home.features.privacy.title")}</h4>
                <p>{t("home.features.privacy.text")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
