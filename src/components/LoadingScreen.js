import React from "react";
import { motion } from "framer-motion";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <motion.div
      className="loading-wrapper"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {/* Animated background gradient */}
      <div className="gradient-bg" />

      {/* Centered animated logo */}
      <div className="loading-center">
        {/* Glowing ring */}
        <motion.div
          className="pulse-ring"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main logo */}
        <motion.img
          src="/public/logo4000.png"
          alt="SaYfe Logo"
          className="loading-logo"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
