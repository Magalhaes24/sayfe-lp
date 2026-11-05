import React, { useEffect } from "react";
import { Link } from "react-router-dom";

// Shared pieces of the /lab pages: reveal on scroll, text helpers and the
// Apple-style "Learn more ›" link. Styles live in pages/HomeLab.css.

export const plain = (html) => String(html || "").replace(/<[^>]+>/g, "");
export const words = (html) => plain(html).split(/\s+/).filter(Boolean);

// Adds .is-in to each reveal element the first time it comes into view.
// A MutationObserver also picks up elements React mounts later (a language
// switch can remount list items), so nothing is ever left at opacity 0.
export function useReveal(rootRef, selector = ".lx-reveal", ioOptions) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const show = (el) => el.classList.add("is-in");
    if (typeof IntersectionObserver === "undefined") {
      root.querySelectorAll(selector).forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        }),
      ioOptions || { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    const seen = new WeakSet();
    const watch = () =>
      root.querySelectorAll(selector).forEach((el) => {
        if (seen.has(el) || el.classList.contains("is-in")) return;
        seen.add(el);
        io.observe(el);
      });
    watch();
    let mo;
    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(watch);
      mo.observe(root, { childList: true, subtree: true });
    }
    return () => {
      io.disconnect();
      if (mo) mo.disconnect();
    };
  }, [rootRef, selector, ioOptions]);
}

export function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

// Text link with a chevron that nudges on hover.
export function More({ href, to, children, light = false }) {
  const className = `lx-more${light ? " lx-more--light" : ""}`;
  const inner = (
    <>
      {children}
      <Chevron />
    </>
  );
  return to ? (
    <Link to={to} className={className}>{inner}</Link>
  ) : (
    <a href={href} className={className}>{inner}</a>
  );
}

// Headline whose words rise out of a mask one after another.
export function RiseTitle({ text, as: Tag = "h1", className, delay = 80, step = 45 }) {
  return (
    <Tag className={className}>
      {words(text).map((w, i) => (
        <span className="lx-word" key={i}>
          <span style={{ "--d": `${delay + i * step}ms` }}>{w}</span>
        </span>
      ))}
    </Tag>
  );
}

// The app now shows two greens: strong when the restaurant confirmed, dashed
// (hollow) when it is an estimate. The shared legend copy still says blue,
// so the test pages swap those two entries.
const LEGEND_NOW = {
  pt: {
    safe: { title: "Verde forte", text: "Há pratos sem as tuas alergias, confirmados pelo restaurante." },
    likely: { title: "Verde tracejado", text: "Estimativa, ainda não confirmada pelo restaurante." }
  },
  en: {
    safe: { title: "Strong green", text: "There are dishes free of your allergens, confirmed by the restaurant." },
    likely: { title: "Dashed green", text: "An estimate, not confirmed by the restaurant yet." }
  }
};

export const labLegend = (items, language) => {
  const now = LEGEND_NOW[language] || LEGEND_NOW.pt;
  return items.map((item) => (now[item.tone] ? { ...item, ...now[item.tone] } : item));
};
