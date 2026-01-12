import React, { useState, useLayoutEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import DemoPreview from "./pages/DemoPreview";
import ProductDemo from "./pages/ProductDemo";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClickSpark from "./components/ClickSpark";
import { LanguageProvider } from "./contexts/LanguageContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    let isActive = true;
    const mediaSettlers = [];
    const MAX_ASSET_WAIT_MS = 8000;

    const shouldSkipPreload = (element) => {
      if (!element) return false;
      if (element.hasAttribute("data-skip-preload")) return true;
      const dataset = element.dataset || {};
      return dataset.preload === "false" || dataset.preloadMode === "async";
    };

    const waitForMedia = () =>
      new Promise((resolve) => {
        if (typeof window === "undefined") {
          resolve();
          return;
        }

        window.requestAnimationFrame(() => {
          const container = contentRef.current;

          if (!container) {
            resolve();
            return;
          }

          const mediaElements = Array.from(
            container.querySelectorAll("img, video, iframe")
          );

          const eagerMedia = mediaElements.filter(
            (element) => !shouldSkipPreload(element)
          );

          const backgroundElements = Array.from(
            container.querySelectorAll("[data-screen]")
          );

          const createMediaPromise = (element) =>
            new Promise((resolveElement) => {
              if (shouldSkipPreload(element)) {
                resolveElement();
                return;
              }

              const elementCleanups = [];
              let settled = false;

              const runElementCleanup = () => {
                elementCleanups.forEach((fn) => {
                  try {
                    fn();
                  } catch {
                    // Ignore cleanup errors to avoid breaking the loading cycle.
                  }
                });
              };

              const settle = () => {
                if (settled) return;
                settled = true;
                runElementCleanup();
                resolveElement();
              };

              const fallbackId = setTimeout(settle, MAX_ASSET_WAIT_MS);
              elementCleanups.push(() => clearTimeout(fallbackId));

              mediaSettlers.push(settle);

              const tag = element.tagName.toLowerCase();

              if (tag === "img") {
                if (element.complete && element.naturalWidth !== 0) {
                  settle();
                  return;
                }

                const onLoad = () => settle();
                const onError = () => settle();

                element.addEventListener("load", onLoad, { once: true });
                element.addEventListener("error", onError, { once: true });

                elementCleanups.push(() =>
                  element.removeEventListener("load", onLoad)
                );
                elementCleanups.push(() =>
                  element.removeEventListener("error", onError)
                );

                return;
              }

              if (tag === "video") {
                if (element.readyState >= 3) {
                  settle();
                  return;
                }

                const onLoadedData = () => settle();
                const onCanPlayThrough = () => settle();
                const onError = () => settle();

                element.addEventListener("loadeddata", onLoadedData, {
                  once: true,
                });
                element.addEventListener("canplaythrough", onCanPlayThrough, {
                  once: true,
                });
                element.addEventListener("error", onError, { once: true });

                elementCleanups.push(() =>
                  element.removeEventListener("loadeddata", onLoadedData)
                );
                elementCleanups.push(() =>
                  element.removeEventListener("canplaythrough", onCanPlayThrough)
                );
                elementCleanups.push(() =>
                  element.removeEventListener("error", onError)
                );

                return;
              }

              if (tag === "iframe") {
                try {
                  const iframeDoc = element.contentDocument;
                  if (iframeDoc && iframeDoc.readyState === "complete") {
                    settle();
                    return;
                  }
                } catch {
                  // Ignore cross-origin access errors; rely on load events.
                }

                const onLoad = () => settle();
                const onError = () => settle();

                element.addEventListener("load", onLoad, { once: true });
                element.addEventListener("error", onError, { once: true });

                elementCleanups.push(() =>
                  element.removeEventListener("load", onLoad)
                );
                elementCleanups.push(() =>
                  element.removeEventListener("error", onError)
                );

                return;
              }

              settle();
            });

          const mediaPromises = eagerMedia.map(createMediaPromise);

          const backgroundPromises = backgroundElements.map((element) => {
            return new Promise((resolveElement) => {
              const src = element.getAttribute("data-screen");

              if (!src) {
                resolveElement();
                return;
              }

              let settled = false;

              const settle = () => {
                if (settled) return;
                settled = true;
                clearTimeout(fallbackId);
                if (preloader) {
                  preloader.onload = null;
                  preloader.onerror = null;
                }
                resolveElement();
              };

              const fallbackId = setTimeout(settle, MAX_ASSET_WAIT_MS);
              const preloader = new Image();
              preloader.onload = settle;
              preloader.onerror = settle;
              mediaSettlers.push(settle);
              preloader.src = src;
            });
          });

          const pending = [...mediaPromises, ...backgroundPromises];

          if (pending.length === 0) {
            resolve();
            return;
          }

          Promise.all(pending)
            .then(() => resolve())
            .catch(() => resolve());
        });
      });

    const fontsPromise =
      typeof document !== "undefined" &&
      document.fonts &&
      typeof document.fonts.ready?.then === "function"
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    setIsLoading(true);

    Promise.all([waitForMedia(), fontsPromise])
      .then(() => {
        if (isActive) {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
      mediaSettlers.forEach((finish) => {
        try {
          finish();
        } catch {
          // Ignore clean-up errors.
        }
      });
    };
  }, [location]);

  return (
    <LanguageProvider>
      <ClickSpark
        sparkColor="#73ac84"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <>
          <div ref={contentRef} data-page-root aria-hidden={isLoading}>
            <Header />
            <ScrollToTop /> {/* Ensures scroll resets on route change */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/demo" element={<DemoPreview />} />
                  <Route path="/product-demo" element={<ProductDemo />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
            <Footer />
          </div>
          <AnimatePresence initial={false}>
            {isLoading && <LoadingScreen key="global-loading-screen" />}
          </AnimatePresence>
        </>
      </ClickSpark>
    </LanguageProvider>
  );
}

export default App;
