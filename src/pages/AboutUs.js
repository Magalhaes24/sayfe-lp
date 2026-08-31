import React from "react";
import DotGrid from "../components/DotGrid";
import { useTranslation } from "../contexts/LanguageContext";
import "./AboutUs.css";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useReveal } from "../hooks/useReveal";

// Only .webp here: the previous pattern matched every PNG in assets/ and
// bundled all 4.3 MB of them into this page.
const founderImages = require.context("../assets", false, /\.webp$/);

const normalizeFirstName = (name = "") =>
  name
    .split(" ")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getFounderImage = firstName => {
  const safeName = firstName || "francisco";

  try {
    return founderImages(`./${safeName}.webp`);
  } catch (error) {
    return founderImages("./francisco.webp");
  }
};

function AboutUs() {
  const { t } = useTranslation();
  const pillars = t("about.missionPillars") || [];
  const founders = t("about.founders") || [];
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.about") || {};

  const missionRef = useReveal();
  const teamRef    = useReveal();
  const ctaRef     = useReveal();

  return (
    <div className="App">
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/about/"
        siteName={siteName}
      />
      <main className="page-main about-main">
        <section className="about-hero">
          <DotGrid
            className="about-hero__grid"
            baseColor="#73ac84"
            activeColor="#73ac84"
            baseOpacity={0.08}
            activeOpacity={0.2}
            dotSize={14}
            gap={30}
          />
          <div className="section-shell about-shell">
            <span
              className="about-tag"
              dangerouslySetInnerHTML={{ __html: t("about.heroTag") }}
            ></span>
            <h2
              className="about-title"
              dangerouslySetInnerHTML={{ __html: t("about.heroTitle") }}
            ></h2>
            <p
              className="about-lead"
              dangerouslySetInnerHTML={{ __html: t("about.heroLead") }}
            ></p>
          </div>
        </section>

        <section className="about-mission" ref={missionRef}>
          <div className="section-shell about-shell">
            <div className="mission-card reveal">
              <h3
                dangerouslySetInnerHTML={{ __html: t("about.missionTitle") }}
              ></h3>
              <p
                dangerouslySetInnerHTML={{ __html: t("about.missionBody") }}
              ></p>
              <ul className="mission-pillars">
                {pillars.map((pillar, i) => (
                  <li
                    key={pillar}
                    className="mission-pillar-item reveal"
                    style={{ "--reveal-delay": `${i * 80}ms` }}
                    dangerouslySetInnerHTML={{ __html: pillar }}
                  ></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="about-team" ref={teamRef}>
          <div className="section-shell about-shell">
            <h3
              className="team-title reveal"
              dangerouslySetInnerHTML={{ __html: t("about.teamTitle") }}
            ></h3>
            <p
              className="team-intro reveal"
              style={{ "--reveal-delay": "80ms" }}
              dangerouslySetInnerHTML={{ __html: t("about.teamIntro") }}
            ></p>
            <div className="founder-grid">
              {founders.map((founder, i) => {
                const founderKey = normalizeFirstName(founder.name);
                const imageSrc = getFounderImage(founderKey);

                return (
                  <article
                    className="founder-card reveal-scale"
                    key={founder.name}
                    data-founder={founderKey}
                    style={{ "--reveal-delay": `${i * 120}ms` }}
                  >
                    <div className="founder-card__media" aria-hidden="true">
                      <img src={imageSrc} alt="" className="founder-photo" />
                    </div>
                    <div className="founder-card__content">
                      <h4>{founder.name}</h4>
                      <p className="founder-role">{founder.role}</p>
                      <p
                        className="founder-bio"
                        dangerouslySetInnerHTML={{ __html: founder.bio }}
                      ></p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="about-cta" ref={ctaRef}>
          <div className="section-shell about-shell about-cta__shell reveal-scale">
            <h3
              dangerouslySetInnerHTML={{ __html: t("about.ctaTitle") }}
            ></h3>
            <p
              dangerouslySetInnerHTML={{ __html: t("about.ctaBody") }}
            ></p>
            <Link to="/contact" className="cta-btn">
              {t("home.heroCta")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutUs;
