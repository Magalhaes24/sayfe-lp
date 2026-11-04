import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import LabHeader from "./lab/LabHeader";
import { useTranslation } from "../contexts/LanguageContext";

function SiteHeader() {
  const { t } = useTranslation();
  const [isPinned, setIsPinned] = useState(false);

  const logoPath = `${process.env.PUBLIC_URL || ""}/allercarte-logo.svg`;
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
            {/* The wordmark carries the symbol in its "ll". */}
            <img src={logoPath} alt="AllerCarte" className="logo-mark" width="1335" height="366" />
          </Link>
          <div className="navbar-actions">
            <HamburgerMenu links={navLinks} />
          </div>
        </div>
      </nav>
    </header>
  );
}

// The public pages use the new header; the admin pages keep the old one.
function Header() {
  const isAdmin = useLocation().pathname.startsWith("/admin");
  return isAdmin ? <SiteHeader /> : <LabHeader />;
}

export default Header;

