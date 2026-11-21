import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import { needsDecision, onConsentReopen, setConsent } from "../analytics/consent";
import "./ConsentBanner.css";

const COPY = {
  pt: {
    title: "Podemos medir como o site é usado?",
    body:
      "Guardamos um identificador anónimo e registamos cliques, scroll e tempo na página para melhorar o AllerCarte, e ativamos o Google Analytics. Nunca recolhemos o IP nem o que se escreve nos formulários. A escolha pode mudar-se a qualquer momento, no rodapé.",
    accept: "Aceitar",
    reject: "Recusar",
    more: "Política de privacidade"
  },
  en: {
    title: "Can we measure how the site is used?",
    body:
      "We keep an anonymous identifier and record clicks, scrolling and time on page to improve AllerCarte, and we turn on Google Analytics. We never collect your IP address or anything typed into forms. You can change your mind at any time from the footer.",
    accept: "Accept",
    reject: "Decline",
    more: "Privacy policy"
  }
};

export default function ConsentBanner() {
  const { language } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(() => needsDecision());
  const copy = COPY[language] || COPY.pt;

  useEffect(() => onConsentReopen(() => setOpen(true)), []);

  if (!open || pathname.startsWith("/admin") || window.location.search.includes("_hm")) return null;

  const choose = (granted) => {
    setConsent(granted);
    setOpen(false);
  };

  return (
    <section className="acb" role="dialog" aria-modal="false" aria-labelledby="acb-title">
      <h2 id="acb-title" className="acb__title">{copy.title}</h2>
      <p className="acb__body">{copy.body}</p>
      <div className="acb__actions">
        <button type="button" className="acb__btn" onClick={() => choose(false)}>
          {copy.reject}
        </button>
        <button type="button" className="acb__btn" onClick={() => choose(true)}>
          {copy.accept}
        </button>
      </div>
      <Link to="/privacy" className="acb__more">{copy.more}</Link>
    </section>
  );
}
