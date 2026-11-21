import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import { reopenConsent, getConsent } from "../analytics/consent";
import Seo from "../components/Seo";
import "./Privacy.css";

const COPY = {
  pt: {
    title: "Privacidade e cookies",
    updated: "Atualizado em novembro de 2026",
    intro:
      "Este site mede a forma como é usado para melhorarmos o AllerCarte. Só o faz se aceitar, e fazemo-lo sem recolher dados que o identifiquem.",
    sections: [
      {
        h: "Quem é responsável",
        p: ["AllerCarte. Para qualquer pedido sobre dados, use a página de contacto."]
      },
      {
        h: "O que registamos (só com o seu consentimento)",
        ul: [
          "Páginas vistas, tempo na página, profundidade de scroll e secções que viu.",
          "Cliques (posição na página e tipo de elemento) e cliques repetidos, para os mapas de calor.",
          "Zonas da página onde o rato passou, em quadrículas agregadas, nunca o trajeto.",
          "Que campo de um formulário foi tocado e se foi enviado. Nunca o que foi escrito.",
          "Mudança de língua, erros técnicos e tempos de carregamento.",
          "Contexto geral: tipo de dispositivo, largura do ecrã arredondada, sistema e navegador (sem versões), língua, fuso horário, site de origem e campanha (utm)."
        ]
      },
      {
        h: "O que nunca registamos",
        ul: [
          "O endereço IP.",
          "Texto escrito em formulários, e-mails, telefones ou nomes.",
          "Localização precisa, impressão digital do dispositivo ou dados de outros sites.",
          "Qualquer ligação entre estes dados e uma mensagem enviada pelo formulário de contacto."
        ]
      },
      {
        h: "Cookies e armazenamento local",
        p: [
          "Sem consentimento, só guardamos a sua escolha e a língua. Com consentimento, guardamos no navegador um identificador aleatório (válido por 12 meses, depois muda) e um identificador de visita (termina com o separador). O Google Analytics (cookies _ga) só é carregado depois de aceitar, com o endereço IP anonimizado. Não usamos publicidade nem cookies de redes sociais."
        ]
      },
      {
        h: "Base legal e conservação",
        p: [
          "Consentimento (RGPD, artigo 6.º, n.º 1, alínea a). Os registos são apagados automaticamente ao fim de 13 meses."
        ]
      },
      {
        h: "Onde ficam os dados",
        p: ["Na Google Cloud (Firebase) e, se aceitar, no Google Analytics. O acesso aos registos próprios é restrito à equipa do AllerCarte."]
      },
      {
        h: "Os seus direitos",
        p: [
          "Pode retirar o consentimento quando quiser: o identificador é apagado do seu dispositivo e os registos anteriores deixam de poder ser associados a si. Tem ainda direito de acesso, retificação, apagamento, oposição e a reclamar junto da CNPD (cnpd.pt). O pedido faz-se pela página de contacto."
        ]
      },
      {
        h: "Sinais do navegador",
        p: [
          "Se o navegador enviar o sinal Global Privacy Control ou «Não rastrear», tratamo-lo como recusa e nem sequer mostramos o aviso."
        ]
      }
    ],
    status: { granted: "Estado atual: aceitou a medição.", denied: "Estado atual: recusou a medição.", unset: "Estado atual: ainda não escolheu." },
    change: "Alterar a minha escolha",
    back: "Voltar ao início"
  },
  en: {
    title: "Privacy and cookies",
    updated: "Updated November 2026",
    intro:
      "This site measures how it is used so we can improve AllerCarte. It only does so if you accept, and it does so without collecting data that identifies you.",
    sections: [
      {
        h: "Who is responsible",
        p: ["AllerCarte. For any request about your data, use the contact page."]
      },
      {
        h: "What we record (only with your consent)",
        ul: [
          "Page views, time on page, scroll depth and the sections you saw.",
          "Clicks (position on the page and element type) and repeated clicks, for heatmaps.",
          "Areas of the page the mouse passed over, as aggregated grid cells, never the path.",
          "Which form field was touched and whether the form was sent. Never what was typed.",
          "Language changes, technical errors and loading times.",
          "General context: device type, rounded screen width, system and browser (no versions), language, time zone, referring site and campaign (utm)."
        ]
      },
      {
        h: "What we never record",
        ul: [
          "Your IP address.",
          "Text typed into forms, e-mails, phone numbers or names.",
          "Precise location, device fingerprints or data from other sites.",
          "Any link between this data and a message sent through the contact form."
        ]
      },
      {
        h: "Cookies and local storage",
        p: [
          "Without consent we only store your choice and your language. With consent we store a random identifier in your browser (valid for 12 months, then replaced) and a visit identifier (it ends with the tab). Google Analytics (_ga cookies) only loads after you accept, with IP anonymisation on. We use no advertising and no social-network cookies."
        ]
      },
      {
        h: "Legal basis and retention",
        p: ["Consent (GDPR Article 6(1)(a)). Records are deleted automatically after 13 months."]
      },
      {
        h: "Where the data lives",
        p: ["On Google Cloud (Firebase) and, if you accept, Google Analytics. Access to our own records is limited to the AllerCarte team."]
      },
      {
        h: "Your rights",
        p: [
          "You can withdraw consent at any time: the identifier is deleted from your device and earlier records can no longer be linked to you. You also have the right of access, rectification, erasure, objection and to complain to your data protection authority (in Portugal, the CNPD at cnpd.pt). Make a request through the contact page."
        ]
      },
      {
        h: "Browser signals",
        p: [
          "If your browser sends Global Privacy Control or Do Not Track, we treat it as a refusal and do not show the notice."
        ]
      }
    ],
    status: { granted: "Current status: you accepted measurement.", denied: "Current status: you declined measurement.", unset: "Current status: no choice made yet." },
    change: "Change my choice",
    back: "Back to home"
  }
};

export default function Privacy() {
  const { language } = useTranslation();
  const c = COPY[language] || COPY.pt;
  const status = getConsent();

  return (
    <main className="prv">
      <Seo title={c.title} description={c.intro} canonicalPath="/privacy" siteName="AllerCarte" />
      <div className="prv__shell">
        <p className="prv__updated">{c.updated}</p>
        <h1>{c.title}</h1>
        <p className="prv__intro">{c.intro}</p>

        {c.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {(s.p || []).map((line) => <p key={line}>{line}</p>)}
            {s.ul && <ul>{s.ul.map((line) => <li key={line}>{line}</li>)}</ul>}
          </section>
        ))}

        <div className="prv__choice">
          <p>{c.status[status]}</p>
          <button type="button" onClick={reopenConsent}>{c.change}</button>
        </div>
        <Link to="/" className="prv__back">{c.back}</Link>
      </div>
    </main>
  );
}
