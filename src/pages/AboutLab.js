import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import { More, RiseTitle, plain, useReveal } from "../components/lab/LabKit";
import "./HomeLab.css";
import "./AboutLab.css";

// Only .webp, as on the live About page, so the PNGs stay out of the bundle.
const founderImages = require.context("../assets", false, /\.webp$/);

const firstName = (name = "") =>
  name
    .split(" ")[0]
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const founderImage = (name) => {
  try {
    return founderImages(`./${firstName(name)}.webp`);
  } catch (error) {
    return null;
  }
};

/**
 * Timeline: the line fills down to the middle of the screen (--fill on the
 * list) and each chapter turns on once its top passes that point.
 */
function useTimeline() {
  const ref = useRef(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const chapters = Array.from(list.children);
    let frame = 0;

    const update = () => {
      frame = 0;
      const mid = window.innerHeight * 0.55;
      const rect = list.getBoundingClientRect();
      const fill = Math.min(Math.max((mid - rect.top) / rect.height, 0), 1);
      list.style.setProperty("--fill", fill.toFixed(4));
      chapters.forEach((c) => {
        c.classList.toggle("is-on", c.getBoundingClientRect().top < mid);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return ref;
}

function AboutLab() {
  const { t } = useTranslation();
  const seo = t("seo.about") || {};
  const seoDefaults = t("seo.defaults") || {};
  const lab = t("about.lab") || {};
  const chapters = lab.chapters || [];
  const founders = t("about.founders") || [];

  const rootRef = useRef(null);
  const timelineRef = useTimeline();
  useReveal(rootRef);

  return (
    <div className="lx lx-about" ref={rootRef}>
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        canonicalPath="/about/"
        siteName={t("seo.siteName") || "AllerCarte"}
      />

      {/* === Hero === */}
      <section className="lx-hero lx-page-hero">
        <div className="lx-shell lx-hero__copy">
          <p className="lx-eyebrow lx-rise" style={{ "--d": "0ms" }}>
            {plain(t("about.heroTag"))}
          </p>
          <RiseTitle text={lab.heroTitle} className="lx-hero__title lx-page-hero__title" />
          <p className="lx-hero__text lx-rise" style={{ "--d": "600ms" }}>
            {lab.heroLead}
          </p>
        </div>
      </section>

      {/* === The story, chapter by chapter === */}
      <section className="lx-section lx-timeline">
        <div className="lx-shell">
          <ol className="lx-timeline__list" ref={timelineRef}>
            {chapters.map((c, i) => (
              <li key={c.label} className="lx-chapter">
                <span className="lx-chapter__dot" aria-hidden="true" />
                <p className="lx-chapter__label">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {c.label}
                </p>
                <h2 className="lx-chapter__title">{c.title}</h2>
                <p className="lx-chapter__text">{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* === What we learned, in one line === */}
      <section className="lx-about-quote">
        <div className="lx-shell">
          <blockquote className="lx-reveal">
            <span aria-hidden="true">“</span>
            {plain(t("about.storyQuote"))}
            <span aria-hidden="true">”</span>
          </blockquote>
        </div>
      </section>

      {/* === Founders === */}
      <section className="lx-section">
        <div className="lx-shell">
          <header className="lx-head lx-head--center lx-reveal">
            <h2 className="lx-h2">{plain(t("about.teamTitle"))}</h2>
            <p className="lx-lead">{plain(t("about.teamIntro"))}</p>
          </header>
          <ul className="lx-founders">
            {founders.map((f, i) => {
              const src = founderImage(f.name);
              return (
                <li key={f.name} className="lx-reveal" style={{ "--d": `${i * 120}ms` }}>
                  <div className="lx-founders__photo">
                    {src && <img src={src} alt={f.name} loading="lazy" decoding="async" />}
                  </div>
                  <h3>{f.name}</h3>
                  <p className="lx-founders__role">{f.role}</p>
                  <p className="lx-founders__bio">{plain(f.bio)}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* === Where we're headed, on dark === */}
      <section className="lx-section lx-dark lx-about-vision">
        <div className="lx-shell lx-reveal">
          <p className="lx-eyebrow">{lab.visionLabel}</p>
          <p className="lx-about-vision__text">{plain(t("about.visionBody"))}</p>
        </div>
      </section>

      {/* === CTA === */}
      <section className="lx-section lx-cta">
        <div className="lx-shell lx-reveal">
          <h2 className="lx-cta__title">{plain(t("about.ctaTitle"))}</h2>
          <p className="lx-lead" dangerouslySetInnerHTML={{ __html: t("about.ctaBody") }} />
          <div className="lx-hero__actions">
            <Link to="/contact" className="lx-btn">
              {t("contact.title")}
            </Link>
            <More href="https://www.allercarte.com/mapa">{plain(t("home.heroCta"))}</More>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutLab;
