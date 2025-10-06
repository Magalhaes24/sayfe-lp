import React from "react";
import { useTranslation } from "../contexts/LanguageContext";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer site-footer">
      <p>{t("footer.copyright")}</p>
    </footer>
  );
}

export default Footer;
