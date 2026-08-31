import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import "./ProductDemo.css";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

function ProductDemo() {
  const { t } = useTranslation();
  const tt = useMemo(() => t("productDemo"), [t]);
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.productDemo") || {};

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
          return;
        }

        const product = data.product;
        const allergens = collectProductTags(product, [
          "allergens_tags",
          "allergens",
          "ingredients_allergens"
        ]);
        const traces = collectProductTags(product, ["traces_tags", "traces"]);

        const allergenList = allergens.length ? allergens : [tt.noneListed];
        const tracesList = traces.length ? traces : [tt.noneListed];

        setStatusMessage(tt.productFoundConfirm);
        setProductData({
          name: product.product_name || tt.noneListed,
          code,
          allergens: allergenList,
          traces: tracesList
        });
        scrollToSummaryOnMobile();
      } catch (error) {
        console.error("Erro ao obter produto:", error);
        setStatusMessage(tt.errorFetch);
      }
    },
    [scrollToSummaryOnMobile, tt]
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

    if (statusMessage === tt.errorFetch) return "error";

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
      statusMessage === tt.waiting
    ) {
      return "info";
    }

    if (statusMessage === tt.productFoundConfirm) return "success";

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

  return (
    <div className="product-demo">
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/product-demo-legacy"
        siteName={siteName}
      />
      <div className="product-demo__container">
        <header className="product-demo__header">
          <span className="product-demo__eyebrow">{tt.headerTag}</span>
          <h1 className="product-demo__title">{tt.headerTitle}</h1>
          <p className="product-demo__subtitle">{tt.headerSubtitle}</p>
        </header>

        <div className="product-demo__grid">
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
          </section>

          <section
            ref={summaryRef}
            className="product-demo__panel product-demo__panel--summary"
          >
            <div className="product-demo__panel-header">
              <h2 className="product-demo__panel-title">{tt.summaryTitle}</h2>
              <p
                className="product-demo__panel-subtitle"
                dangerouslySetInnerHTML={{
                  __html: t("productDemo.summarySubtitle")
                }}
              />
            </div>

            <div className="product-demo__status">
              <span
                className={`product-demo__status-message product-demo__status-message--${statusVariant}`}
              >
                {statusCopy}
              </span>
            </div>

            {productData ? (
              <dl className="product-demo__data">
                <div className="product-demo__data-row">
                  <dt>{tt.name}</dt>
                  <dd>{productData.name}</dd>
                </div>
                <div className="product-demo__data-row">
                  <dt>{tt.code}</dt>
                  <dd>{productData.code}</dd>
                </div>
                <div className="product-demo__data-row">
                  <dt>{tt.allergens}</dt>
                  <dd>
                    {productData.allergens.length ? (
                      productData.allergens.map((item, index) => (
                        <span key={`allergen-${index}`} className="product-demo__token">
                          {item}
                        </span>
                      ))
                    ) : (
                      tt.noneListed
                    )}
                  </dd>
                </div>
                <div className="product-demo__data-row">
                  <dt>{tt.mayContain}</dt>
                  <dd>
                    {productData.traces.length ? (
                      productData.traces.map((item, index) => (
                        <span key={`trace-${index}`} className="product-demo__token">
                          {item}
                        </span>
                      ))
                    ) : (
                      tt.noneListed
                    )}
                  </dd>
                </div>
              </dl>
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

export default ProductDemo;
