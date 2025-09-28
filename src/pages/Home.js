// src/Home.js
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="App">
      <nav className="navbar">
        <h1 className="logo">SaYfe</h1>
        <Link to="/contact" className="nav-btn">Contact</Link>
      </nav>

      <section className="hero">
        <h2 className="hero-title">Safety in Every Bite</h2>
        <p className="hero-text">
          SaYfe connects restaurants and customers with food allergies through intelligent menus and real-time safety insights.
        </p>
        <Link to="/waitlist" className="cta-btn">Join the Waitlist</Link>
      </section>

      <section className="features">
        <h3>Why Choose SaYfe?</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>Real-time Safety</h4>
            <p>Live updates from restaurants ensure allergens are always identified.</p>
          </div>
          <div className="feature-card">
            <h4>Smart AI Recognition</h4>
            <p>AI detects and corrects allergy inputs for precise communication.</p>
          </div>
          <div className="feature-card">
            <h4>Encrypted Data</h4>
            <p>All allergy data is securely stored and encrypted for privacy.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} SaYfe — All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
