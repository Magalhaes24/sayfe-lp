import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import SafetyIcon from "../components/SafetyIcon";
import shotAllergens from "../assets/app/app-allergens.jpg";
import shotMap from "../assets/app/app-map.jpg";
import shotContribution from "../assets/app/app-contribution.jpg";
import { COPY, Check, CountUp, DoodleArrow, FaqItem, plain, useReveal } from "./HomeStartup";
import { labLegend } from "../components/lab/LabKit";
import "./HomeStartup.css";
import "./HomeDepth.css";

export { labLegend };

// Third test direction (/lab3): the /lab2 tone with real depth. Everything is
// CSS 3D (perspective, translateZ, rotations), so it stays sharp on any screen
// and runs on the compositor. Scroll and pointer only write a few CSS vars.

const APP_URL = "https://www.allercarte.com/mapa";
const STACK_SHOTS = [shotAllergens, shotMap, shotContribution];
const ORBIT = ["🌾", "🥛", "🥚", "🐟", "🦐", "🥜", "🌰", "🐚"];

export const EXTRA = {
  pt: { flip: "Toca para virar", flipHover: "Clica para virar", orbitLabel: "Os 14 alergénios da UE" },
  en: { flip: "Tap to flip", flipHover: "Click to flip", orbitLabel: "The 14 EU allergens" }
};

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One scroll loop for the whole page. It writes:
 *  --p on [data-depth-p]: 0 when the element enters at the bottom, 1 when it
 *     leaves at the top;
 *  --k on each stacked card: how far the next card has slid over it.
 * Only elements on screen are measured.
 */
export function useDepthScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion()) return;
    const tracked = Array.from(root.querySelectorAll("[data-depth-p]"));
    const cards = Array.from(root.querySelectorAll(".d3-stack__card"));
    const visible = new Set();
    const io = new IntersectionObserver((entries) =>
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)))
    );
    [...tracked, ...cards].forEach((el) => io.observe(el));

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      tracked.forEach((el) => {
        if (!visible.has(el)) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--p", clamp01((vh - r.top) / (vh + r.height)).toFixed(4));
      });
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next || !visible.has(card)) return;
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        card.style.setProperty("--k", clamp01(1 - (b.top - a.top) / a.height).toFixed(4));
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [rootRef]);
}

/**
 * Pointer depth: the element leans toward a mouse (eased, so it glides).
 * Touch screens keep the slow idle sway from CSS instead.
 */
export function usePointerTilt(max = 10) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || reducedMotion()) return;
    let tx = 0, ty = 0, x = 0, y = 0, frame = 0, running = false;
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
      if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) {
        frame = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };
    const kick = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(loop);
      }
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
      kick();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.style.setProperty("--tilt", `${max}deg`);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return ref;
}

