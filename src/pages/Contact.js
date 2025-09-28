// src/pages/Contact.js
import React from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

function Contact() {
  return (
    <div className="App">
      <nav className="navbar">
        <h1 className="logo">SaYfe</h1>
        <Link to="/" className="nav-btn">Home</Link>
      </nav>

      <section className="contact">
        <h2 className="contact-title">Get in Touch</h2>
        <p className="contact-text">
          We’d love to hear from you! Whether you’re a restaurant partner, a user with feedback, or just curious. Send us a message!
        </p>

        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Your email" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" placeholder="Your message" rows="5" required></textarea>
          </div>
          <button type="submit" className="cta-btn">Send Message</button>
        </form>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} SaYfe — All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Contact;
