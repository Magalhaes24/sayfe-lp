import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";
import LabFooter from "./lab/LabFooter";

function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="footer site-footer">
      <p dangerouslySetInnerHTML={{ __html: t("footer.copyright") }}></p>
    </footer>
  );
}

// The public pages use the new footer; the admin pages keep the old one.
function Footer() {
  const isAdmin = useLocation().pathname.startsWith("/admin");
  return isAdmin ? <SiteFooter /> : <LabFooter />;
}

export default Footer;
