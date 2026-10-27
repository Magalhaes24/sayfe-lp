import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
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

// Helper to highlight every occurrence of "besayfe"
function highlightBesayfe(text) {
  if (typeof text !== "string") return text;
  return text.replace(/\bbesayfe\b/g, match => {
    return `<span class="highlight">${match}</span>`;
  });
}

// First visit follows the browser, so a tourist lands in English. Crawlers
// report en-US too, and the canonical page is Portuguese, so they keep the default.
function detectLanguage() {
  const agent = window.navigator.userAgent || "";
  if (/bot|crawler|spider|lighthouse|prerender/i.test(agent)) return DEFAULT_LANGUAGE;
  const preferred = window.navigator.languages || [window.navigator.language];
  for (const tag of preferred) {
    const base = (tag || "").slice(0, 2).toLowerCase();
    if (translations[base]) return base;
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      // Storage can be blocked (private mode); fall back to the browser.
    }
    return stored && translations[stored] ? stored : detectLanguage();
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, language);
      } catch (error) {
        // Not remembered this time; the browser language still applies.
      }
    }
  }, [language]);

  const translate = useCallback(
    key => {
      const bundle = translations[language];
      const fallbackBundle = translations.en;

      let value = resolveKey(bundle, key);
      if (value === undefined) value = resolveKey(fallbackBundle, key);
      if (value === undefined) return key;

      const skipHighlight = typeof key === "string" && key.startsWith("seo.");

      if (skipHighlight) return value;

      // Apply highlight to besayfe automatically for non-SEO content
      return highlightBesayfe(value);
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

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

