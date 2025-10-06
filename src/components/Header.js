import React from "react";
import { Link } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import { useTranslation } from "../contexts/LanguageContext";

function Header() {
  const { t, language, setLanguage } = useTranslation();

  const logoPath = `${process.env.PUBLIC_URL || ""}/Y1000.png`;
  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/waitlist", label: t("nav.waitlist") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") }
  ];

  const handleLanguageChange = event => {
    setLanguage(event.target.value);
  };

  return (
    <header className="site-header">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="logo-link">
            <img src={logoPath} alt="SaYfe" className="logo-mark" />
            <h1 className="logo">sayfe</h1>
          </Link>
          <div className="navbar-actions">
            {/*
            <label htmlFor="language-select" className="language-switcher">
              <select
                id="language-select"
                className="language-select"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="pt">{t("nav.languageOptionPt")}</option>
                <option value="en">{t("nav.languageOptionEn")}</option>
              </select>
            </label>
            */}
            <HamburgerMenu links={navLinks} />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
