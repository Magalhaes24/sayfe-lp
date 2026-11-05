import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import shotAllergens from "../assets/app/app-allergens.jpg";
import shotMap from "../assets/app/app-map.jpg";
import shotContribution from "../assets/app/app-contribution.jpg";
import "./HomeStartup.css";

// Second test direction (/lab2): warmer and more playful, startup style.
// Same facts as the rest of the site; only the tone and the look change.

const APP_URL = "https://www.allercarte.com/mapa";
const STEP_SHOTS = [shotAllergens, shotMap, shotContribution];
// How far each screenshot slides up inside its card, to show the useful part.
const STEP_SHIFT = ["-46%", "-8%", "0%"];

export const COPY = {
  pt: {
    titleA: "Vê o que leva cada prato",
    titleB: "antes de pedires",
    checks: [
      "Escolhe as tuas alergias entre as 14 da UE",
      "Vê no mapa onde há pratos para ti",
      "Abre logo no navegador do telemóvel"
    ],
    startHere: "Começa aqui",
    micro: ["📸 Sem menu? Fotografa-o", "🌍 Em português e inglês"],
    bubbles: ["✅ 3 pratos sem as tuas alergias", "⚠️ Possível contacto · Glúten", "📍 Tasca do Largo · Lisboa"],
    statsTitleA: "Portugal inteiro,",
    statsTitleB: "prato a prato",
    statsNote: "* De Viana do Castelo ao Algarve, com a Madeira e os Açores incluídos 🏝️",
    stepsTitle: "Três passos e já estás à mesa 🍽️",
    stepEmoji: ["✋", "🗺️", "📸"],
    step: "Passo",
    askTitle: "E se estás a pensar…",
    chat: [
      {
        q: "E se o restaurante onde vou não estiver no mapa? 🤔",
        a: "Tira uma fotografia ao menu. O AllerCarte lê-o e estima os alergénios de cada prato na hora."
      },
      {
        q: "E se eu tiver mais do que uma alergia? 🙋",
        a: "Marca todas as que evitas. Cada prato é comparado com todas ao mesmo tempo."
      },
      {
        q: "E se a estimativa estiver errada? 😬",
        a: "Só aparece a verde o que o restaurante confirma. Se vires um erro, reportas a partir do próprio menu."
      }
    ],
    whyTitleA: "Porque é que",
    whyTitleB: "isto importa 💚",
    finalA: "Pronto para comer fora",
    finalB: "com mais calma?",
    finalText: "Escolher as tuas alergias demora menos de um minuto.",
    finalNote: "Experimenta já 👇",
    suggest: "Sugerir um restaurante",
    open: "Abrir o mapa"
  },
  en: {
    titleA: "See what goes into every dish",
    titleB: "before you order",
    checks: [
      "Pick your allergies from the 14 EU allergens",
      "See on the map where there are dishes for you",
      "Opens straight in your phone's browser"
    ],
    startHere: "Start here",
    micro: ["📸 No menu? Photograph it", "🌍 In Portuguese and English"],
    bubbles: ["✅ 3 dishes free of your allergens", "⚠️ Possible cross-contact · Gluten", "📍 Tasca do Largo · Lisbon"],
    statsTitleA: "All of Portugal,",
    statsTitleB: "dish by dish",
    statsNote: "* From Viana do Castelo to the Algarve, Madeira and the Azores included 🏝️",
    stepsTitle: "Three steps and you're at the table 🍽️",
    stepEmoji: ["✋", "🗺️", "📸"],
    step: "Step",
    askTitle: "And if you're wondering…",
    chat: [
      {
        q: "What if the restaurant I'm going to isn't on the map? 🤔",
        a: "Take a photo of the menu. AllerCarte reads it and estimates the allergens in each dish on the spot."
      },
      {
        q: "What if I have more than one allergy? 🙋",
        a: "Tick every one you avoid. Each dish is checked against all of them at once."
      },
      {
        q: "What if the estimate is wrong? 😬",
        a: "Only what the restaurant confirms shows up green. If you spot a mistake, you can report it from the menu itself."
      }
    ],
    whyTitleA: "Why this",
    whyTitleB: "matters 💚",
    finalA: "Ready to eat out",
    finalB: "with less worry?",
    finalText: "Picking your allergies takes less than a minute.",
    finalNote: "Try it now 👇",
    suggest: "Suggest a restaurant",
    open: "Open the map"
  }
};

