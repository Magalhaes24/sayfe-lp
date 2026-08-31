import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import { useTranslation } from "../contexts/LanguageContext";

function Header() {
  const { t } = useTranslation();
  const [isPinned, setIsPinned] = useState(false);

  const logoPath = `${process.env.PUBLIC_URL || ""}/Y1000.png`;
  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") }
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setIsPinned(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-header${isPinned ? " site-header--pinned" : ""}`}>
      <nav className={`navbar${isPinned ? " navbar--pinned" : ""}`}>
        <div className="navbar-inner">
          <Link to="/" className="logo-link">
            <img src={logoPath} alt="besayfe" className="logo-mark" />
            <h1 className="logo">besayfe</h1>
          </Link>
          <div className="navbar-actions">
            <HamburgerMenu links={navLinks} />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

