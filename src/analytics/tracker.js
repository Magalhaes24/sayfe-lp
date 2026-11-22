// First-party, consent-gated, anonymous analytics.
//
// What is collected (only after the visitor accepts):
//   page views, time on page, scroll depth, section dwell, clicks (with page
//   coordinates for heatmaps), rage clicks, mouse-attention grid, form
//   interaction (which field, never what was typed), language switches,
//   JS errors, Core Web Vitals, and a coarse device/source context.
//
// What is never collected: IP address (the browser never sees it and the
// endpoint does not log it), typed values, e-mail/phone, precise location,
// fingerprints, query strings (except sanitised utm_*), full referrer URLs,
// or anything that links a visitor to a contact-form submission.
//
// Transport: plain fetch (keepalive) to the Firestore REST API. No SDK, no
// third-party script, no third-party cookie. Rules in firestore.rules only
// allow validated creates; reads are admin-only.

import { getConsent, onConsentChange } from "./consent";

const API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;
const PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const ENDPOINT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/analytics_batches?key=${API_KEY}`;

const VID_KEY = "ac_vid";
const SID_KEY = "ac_sid";
const CTX_KEY = "ac_ctx";
const IGNORE_KEY = "ac_ignore"; // set on the owner's browser to skip own visits
const VID_TTL = 365 * 24 * 3600 * 1000; // the identifier rotates once a year
const SESSION_IDLE = 30 * 60 * 1000;
const RETENTION_MS = 395 * 24 * 3600 * 1000; // ~13 months, then Firestore TTL deletes it
const FLUSH_MS = 10000;
const BATCH_MAX = 40;
const SESSION_EVENT_CAP = 1200;
const CLICK_CAP = 250;

const state = {
  on: false,
  appCheck: "",
  queue: [],
  sent: 0,
  timer: null,
  cleanups: [],
  vid: "",
  sid: "",
  ctx: null,
  page: null
};

/* ----------------------------- helpers ----------------------------- */

const now = () => Date.now();

function store(kind) {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch (error) {
    return null;
  }
}

function randomId() {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Removes anything that looks personal from free text before it leaves the browser.
export function clean(value, max = 40) {
  if (value == null) return "";
  return String(value)
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\d{5,}/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function isBot() {
  const ua = navigator.userAgent || "";
  return (
    navigator.webdriver === true ||
    /bot|crawler|spider|crawling|lighthouse|prerender|headless|slurp|facebookexternalhit|preview/i.test(ua)
  );
}

function shouldSkip() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("_hm")) return true; // the admin heatmap iframe
  if (window.location.pathname.startsWith("/admin")) return true;
  const local = store("local");
  if (local && local.getItem(IGNORE_KEY) === "1") return true;
  return isBot();
}

function deviceClass() {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1100) return "tablet";
  return "desktop";
}

// Family only, no version numbers: not enough detail to single anyone out.
function parseAgent() {
  const ua = navigator.userAgent || "";
  let os = "other";
  if (/Windows/i.test(ua)) os = "windows";
  else if (/Android/i.test(ua)) os = "android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "ios";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macos";
  else if (/Linux|X11/i.test(ua)) os = "linux";
  let br = "other";
  if (/Edg\//i.test(ua)) br = "edge";
  else if (/OPR\/|Opera/i.test(ua)) br = "opera";
  else if (/Firefox|FxiOS/i.test(ua)) br = "firefox";
  else if (/Chrome|CriOS/i.test(ua)) br = "chrome";
  else if (/Safari/i.test(ua)) br = "safari";
  return { os, br };
}

function refHost() {
  try {
    if (!document.referrer) return "";
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === window.location.hostname.replace(/^www\./, "") ? "" : host.slice(0, 60);
  } catch (error) {
    return "";
  }
}

function utm(name) {
  const value = new URLSearchParams(window.location.search).get(name);
  return value ? value.toLowerCase().replace(/[^a-z0-9_.\- ]/g, "").slice(0, 40) : "";
}

/* ----------------------- identity and session ----------------------- */

function loadIdentity() {
  const local = store("local");
  const session = store("session");
  let vid = "";
  let returning = false;
  let visits = 1;

  if (local) {
    try {
      const saved = JSON.parse(local.getItem(VID_KEY) || "null");
      if (saved && saved.id && now() - saved.ts < VID_TTL) {
        vid = saved.id;
        returning = true;
        visits = Math.min((saved.n || 1), 99);
      }
    } catch (error) {
      // Corrupt value: start over.
    }
  }
  if (!vid) vid = randomId();

  let sid = "";
  let fresh = true;
  if (session) {
    const last = Number(session.getItem(SID_KEY + "_t") || 0);
    const current = session.getItem(SID_KEY);
    if (current && now() - last < SESSION_IDLE) {
      sid = current;
      fresh = false;
    }
  }
  if (!sid) sid = randomId();

  if (fresh && local) {
    visits = returning ? Math.min(visits + 1, 99) : 1;
    try {
      local.setItem(VID_KEY, JSON.stringify({ id: vid, ts: returning ? JSON.parse(local.getItem(VID_KEY)).ts : now(), n: visits }));
    } catch (error) {
      // Not persisted; this visit still works.
    }
  }

  state.vid = vid;
  state.sid = sid;
  touchSession();

  if (fresh || !session || !session.getItem(CTX_KEY)) {
    const { os, br } = parseAgent();
    let tz = "";
    try {
      tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").slice(0, 40);
    } catch (error) {
      tz = "";
    }
    state.ctx = {
      lang: (document.documentElement.lang || "").slice(0, 5),
      dev: deviceClass(),
      vw: Math.round(window.innerWidth / 100) * 100,
      os,
      br,
      tz,
      ref: refHost(),
      us: utm("utm_source"),
      um: utm("utm_medium"),
      uc: utm("utm_campaign"),
      rv: returning,
      vc: visits,
      lp: window.location.pathname.slice(0, 80),
      touch: window.matchMedia && window.matchMedia("(pointer: coarse)").matches
    };
    if (session) {
      try {
        session.setItem(CTX_KEY, JSON.stringify(state.ctx));
      } catch (error) {
        // Context is rebuilt on the next page.
      }
    }
  } else {
    try {
      state.ctx = JSON.parse(session.getItem(CTX_KEY));
    } catch (error) {
      state.ctx = {};
    }
    state.ctx.lang = (document.documentElement.lang || state.ctx.lang || "").slice(0, 5);
  }
}

function touchSession() {
  const session = store("session");
  if (!session) return;
  try {
    session.setItem(SID_KEY, state.sid);
    session.setItem(SID_KEY + "_t", String(now()));
  } catch (error) {
    // Ignore.
  }
}

function wipeIdentifiers() {
  const local = store("local");
  const session = store("session");
  [local, session].forEach((area) => {
    if (!area) return;
    try {
      [VID_KEY, SID_KEY, SID_KEY + "_t", CTX_KEY].forEach((key) => area.removeItem(key));
    } catch (error) {
      // Ignore.
    }
  });
}

/* ------------------------------ transport ------------------------------ */

function encode(value, depth = 0) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return { nullValue: null };
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: depth > 4 ? [] : value.map((item) => encode(item, depth + 1)) } };
  }
  if (typeof value === "object") {
    const fields = {};
    Object.keys(value).forEach((key) => {
      if (value[key] !== undefined && value[key] !== null && value[key] !== "") {
        fields[key] = encode(value[key], depth + 1);
      }
    });
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

// Keeps a fresh App Check token ready, so a flush while the page unloads never has to wait.
function refreshAppCheck() {
  if (!process.env.REACT_APP_RECAPTCHA_SITE_KEY) return;
  import("./appCheck")
    .then((mod) => mod.fetchAppCheckToken())
    .then((token) => {
      if (state.on) state.appCheck = token;
    })
    .catch(() => {});
}

function dryRun() {
  const session = store("session");
  return process.env.REACT_APP_ANALYTICS_DRY_RUN === "1" || (session && session.getItem("ac_dry") === "1");
}

function flush({ unloading = false } = {}) {
  if (!state.queue.length) return;
  const batch = state.queue.splice(0, BATCH_MAX);
  const body = {
    fields: {
      v: encode(1),
      vid: encode(state.vid),
      sid: encode(state.sid),
      ts: encode(now()),
      expireAt: { timestampValue: new Date(now() + RETENTION_MS).toISOString() },
      ctx: encode(state.ctx || {}),
      ev: encode(batch)
    }
  };

  if (dryRun()) {
    window.__acSent = (window.__acSent || []).concat([{ ctx: state.ctx, ev: batch }]);
    // eslint-disable-next-line no-console
    console.debug("[analytics:dry-run]", batch);
    if (state.queue.length) flush({ unloading });
    return;
  }

  if (!API_KEY || !PROJECT_ID) return;

  fetch(ENDPOINT, {
    method: "POST",
    headers: state.appCheck
      ? { "Content-Type": "application/json", "X-Firebase-AppCheck": state.appCheck }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
    credentials: "omit",
    referrerPolicy: "no-referrer"
  }).catch(() => {
    // One quiet retry for ordinary page lifetime; nothing is retried while unloading.
    if (!unloading && state.on) state.queue.unshift(...batch.slice(0, 20));
  });

  if (state.queue.length) flush({ unloading });
}

function push(event) {
  if (!state.on) return;
  if (state.sent >= SESSION_EVENT_CAP) return;
  state.sent += 1;
  const item = { ...event, o: Math.max(0, Math.round(now() - state.t0)) };
  if (state.page) item.p = state.page.path;
  state.queue.push(item);
  touchSession();
  if (state.queue.length >= BATCH_MAX - 5) flush();
}

/* --------------------------- DOM description --------------------------- */

const INTERACTIVE = "a,button,input,select,textarea,label,summary,[role='button'],[role='link'],[data-track]";

function describe(el) {
  if (!el || !el.tagName) return { el: "?", ia: false };
  const target = el.closest ? el.closest(INTERACTIVE) : null;
  const node = target || el;
  const tag = node.tagName.toLowerCase();
  let id = node.id && node.id.length < 30 && !/\d{4,}/.test(node.id) ? "#" + node.id : "";
  const classes = (typeof node.className === "string" ? node.className : "")
    .split(/\s+/)
    .filter((name) => name && name.length < 28 && !/\d{3,}/.test(name))
    .slice(0, 2)
    .map((name) => "." + name)
    .join("");
  const named = node.getAttribute && node.getAttribute("data-track");
  const out = { el: (tag + id + classes).slice(0, 70), ia: !!target };
  if (named) out.k = clean(named, 40);
  if (tag === "a" || tag === "button") {
    out.tx = clean(node.getAttribute("aria-label") || node.textContent, 40);
    const href = tag === "a" ? node.getAttribute("href") : "";
    if (href) {
      try {
        const url = new URL(href, window.location.href);
        out.h = (url.hostname === window.location.hostname ? "" : url.hostname) + url.pathname.slice(0, 60);
        out.ob = url.hostname !== window.location.hostname;
        if (url.hash && url.hostname === window.location.hostname) out.h += url.hash.slice(0, 30);
      } catch (error) {
        // Ignore malformed links.
      }
    }
  }
  return out;
}

function pageSize() {
  const doc = document.documentElement;
  return {
    w: Math.max(doc.scrollWidth, window.innerWidth, 1),
    h: Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0, 1)
  };
}

/* ------------------------------ page state ------------------------------ */

function newPageState(path) {
  return {
    path: path.slice(0, 80),
    start: now(),
    visibleMs: 0,
    visibleSince: document.visibilityState === "visible" ? now() : 0,
    maxScroll: 0,
    marks: {},
    sections: new Map(),
    inView: new Set(),
    grid: new Map(),
    clicks: 0,
    forms: new Map(),
    io: null
  };
}

function pauseClock() {
  const page = state.page;
  if (!page) return;
  if (page.visibleSince) {
    page.visibleMs += now() - page.visibleSince;
    page.visibleSince = 0;
  }
  const t = now();
  page.sections.forEach((s) => {
    if (s.since) {
      s.ms += t - s.since;
      s.since = 0;
    }
  });
}

function resumeClock() {
  const page = state.page;
  if (!page || page.visibleSince) return;
  page.visibleSince = now();
  const t = now();
  page.inView.forEach((key) => {
    const s = page.sections.get(key);
    if (s) s.since = t;
  });
}

function observeSections() {
  const page = state.page;
  if (!page || !("IntersectionObserver" in window)) return;
  const root = document.querySelector("[data-page-root]") || document.body;
  const nodes = Array.from(root.querySelectorAll("main section, section")).slice(0, 40);
  if (!nodes.length) return;

  page.io = new IntersectionObserver(
    (entries) => {
      const t = now();
      entries.forEach((entry) => {
        const key = entry.target.getAttribute("data-ac-sec");
        const s = page.sections.get(key);
        if (!s) return;
        const seen =
          entry.isIntersecting &&
          (entry.intersectionRatio >= 0.4 ||
            entry.intersectionRect.height >= window.innerHeight * 0.4);
        if (seen && !page.inView.has(key)) {
          page.inView.add(key);
          if (page.visibleSince) s.since = t;
        } else if (!seen && page.inView.has(key)) {
          page.inView.delete(key);
          if (s.since) {
            s.ms += t - s.since;
            s.since = 0;
          }
        }
      });
    },
    { threshold: [0, 0.2, 0.4, 0.6, 1] }
  );

  nodes.forEach((node, index) => {
    const key = node.id || "s" + (index + 1);
    node.setAttribute("data-ac-sec", key);
    const heading = node.querySelector("h1,h2,h3");
    page.sections.set(key, {
      i: index + 1,
      id: key,
      l: clean(heading ? heading.textContent : "", 40),
      ms: 0,
      since: 0
    });
    page.io.observe(node);
  });
}

function endPage(reason) {
  const page = state.page;
  if (!page) return;
  pauseClock();

  const t = now();
  page.sections.forEach((s) => {
    if (s.ms >= 1000) push({ t: "sv", s: s.i, id: s.id, l: s.l, ms: Math.min(s.ms, 600000) });
  });

  if (page.grid.size) {
    const cells = Array.from(page.grid.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 120)
      .map(([cell, count]) => {
        const [cx, cy] = cell.split(":");
        return [Number(cx), Number(cy), count];
      });
    push({ t: "mm", g: cells, dev: deviceClass() });
  }

  page.forms.forEach((form, id) => {
    if (form.started && !form.submitted) {
      push({ t: "fa", f: id, fld: form.last, n: form.fields.size });
    }
  });

  push({
    t: "pe",
    ms: Math.min(page.visibleMs, 3600000),
    wall: Math.min(t - page.start, 3600000),
    sd: Math.round(page.maxScroll),
    ck: page.clicks,
    why: reason
  });

  if (page.io) page.io.disconnect();
  state.page = null;
}

/* ------------------------------ listeners ------------------------------ */

function on(target, name, handler, options) {
  target.addEventListener(name, handler, options);
  state.cleanups.push(() => target.removeEventListener(name, handler, options));
}

let lastClicks = [];
let scrollTick = false;
let moveAt = 0;
let errors = 0;

function onScroll() {
  if (scrollTick) return;
  scrollTick = true;
  // A timer instead of requestAnimationFrame: it keeps running in background tabs.
  window.setTimeout(() => {
    scrollTick = false;
    const page = state.page;
    if (!page) return;
    const { h } = pageSize();
    const depth = Math.min(100, ((window.scrollY + window.innerHeight) / h) * 100);
    if (depth > page.maxScroll) page.maxScroll = depth;
    [25, 50, 75, 100].forEach((mark) => {
      const hit = mark === 100 ? depth >= 97 : depth >= mark;
      if (hit && !page.marks[mark]) {
        page.marks[mark] = true;
        push({ t: "sc", d: mark, ms: Math.round(page.visibleMs + (page.visibleSince ? now() - page.visibleSince : 0)) });
      }
    });
  }, 100);
}

function onClick(event) {
  const page = state.page;
  if (!page || page.clicks >= CLICK_CAP) return;
  page.clicks += 1;
  const { w, h } = pageSize();
  const x = Math.round((event.pageX / w) * 1000);
  const y = Math.round(event.pageY);
  const info = describe(event.target);
  push({ t: "ck", x, y, ph: h, dev: deviceClass(), vw: Math.round(window.innerWidth / 50) * 50, ...info });

  // Rage click: three or more clicks close together within 700 ms.
  const t = now();
  lastClicks = lastClicks.filter((c) => t - c.t < 700 && Math.abs(c.x - event.pageX) < 40 && Math.abs(c.y - event.pageY) < 40);
  lastClicks.push({ t, x: event.pageX, y: event.pageY });
  if (lastClicks.length === 3) {
    push({ t: "rg", x, y, ph: h, dev: deviceClass(), el: info.el, ia: info.ia });
  }
}

function onMove(event) {
  const page = state.page;
  if (!page || event.pointerType !== "mouse") return;
  const t = now();
  if (t - moveAt < 120) return;
  moveAt = t;
  const { w } = pageSize();
  const cell = Math.floor((event.pageX / w) * 50) + ":" + Math.floor(event.pageY / 100);
  page.grid.set(cell, (page.grid.get(cell) || 0) + 1);
}

function formInfo(target) {
  const form = target.closest ? target.closest("form") : null;
  if (!form) return null;
  const id = clean(form.id || form.getAttribute("name") || "form", 30);
  return { form, id };
}

function onFocusIn(event) {
  const page = state.page;
  const target = event.target;
  if (!page || !target || !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
  const info = formInfo(target);
  if (!info) return;
  const field = clean(target.name || target.id || target.type || "field", 30);
  let entry = page.forms.get(info.id);
  if (!entry) {
    entry = { started: false, submitted: false, last: "", fields: new Set() };
    page.forms.set(info.id, entry);
  }
  entry.last = field;
  if (!entry.fields.has(field)) {
    entry.fields.add(field);
    if (!entry.started) {
      entry.started = true;
      push({ t: "fm", a: "start", f: info.id, fld: field });
    } else {
      push({ t: "fm", a: "field", f: info.id, fld: field });
    }
  }
}

function onSubmit(event) {
  const page = state.page;
  const info = formInfo(event.target);
  if (!page || !info) return;
  const entry = page.forms.get(info.id) || { started: true, submitted: false, last: "", fields: new Set() };
  entry.submitted = true;
  page.forms.set(info.id, entry);
  push({ t: "fm", a: "submit", f: info.id, n: entry.fields.size });
}

function onError(event) {
  if (errors >= 10) return;
  errors += 1;
  const file = event.filename ? event.filename.split("/").pop().split("?")[0].slice(0, 40) : "";
  push({ t: "er", m: clean(event.message, 120), f: file, ln: event.lineno || 0 });
}

function onRejection(event) {
  if (errors >= 10) return;
  errors += 1;
  const reason = event.reason && (event.reason.message || String(event.reason));
  push({ t: "er", m: clean("promise: " + reason, 120) });
}

function startVitals() {
  import("web-vitals")
    .then((mod) => {
      const report = (metric) => {
        const value = metric.name === "CLS" ? Math.round(metric.value * 1000) / 1000 : Math.round(metric.value);
        push({ t: "wv", n: metric.name, v: value, dev: deviceClass() });
      };
      mod.getCLS(report);
      mod.getFID(report);
      mod.getLCP(report);
      mod.getFCP(report);
      mod.getTTFB(report);
    })
    .catch(() => {});
}

function watchLanguage() {
  let previous = document.documentElement.lang;
  const observer = new MutationObserver(() => {
    const next = document.documentElement.lang;
    if (next !== previous) {
      // The app sets <html lang> itself while booting; only later changes are the visitor's.
      if (now() - state.t0 > 3000) push({ t: "lg", from: previous, to: next });
      if (state.ctx) state.ctx.lang = next;
      previous = next;
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  state.cleanups.push(() => observer.disconnect());
}

/* ------------------------------ lifecycle ------------------------------ */

function start() {
  if (state.on || shouldSkip() || typeof window === "undefined" || !window.crypto) return;
  loadIdentity();
  state.on = true;
  if (dryRun()) window.__acState = state; // inspection hook for local testing only
  state.sent = 0;
  state.t0 = now();
  errors = 0;

  on(window, "scroll", onScroll, { passive: true });
  on(document, "click", onClick, { capture: true, passive: true });
  on(document, "pointermove", onMove, { passive: true });
  on(document, "focusin", onFocusIn, { passive: true });
  on(document, "submit", onSubmit, { capture: true });
  on(window, "error", onError);
  on(window, "unhandledrejection", onRejection);
  on(document, "visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pauseClock();
      flush({ unloading: true });
    } else {
      resumeClock();
    }
  });
  on(window, "pagehide", () => {
    endPage("leave");
    flush({ unloading: true });
  });

  // Back/forward cache: the page returns without reloading, so count it again.
  on(window, "pageshow", (event) => {
    if (event.persisted) trackPage(window.location.pathname);
  });

  watchLanguage();
  startVitals();
  refreshAppCheck();
  state.timer = window.setInterval(() => {
    refreshAppCheck();
    flush();
  }, FLUSH_MS);
  state.cleanups.push(() => window.clearInterval(state.timer));

  trackPage(window.location.pathname);
}

function stop({ wipe }) {
  if (!state.on) return;
  state.on = false;
  state.cleanups.splice(0).forEach((fn) => fn());
  if (state.page && state.page.io) state.page.io.disconnect();
  state.page = null;
  state.queue = [];
  state.appCheck = "";
  if (wipe) {
    wipeIdentifiers();
    if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: "denied" });
    // Google Analytics cookies from an earlier "accept".
    const parts = window.location.hostname.split(".");
    const domains = ["", window.location.hostname, "." + parts.slice(-2).join(".")];
    document.cookie.split(";").forEach((entry) => {
      const name = entry.split("=")[0].trim();
      if (!/^_ga(_|$)/.test(name)) return;
      domains.forEach((domain) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? "; domain=" + domain : ""}`;
      });
    });
  }
}