export const plain = (html) => String(html || "").replace(/<[^>]+>/g, "");

// .is-in once on screen, for the pop-in reveals.
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".st-reveal");
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

// Counts up when the number scrolls into view. It starts on the real value
// and only drops to 0 if it is still below the fold, so crawlers, reduced
// motion and anything that never scrolls always see the true figure.
export function CountUp({ value }) {
  const ref = useRef(null);
  const match = String(value).match(/^(\d+)(.*)$/);
  const [n, setN] = useState(match ? Number(match[1]) : value);

  useEffect(() => {
    const el = ref.current;
    if (!match || !el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    const target = Number(match[1]);
    setN(0);
    let frame;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const k = Math.min((now - start) / 1400, 1);
        setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span ref={ref}>{match ? `${n}${match[2]}` : value}</span>;
}

export function Check() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Hand-drawn arrow next to the "Start here" note.
export function DoodleArrow() {
  return (
    <svg className="st-doodle" viewBox="0 0 90 46" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8c18 2 44 6 62 22" />
      <path d="M58 33l9 -2 -3 -9" />
    </svg>
  );
}

export function FaqItem({ item, open, onToggle, id }) {
  return (
    <div className={`st-faq__item${open ? " is-open" : ""}`}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span>{item.q}</span>
          <span className="st-faq__icon" aria-hidden="true" />
        </button>
      </h3>
      <div className="st-faq__answer" id={id} role="region" aria-hidden={!open}>
        <div>
          <p>{item.a}</p>
        </div>
      </div>
    </div>
  );
}

function HomeStartup() {
  const { t, language } = useTranslation();
  const c = COPY[language] || COPY.pt;
  const seo = t("seo.home") || {};
  const seoDefaults = t("seo.defaults") || {};
  const steps = t("home.solution.steps") || [];
  const stats = t("home.citiesStats") || [];
  const why = (t("home.socialProof.items") || []).slice(0, 2);
  // "No account needed" is not something we sell: skip that question.
  const faq = (t("home.faq") || []).filter((f) => !/conta|account/i.test(f.q));

  const [faqOpen, setFaqOpen] = useState(0);
  const rootRef = useRef(null);
  useReveal(rootRef);

  return (
    <div className="st" ref={rootRef}>
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        canonicalPath="/"
        noindex
        siteName={t("seo.siteName") || "AllerCarte"}
      />

      {/* === Hero === */}
      <section className="st-hero">
        <div className="st-shell st-hero__grid">
          <div className="st-hero__copy">
            <h1 className="st-hero__title">
              {c.titleA} <mark>{c.titleB}</mark>
            </h1>
            <ul className="st-checks">
              {c.checks.map((item, i) => (
                <li key={item} style={{ "--d": `${200 + i * 90}ms` }}>
                  <span className="st-checks__icon"><Check /></span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="st-note">
              {c.startHere}
              <DoodleArrow />
            </p>
            <a href={APP_URL} className="st-btn st-btn--big">
              <span aria-hidden="true">🗺️</span>
              {c.open}
            </a>
            <ul className="st-micro">
              {c.micro.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>

          <div className="st-hero__visual" aria-hidden="true">
            <div className="st-blob" />
            <div className="st-phone">
              <img src={shotMap} alt="" width="750" height="1280" />
            </div>
            {c.bubbles.map((b, i) => (
              <span key={b} className={`st-bubble st-bubble--${i}`}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === Numbers === */}
      <section className="st-section">
        <div className="st-shell">
          <h2 className="st-h2 st-center st-reveal">
            {c.statsTitleA} <mark>{c.statsTitleB}</mark>
            <sup>*</sup>
          </h2>
          <div className="st-stats">
            {stats.map((s, i) => (
              <div key={s.label} className="st-stat st-reveal" style={{ "--d": `${i * 90}ms` }}>
                <span className="st-stat__emoji" aria-hidden="true">{["🍽️", "📍", "🛡️"][i]}</span>
                <strong><CountUp value={s.value} /></strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="st-footnote st-reveal">{c.statsNote}</p>
        </div>
      </section>

      {/* === Steps === */}
      <section className="st-section st-steps" id="st-how">
        <div className="st-shell">
          <p className="st-pill st-reveal">⚙️ {plain(t("home.solutionEyebrow"))}</p>
          <h2 className="st-h2 st-reveal">{c.stepsTitle}</h2>
          <ol className="st-steps__grid">
            {steps.map((s, i) => (
              <li key={s.title} className="st-card st-reveal" style={{ "--d": `${i * 110}ms` }}>
                <span className="st-pill st-pill--soft">{c.step} {i + 1}</span>
                <h3>
                  {plain(s.title)} <span className="st-wiggle">{c.stepEmoji[i]}</span>
                </h3>
                <p>{plain(s.text)}</p>
                <div className="st-card__art" style={{ "--shift": STEP_SHIFT[i] }}>
                  <img src={STEP_SHOTS[i]} alt="" loading="lazy" decoding="async" width="750" height="1280" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* === Questions, answered like a chat === */}
      <section className="st-section st-chat">
        <div className="st-shell st-chat__shell">
          <h2 className="st-h2 st-center st-reveal">{c.askTitle}</h2>
          <div className="st-chat__thread">
            {c.chat.map((m, i) => (
              <div key={m.q} className="st-chat__pair">
                <p className="st-msg st-msg--q st-reveal">{m.q}</p>
                <p className="st-msg st-msg--a st-reveal" style={{ "--d": "450ms" }}>
                  <span className="st-msg__typing" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="st-msg__text">{m.a}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Why it matters, on dark === */}
      <section className="st-section st-dark">
        <div className="st-shell">
          <h2 className="st-h2 st-center st-reveal">
            {c.whyTitleA} <mark>{c.whyTitleB}</mark>
          </h2>
          <div className="st-why">
            {why.map((w, i) => (
              <div key={w.title} className="st-why__card st-reveal" style={{ "--d": `${i * 120}ms` }}>
                <strong>{plain(w.title)}</strong>
                <p>{plain(w.text)}</p>
                <small dangerouslySetInnerHTML={{ __html: w.meta }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section className="st-section">
        <div className="st-shell st-faq">
          <h2 className="st-h2 st-center st-reveal">{t("home.faqTitle")}</h2>
          <div className="st-faq__list st-reveal">
            {faq.map((item, i) => (
              <FaqItem
                key={item.q}
                id={`st-faq-${i}`}
                item={item}
                open={faqOpen === i}
                onToggle={() => setFaqOpen((o) => (o === i ? -1 : i))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* === Final CTA === */}
      <section className="st-section st-final-wrap">
        <div className="st-shell">
          <div className="st-final st-reveal">
            <h2 className="st-h2">
              {c.finalA} <mark>{c.finalB}</mark>
            </h2>
            <p>{c.finalText}</p>
            <p className="st-note st-note--light">{c.finalNote}</p>
            <div className="st-final__actions">
              <a href={APP_URL} className="st-btn st-btn--big st-btn--light">
                <span aria-hidden="true">🗺️</span>
                {c.open}
              </a>
              <Link to="/contact" className="st-link">
                {c.suggest} →
              </Link>
            </div>
            <p className="st-final__fine">{plain(t("home.disclaimer"))}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeStartup;
