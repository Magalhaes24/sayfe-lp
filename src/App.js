import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import WaitlistForm from "./pages/WaitlistForm";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClickSpark from "./components/ClickSpark";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <ClickSpark
        sparkColor="#73ac84"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            <Header />
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
                  <Route path="/waitlist" element={<WaitlistForm />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
            <Footer />
          </>
        )}
      </ClickSpark>
    </LanguageProvider>
  );
}

export default App;
