import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClickSpark from "./components/ClickSpark";
import { LanguageProvider } from "./contexts/LanguageContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

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
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                {/* Demo and product demonstration routes are hidden while the
                    restaurant platform is the public offering. The /tests
                    scratch pages are unrouted too: they pulled three.js, the
                    3D models and 4 MB of screenshots into the main bundle.
                    Old links fall back to the home page. */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
