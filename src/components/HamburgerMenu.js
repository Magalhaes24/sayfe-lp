import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import "./HamburgerMenu.css";

function HamburgerMenu({ links = [], className = "" }) {
  const location = useLocation();
  const { t, language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const linkRefs = useRef([]);

  const menuId = useMemo(() => `hamburger-menu-${Math.random().toString(36).slice(2)}`, []);

  const navLinks = links.length
    ? links
    : [
        { to: "/", label: t("nav.home") },
        { to: "/about", label: t("nav.about") },
        { to: "/product-demo", label: t("nav.productDemo") },
        { to: "/contact", label: t("nav.contact") }
      ];

  useEffect(() => {
    const handlePointerDown = event => {
      if (!isOpen) return;
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      linkRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleLanguageChange = event => {
    setLanguage(event.target.value);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={`hamburger-menu ${className} ${isOpen ? "is-open" : ""}`}>
      <svg className="hamburger-menu__defs" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="hamburger-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <button
        ref={toggleRef}
        type="button"
        className="hamburger-menu__toggle"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="hamburger-menu__bar hamburger-menu__bar--top" />
        <span className="hamburger-menu__bar hamburger-menu__bar--middle" />
        <span className="hamburger-menu__bar hamburger-menu__bar--bottom" />
      </button>

      <div className="hamburger-menu__tray" id={menuId} role="menu" aria-hidden={!isOpen}>
        <ul className="hamburger-menu__list">
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.to;
            return (
              <li className="hamburger-menu__item" key={link.to}>
                <Link
                  ref={element => {
                    linkRefs.current[index] = element;
                  }}
                  className={`hamburger-menu__link ${isActive ? "is-active" : ""}`}
                  to={link.to}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hamburger-menu__language">
          <label className="hamburger-menu__language-label" htmlFor={`${menuId}-language`}>
            {t("nav.languageLabel")}
          </label>
          <select
            id={`${menuId}-language`}
            className="hamburger-menu__language-select"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="pt">{t("nav.languageOptionPt")}</option>
            <option value="en">{t("nav.languageOptionEn")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default HamburgerMenu;
