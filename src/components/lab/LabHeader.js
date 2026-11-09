import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "../../contexts/LanguageContext";
import "./LabHeader.css";

const APP_URL = "https://www.allercarte.com/mapa";

const COPY = {
  pt: { announce: "🎉 O besayfe agora chama-se AllerCarte. A mesma app, com nome novo.", announceShort: "🎉 O besayfe agora é AllerCarte", closeNotice: "Fechar aviso", main: "Principal", menu: "Menu", close: "Fechar menu", open: "Abrir menu" },
  en: { announce: "🎉 besayfe is now called AllerCarte. Same app, new name.", announceShort: "🎉 besayfe is now AllerCarte", closeNotice: "Close notice", main: "Main", menu: "Menu", close: "Close menu", open: "Open menu" }
};

// Two-letter switch; the active language sits on a white pill.
export function LanguageSwitch({ className = "" }) {
  const { language, setLanguage, t } = useTranslation();
  return (
    <div className={`lxh-lang ${className}`} role="group" aria-label={t("nav.languageLabel")}>
      {["pt", "en"].map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          lang={code}
          aria-label={`${code.toUpperCase()}, ${t(code === "pt" ? "nav.languageOptionPt" : "nav.languageOptionEn")}`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * Site header: a floating pill, slim and translucent, hides while scrolling
 * down and comes back on the way up. Links sit inline on wide screens and in
 * a full-screen sheet on phones.
 */
function LabHeader() {
  const { t, language } = useTranslation();
  const copy = COPY[language] || COPY.pt;
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notice, setNotice] = useState(true);
  const toggleRef = useRef(null);
  const sheetRef = useRef(null);

  const links = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") }
  ];

  // Close the sheet whenever the page changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      // Small moves are ignored so the bar doesn't flicker.
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160);
        last = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Sheet: lock the page behind it, Escape closes, focus goes in and back.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    const first = sheetRef.current && sheetRef.current.querySelector("a, button");
    if (first) first.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        if (toggleRef.current) toggleRef.current.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`lxh lxh--pill${notice ? " has-notice" : ""}${hidden && !open ? " is-hidden" : ""}${scrolled || open ? " is-scrolled" : ""}${open ? " is-open" : ""}`}
    >
      {notice && (
        <div className="lxh__announce">
          <p>
            <span className="lxh__announce-long">{copy.announce}</span>
            <span className="lxh__announce-short">{copy.announceShort}</span>
          </p>
          <button type="button" onClick={() => setNotice(false)} aria-label={copy.closeNotice}>
            ×
          </button>
        </div>
      )}
      <div className="lxh__bar">
        <Link to="/" className="lxh__logo" aria-label="AllerCarte">
          <img src={`${process.env.PUBLIC_URL || ""}/allercarte-logo.svg`} alt="" width="682" height="189" />
        </Link>

        <nav className="lxh__links" aria-label={copy.main}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="lxh__actions">
          <LanguageSwitch className="lxh__lang-desktop" />
          <a href={APP_URL} className="lxh__cta">
            {t("home.heroCta")}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="lxh__toggle"
            aria-expanded={open}
            aria-controls="lxh-sheet"
            aria-label={open ? copy.close : copy.open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="lxh__sheet" id="lxh-sheet" ref={sheetRef} inert={!open}>
        <nav aria-label={copy.menu}>
          {links.map((l, i) => (
            <NavLink key={l.to} to={l.to} end={l.end} style={{ "--i": i }}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="lxh__sheet-foot" style={{ "--i": links.length }}>
          <a href={APP_URL} className="lx-btn">
            {t("home.heroCta")}
          </a>
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}

export default LabHeader;
