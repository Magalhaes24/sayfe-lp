import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../contexts/LanguageContext";
import { reopenConsent } from "../../analytics/consent";
import { LanguageSwitch } from "./LabHeader";
import "./LabFooter.css";

const APP_URL = "https://www.allercarte.com/mapa";
const RESTAURANTS_URL = "https://www.allercarte.com/restaurantes";

const COPY = {
  pt: { product: "Produto", company: "Empresa", language: "Idioma", privacy: "Privacidade", cookies: "Definições de cookies" },
  en: { product: "Product", company: "Company", language: "Language", privacy: "Privacy", cookies: "Cookie settings" }
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
          <a
            className="lxf__ph"
            href="https://www.producthunt.com/products/allercarte?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-allercarte"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="AllerCarte - See which dishes you can eat, based on your allergies | Product Hunt"
              width="250"
              height="54"
              loading="lazy"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1318710&theme=light&t=1795623085828"
            />
          </a>
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
            <Link to="/privacy">{copy.privacy}</Link>
            <button type="button" className="lxf__link" onClick={reopenConsent}>{copy.cookies}</button>
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
