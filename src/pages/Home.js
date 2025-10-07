import React from "react";
import { Link } from "react-router-dom";
import DotGrid from "../components/DotGrid";
import { useTranslation } from "../contexts/LanguageContext";
import homeDemo from "../assets/Home.png";
import onboardingDemo from "../assets/OnBoarding.png";


function Home() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <main className="page-main home-main">
        
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
        
        {/* === Demo Section === */}
        <section className="demo-section">
          <div className="section-shell demo-shell">
            <div className="demo-content">
              <h2
                className="demo-title"
                dangerouslySetInnerHTML={{ __html: t("home.demoTitle") }}
              ></h2>
              <p
                className="demo-text"
                dangerouslySetInnerHTML={{ __html: t("home.demoText") }}
              ></p>
              <a
                href="https://www.figma.com/proto/Jc6hi1431RQHVNCImYOYxl/Sayfe--Copy-?node-id=1-344&t=FMQYJ2jTIXk4Vgn5-1"
                target="_blank"
                rel="noopener noreferrer"
                className="demo-btn"
              >
                {t("home.demoCta")}
              </a>
            </div>

            <div className="demo-visual">
              <div className="phone-stack">
                <div className="phone-frame phone-left">
                  <img
                    src={homeDemo}
                    alt="Sayfe App Demo Screen 1"
                    className="demo-screen"
                  />
                </div>
                <div className="phone-frame phone-right">
                  <img
                    src={onboardingDemo}
                    alt="Sayfe App Demo Screen 2"
                    className="demo-screen"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === Hero Section === */}
        <section className="hero">
          <div className="section-shell">
            <h2
              className="hero-title"
              dangerouslySetInnerHTML={{ __html: t("home.heroTitle") }}
            ></h2>
            <p
              className="hero-text"
              dangerouslySetInnerHTML={{ __html: t("home.heroText") }}
            ></p>
            <Link to="/waitlist" className="cta-btn">
              {t("home.heroCta")}
            </Link>
          </div>
        </section>

        {/* === Features Section === */}
        <section className="features">
          <div className="section-shell">
            <h3
              dangerouslySetInnerHTML={{ __html: t("home.featuresTitle") }}
            ></h3>
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
