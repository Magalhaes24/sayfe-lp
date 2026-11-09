import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../contexts/LanguageContext";
import { LanguageSwitch } from "./LabHeader";
import "./LabFooter.css";

const APP_URL = "https://www.allercarte.com/mapa";
const RESTAURANTS_URL = "https://www.allercarte.com/restaurantes";

const COPY = {
  pt: { product: "Produto", company: "Empresa", language: "Idioma" },
  en: { product: "Product", company: "Company", language: "Language" }
};

const plain = (html) => String(html || "").replace(/<[^>]+>/g, "");

// Site footer: every destination one tap away, then the fine print.
function LabFooter() {
  const { t, language } = useTranslation();
  const copy = COPY[language] || COPY.pt;

  return (
    <footer className="lxf">
      <div className="lxf__shell">
        <div className="lxf__top">
          <Link to="/" className="lxf__logo" aria-label="AllerCarte">
            <img src={`${process.env.PUBLIC_URL || ""}/allercarte-logo.svg`} alt="" width="682" height="189" />
          </Link>
          <p className="lxf__tagline">{plain(t("home.heroEyebrow"))}</p>
        </div>

        <div className="lxf__cols">
          <nav aria-label={copy.product}>
            <h2>{copy.product}</h2>
            <a href={APP_URL}>{plain(t("home.heroCta"))}</a>
            <a href={RESTAURANTS_URL}>{t("home.citiesCta")}</a>
            <Link to="/#st-how">{plain(t("home.heroSecondaryCta"))}</Link>
          </nav>
          <nav aria-label={copy.company}>
            <h2>{copy.company}</h2>
            <Link to="/about">{t("nav.about")}</Link>
            <Link to="/contact">{t("nav.contact")}</Link>
          </nav>
          <div>
            <h2>{copy.language}</h2>
            <LanguageSwitch />
          </div>
        </div>

        <div className="lxf__bottom">
          <p>{plain(t("home.disclaimer"))}</p>
          <p>{plain(t("footer.copyright"))}</p>
        </div>
      </div>
    </footer>
  );
}

export default LabFooter;
