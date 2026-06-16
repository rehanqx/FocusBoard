// ============================================================
//  admin.js — Secure Admin Panel (Firebase Auth version)
//  FIX: Session-only persistence — browser band = logout
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword,
  signOut, onAuthStateChanged,
  setPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection,
  getDocs, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── CONFIG ───────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// ── INIT ─────────────────────────────────────────────────────
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

// ── STATE ─────────────────────────────────────────────────────
let allVisitors = [], chartInstance = null;

// ══════════════════════════════════════════════════════════════
//  AUTH — KEY FIX: SESSION-ONLY PERSISTENCE
//  Tab band = auto logout. No more auto login on refresh.
// ══════════════════════════════════════════════════════════════

// Set session-only persistence IMMEDIATELY on load
// This clears any existing "remember me" tokens from Firebase
setPersistence(auth, browserSessionPersistence).catch(console.error);

// Now watch auth state — but only trust it within this tab session
onAuthStateChanged(auth, user => {
  if (user) {
    const el = document.getElementById("admin-email");
    if (el) el.textContent = user.email;
    showDashboard();
    loadData();
  } else {
    showLogin();
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
window.doLogin = async function () {
  const email = document.getElementById("email-input").value.trim();
  const pass = document.getElementById("pwd-input").value.trim();
  const errEl = document.getElementById("login-error");
  const btn = document.getElementById("login-btn");

  if (!email || !pass) {
    errEl.textContent = "Please enter email and password.";
    return;
  }

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';
  btn.disabled = true;
  errEl.textContent = "";

  try {
    // Ensure session-only BEFORE signing in (belt + suspenders)
    await setPersistence(auth, browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged fires automatically → showDashboard()
  } catch (err) {
    const msgs = {
      "auth/invalid-credential": "❌ Wrong email or password.",
      "auth/user-not-found": "❌ No account found with this email.",
      "auth/wrong-password": "❌ Incorrect password.",
      "auth/too-many-requests": "⚠️ Too many attempts. Please wait a few minutes.",
      "auth/network-request-failed": "⚠️ Network error. Check your connection.",
      "auth/invalid-email": "❌ Invalid email format.",
    };
    errEl.textContent = msgs[err.code] || `❌ ${err.message}`;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    btn.disabled = false;
  }
};

// ── LOGOUT ────────────────────────────────────────────────────
window.doLogout = async function () {
  try {
    await signOut(auth);
    showToast("✅ Logged out successfully");
  } catch (err) {
    showToast("❌ Logout failed: " + err.message);
  }
};

// ── SHOW/HIDE ─────────────────────────────────────────────────
function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
  // Clear inputs on every show
  const e = document.getElementById("email-input");
  const p = document.getElementById("pwd-input");
  if (e) e.value = "";
  if (p) p.value = "";
  const err = document.getElementById("login-error");
  if (err) err.textContent = "";
  const btn = document.getElementById("login-btn");
  if (btn) { btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login'; btn.disabled = false; }
}

function showDashboard() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}

// ── KEYBOARD SUPPORT ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  ["email-input", "pwd-input"].forEach(id =>
    document.getElementById(id)?.addEventListener("keydown", e => {
      if (e.key === "Enter") window.doLogin();
    })
  );
});

// ══════════════════════════════════════════════════════════════
//  FIRESTORE DATA
// ══════════════════════════════════════════════════════════════

window.loadData = async function () {
  showTableLoader();
  try {
    const snap = await getDocs(
      query(collection(db, "visitors"), orderBy("timestamp", "desc"), limit(2000))
    );
    allVisitors = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        timestamp: d.timestamp?.toDate() ?? new Date(0),
        page: d.page || "/",
        url: d.url || "",
        referrer: d.referrer || "direct",
        userAgent: d.userAgent || "",
        screen: d.screen || "",
        language: d.language || "",
      };
    });
    populatePageFilter();
    updateStats();
    redrawChart();
    renderTable(allVisitors);
    showToast(`✅ Loaded ${allVisitors.length} visits`);
  } catch (err) {
    document.getElementById("table-container").innerHTML =
      `<div class="loader" style="color:#ff8080">
        <i class="fas fa-triangle-exclamation" style="font-size:1.5rem"></i>
        ${err.code === "permission-denied"
        ? "Permission denied — are you logged in?"
        : err.message}
      </div>`;
    showToast("❌ " + err.message);
  }
};

// ══════════════════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════════════════

function populatePageFilter() {
  const sel = document.getElementById("page-filter");
  sel.innerHTML = `<option value="all">All Pages</option>`;
  [...new Set(allVisitors.map(v => v.page))].sort().forEach(p => {
    sel.innerHTML += `<option value="${escHtml(p)}">${escHtml(p)}</option>`;
  });
}

function updateStats() {
  const now = new Date();
  const todayStr = now.toDateString();
  const weekAgo = new Date(now - 7 * 86400000);
  setText("stat-total", allVisitors.length.toLocaleString());
  setText("stat-today", allVisitors.filter(v => v.timestamp.toDateString() === todayStr).length.toLocaleString());
  setText("stat-week", allVisitors.filter(v => v.timestamp >= weekAgo).length.toLocaleString());
  setText("stat-pages", new Set(allVisitors.map(v => v.page)).size.toLocaleString());
}

// ══════════════════════════════════════════════════════════════
//  CHART
// ══════════════════════════════════════════════════════════════

window.redrawChart = function () {
  const mode = document.getElementById("chart-mode").value;
  const filter = document.getElementById("page-filter").value;
  const data = filter === "all" ? allVisitors : allVisitors.filter(v => v.page === filter);
  mode === "daily" ? drawDailyChart(data) : drawHourlyChart(data);
};

