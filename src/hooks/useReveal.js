import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to a container element.
 * Any child with .reveal, .reveal-scale, .reveal-left, or .reveal-right
 * gets .is-visible added when it enters the viewport, triggering its CSS transition.
 * If no such children exist, the container itself is observed.
 */
export function useReveal({ threshold = 0.12, rootMargin = "0px 0px -60px 0px" } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const revealEls = container.querySelectorAll(
      ".reveal, .reveal-scale, .reveal-left, .reveal-right"
    );
    const targets = revealEls.length ? Array.from(revealEls) : [container];

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
