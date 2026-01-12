import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const start = window.scrollY;
    if (start === 0) return;

    const duration = 750; // milliseconds
    const overshoot = 1.04; // how far it “bounces” at the top
    const startTime = performance.now();

    const easeOutExpo = (t) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // super smooth ease-out curve

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      // Add a subtle bounce feeling when nearing top
      const target = start * (1 - eased * overshoot);
      window.scrollTo(0, Math.max(0, target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // small correction in case of overshoot
        window.scrollTo({ top: 0 });
      }
    };

    requestAnimationFrame(animate);
  }, [pathname]);

  return null;
}
