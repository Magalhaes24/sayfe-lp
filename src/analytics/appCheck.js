// Firebase App Check token for the analytics tracker.
//
// The tracker talks to Firestore over plain REST, so it has to attach the App
// Check token itself. This file uses a small separate Firebase app (no Auth,
// no Firestore) and is only imported after the visitor has accepted analytics.
// Without REACT_APP_RECAPTCHA_SITE_KEY nothing happens and no Google script loads.

import { initializeApp } from "firebase/app";
import { initializeAppCheck, getToken, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

let appCheck = null;

function init() {
  if (appCheck || !SITE_KEY) return appCheck;
  if (window.location.hostname === "localhost") {
    // Prints a debug token in the console; register it under App Check > Apps > Manage debug tokens.
    window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  const app = initializeApp(
    {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    },
    "analytics-appcheck"
  );
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
  return appCheck;
}

// Resolves to a token string, or "" when App Check is off or unavailable.
export async function fetchAppCheckToken() {
  try {
    const instance = init();
    if (!instance) return "";
    const result = await getToken(instance, false);
    return result.token || "";
  } catch (error) {
    return "";
  }
}
