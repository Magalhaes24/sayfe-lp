import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import DotGrid from "../components/DotGrid";
import { useTranslation } from "../contexts/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import rocketIcon from "../assets/rocket_ic.png";
import ideaIcon from "../assets/idea_ic.png";
import checkIcon from "../assets/check_ic.png";
import Seo from "../components/Seo";

function Home() {
  const { t } = useTranslation();
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.home") || {};

  const mock = t("home.mock") || {};
  const mockFilters = mock.filterChips || [];
  const mockDishes = mock.dishes || [];
  const problemPoints = t("home.problem.points") || [];
  const solutionSteps = t("home.solution.steps") || [];
  const featureItems = t("home.features.items") || [];
  const socialProofItems = t("home.socialProof.items") || [];

  // Scrolls without touching the URL hash: a hash change would restart the
  // global loading screen, which watches the whole location object.
  const handleJumpToSteps = useCallback((event) => {
    event.preventDefault();
    const target = document.getElementById("how-it-works");
    if (!target) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }, []);

  const problemRef  = useReveal();
  const solutionRef = useReveal();
  const featuresRef = useReveal();
  const socialRef   = useReveal();
  const ctaRef      = useReveal();

  return (
    <div className="App">
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/"
        siteName={siteName}
      />
      <main className="page-main home-main">
        <DotGrid
          className="dotGrid-background"
          dotSize={11}
          gap={19}
          baseColor="#73ac84"
          activeColor="#73ac84"
          baseOpacity={0.10}
          activeOpacity={0.30}
          proximity={145}
          shockRadius={270}
          shockStrength={4.5}
          resistance={800}
          returnDuration={1.4}
          style={{ width: "100%", height: "100%" }}
        />

        {/* === Hero Section (above fold — no reveal needed) === */}
        <section className="demo-section">
          <div className="section-shell demo-shell">
            <div className="demo-content">
              <p className="section-eyebrow hero-eyebrow">
                <span className="section-emoji" aria-hidden="true">
                  <img src={rocketIcon} alt="" className="section-icon" />
                </span>{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.heroEyebrow") }}
                ></span>
              </p>
              <h2 className="demo-title">
                <span
                  className="demo-title__text"
                  dangerouslySetInnerHTML={{ __html: t("home.heroTitle") }}
                ></span>
              </h2>
              <p
                className="demo-text"
                dangerouslySetInnerHTML={{ __html: t("home.heroText") }}
              ></p>
              <div className="hero-actions">
                <Link to="/contact" className="demo-btn">
                  <span
                    dangerouslySetInnerHTML={{ __html: t("home.heroCta") }}
                  ></span>
                </Link>
                <a
                  href="#how-it-works"
                  className="ghost-btn"
                  onClick={handleJumpToSteps}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t("home.heroSecondaryCta")
                    }}
                  ></span>
                </a>
              </div>
            </div>

            <div className="demo-visual">
              {/* The menu as a guest reads it: their profile, then the dishes. */}
              <div className="product-mock" aria-hidden="true">
                <article className="mock-card mock-card--menu">
                  <span className="mock-tag">{mock.menuTag}</span>

                  <div className="mock-profile">
                    <span className="mock-profile__label">
                      {mock.filterLabel}
                    </span>
                    <ul className="mock-allergens">
                      {mockFilters.map((allergen) => (
                        <li className="mock-chip mock-chip--active" key={allergen}>
                          {allergen}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {mockDishes.map((dish) => (
                    <div className="mock-dish-block" key={dish.name}>
                      <h3 className="mock-dish">{dish.name}</h3>
                      <p className="mock-category">{dish.category}</p>
                      <ul className="mock-allergens">
                        {(dish.allergens || []).map((allergen) => (
                          <li className="mock-chip" key={allergen}>
                            {allergen}
                          </li>
                        ))}
                      </ul>
                      <p className={`mock-status mock-status--${dish.status}`}>
                        {dish.statusLabel}
                      </p>
                    </div>
                  ))}
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* === Problem Section === */}
        <section className="problem" ref={problemRef}>
          <div className="section-shell">
            <div className="section-heading reveal">
              <p className="section-eyebrow">
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.problemEyebrow") }}
                ></span>
              </p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.problemTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.problemIntro") }}
              ></p>
            </div>
            <div className="problem-grid">
              {problemPoints.map((point, i) => (
                <article
                  className="problem-card reveal-scale"
                  key={point.title}
                  style={{ "--reveal-delay": `${i * 100}ms` }}
                >
                  <span className="problem-step" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="problem-copy">
                    <h4 dangerouslySetInnerHTML={{ __html: point.title }}></h4>
                    <p dangerouslySetInnerHTML={{ __html: point.text }}></p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Solution Section === */}
        <section className="solution" id="how-it-works" ref={solutionRef}>
          <div className="section-shell">
            <div className="section-heading section-heading--center reveal">
              <p className="section-eyebrow">
                <span className="section-emoji" aria-hidden="true">
                  <img src={ideaIcon} alt="" className="section-icon" />
                </span>{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.solutionEyebrow") }}
                ></span>
              </p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.solutionTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.solutionIntro") }}
              ></p>
            </div>
            <div className="solution-grid">
              {solutionSteps.map((step, i) => (
                <article
                  className="solution-card reveal-scale"
                  key={step.title}
                  style={{ "--reveal-delay": `${i * 110}ms` }}
                >
                  <span className="solution-step" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 dangerouslySetInnerHTML={{ __html: step.title }}></h4>
                  <p dangerouslySetInnerHTML={{ __html: step.text }}></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Feature Section === */}
        <section className="home-features" ref={featuresRef}>
          <div className="section-shell">
            <div className="section-heading reveal">
              <p className="section-eyebrow">
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.featuresEyebrow") }}
                ></span>
              </p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.featuresTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.featuresIntro") }}
              ></p>
            </div>
            <div className="home-features-grid">
              {featureItems.map((item, i) => (
                <article
                  className="home-feature-card reveal"
                  key={item.title}
                  style={{ "--reveal-delay": `${i * 70}ms` }}
                >
                  <span className="home-feature-step" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h4 dangerouslySetInnerHTML={{ __html: item.title }}></h4>
                  <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Social Proof Section === */}
        <section className="social-proof" ref={socialRef}>
          <div className="section-shell">
            <div className="section-heading reveal">
              <p className="section-eyebrow">
                <span className="section-emoji" aria-hidden="true">
                  <img src={checkIcon} alt="" className="section-icon" />
                </span>{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.socialProofEyebrow") }}
                ></span>
              </p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.socialProofTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.socialProofIntro") }}
              ></p>
            </div>
            <div className="social-proof-grid">
              {socialProofItems.map((item, i) => (
                <article
                  className="social-proof-card reveal"
                  key={item.title}
                  style={{ "--reveal-delay": `${i * 90}ms` }}
                >
                  <span className="social-proof-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <p
                    className="social-proof-label"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  ></p>
                  <p
                    className="social-proof-detail"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  ></p>
                  {item.meta && (
                    <span
                      className="social-proof-meta"
                      dangerouslySetInnerHTML={{ __html: item.meta }}
                    ></span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Final CTA Section === */}
        <section className="home-cta" ref={ctaRef}>
          <div className="section-shell">
            <div className="home-cta-card reveal-scale">
              <p
                className="section-eyebrow"
                dangerouslySetInnerHTML={{ __html: t("home.ctaEyebrow") }}
              ></p>
              <h3 dangerouslySetInnerHTML={{ __html: t("home.ctaTitle") }}></h3>
              <p dangerouslySetInnerHTML={{ __html: t("home.ctaText") }}></p>
              <div className="cta-actions">
                <Link to="/contact" className="cta-btn">
                  <span
                    dangerouslySetInnerHTML={{ __html: t("home.ctaButton") }}
                  ></span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
