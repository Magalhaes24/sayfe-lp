// Consent state for first-party analytics.
//
// Rules this file enforces:
//  - Nothing is stored or sent until the visitor opts in.
//  - "Reject" and "Accept" carry the same weight; a decision is remembered 12 months.
//  - A Global Privacy Control / Do Not Track signal counts as "reject" and the
//    banner stays away. The visitor can still opt in from the footer.
//  - Withdrawing consent deletes every identifier the tracker created.

const KEY = "ac_consent";
const VERSION = 1; // bump when the policy changes, so everyone is asked again
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const EVENT = "ac:consent";

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== VERSION) return null;
    if (Date.now() - data.ts > MAX_AGE_MS) return null;
    return data;
  } catch (error) {
    return null;
  }
}

export function browserSaysNo() {
  if (typeof navigator === "undefined") return false;
  return (
    navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1"
  );
}

// "granted" | "denied" | "unset"
export function getConsent() {
  const saved = read();
  if (saved) return saved.a ? "granted" : "denied";
  return browserSaysNo() ? "denied" : "unset";
}

export function needsDecision() {
  return !read() && !browserSaysNo();
}

export function setConsent(granted) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: VERSION, a: !!granted, ts: Date.now() }));
  } catch (error) {
    // Storage blocked: the choice only lasts for this page view.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: granted ? "granted" : "denied" }));
}

export function onConsentChange(handler) {
  const wrapped = (event) => handler(event.detail);
  window.addEventListener(EVENT, wrapped);
  return () => window.removeEventListener(EVENT, wrapped);
}

// Lets the footer reopen the banner.
export function reopenConsent() {
  window.dispatchEvent(new CustomEvent("ac:consent-open"));
}

export function onConsentReopen(handler) {
  window.addEventListener("ac:consent-open", handler);
  return () => window.removeEventListener("ac:consent-open", handler);
}