export function FlipCard({ item, hint, hintHover }) {
  const [flipped, setFlipped] = useState(false);
  return (
    // The <li> keeps a fixed className: the reveal adds .is-in to it from
    // outside React, and changing className on click would wipe that class
    // (the card faded out). The flip state lives on the inner element.
    <li className={`d3-flip d3-tone--${item.tone} st-reveal`}>
      <button type="button" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}>
        <span className={`d3-flip__inner${flipped ? " is-flipped" : ""}`}>
          <span className="d3-flip__face d3-flip__front">
            <span className="d3-flip__pin">
              <SafetyIcon tone={item.tone} size={26} strokeWidth={2.4} />
            </span>
            <strong>{item.title}</strong>
            <small>
              <span className="d3-touch">{hint}</span>
              <span className="d3-mouse">{hintHover}</span> ↻
            </small>
          </span>
          <span className="d3-flip__face d3-flip__back">
            <SafetyIcon tone={item.tone} size={20} strokeWidth={2.4} />
            <span>{item.text}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

function HomeDepth() {
  const { t, language } = useTranslation();
  const c = COPY[language] || COPY.pt;
  const x = EXTRA[language] || EXTRA.pt;
  const seo = t("seo.home") || {};
  const seoDefaults = t("seo.defaults") || {};
  const steps = t("home.solution.steps") || [];
  const stats = t("home.citiesStats") || [];
  const legend = labLegend(t("home.legend") || [], language);
  const allergens = t("home.allergens") || [];
  const why = (t("home.socialProof.items") || []).slice(0, 2);
  // "No account needed" is not something we sell: skip that question.
  const faq = (t("home.faq") || []).filter((f) => !/conta|account/i.test(f.q));

  const [faqOpen, setFaqOpen] = useState(0);
  const rootRef = useRef(null);
  const heroTilt = usePointerTilt(10);
  const finalTilt = usePointerTilt(6);
  useReveal(rootRef);
  useDepthScroll(rootRef);

  return (
    <div className="st d3" ref={rootRef}>
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        canonicalPath="/"
        noindex
        siteName={t("seo.siteName") || "AllerCarte"}
      />

      {/* === Hero: copy + a 3D scene (phone, orbiting allergens, notes) === */}
      <section className="st-hero d3-hero">
        <div className="st-shell st-hero__grid">
          <div className="st-hero__copy">
            <h1 className="st-hero__title d3-title">
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

          <div className="d3-stage" ref={heroTilt} data-depth-p aria-hidden="true">
            <div className="d3-scene">
              <div className="d3-blob" />
              <div className="d3-orbit">
                {ORBIT.map((e, i) => (
                  <span key={e} className="d3-orbit__item" style={{ "--i": i, "--n": ORBIT.length }}>
                    <span>{e}</span>
                  </span>
                ))}
              </div>
              <div className="d3-phone">
                <img src={shotMap} alt="" width="750" height="1280" />
                <span className="d3-phone__shine" />
              </div>
              {c.bubbles.map((b, i) => (
                <span key={b} className={`d3-bubble d3-bubble--${i}`}>
                  <span>{b}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === Allergens on two bands that run through space === */}
      <section className="d3-bands" aria-label={x.orbitLabel}>
        <div className="d3-band d3-band--back">
          <ul>{allergens.map((a) => <li key={a}>{a}</li>)}</ul>
          <ul aria-hidden="true">{allergens.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
        <div className="d3-band d3-band--front">
          <ul>{allergens.map((a) => <li key={a}>{a}</li>)}</ul>
          <ul aria-hidden="true">{allergens.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
      </section>

      {/* === Numbers that flip up into place === */}
      <section className="st-section">
        <div className="st-shell">
          <h2 className="st-h2 st-center st-reveal">
            {c.statsTitleA} <mark>{c.statsTitleB}</mark>
            <sup>*</sup>
          </h2>
          <div className="st-stats d3-stats">
            {stats.map((s, i) => (
              <div key={s.label} className="st-stat d3-stat st-reveal" style={{ "--d": `${i * 110}ms` }}>
                <span className="st-stat__emoji" aria-hidden="true">{["🍽️", "📍", "🛡️"][i]}</span>
                <strong><CountUp value={s.value} /></strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="st-footnote st-reveal">{c.statsNote}</p>
        </div>
      </section>

      {/* === Steps: cards stack in depth as you scroll === */}
      <section className="st-section d3-stack" id="st-how">
        <div className="st-shell">
          <p className="st-pill st-reveal">⚙️ {plain(t("home.solutionEyebrow"))}</p>
          <h2 className="st-h2 st-reveal">{c.stepsTitle}</h2>
          <ol className="d3-stack__list">
            {steps.map((s, i) => (
              <li key={s.title} className="d3-stack__card" style={{ "--i": i }}>
                <div className="d3-stack__copy">
                  <span className="st-pill st-pill--soft">{c.step} {i + 1}</span>
                  <h3>
                    {plain(s.title)} <span className="st-wiggle">{c.stepEmoji[i]}</span>
                  </h3>
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

      {/* === Colours: cards that flip over === */}
      <section className="st-section d3-legend">
        <div className="st-shell">
          <h2 className="st-h2 st-center st-reveal">{t("home.legendTitle")}</h2>
          <ul className="d3-flips">
            {legend.map((item) => (
              <FlipCard key={item.tone} item={item} hint={x.flip} hintHover={x.flipHover} />
            ))}
          </ul>
        </div>
      </section>

      {/* === Questions, answered like a chat === */}
      <section className="st-section st-chat d3-chat">
        <div className="st-shell st-chat__shell">
          <h2 className="st-h2 st-center st-reveal">{c.askTitle}</h2>
          <div className="st-chat__thread">
            {c.chat.map((m) => (
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

      {/* === Why it matters: numbers float at different depths === */}
      <section className="st-section st-dark d3-why" data-depth-p>
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
      <section className="st-section">
        <div className="st-shell st-faq">
          <h2 className="st-h2 st-center st-reveal">{t("home.faqTitle")}</h2>
          <div className="st-faq__list st-reveal">
            {faq.map((item, i) => (
              <FaqItem
                key={item.q}
                id={`d3-faq-${i}`}
                item={item}
                open={faqOpen === i}
                onToggle={() => setFaqOpen((o) => (o === i ? -1 : i))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* === Final CTA: a card that leans toward you === */}
      <section className="st-section st-final-wrap">
        <div className="st-shell">
          <div className="d3-final-stage st-reveal" ref={finalTilt}>
            <div className="st-final d3-final">
              <span className="d3-final__emoji d3-final__emoji--a" aria-hidden="true">🍝</span>
              <span className="d3-final__emoji d3-final__emoji--b" aria-hidden="true">🥗</span>
              <span className="d3-final__emoji d3-final__emoji--c" aria-hidden="true">🍰</span>
              <span className="d3-final__glare" aria-hidden="true" />
              <div className="d3-final__content">
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
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeDepth;
