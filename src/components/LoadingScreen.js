import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../contexts/LanguageContext";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  const { t } = useTranslation();
  const accent = "#73ac84";
  const logoPath = `${process.env.PUBLIC_URL || ""}/logo500.png`;

  return (
    <motion.div
      className="loading-wrapper"
      style={{ "--accent-color": accent }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="loading-core"
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div
          className="core-halo"
          animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="core-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <span className="core-dot" />
        </motion.div>

        <motion.div
          className="core-pulse"
          animate={{ scale: [0.92, 1.05, 0.92] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.img
          src={logoPath}
          alt="besayfe logo"
          className="core-logo"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        className="progress-line"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
      >
        <motion.span
          className="progress-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          style={{ originX: 0 }}
        />
      </motion.div>

      <motion.p
        className="loading-copy"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {t("loading.message")}
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;



