import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Home from "./pages/HomeMix";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClickSpark from "./components/ClickSpark";
import { LanguageProvider } from "./contexts/LanguageContext";
import ScrollToTop from "./components/ScrollToTop";
import Analytics from "./analytics/Analytics";
import ConsentBanner from "./components/ConsentBanner";
import "./App.css";

// About and Contact load on demand; the home page ships in the main bundle.
const About = lazy(() => import("./pages/AboutLab"));
const Contact = lazy(() => import("./pages/ContactLab"));
const Privacy = lazy(() => import("./pages/Privacy"));
// Everything under /admin (login and analytics) only exists in `npm start`.
// In a production build these are null: the pages are not bundled and the
// addresses fall back to the home page, so nothing of the admin is live.
// The condition must stay inline: webpack only drops the import() in a production
// build when it can fold `process.env.NODE_ENV === "development"` itself.
const AdminAnalytics =
  process.env.NODE_ENV === "development" ? lazy(() => import("./pages/AdminAnalytics")) : null;
const AdminLogin =
  process.env.NODE_ENV === "development" ? lazy(() => import("./pages/AdminLogin")) : null;

// Pages render straight away and fade in briefly; nothing waits for images.
const PAGE_FADE = { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] };

function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <LanguageProvider>
      <ClickSpark
        sparkColor="#73ac84"
        sparkSize={10}
        sparkRadius={16}
        sparkCount={8}
        duration={380}
      >
        <div data-page-root>
          <Header />
          <Analytics />
          <ConsentBanner />
          <ScrollToTop /> {/* Ensures scroll resets on route change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : PAGE_FADE}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route
                  path="/about"
                  element={
                    <Suspense fallback={null}>
                      <About />
                    </Suspense>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <Suspense fallback={null}>
                      <Contact />
                    </Suspense>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <Suspense fallback={null}>
                      <Privacy />
                    </Suspense>
                  }
                />
                {AdminAnalytics && (
                  <Route
                    path="/admin/analytics"
                    element={
                      <Suspense fallback={null}>
                        <AdminAnalytics />
                      </Suspense>
                    }
                  />
                )}
                {/* Demo, test (/lab*) and old routes fall back to the home page. */}
                {AdminLogin && (
                  <Route
                    path="/admin"
                    element={
                      <Suspense fallback={null}>
                        <AdminLogin />
                      </Suspense>
                    }
                  />
                )}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
          <Footer />
        </div>
      </ClickSpark>
    </LanguageProvider>
  );
}

export default App;