/* -------------------------------- public -------------------------------- */

export function trackPage(path) {
  if (!state.on) return;
  if (path.startsWith("/admin")) return;
  if (state.page && state.page.path === path.slice(0, 80)) return; // already counted
  endPage("route");
  state.page = newPageState(path);
  lastClicks = [];
  push({ t: "pv", w: window.innerWidth, h: window.innerHeight });
  window.setTimeout(observeSections, 700); // after the new route has painted
  onScroll();
}

// Business events, e.g. trackEvent("contact_sent"). Properties are short labels only.
export function trackEvent(name, props = {}) {
  if (!state.on) return;
  const safe = {};
  Object.keys(props || {})
    .slice(0, 6)
    .forEach((key) => {
      const value = props[key];
      safe[clean(key, 20)] = typeof value === "number" || typeof value === "boolean" ? value : clean(value, 40);
    });
  push({ t: "ev", n: clean(name, 40), ...safe });
}

export function initAnalytics() {
  if (typeof window === "undefined") return () => {};
  if (getConsent() === "granted") start();
  return onConsentChange((status) => {
    if (status === "granted") start();
    else stop({ wipe: true });
  });
}

// Owner's own visits are excluded on this browser.
export function setIgnoreSelf(value) {
  const local = store("local");
  if (!local) return;
  try {
    if (value) local.setItem(IGNORE_KEY, "1");
    else local.removeItem(IGNORE_KEY);
  } catch (error) {
    // Ignore.
  }
}
