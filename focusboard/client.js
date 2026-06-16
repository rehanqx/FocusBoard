// ============================================================
//  client.js — Visitor Tracking Script
//  Drop this in every page you want to track.
//  It captures: timestamp, page URL, referrer, user-agent.
//  Writes one document to Firestore "visitors" collection.
// ============================================================

// ── 1. YOUR FIREBASE CONFIG ──────────────────────────────────
//  Replace these values with your own project's config from:
//  Firebase Console → Project Settings → "Your apps" → SDK setup
const FIREBASE_CONFIG = {
 apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"

};

// ── 2. IMPORT Firebase SDKs from CDN (ES Module) ─────────────
//  These imports work inside a <script type="module"> tag.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection,
  addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── 3. INIT ───────────────────────────────────────────────────
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

// ── 4. TRACK VISIT ───────────────────────────────────────────
/**
 * Sends one visitor record to Firestore.
 * Called automatically on page load (see bottom of file).
 */
async function trackVisit() {
  try {
    // Build the visitor data object
    const visitorData = {
      // Server-side timestamp (more reliable than client clock)
      timestamp: serverTimestamp(),

      // Page that was visited
      page: window.location.pathname || "/",

      // Full URL
      url: window.location.href,

      // Where the visitor came from (empty if direct)
      referrer: document.referrer || "direct",

      // Browser / OS string (for basic device breakdown)
      userAgent: navigator.userAgent,

      // Screen resolution (optional, useful for UX insights)
      screen: `${window.screen.width}x${window.screen.height}`,

      // Language setting of the browser
      language: navigator.language || "unknown",
    };

    // Write to the "visitors" collection — Firestore auto-generates the doc ID
    const docRef = await addDoc(collection(db, "visitors"), visitorData);

    // Optional: log to console during development
    console.log("[FocusBoard] Visit tracked:", docRef.id);

  } catch (error) {
    // Fail silently — tracking should never break the user's experience
    console.warn("[FocusBoard] Tracking failed:", error.message);
  }
}

// ── 5. RUN ON PAGE LOAD ───────────────────────────────────────
//  We wait for DOM to be ready, then fire.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", trackVisit);
} else {
  trackVisit(); // DOM already ready
}
