import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import translations from "../i18n/translations";

const DEFAULT_LANGUAGE = "pt";
const STORAGE_KEY = "sayfe-language";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: key => key
});

function resolveKey(bundle, key) {
  if (!bundle) return undefined;
  return key.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), bundle);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && translations[stored] ? stored : DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const translate = useCallback(
    key => {
      const bundle = translations[language];
      const fallbackBundle = translations.en;
      const value = resolveKey(bundle, key);
      if (value !== undefined) return value;
      const fallback = resolveKey(fallbackBundle, key);
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translate
    }),
    [language, translate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
