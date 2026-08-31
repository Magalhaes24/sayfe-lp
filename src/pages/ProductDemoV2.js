import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import "./ProductDemoV2.css";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import CelebrationOverlay from "../components/CelebrationOverlay";
import cameraIcon from "../assets/camera_ic.png";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const RISK_API_BASE_URL = process.env.REACT_APP_RISK_API_BASE_URL;
const RISK_API_WARMUP_STORAGE_KEY = "besayfe:riskApiWarm";
const RISK_API_WARMUP_TTL_MS = 5 * 60 * 1000; // cache warm-up result for 5 minutes
const RISK_API_WARMUP_TIMEOUT_MS = 1800; // keep the warm-up under 2 seconds

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ANNEX_ALLERGENS = [
  {
    code: "GLUTEN",
    offTags: [
      "en:gluten",
      "pt:gluten",
      "en:wheat",
      "en:wheat-flour",
      "en:barley",
      "en:rye",
      "en:oats",
      "en:oat",
      "pt:trigo",
      "pt:farinha-de-trigo",
      "pt:cevada",
      "pt:centeio",
      "pt:aveia"
    ]
  },
  {
    code: "CRUSTACEANS",
    offTags: ["en:crustaceans", "en:crustacean", "pt:crustaceos", "pt:crustaceo"]
  },
  {
    code: "EGG",
    offTags: ["en:egg", "en:eggs", "pt:ovo", "pt:ovos"]
  },
  {
    code: "FISH",
    offTags: ["en:fish", "pt:peixe", "pt:peixes"]
  },
  {
    code: "PEANUT",
    offTags: ["en:peanut", "en:peanuts", "pt:amendoim", "pt:amendoins"]
  },
  {
    code: "SOY",
    offTags: ["en:soybeans", "en:soy", "en:soya", "pt:soja"]
  },
  {
    code: "MILK",
    offTags: ["en:milk", "en:milk-protein", "en:lactose", "pt:leite", "pt:lactose"]
  },
  {
    code: "TREE_NUTS",
    offTags: [
      "en:nuts",
      "en:tree-nuts",
      "en:almonds",
      "en:hazelnuts",
      "en:walnuts",
      "en:cashew",
      "en:pistachio",
      "pt:frutos-de-casca-rija",
      "pt:frutos-de-casca-dura",
      "pt:frutos-secos",
      "pt:amendoa",
      "pt:amendoas",
      "pt:avelas",
      "pt:noz",
      "pt:nozes",
      "pt:caju",
      "pt:pistacio"
    ]
  },
  {
    code: "CELERY",
    offTags: ["en:celery", "pt:aipo"]
  },
  {
    code: "MUSTARD",
    offTags: ["en:mustard", "pt:mostarda"]
  },
  {
    code: "SESAME",
    offTags: ["en:sesame", "en:sesame-seeds", "pt:sesamo", "pt:sementes-de-sesamo"]
  },
  {
    code: "SULPHITES",
    offTags: [
      "en:sulphur-dioxide-and-sulphites",
      "en:sulphites",
      "en:sulfites",
      "pt:dioxido-de-enxofre-e-sulfitos",
      "pt:sulfitos"
    ]
  },
  {
    code: "LUPIN",
    offTags: ["en:lupin", "en:lupine", "pt:tremoço", "pt:tremoco"]
  },
  {
    code: "MOLLUSCS",
    offTags: ["en:molluscs", "en:mollusks", "pt:moluscos"]
  }
];

const TAG_TO_FAMILY = ANNEX_ALLERGENS.reduce((acc, allergen) => {
  (allergen.offTags || []).forEach(tag => {
    const norm = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
    acc[norm] = allergen.code;
  });
  return acc;
}, {});

function dataUrlSize(dataUrl = "") {
  if (!dataUrl.startsWith("data:")) return 0;
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4); // approximate bytes
}

function parseIngredientsList(text = "") {
  if (!text) return [];
  return text
    .split(/[,;\n\r]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function isValidEan(value) {
  if (!/^\d{8}$|^\d{13}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const checkDigit = digits.pop();
  const sum = digits
    .reverse()
    .reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 3 : 1), 0);
  const calc = (10 - (sum % 10)) % 10;
  return calc === checkDigit;
}

function isLikelyFilename(value) {
  if (typeof value !== "string") return false;
  return /\.(jpg|jpeg|png|heic|webp)$/i.test(value.trim());
}

function normalizeProductName(...candidates) {
  const match = candidates.find(
    value => typeof value === "string" && value.trim() && !isLikelyFilename(value)
  );
  return match ? match.trim() : "not found";
}

function findEanInText(...texts) {
  const candidates = [];
  texts
    .filter(Boolean)
    .forEach(text => {
      const matches = text.match(/\b\d{8}\b|\b\d{13}\b/g);
      if (matches) candidates.push(...matches);
    });
  const unique = Array.from(new Set(candidates));
  return unique.find(isValidEan) || "";
}

function dataUrlToBlob(dataUrl = "") {
  if (!dataUrl.startsWith("data:")) return new Blob();
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/i);
  const mimeType = mimeMatch?.[1] || "image/jpeg";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

async function compressImageToDataUrl(file, options = {}) {
  const { maxBytes = 900000, maxDimension = 1400, minQuality = 0.35 } = options;
  const readAsDataURL = input =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(input);
    });

  const toImage = src =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const originalUrl = await readAsDataURL(file);
  const originalSize = dataUrlSize(originalUrl);
  if (originalSize <= maxBytes) return originalUrl;

  const image = await toImage(originalUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const ratio = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
  canvas.width = Math.max(1, Math.floor(image.width * ratio));
  canvas.height = Math.max(1, Math.floor(image.height * ratio));
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.75;
  let compressedUrl = canvas.toDataURL("image/jpeg", quality);

  while (dataUrlSize(compressedUrl) > maxBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.1);
    compressedUrl = canvas.toDataURL("image/jpeg", quality);
  }

  return compressedUrl;
}

