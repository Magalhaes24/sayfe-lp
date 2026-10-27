import React from "react";
import { Link } from "react-router-dom";
import DotGrid from "../components/DotGrid";
import { useTranslation } from "../contexts/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import Seo from "../components/Seo";
import ssAllergens from "../assets/app/ss-allergens.webp";
import ssMap from "../assets/app/ss-map.webp";
import ssMenuDanger from "../assets/app/ss-menu-danger.webp";
import ssContribution from "../assets/app/ss-contribution.webp";

const APP_SHOTS = {
  allergens: ssAllergens,
  map: ssMap,
  "menu-danger": ssMenuDanger,
  contribution: ssContribution
};

const APP_URL = "https://besayfe.com/mapa";
const RESTAURANTS_URL = "https://besayfe.com/restaurantes";

const scrollToHow = () => {
  const el = document.getElementById("how-it-works");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function Home() {
  const { t } = useTranslation();
  const trustItems = t("home.heroTrust") || [];
  const legendItems = t("home.legend") || [];
  const allergenItems = t("home.allergens") || [];
  const faqItems = t("home.faq") || [];
  const legendRef = useReveal();
  const faqRef = useReveal();
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.home") || {};

  const mock = t("home.mock") || {};
  const mockFilters = mock.filterChips || [];
  const mockDishes = mock.dishes || [];
  const problemPoints = t("home.problem.points") || [];
  const solutionSteps = t("home.solution.steps") || [];
  const galleryItems = t("home.gallery.items") || [];
  const featureItems = t("home.features.items") || [];
  const socialProofItems = t("home.socialProof.items") || [];
  const citiesStats = t("home.citiesStats") || [];
  const cityItems = t("home.cities") || [];

  // Scrolls without touching the URL hash: a hash change would restart the
  // global loading screen, which watches the whole location object.
  const problemRef  = useReveal();
  const solutionRef = useReveal();
  const citiesRef   = useReveal();
  const galleryRef  = useReveal();
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
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.heroEyebrow") }}
                ></span>
              </p>
              <h1 className="demo-title">
                <span
                  className="demo-title__text"
                  dangerouslySetInnerHTML={{ __html: t("home.heroTitle") }}
                ></span>
              </h1>
              <p
                className="demo-text"
                dangerouslySetInnerHTML={{ __html: t("home.heroText") }}
              ></p>
              <div className="hero-actions">
                <a href={APP_URL} className="demo-btn">
                  <span
                    dangerouslySetInnerHTML={{ __html: t("home.heroCta") }}
                  ></span>
                </a>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={scrollToHow}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t("home.heroSecondaryCta")
                    }}
                  ></span>
                </button>
              </div>
              <ul className="hero-trust">
                {trustItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="demo-visual">
              {/* The menu as a guest reads it: their profile, then the dishes. */}
              <div className="product-mock" aria-hidden="true">
                {/* The app's map screen: search, filter pills, pins coloured for the profile. */}
                <div className="mock-map">
                  <div className="mock-map__search">{mock.search}</div>
                  <div className="mock-map__pills">
                    <span>{mock.allergiesPill}</span>
                    <span>{mock.filtersPill}</span>
                  </div>
                  <span className="mock-pin mock-pin--safe" style={{ top: "58%", left: "22%" }}></span>
                  <span className="mock-pin mock-pin--info" style={{ top: "70%", left: "48%" }}></span>
                  <span className="mock-pin mock-pin--safe" style={{ top: "52%", left: "66%" }}></span>
                  <span className="mock-pin mock-pin--warn" style={{ top: "76%", left: "80%" }}></span>
                  <span className="mock-pin mock-pin--danger" style={{ top: "64%", left: "36%" }}></span>
                  <span className="mock-map__list">{mock.listPill}</span>
                </div>
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

              <p
                className="mock-disclaimer"
                dangerouslySetInnerHTML={{ __html: t("home.disclaimer") }}
              ></p>
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

        {/* === Colour legend + allergens === */}
        <section className="legend" ref={legendRef}>
          <div className="section-shell">
            <div className="section-heading section-heading--center reveal">
              <p className="section-eyebrow">{t("home.legendEyebrow")}</p>
              <h3 className="section-title">{t("home.legendTitle")}</h3>
              <p className="section-intro">{t("home.legendIntro")}</p>
            </div>
            <div className="legend-grid">
              {legendItems.map((item, i) => (
                <article
                  className={`legend-card legend-card--${item.tone} reveal-scale`}
                  key={item.tone}
                  style={{ "--reveal-delay": `${i * 80}ms` }}
                >
                  <span className="legend-dot" aria-hidden="true"></span>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <p className="allergen-strip__label reveal">
              {t("home.allergensLabel")}
            </p>
            <ul className="allergen-strip reveal">
              {allergenItems.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* === Coverage: the same numbers the app's restaurant list shows === */}
        <section className="cities" ref={citiesRef}>
          <div className="section-shell">
            <div className="section-heading section-heading--center reveal">
              <p className="section-eyebrow">{t("home.citiesEyebrow")}</p>
              <h3 className="section-title">{t("home.citiesTitle")}</h3>
              <p className="section-intro">{t("home.citiesIntro")}</p>
            </div>
            <dl className="cities-stats reveal">
              {citiesStats.map((stat) => (
                <div className="cities-stat" key={stat.label}>
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
            <ul className="cities-list reveal">
              {cityItems.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
            <div className="cities-actions reveal">
              <a href={RESTAURANTS_URL} className="cities-btn">
                {t("home.citiesCta")}
              </a>
              <p className="cities-note">{t("home.citiesNote")}</p>
            </div>
          </div>
        </section>

        {/* === App Screenshots === */}
        <section className="app-gallery" ref={galleryRef}>
          <div className="section-shell">
            <div className="section-heading section-heading--center reveal">
              <p className="section-eyebrow">
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.galleryEyebrow") }}
                ></span>
              </p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.galleryTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.galleryIntro") }}
              ></p>
            </div>
            <div className="app-gallery-grid">
              {galleryItems.map((item, i) => (
                <figure
                  className="app-shot reveal-scale"
                  key={item.key}
                  style={{ "--reveal-delay": `${i * 90}ms` }}
                >
                  <div className="app-shot__frame">
                    <img
                      src={APP_SHOTS[item.key]}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      data-skip-preload="true"
                      width="720"
                      height="1210"
                    />
                  </div>
                  <figcaption>
                    <h4 dangerouslySetInnerHTML={{ __html: item.title }}></h4>
                    <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                  </figcaption>
                </figure>
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

        {/* === FAQ === */}
        <section className="home-faq" ref={faqRef}>
          <div className="section-shell">
            <div className="section-heading reveal">
              <p className="section-eyebrow">{t("home.faqEyebrow")}</p>
              <h3 className="section-title">{t("home.faqTitle")}</h3>
            </div>
            <div className="faq-list">
              {faqItems.map((item) => (
                <details className="faq-item reveal" key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
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
                <a href={APP_URL} className="cta-btn">
                  <span
                    dangerouslySetInnerHTML={{ __html: t("home.ctaButton") }}
                  ></span>
                </a>
                <Link to="/contact" className="ghost-btn">
                  {t("home.ctaSecondaryLabel")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <a href={APP_URL} className="sticky-cta" aria-label={t("home.stickyCta")}>
          {t("home.stickyCta")}
        </a>
      </main>
    </div>
  );
}

export default Home;
