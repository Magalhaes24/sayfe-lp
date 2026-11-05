import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import LiveDemo from "../components/lab/LiveDemo";
import shotAllergens from "../assets/app/app-allergens.jpg";
import shotMap from "../assets/app/app-map.jpg";
import shotMenu from "../assets/app/app-menu.jpg";
import shotContribution from "../assets/app/app-contribution.jpg";
import { COPY, CountUp, FaqItem, plain, useReveal } from "./HomeStartup";
import { EXTRA, FlipCard, labLegend, useDepthScroll, usePointerTilt } from "./HomeDepth";
import "./HomeStartup.css";
import "./HomeDepth.css";
import "./HomeMix.css";

// Home page. Startup tone and colour, Apple restraint (centred hero, white
// space, the real interactive demo) and 3D depth where it helps.

const APP_URL = "https://www.allercarte.com/mapa";
const STACK_SHOTS = [shotAllergens, shotMap, shotContribution];

const MIX = {
  pt: {
    noteA: "Experimenta: toca numa alergia 👆",
    noteB: "E depois num pin do mapa 📍",
    how: "Ver como funciona"
  },
  en: {
    noteA: "Try it: tap an allergy 👆",
    noteB: "Then a pin on the map 📍",
    how: "See how it works"
  }
};

function HomeMix() {
  const { t, language } = useTranslation();
  const reduceMotion = Boolean(useReducedMotion());
  const c = COPY[language] || COPY.pt;
  const x = EXTRA[language] || EXTRA.pt;
  const m = MIX[language] || MIX.pt;
  const seo = t("seo.home") || {};
  const seoDefaults = t("seo.defaults") || {};
  const steps = t("home.solution.steps") || [];
  const stats = t("home.citiesStats") || [];
  const legend = labLegend(t("home.legend") || [], language);
  const why = (t("home.socialProof.items") || []).slice(0, 2);
  // "No account needed" is not something we sell: skip that question.
  const faq = (t("home.faq") || []).filter((f) => !/conta|account/i.test(f.q));

  const [faqOpen, setFaqOpen] = useState(0);
  const rootRef = useRef(null);
  const demoTilt = usePointerTilt(4);
  const finalTilt = usePointerTilt(6);
  useReveal(rootRef);
  useDepthScroll(rootRef);

  return (
    <div className="st d3 mx" ref={rootRef}>
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        canonicalPath="/"
        faq={faq}
        siteName={t("seo.siteName") || "AllerCarte"}
      />

      {/* === Hero: one message, one button, then the product itself === */}
      <section className="mx-hero">
        <div className="st-shell mx-hero__copy">
          <p className="st-pill mx-rise" style={{ "--d": "0ms" }}>
            ✨ {plain(t("home.heroEyebrow"))}
          </p>
          <h1 className="mx-hero__title mx-rise" style={{ "--d": "80ms" }}>
            {c.titleA} <mark>{c.titleB}</mark>
          </h1>
          <p
            className="mx-hero__lead mx-rise"
            style={{ "--d": "180ms" }}
            dangerouslySetInnerHTML={{ __html: t("home.heroText") }}
          />
          <div className="mx-hero__actions mx-rise" style={{ "--d": "280ms" }}>
            <a href={APP_URL} className="st-btn st-btn--big">
              <span aria-hidden="true">🗺️</span>
              {c.open}
            </a>
            <a href="#st-how" className="st-link mx-hero__how">
              {m.how} ↓
            </a>
          </div>
        </div>

        {/* The demo lies back a little and stands up as it scrolls in. */}
        <div className="st-shell mx-stage" ref={demoTilt} data-depth-p>
          <div className="mx-stage__tilt">
            <span className="mx-float mx-float--a" aria-hidden="true">{m.noteA}</span>
            <span className="mx-float mx-float--b" aria-hidden="true">{m.noteB}</span>
            <div className="demo-wrap mx-stage__demo">
              <LiveDemo t={t} language={language} reduceMotion={reduceMotion} />
            </div>
          </div>
          <p className="mx-fine">{plain(t("home.disclaimer"))}</p>
        </div>
      </section>

      {/* === Numbers === */}
      <section className="st-section mx-section">
        <div className="st-shell">
          <h2 className="st-h2 st-center st-reveal">
            {c.statsTitleA} <mark>{c.statsTitleB}</mark>
            <sup>*</sup>
          </h2>
          <div className="st-stats d3-stats">
            {stats.map((s, i) => (
              <div key={s.label} className="st-stat d3-stat st-reveal" style={{ "--d": `${i * 110}ms` }}>
                <strong><CountUp value={s.value} /></strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="st-footnote st-reveal">{c.statsNote}</p>
        </div>
      </section>

      {/* === Steps stack in depth === */}
      <section className="st-section mx-section d3-stack" id="st-how">
        <div className="st-shell">
          <header className="mx-head mx-head--center st-reveal">
            <p className="st-pill">⚙️ {plain(t("home.solutionEyebrow"))}</p>
            <h2 className="st-h2 st-center">{c.stepsTitle}</h2>
          </header>
          <ol className="d3-stack__list">
            {steps.map((s, i) => (
              <li key={s.title} className="d3-stack__card" style={{ "--i": i }}>
                <div className="d3-stack__copy">
                  <span className="st-pill st-pill--soft">{c.step} {i + 1}</span>
                  <h3>{plain(s.title)}</h3>
                  <p>{plain(s.text)}</p>
                </div>
                <div className="d3-stack__device" aria-hidden="true">
                  <div className="d3-mini-phone">
                    <img src={STACK_SHOTS[i]} alt="" loading="lazy" decoding="async" width="750" height="1280" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* === Colours === */}
      <section className="st-section mx-section">
        <div className="st-shell">
          <header className="mx-head mx-head--center st-reveal">
            <h2 className="st-h2 st-center">{t("home.legendTitle")}</h2>
            <p className="mx-lead">{t("home.legendIntro")}</p>
          </header>
          <ul className="d3-flips">
            {legend.map((item) => (
              <FlipCard key={item.tone} item={item} hint={x.flip} hintHover={x.flipHover} />
            ))}
          </ul>
        </div>
      </section>

      {/* === Questions, answered like a chat === */}
      <section className="st-section mx-section st-chat d3-chat mx-chat">
        <div className="st-shell st-chat__shell">
          <h2 className="st-h2 st-center st-reveal">{c.askTitle}</h2>
          <div className="st-chat__thread">
            {c.chat.map((msg) => (
              <div key={msg.q} className="st-chat__pair">
                <p className="st-msg st-msg--q st-reveal">{msg.q}</p>
                <p className="st-msg st-msg--a st-reveal" style={{ "--d": "450ms" }}>
                  <span className="st-msg__typing" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="st-msg__text">{msg.a}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Why it matters, on dark, with depth === */}
      <section className="st-section mx-section st-dark d3-why" data-depth-p>
        <span className="d3-float d3-float--a" aria-hidden="true">🌾</span>
        <span className="d3-float d3-float--b" aria-hidden="true">🥜</span>
        <span className="d3-float d3-float--c" aria-hidden="true">🥛</span>
        <span className="d3-float d3-float--d" aria-hidden="true">🦐</span>
        <div className="st-shell">
          <h2 className="st-h2 st-center st-reveal">
            {c.whyTitleA} <mark>{c.whyTitleB}</mark>
          </h2>
          <div className="st-why">
            {why.map((w, i) => (
              <div key={w.title} className="st-why__card d3-why__card st-reveal" style={{ "--d": `${i * 120}ms` }}>
                <strong>{plain(w.title)}</strong>
                <p>{plain(w.text)}</p>
                <small dangerouslySetInnerHTML={{ __html: w.meta }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section className="st-section mx-section">
        <div className="st-shell st-faq">
          <h2 className="st-h2 st-center st-reveal">{t("home.faqTitle")}</h2>
          <div className="st-faq__list st-reveal">
            {faq.map((item, i) => (
              <FaqItem
                key={item.q}
                id={`mx-faq-${i}`}
                item={item}
                open={faqOpen === i}
                onToggle={() => setFaqOpen((o) => (o === i ? -1 : i))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* === Final CTA: copy on the left, two phones leaning out of the card === */}
      <section className="st-section mx-section mx-final-wrap">
        <div className="st-shell">
          <div className="d3-final-stage st-reveal" ref={finalTilt}>
            <div className="mx-final">
              <span className="d3-final__glare" aria-hidden="true" />
              <div className="mx-final__copy">
                {stats[0] && (
                  <p className="mx-final__pill">
                    <span className="mx-final__dot" aria-hidden="true" />
                    {stats[0].value} {stats[0].label}
                  </p>
                )}
                <h2 className="mx-final__title">
                  {c.finalA} <span>{c.finalB}</span>
                </h2>
                <p className="mx-final__text">{c.finalText}</p>
                <div className="mx-final__actions">
                  <a href={APP_URL} className="st-btn st-btn--big st-btn--light">
                    {c.open}
                    <span aria-hidden="true">→</span>
                  </a>
                  <Link to="/contact" className="mx-final__link">
                    {c.suggest}
                  </Link>
                </div>
              </div>
              <div className="mx-final__phones" aria-hidden="true">
                <div className="mx-final__phone mx-final__phone--back">
                  <img src={shotMenu} alt="" loading="lazy" decoding="async" width="750" height="1280" />
                </div>
                <div className="mx-final__phone mx-final__phone--front">
                  <img src={shotMap} alt="" loading="lazy" decoding="async" width="750" height="1280" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeMix;