function collectProductTags(product, keys) {
  const set = new Set();
  const pushValue = value => {
    if (Array.isArray(value)) return value.forEach(pushValue);
    if (typeof value !== "string") return;
    value
      .split(/[,;|]+/)
      .map(v => v.trim())
      .filter(Boolean)
      .forEach(v => {
        const clean = v.replace(/^\(.*\)\s*/, "").replace(/^en:/, "").trim();
        if (clean && clean !== "none" && clean !== "unknown") {
          set.add(clean);
        }
      });
  };
  keys.forEach(key => {
    if (key in product) pushValue(product[key]);
  });
  return Array.from(set);
}

function extractSummaryAllergens(summary) {
  if (!Array.isArray(summary?.allergens_found)) return [];
  return summary.allergens_found
    .map(entry => {
      if (typeof entry !== "string") return "";
      return entry.split(":")[0]?.trim() || "";
    })
    .filter(Boolean);
}

function ProductDemoV2() {
  const { t } = useTranslation();
  const tt = useMemo(() => t("productDemoV2") || t("productDemo"), [t]);
  const ttAnnex = useMemo(
    () => t("productDemoV2.annex") || t("productDemo.annex") || t("annex"),
    [t]
  );
  const allergenFriendly = useMemo(
    () =>
      t("productDemoV2.allergenLabels") ||
      t("productDemo.allergenLabels") ||
      t("allergenLabels") ||
      {},
    [t]
  );
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.productDemoV2") || {};

  const manualInputId = "product-demo-manual";
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const streamRef = useRef(null);
  const trackRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const summaryRef = useRef(null);
  const videoShellRef = useRef(null);
  const pinchStateRef = useRef({
    active: false,
    initialDistance: 0,
    initialZoom: 1
  });
  const zoomSnapshotRef = useRef(null);
  const labelInputRef = useRef(null);

  const scannerPausedRef = useRef(false);
  const handleDecodedValueRef = useRef(null);
  const restartDecodingRef = useRef(() => {});

  const [zoomState, setZoomState] = useState({
    supported: false,
    min: 1,
    max: 3,
    step: 0.1,
    value: 1
  });
  const [manualCode, setManualCode] = useState("");
  const [statusMessage, setStatusMessage] = useState(tt.initialMessage);
  const [productData, setProductData] = useState(null);
  const [scannerPaused, setScannerPaused] = useState(false);
  const [userAllergens, setUserAllergens] = useState([]);
  const [riskResult, setRiskResult] = useState(null);
  const [riskError, setRiskError] = useState("");
  const [riskStatus, setRiskStatus] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [needsLabelPhoto, setNeedsLabelPhoto] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [apiChecked, setApiChecked] = useState(false);
  const allergensList = useMemo(
    () =>
      ANNEX_ALLERGENS.map(item => ({
        code: item.code,
        label: allergenFriendly?.[item.code] || item.code,
        title: ttAnnex?.[item.code] || allergenFriendly?.[item.code] || item.code
      })),
    [allergenFriendly, ttAnnex]
  );

  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const normalizeAllergen = value =>
    value
      .toLowerCase()
      .replace(/^(en:|pt:)/, "")
      .replace(/[^a-z0-9]/g, "");

  const expandAllergenTerms = allergens => {
    const expanded = new Set();
    allergens.forEach(item => {
      const normalized = normalizeAllergen(item);
      if (!normalized) return;
      expanded.add(normalized);
      const family = TAG_TO_FAMILY[normalized];
      if (family) {
        (ANNEX_ALLERGENS.find(a => a.code === family)?.offTags || []).forEach(tag => {
          const tagNorm = normalizeAllergen(tag);
          if (tagNorm) expanded.add(tagNorm);
        });
      }
    });
    return Array.from(expanded).filter(Boolean);
  };

  const annexKeywords = useMemo(() => {
    const keywords = new Set();
    ANNEX_ALLERGENS.forEach(item => {
      (item.offTags || []).forEach(tag => {
        const norm = normalizeAllergen(tag);
        if (norm) keywords.add(norm);
      });
    });
    return Array.from(keywords);
  }, []);

  const highlightAllergens = (text, allergens) => {
    if (!text) return text;

    const allTerms = new Set();
    expandAllergenTerms(allergens || []).forEach(term => allTerms.add(term));
    annexKeywords.forEach(term => allTerms.add(term));
    if (!allTerms.size) return text;

    const patterns = Array.from(allTerms)
      .map(term =>
        term
          .split(/\s+/)
          .map(piece => escapeRegex(piece))
          .join("\\s+")
      )
      .map(term => `\\b[\\w-]*${term}[\\w-]*\\b`);

    const matcher = new RegExp(patterns.join("|"), "gi");
    const segments = [];
    let lastIndex = 0;

    text.replace(matcher, (match, offset) => {
      if (offset > lastIndex) {
        segments.push(text.slice(lastIndex, offset));
      }
      segments.push(
        <strong
          key={`highlight-${offset}`}
          className="product-demo__ingredient-highlight"
        >
          {match}
        </strong>
      );
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      segments.push(text.slice(lastIndex));
    }

    return segments.map((segment, index) =>
      typeof segment === "string" ? (
        <span key={`segment-${index}`}>{segment}</span>
      ) : (
        React.cloneElement(segment, { key: `highlight-${index}` })
      )
    );
  };

  const buildProductFromRisk = useCallback((riskData, fallbackCode = "") => {
    const product = riskData?.product || {};
    const summary = riskData?.summary || {};
    const summaryAllergens = extractSummaryAllergens(summary);
    const allergens = summaryAllergens.length ? summaryAllergens : userAllergens;
    const ingredientsText =
      product.ingredients_text || summary.ingredients_text || "";

    return {
      name: product.name || summary.product || tt.noneListed,
      code: product.ean || fallbackCode || tt.noneListed,
      allergens: allergens.length ? allergens : [tt.noneListed],
      traces: Array.isArray(product.traces_tags) && product.traces_tags.length
        ? product.traces_tags
        : [tt.noneListed],
      ingredients: ingredientsText
    };
  }, [tt.noneListed, userAllergens]);

  const recordRiskReading = useCallback(
    async ({ mode, barcode, riskData, error, productName }) => {
      const product = riskData?.product || {};
      const summary = riskData?.summary || {};
      const ingredientsText =
        product.ingredients_text || summary.ingredients_text || "";
      const ingredientsList = parseIngredientsList(ingredientsText);
      const finalScore =
        riskData?.risk?.final_score ??
        riskData?.risk?.finalScore ??
        null;
      const productEan =
        typeof product.ean === "string" && isValidEan(product.ean)
          ? product.ean
          : "";
      const resolvedBarcode =
        barcode ||
        productEan ||
        findEanInText(ingredientsText, summary.product, product.name);
      const normalizedBarcode =
        mode === "image" && !resolvedBarcode ? "not_found" : resolvedBarcode || null;

      try {
        await addDoc(collection(db, "riskReadings"), {
          mode,
          status: error ? "error" : "success",
          error: error || null,
          barcode: normalizedBarcode,
          productName: normalizeProductName(product.name, productName, summary.product),
          brand: product.brand || null,
          source: product.source || null,
          userAllergens,
          ingredientsText,
          ingredientsList,
          riskFinalScore: finalScore,
          riskPerAllergen: riskData?.risk?.per_allergen || null,
          summary,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.warn("Failed to store risk reading", error);
      }
    },
    [userAllergens]
  );

  useEffect(() => {
    scannerPausedRef.current = scannerPaused;
  }, [scannerPaused]);

  useEffect(() => {
    zoomSnapshotRef.current = zoomState;
  }, [zoomState]);

  const stopCamera = useCallback(() => {
    readerRef.current?.reset();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.warn("Unable to stop track", error);
        }
      });
      streamRef.current = null;
    }
    trackRef.current = null;
    setCameraActive(false);
  }, []);

  const scrollToSummaryOnMobile = useCallback(() => {
    if (!summaryRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (isMobile) {
      const delay = prefersReducedMotion ? 0 : 180;
      window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
        summaryRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }, delay);
    }
  }, []);

  const fetchProductInfo = useCallback(
    async barcode => {
      const code = barcode.trim();
      if (!code) return;

      setStatusMessage(tt.searching);
      setProductData(null);
      setRiskResult(null);
      setRiskError("");
      setRiskStatus("");
      setShowDetails(false);
      setNeedsLabelPhoto(false);
      setUploadStatus("");
      setUploadingLabel(false);

      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
            code
          )}.json`
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (!data.product) {
          setStatusMessage(tt.notFound);
          setNeedsLabelPhoto(true);
          setProductData({
            name: tt.noneListed,
            code,
            allergens: [tt.noneListed],
            traces: [tt.noneListed],
            ingredients: ""
          });
          return;
        }

        const product = data.product;
        const allergens = collectProductTags(product, [
          "allergens_tags",
          "allergens",
          "ingredients_allergens"
        ]);
        const traces = collectProductTags(product, ["traces_tags", "traces"]);
        const hasIngredientText = Boolean(
          product.ingredients_text ||
            product.ingredients_text_en ||
            product.ingredients_text_pt ||
            product.ingredients_text_with_allergens ||
            product.ingredients_text_with_allergens_pt ||
            (typeof product.ingredients === "string" && product.ingredients.trim())
        );
        const labelPhotoNeeded = !hasIngredientText;

        const allergenList = allergens.length ? allergens : [tt.noneListed];
        const tracesList = traces.length ? traces : [tt.noneListed];

        setStatusMessage(tt.productFoundConfirm);
        setProductData({
          name: product.product_name || tt.noneListed,
          code,
          allergens: allergenList,
          traces: tracesList,
          ingredients:
            product.ingredients_text_en ||
            product.ingredients_text ||
            product.ingredients ||
            ""
        });
        scrollToSummaryOnMobile();

        setRiskStatus(tt.riskCalculating);
        try {
          // --- API logging: request payload ---
          const riskPayload = {
            barcode: code,
            user_allergens: userAllergens,
            consider_may_contain: true,
            consider_facility: false
          };
          console.info("[besayfe:risk] request payload", riskPayload);

          const riskResponse = await fetch(`${RISK_API_BASE_URL}/risk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(riskPayload)
          });

          if (!riskResponse.ok) {
            if (riskResponse.status === 404) {
              await recordRiskReading({
                mode: "barcode",
                barcode: code,
                error: "not_found",
                productName: product.product_name
              });
              setRiskError(tt.riskNotFoundEngine);
              setRiskStatus("");
              return;
            }
            if (riskResponse.status >= 500) {
              await recordRiskReading({
                mode: "barcode",
                barcode: code,
                error: `server_${riskResponse.status}`,
                productName: product.product_name
              });
              setRiskError(tt.riskEngineFailed);
              setRiskStatus("");
              return;
            }
            throw new Error(`HTTP ${riskResponse.status}`);
          }

          const riskData = await riskResponse.json();
          // --- API logging: response payload ---
          console.info("[besayfe:risk] response payload", riskData);
          await recordRiskReading({ mode: "barcode", barcode: code, riskData });
          const fallbackText =
            "no ingredient information available; insufficient data to compute ingredient-based risk; openfoodfacts entry has no declared allergens or ingredient text; cannot compute risk from source data; applying conservative fallback score";
          const serializedRisk = JSON.stringify(riskData || {}).toLowerCase();
          const requiresLabelPhoto = serializedRisk.includes(fallbackText);
          setNeedsLabelPhoto(labelPhotoNeeded || requiresLabelPhoto);
          setRiskResult(riskData);
          setRiskStatus("");
        } catch (error) {
          await recordRiskReading({
            mode: "barcode",
            barcode: code,
            error: "network_error",
            productName: product.product_name
          });
          setRiskError(tt.riskUnavailable);
          setRiskStatus("");
        }
      } catch (error) {
        console.error("Erro ao obter produto:", error);
        await recordRiskReading({
          mode: "barcode",
          barcode: code,
          error: "openfoodfacts_error"
        });
        setStatusMessage(tt.errorFetch);
        setNeedsLabelPhoto(true);
        if (!productData) {
          setProductData({
            name: tt.noneListed,
            code,
            allergens: [tt.noneListed],
            traces: [tt.noneListed],
            ingredients: ""
          });
        }
      }
    },
    [productData, recordRiskReading, scrollToSummaryOnMobile, tt, userAllergens]
  );

  const handleDecodedValue = useCallback(
    rawCode => {
      const code = rawCode.trim();
      if (!code) return;

      readerRef.current?.reset();
      window.clearTimeout(pauseTimerRef.current);

      setScannerPaused(true);
      setStatusMessage(tt.processing);
      setProductData(null);

      fetchProductInfo(code);

      pauseTimerRef.current = window.setTimeout(() => {
        setScannerPaused(false);
        restartDecodingRef.current?.();
      }, 2000);
    },
    [fetchProductInfo, tt.processing]
  );
  handleDecodedValueRef.current = handleDecodedValue;

  const restartDecoding = useCallback(() => {
    if (!videoRef.current || !readerRef.current) return;

    readerRef.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, error) => {
        if (error || scannerPausedRef.current) return;
        if (result) {
          handleDecodedValueRef.current?.(result.getText());
        }
      }
    );
  }, []);
  restartDecodingRef.current = restartDecoding;

  const startCamera = useCallback(
    async deviceId => {
      stopCamera();

      try {
        const constraints = {
          audio: false,
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        streamRef.current = stream;
        const [track] = stream.getVideoTracks();
        trackRef.current = track;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play().catch(() => {});
        }

        const capabilities = track.getCapabilities?.() || {};
        const settings = track.getSettings?.() || {};

        if (capabilities.zoom) {
          setZoomState({
            supported: true,
            min: capabilities.zoom.min ?? 1,
            max: capabilities.zoom.max ?? 3,
            step: capabilities.zoom.step || 0.1,
            value: settings.zoom || capabilities.zoom.min || 1
          });
        } else {
          setZoomState(previous => ({ ...previous, supported: false }));
        }

        if (!readerRef.current) {
          readerRef.current = new BrowserMultiFormatReader();
        } else {
          readerRef.current.reset();
        }

        setScannerPaused(false);
        scannerPausedRef.current = false;
        restartDecoding();

        setStatusMessage(tt.initialMessage);
        setCameraActive(true);
      } catch (error) {
        console.error("Camera error:", error);
        setStatusMessage(tt.cameraAccess);
        setCameraActive(false);
      }
    },
    [restartDecoding, stopCamera, tt]
  );

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    return () => {
      window.clearTimeout(pauseTimerRef.current);
      window.clearTimeout(scrollTimerRef.current);
      stopCamera();
      readerRef.current?.reset();
    };
  }, [stopCamera]);

  useEffect(() => {
    setStatusMessage(tt.initialMessage);
  }, [tt.initialMessage]);

  useEffect(() => {
    if (userAllergens.length && uploadStatus === "missingAllergens") {
      setUploadStatus("");
    }
  }, [uploadStatus, userAllergens.length]);

  useEffect(() => {
    const readWarmupCache = () => {
      try {
        const raw = window.localStorage.getItem(RISK_API_WARMUP_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.timestamp) return null;
        const age = Date.now() - parsed.timestamp;
        if (age > RISK_API_WARMUP_TTL_MS) return null;
        return { online: Boolean(parsed.online) };
      } catch (error) {
        return null;
      }
    };

    const writeWarmupCache = online => {
      try {
        window.localStorage.setItem(
          RISK_API_WARMUP_STORAGE_KEY,
          JSON.stringify({ online, timestamp: Date.now() })
        );
      } catch (storageError) {
        // ignore storage write errors
      }
    };

    const checkHealth = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        RISK_API_WARMUP_TIMEOUT_MS
      );

      try {
        const res = await fetch(`${RISK_API_BASE_URL}/health`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store"
        });
        // Consider the API online if we get any response that is not a server error.
        const online = res.status < 500;
        setApiOnline(online);
        writeWarmupCache(online);
        console.info("[besayfe:risk] health check", {
          online,
          status: res.status
        });
      } catch (error) {
        setApiOnline(false);
        writeWarmupCache(false);
        if (error?.name !== "AbortError") {
          console.warn("[besayfe:risk] health check failed", error);
        }
      } finally {
        window.clearTimeout(timeoutId);
        setApiChecked(true);
      }
    };

    const cached = readWarmupCache();
    if (cached) {
      setApiOnline(Boolean(cached.online));
      setApiChecked(true);
      console.info("[besayfe:risk] warmup cache hit", {
        online: Boolean(cached.online)
      });
    } else {
      console.info("[besayfe:risk] warmup start");
      checkHealth();
    }

    const intervalId = window.setInterval(checkHealth, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const applyZoomValue = useCallback(
    value => {
      const snapshot = zoomSnapshotRef.current || zoomState;
      const next = clamp(value, snapshot.min, snapshot.max);
      setZoomState(previous => ({ ...previous, value: next }));
      trackRef.current
        ?.applyConstraints({ advanced: [{ zoom: next }] })
        .catch(() => {});
    },
    [zoomState]
  );

  useEffect(() => {
    const shell = videoRef.current?.parentElement?.parentElement;
    const target = videoShellRef.current || shell;
    if (!target || !zoomState.supported) return;

    const getDistance = (a, b) => {
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchStart = event => {
      if (event.touches.length !== 2) return;
      const distance = getDistance(event.touches[0], event.touches[1]);
      pinchStateRef.current = {
        active: true,
        initialDistance: distance,
        initialZoom:
          zoomSnapshotRef.current?.value !== undefined
            ? zoomSnapshotRef.current.value
            : zoomState.value
      };
    };

    const handleTouchMove = event => {
      if (!pinchStateRef.current.active || event.touches.length !== 2) return;
      event.preventDefault();
      const distance = getDistance(event.touches[0], event.touches[1]);
      const { initialDistance, initialZoom } = pinchStateRef.current;
      if (!initialDistance) return;
      const scale = distance / initialDistance;
      applyZoomValue(initialZoom * scale);
    };

    const endPinch = () => {
      pinchStateRef.current.active = false;
    };

    target.addEventListener("touchstart", handleTouchStart, { passive: true });
    target.addEventListener("touchmove", handleTouchMove, { passive: false });
    target.addEventListener("touchend", endPinch);
    target.addEventListener("touchcancel", endPinch);

    return () => {
      target.removeEventListener("touchstart", handleTouchStart);
      target.removeEventListener("touchmove", handleTouchMove);
      target.removeEventListener("touchend", endPinch);
      target.removeEventListener("touchcancel", endPinch);
    };
  }, [applyZoomValue, zoomState.supported, zoomState.value]);

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      setStatusMessage(tt.enterValidCode);
      setProductData(null);
      return;
    }
    handleDecodedValue(manualCode);
  };

  const statusCopy =
    statusMessage || (productData ? tt.productFoundConfirm : tt.waiting);

  const statusVariant = useMemo(() => {
    if (!statusMessage) {
      return productData ? "success" : "idle";
    }

    if (statusMessage === tt.errorFetch || statusMessage === tt.riskUnavailable) {
      return "error";
    }

    if (
      statusMessage === tt.notFound ||
      statusMessage === tt.noCamera ||
      statusMessage === tt.cameraUnavailable ||
      statusMessage === tt.enterValidCode ||
      statusMessage === tt.cameraAccess
    ) {
      return "warning";
    }

    if (
      statusMessage === tt.searching ||
      statusMessage === tt.initialMessage ||
      statusMessage === tt.processing ||
      statusMessage === tt.labelProcessing ||
      statusMessage === tt.waiting
    ) {
      return "info";
    }

    if (statusMessage === tt.productFoundConfirm || statusMessage === tt.labelReady) {
      return "success";
    }

    return productData ? "success" : "info";
  }, [statusMessage, tt, productData]);

  const handleVideoShellClick = useCallback(() => {
    if (cameraActive) {
      stopCamera();
      setProductData(null);
      setStatusMessage(tt.cameraAccess);
      setScannerPaused(false);
      return;
    }
    startCamera();
  }, [cameraActive, startCamera, stopCamera, tt.cameraAccess]);

  const handleVideoShellKeyDown = useCallback(
    event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleVideoShellClick();
      }
    },
    [handleVideoShellClick]
  );

  const riskReady = Boolean(riskResult?.risk);
  const riskDetailsVisible = riskReady && showDetails && !needsLabelPhoto;
  const showRiskSummary = riskReady && !needsLabelPhoto;
  const shouldShowLabelCta = Boolean(productData && needsLabelPhoto);

  const getRiskLevel = value => {
    const score = typeof value === "number" ? value : parseFloat(value);
    if (Number.isNaN(score)) return "unknown";
    if (score < 34) return "low";
    if (score < 67) return "mid";
    return "high";
  };

  const renderRiskBadge = value => {
    const level = getRiskLevel(value);
    return (
      <span className={`risk-badge risk-badge--${level}`}>
        {value ?? "N/A"}
      </span>
    );
  };

  const handleLabelUploadClick = useCallback(() => {
    labelInputRef.current?.click();
  }, []);

  const handleLabelFileChange = useCallback(
    event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!userAllergens.length) {
        setUploadStatus("missingAllergens");
        if (labelInputRef.current) {
          labelInputRef.current.value = "";
        }
        return;
      }
      const productName = productData?.name || tt.noneListed;

      const run = async () => {
        try {
          setUploadingLabel(true);
          setUploadStatus("");
          setRiskError("");
          setRiskResult(null);
          setRiskStatus(tt.labelProcessing || tt.riskCalculating);
          setStatusMessage(tt.labelProcessing || tt.processing);
          setNeedsLabelPhoto(false);
          setShowDetails(false);
          setProductData(null);
          const imageData = await compressImageToDataUrl(file, {
            maxBytes: 900000,
            maxDimension: 1400,
            minQuality: 0.35
          });
          const imageBlob = dataUrlToBlob(imageData);
          const safeName = file.name?.trim() ? file.name.trim() : "label.jpg";
          const imageFile = new File([imageBlob], safeName, {
            type: imageBlob.type || "image/jpeg"
          });

          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("user_allergens", userAllergens.join(","));
          formData.append("consider_may_contain", "true");
          formData.append("consider_facility", "false");
          formData.append("reference_id", safeName);

          const response = await fetch(`${RISK_API_BASE_URL}/risk/image`, {
            method: "POST",
            body: formData
          });

          if (!response.ok) {
            if (response.status >= 500) {
              await recordRiskReading({
                mode: "image",
                barcode: "",
                error: `server_${response.status}`,
                productName
              });
              throw new Error("Risk engine unavailable");
            }
            await recordRiskReading({
              mode: "image",
              barcode: "",
              error: `http_${response.status}`,
              productName
            });
            throw new Error(`HTTP ${response.status}`);
          }

          const riskData = await response.json();
          console.info("[besayfe:risk:image] response payload", riskData);
          const product = riskData?.product || {};
          const summary = riskData?.summary || {};
          const ingredientsText =
            product.ingredients_text || summary.ingredients_text || "";
          const productEan =
            typeof product.ean === "string" && isValidEan(product.ean)
              ? product.ean
              : "";
          const extractedBarcode =
            productEan || findEanInText(ingredientsText, summary.product, product.name);
          const resolvedProductName = normalizeProductName(
            product.name,
            productName,
            summary.product
          );
          const recordLabelUpload = async () => {
            try {
              await addDoc(collection(db, "labelUploads"), {
                barcode: extractedBarcode || "not_found",
                productName: resolvedProductName,
                source: "productDemoV2",
                image: imageData,
                checked: false,
                createdAt: serverTimestamp()
              });
            } catch (error) {
              console.warn("Failed to store label upload", error);
            }
          };
          await recordRiskReading({
            mode: "image",
            barcode: extractedBarcode,
            riskData,
            productName: resolvedProductName
          });
          await recordLabelUpload();
          setShowThankYou(true);
          setRiskResult(riskData);
          setRiskStatus("");
          setRiskError("");
          setUploadStatus("success");
          setStatusMessage(tt.labelReady || tt.productFoundConfirm);
          setProductData(buildProductFromRisk(riskData));
          scrollToSummaryOnMobile();
        } catch (error) {
          console.error("Failed to analyze label photo", error);
          await recordRiskReading({
            mode: "image",
            barcode: "",
            error: "network_error",
            productName
          });
          if (!navigator.onLine) {
            setUploadStatus("offline");
          } else {
            setUploadStatus("error");
          }
          setRiskError(tt.riskUnavailable);
          setRiskStatus("");
          setStatusMessage(tt.riskUnavailable);
        } finally {
          setUploadingLabel(false);
          if (labelInputRef.current) {
            labelInputRef.current.value = "";
          }
        }
      };
      run();
    },
    [
      buildProductFromRisk,
      productData?.name,
      recordRiskReading,
      scrollToSummaryOnMobile,
      tt,
      userAllergens
    ]
  );

  return (
    <div className="product-demo">
      {showThankYou && (
        <CelebrationOverlay
          title={tt.uploadLabelSuccess}
          text={tt.labelEncourage}
          onClose={() => setShowThankYou(false)}
        />
      )}
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/product-demo"
        siteName={siteName}
      />
      <div className="product-demo__container">
        <header className="product-demo__header">
          <span className="product-demo__eyebrow">{tt.headerTag}</span>
          <h1 className="product-demo__title">{tt.headerTitle}</h1>
          <p className="product-demo__subtitle">{tt.headerSubtitle}</p>
          {apiChecked && !apiOnline && (
            <div className="product-demo__api-alert" role="alert">
              <div className="product-demo__api-alert-text">
                {tt?.apiUnavailable || "The risk analysis service might be currently unavailable."}
              </div>
              <a className="product-demo__button product-demo__button--ghost" href="/product-demo-legacy">
                {tt?.apiSwitchLegacy || "Go to the older version"}
              </a>
            </div>
          )}
        </header>

        <div className="product-demo__grid">
          <section className="product-demo__panel product-demo__panel--profile">
            <div className="product-demo__panel-header">
              <div className="product-demo__panel-header-row">
                <div>
                  <h2 className="product-demo__panel-title">{tt.profileTitle}</h2>
                </div>
                <div className="product-demo__panel-actions">
                  <button
                    type="button"
                    className="product-demo__button product-demo__button--ghost"
                    onClick={() => setProfileExpanded(prev => !prev)}
                  >
                    {profileExpanded ? tt.profileHide : tt.profileEdit}
                  </button>
                </div>
              </div>
              <div className="product-demo__profile-summary">
                {userAllergens.length ? (
                  userAllergens.slice(0, 4).map(code => {
                    const label =
                      allergensList.find(item => item.code === code)?.label || code;
                    return (
                      <span key={code} className="product-demo__token">
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="product-demo__token product-demo__token--muted">
                    {tt.profileTokenNone}
                  </span>
                )}
                {userAllergens.length > 4 && (
                  <span className="product-demo__token product-demo__token--muted">
                    +{userAllergens.length - 4} {tt.profileMore}
                  </span>
                )}
              </div>
            </div>

            {profileExpanded && (
              <>
                <div className="product-demo__panel-actions product-demo__panel-actions--secondary">
                  <button
                    type="button"
                    className="product-demo__link"
                    onClick={() => setUserAllergens(ANNEX_ALLERGENS.map(a => a.code))}
                  >
                    {tt.profileSelectAll}
                  </button>
                  <button
                    type="button"
                    className="product-demo__link"
                    onClick={() => setUserAllergens([])}
                  >
                    {tt.profileClear}
                  </button>
                </div>

                <div className="product-demo__allergen-grid product-demo__allergen-grid--chips">
                  {allergensList.map(item => {
                    const selected = userAllergens.includes(item.code);
                    return (
                      <button
                        key={item.code}
                    type="button"
                    className={`product-demo__chip ${selected ? "product-demo__chip--active" : ""}`}
                    onClick={() =>
                      setUserAllergens(previous =>
                        previous.includes(item.code)
                          ? previous.filter(code => code !== item.code)
                          : [...previous, item.code]
                      )
                    }
                    aria-pressed={selected}
                    title={item.title || item.label}
                  >
                    <span className="product-demo__chip-label-text">{item.label}</span>
                  </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <section className="product-demo__panel product-demo__panel--scanner">
            <div className="product-demo__panel-header">
              <h2 className="product-demo__panel-title">{tt.scannerTitle}</h2>
              <p className="product-demo__panel-subtitle">
                {tt.scannerSubtitle}
              </p>
            </div>
            <div
              className={`product-demo__video-shell ${
                scannerPaused ? "product-demo__video-shell--paused" : ""
              }`}
              ref={videoShellRef}
              role="button"
              tabIndex={0}
              aria-pressed={cameraActive}
              onClick={handleVideoShellClick}
              onKeyDown={handleVideoShellKeyDown}
            >
              <video ref={videoRef} className="product-demo__video" />
              {!cameraActive && (
                <div className="product-demo__video-hint" aria-live="polite">
                  {tt.tapToEnable}
                </div>
              )}
              <div className="product-demo__video-overlay">
                <div
                  className={`product-demo__scan-box ${
                    scannerPaused ? "product-demo__scan-box--success" : ""
                  }`}
                >
                  <span
                    className={`product-demo__scan-check ${
                      scannerPaused ? "product-demo__scan-check--visible" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {"\u2713"}
                  </span>
                </div>
              </div>
            </div>

            <div className="product-demo__manual">
              <span className="product-demo__label">{tt.noCameraQuestion}</span>
              <div className="product-demo__manual-row">
                <input
                  id={manualInputId}
                  type="text"
                  className="product-demo__input"
                  placeholder={tt.manualPlaceholder}
                  value={manualCode}
                  onChange={event => setManualCode(event.target.value)}
                />
                <button
                  type="button"
                  className="product-demo__button product-demo__button--primary"
                  onClick={handleManualSearch}
                >
                  {tt.search}
                </button>
              </div>
            </div>

            <div className="product-demo__label-upload product-demo__label-upload--primary">
              <div className="product-demo__label-upload-header">
                <span className="product-demo__label">
                  {tt.labelTitle || tt.uploadLabel}
                </span>
                <p className="product-demo__label-note">
                  {tt.labelSubtitle || tt.labelEncourage}
                </p>
              </div>
              <div className="product-demo__label-upload-actions">
                <button
                  type="button"
                  className="product-demo__button product-demo__button--primary"
                  onClick={handleLabelUploadClick}
                  disabled={uploadingLabel}
                >
                  {uploadingLabel ? (
                    tt.uploadingLabel
                  ) : (
                    <>
                      <img
                        src={cameraIcon}
                        alt=""
                        className="product-demo__button-icon"
                      />
                      {tt.uploadLabel}
                    </>
                  )}
                </button>
                <input
                  ref={labelInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleLabelFileChange}
                  className="product-demo__label-input"
                  style={{ display: "none" }}
                />
              </div>
              {uploadStatus === "missingAllergens" && (
                <p className="product-demo__risk-message product-demo__risk-message--error">
                  {tt.uploadLabelMissingAllergens}
                </p>
              )}
              {uploadStatus === "success" && (
                <p className="product-demo__risk-message">
                  {tt.uploadLabelSuccess}
                </p>
              )}
              {uploadStatus === "offline" && (
                <p className="product-demo__risk-message product-demo__risk-message--error">
                  {tt.uploadLabelOffline}
                </p>
              )}
              {uploadStatus === "error" && (
                <p className="product-demo__risk-message product-demo__risk-message--error">
                  {tt.uploadLabelError}
                </p>
              )}
            </div>
          </section>

          <section
            ref={summaryRef}
            className="product-demo__panel product-demo__panel--summary"
          >
            <div className="product-demo__panel-header">
              <h2 className="product-demo__panel-title">{tt.summaryTitle}</h2>
            </div>

            <div className="product-demo__status">
              <span
                className={`product-demo__status-message product-demo__status-message--${statusVariant}`}
              >
                {statusCopy}
              </span>
            </div>

            {productData ? (
              <>
                <div className="product-demo__data product-demo__data--minimal">
                  <div className="product-demo__data-row">
                    <dt>{tt.name}</dt>
                    <dd>{productData.name}</dd>
                  </div>
                  {showRiskSummary && (
                    <div className="product-demo__data-row">
                      <dt>{tt.riskLabel}</dt>
                      <dd>
                        {renderRiskBadge(
                          riskResult?.risk?.final_score ??
                            riskResult?.risk?.finalScore ??
                            "N/A"
                        )}
                      </dd>
                    </div>
                  )}
                  {shouldShowLabelCta && (
                    <div className="product-demo__label-cta">
                      <p className="product-demo__risk-message">
                        {tt.insufficientInfo}
                      </p>
                      <button
                        type="button"
                        className="product-demo__button product-demo__button--ghost"
                        onClick={handleLabelUploadClick}
                        disabled={uploadingLabel}
                      >
                        {tt.uploadLabel}
                      </button>
                    </div>
                  )}

                  {!riskReady && (riskStatus || riskError) && (
                    <p
                      className={`product-demo__risk-message${
                        riskError ? " product-demo__risk-message--error" : ""
                      }`}
                    >
                      {riskError || riskStatus}
                    </p>
                  )}

                  {riskDetailsVisible && (
                    <div className="product-demo__details">
                      <dl className="product-demo__data product-demo__data--expanded">
                        <div className="product-demo__data-row">
                          <dt>{tt.code}</dt>
                          <dd>{productData.code}</dd>
                        </div>
                        <div className="product-demo__data-row">
                          <dt>{tt.ingredients}</dt>
                          <dd className="product-demo__ingredients">
                            {productData.ingredients
                              ? highlightAllergens(
                                  productData.ingredients,
                                  productData.allergens
                                )
                              : tt.noneListed}
                          </dd>
                        </div>
                      </dl>

                      {!needsLabelPhoto && (
                        <div className="product-demo__risk">
                        <h3 className="product-demo__risk-title">{tt.riskAnalysisTitle}</h3>
                        {riskStatus && (
                          <p className="product-demo__risk-message">{riskStatus}</p>
                        )}
                        {riskError && (
                          <p className="product-demo__risk-message product-demo__risk-message--error">
                            {riskError}
                          </p>
                        )}
                        {riskResult?.risk && !riskError && (
                          <div className="product-demo__risk-results">
                            <p className="product-demo__risk-score">
                              {tt.riskFinalScore} {renderRiskBadge(riskResult.risk.final_score ?? "N/A")}
                            </p>
                            <p className="product-demo__risk-score product-demo__risk-score--secondary">
                              {tt.riskFacilityAdded}{" "}
                              {renderRiskBadge(
                                riskResult.risk.facility_risk ??
                                  riskResult.risk.facilityRisk ??
                                  "N/A"
                              )}
                            </p>
                            <div className="product-demo__risk-list">
                              {(Array.isArray(riskResult.risk.per_allergen)
                                ? riskResult.risk.per_allergen
                                : riskResult.risk.per_allergen
                                ? Object.entries(riskResult.risk.per_allergen).map(
                                    ([code, details]) => ({
                                      code,
                                      ...(typeof details === "object"
                                        ? details
                                        : { score: details })
                                    })
                                  )
                                : []
                              ).map(item => (
                                <div
                                  key={item.code}
                                  className="product-demo__risk-item"
                                >
                                  <div className="product-demo__risk-item-header">
                                    <span className="product-demo__token product-demo__token--allergen">
                                      {item.code}
                                    </span>
                                    <span className="product-demo__risk-item-score">
                                      {tt.riskScoreLabel} {renderRiskBadge(item.score ?? "N/A")}
                                    </span>
                                  </div>
                                  {Array.isArray(item.reasons) &&
                                    item.reasons.length > 0 && (
                                      <ul className="product-demo__risk-reasons">
                                        {item.reasons.map((reason, index) => (
                                          <li key={`${item.code}-reason-${index}`}>{reason}</li>
                                        ))}
                                      </ul>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      )}
                    </div>
                  )}

                  {showRiskSummary && (
                    <div className="product-demo__view-more">
                      <button
                        type="button"
                        className="product-demo__link"
                        onClick={() => setShowDetails(previous => !previous)}
                      >
                        {showDetails ? tt.riskHideDetails : tt.riskViewMore}
                      </button>
                    </div>
                  )}
                </div>

              </>
            ) : (
              <div className="product-demo__empty">
                <p>{tt.empty}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductDemoV2;