function drawDailyChart(data) {
  const labels = [], counts = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    counts.push(data.filter(v => v.timestamp.toDateString() === d.toDateString()).length);
  }
  renderLineChart(labels, counts, "Visits per Day");
}

function drawHourlyChart(data) {
  const labels = [], counts = [], now = new Date();
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now); h.setHours(now.getHours() - i, 0, 0, 0);
    labels.push(h.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    counts.push(data.filter(v =>
      v.timestamp >= h && v.timestamp < new Date(h.getTime() + 3600000)
    ).length);
  }
  renderLineChart(labels, counts, "Visits per Hour");
}

function renderLineChart(labels, data, label) {
  const ctx = document.getElementById("visitorChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  const g = ctx.createLinearGradient(0, 0, 0, 280);
  g.addColorStop(0, "rgba(245,166,35,0.25)");
  g.addColorStop(1, "rgba(245,166,35,0)");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label, data, fill: true, backgroundColor: g,
        borderColor: "#f5a623", borderWidth: 2.5,
        pointBackgroundColor: "#f5a623", pointBorderColor: "#0f0c00",
        pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: { color: "#fff8e8", font: { size: 12, family: "DM Sans" }, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: "#181200", borderColor: "rgba(255,200,80,0.25)", borderWidth: 1,
          titleColor: "#f5a623", bodyColor: "rgba(255,248,232,0.7)", padding: 12,
          callbacks: { label: c => ` ${c.parsed.y} visit${c.parsed.y !== 1 ? "s" : ""}` }
        }
      },
      scales: {
        x: { grid: { color: "rgba(255,200,80,0.06)" }, ticks: { color: "rgba(255,248,232,0.35)", font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: "rgba(255,200,80,0.06)" }, ticks: { color: "rgba(255,248,232,0.35)", font: { size: 11 }, stepSize: 1, precision: 0 } }
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  TABLE
// ══════════════════════════════════════════════════════════════

function renderTable(rows) {
  const c = document.getElementById("table-container");
  if (!rows.length) {
    c.innerHTML = `<div class="loader">No visits found.</div>`;
    return;
  }
  const display = rows.slice(0, 200);
  let html = `<div style="overflow-x:auto"><table>
    <thead><tr>
      <th>#</th><th>Timestamp</th><th>Page</th>
      <th>Referrer</th><th>Screen</th><th>Language</th>
    </tr></thead><tbody>`;
  display.forEach((v, i) => {
    const ts = v.timestamp.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    const ref = v.referrer === "direct"
      ? `<span style="color:var(--tx3)">direct</span>`
      : `<a href="${escHtml(v.referrer)}" target="_blank" rel="noopener"
           style="color:var(--blue);text-decoration:none">${escHtml(shortUrl(v.referrer))}</a>`;
    html += `<tr>
      <td style="color:var(--tx3)">${i + 1}</td>
      <td style="white-space:nowrap">${ts}</td>
      <td class="page">${escHtml(v.page)}</td>
      <td>${ref}</td>
      <td style="color:var(--tx3)">${escHtml(v.screen)}</td>
      <td style="color:var(--tx3)">${escHtml(v.language)}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  c.innerHTML = html;
  document.getElementById("table-footer").textContent =
    `${rows.length} record${rows.length !== 1 ? "s" : ""}${rows.length > 200 ? " (showing first 200)" : ""}`;
}

window.filterTable = function () {
  const q = document.getElementById("search-input").value.toLowerCase();
  renderTable(
    q ? allVisitors.filter(v =>
      v.page.toLowerCase().includes(q) || v.referrer.toLowerCase().includes(q)
    ) : allVisitors
  );
};

window.exportCSV = function () {
  if (!allVisitors.length) { showToast("No data to export"); return; }
  const rows = allVisitors.map(v => [
    v.timestamp.toISOString(), v.page, v.url, v.referrer,
    v.screen, v.language, `"${v.userAgent.replace(/"/g, "'")}"`
  ]);
  const csv = [
    ["Timestamp", "Page", "URL", "Referrer", "Screen", "Language", "UserAgent"],
    ...rows
  ].map(r => r.join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `visitors-${new Date().toISOString().slice(0, 10)}.csv`
  });
  a.click(); URL.revokeObjectURL(a.href);
  showToast("📥 CSV downloaded!");
};

// ══════════════════════════════════════════════════════════════
//  WEEKLY CHART (sidebar)
// ══════════════════════════════════════════════════════════════

window.toggleStats = function () {
  document.getElementById("statsPanel").classList.toggle("open");
  renderWeekBars();
};

function renderWeekBars() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const counts = days.map(day => {
    return allVisitors.filter(v => {
      const d = v.timestamp.getDay(); // 0=Sun,1=Mon...
      const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      // Count visits from this current week
      const visitDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][v.timestamp.getDay()];
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0);
      return visitDay === day && v.timestamp >= weekStart;
    }).length;
  });
  const max = Math.max(...counts, 1);
  document.getElementById("weekBars").innerHTML = days.map((d, i) => `
    <div class="wbw">
      <div class="wnum">${counts[i]}</div>
      <div class="wbbg"><div class="wbf" style="height:${Math.round(counts[i] / max * 100)}%"></div></div>
      <div class="wday">${d}</div>
    </div>`).join("");
}

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

function showTableLoader() {
  document.getElementById("table-container").innerHTML =
    `<div class="loader"><div class="spinner"></div>Fetching from Firestore…</div>`;
}
function setText(id, val) {
  const el = document.getElementById(id); if (el) el.textContent = val;
}
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function shortUrl(u) {
  try { return new URL(u).hostname; } catch { return u.slice(0, 30); }
}
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}