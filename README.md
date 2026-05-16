<div align="center">

<img src="https://img.shields.io/badge/FocusBoard-Anti--Distraction_Productivity-f5a623?style=for-the-badge&logo=lightning&logoColor=white" alt="FocusBoard" />

<br/><br/>

<img src="https://img.shields.io/badge/PWA-Ready-4caf50?style=flat-square&logo=pwa&logoColor=white" />
<img src="https://img.shields.io/badge/Offline-Capable-4fa3e8?style=flat-square&logo=serviceworker&logoColor=white" />
<img src="https://img.shields.io/badge/No_Framework-Vanilla_JS-f5a623?style=flat-square&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/License-MIT-b06ee0?style=flat-square" />
<img src="https://img.shields.io/badge/Mobile-Friendly-ff5c5c?style=flat-square&logo=android&logoColor=white" />

<br/><br/>

```
███████╗ ██████╗  ██████╗██╗   ██╗███████╗    ██████╗  ██████╗  █████╗ ██████╗ ██████╗ 
██╔════╝██╔═══██╗██╔════╝██║   ██║██╔════╝    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
█████╗  ██║   ██║██║     ██║   ██║███████╗    ██████╔╝██║   ██║███████║██████╔╝██║  ██║
██╔══╝  ██║   ██║██║     ██║   ██║╚════██║    ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
██║     ╚██████╔╝╚██████╗╚██████╔╝███████║    ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
╚═╝      ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
```

### ⚡ A beautiful, distraction-free productivity system — right in your browser.
### Kanban · Pomodoro Timer · Focus Mode · Streak Tracker · PWA Install

<br/>

[🚀 Live Demo](#https://focus-board-dusky.vercel.app/) · [📦 Download](#installation) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

<br/>

---

</div>

## 📸 Screenshots

<div align="center">

![Landing](landing.png)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 **Kanban Board** | Drag & drop tasks across Todo → In Progress → Review → Done |
| ⏱️ **Pomodoro Timer** | 25-min focus sessions with 5-min breaks and a progress ring |
| 🎯 **Focus Mode** | Full-screen, zero-distraction session view with motivational quotes |
| ✅ **Quick Done** | One-click task completion with confetti celebration |
| 🔥 **Streak Tracker** | Daily completion streaks to build consistent habits |
| 📊 **Weekly Stats** | Bar chart of tasks completed per day this week |
| 📝 **Task Notes** | Add rich notes, links, and ideas to each task |
| 📲 **PWA Install** | Install as a native app on Android, iOS, and Desktop |
| 💾 **Auto-Save** | All data persists in `localStorage` — no account needed |
| 📴 **Offline Ready** | Service Worker caches the app for offline use |

---

## 🚀 Getting Started

### Prerequisites

No build tools, no npm, no framework — just a browser.

```
A modern browser (Chrome, Firefox, Safari, Edge)
```

### Installation

**Option 1 — Direct Download**

1. Download [`focusboard.html`](./focusboard.html)
2. Open it in any browser
3. Done ✅

**Option 2 — Clone the Repo**

```bash
git clone https://github.com/rehan-qx/FocusBoard.git
cd FocusBoard
```

Then simply open `index.html` in your browser — or serve it locally:

```bash
# Python (built-in)
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
# Use the "Live Server" extension
```

Then visit → `http://localhost:8080`

---

## 📲 PWA Installation

FocusBoard is a fully installable Progressive Web App.

### Android / Chrome / Edge

1. Open the app in Chrome or Edge
2. The **install banner** appears automatically at the bottom
3. Tap **"Install"** → confirm the prompt
4. The app icon appears on your home screen ⚡

### iPhone / Safari

1. Open the app in Safari
2. A hint banner guides you automatically
3. Tap the **Share** button `⎙` at the bottom
4. Tap **"Add to Home Screen"**
5. Tap **Add** — done!

### Desktop (Chrome / Edge)

1. Open the app in Chrome or Edge
2. Click the **install icon** `⊕` in the address bar
3. Click **Install**

> **Note:** For full PWA installability (especially the browser install prompt), the app must be served over **HTTPS** or `localhost`. A plain `file://` path will not trigger the install banner.

---

## 🗂️ Project Structure

```
focusboard/
├── index.html     ← Entire app (single self-contained file)
├── README.md           ← You are here
└── screenshots/        ← Add your screenshots here (optional)
    ├── landing.png
```

> The entire app lives in **one HTML file** — no dependencies to install, no build step, no server required.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 |
| **Styling** | CSS3 (Custom Properties, Grid, Flexbox, Animations) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Fonts** | Google Fonts — Playfair Display + DM Sans |
| **Icons** | Font Awesome 6 |
| **Storage** | Browser `localStorage` |
| **PWA** | Web App Manifest + Service Worker (inline blob) |
| **Offline** | Cache API via Service Worker |

---

## ⚙️ Customization

All key values are defined as CSS variables at the top of the file — easy to theme:

```css
:root {
    --amber:      #f5a623;   /* Primary accent color */
    --amber-deep: #c97d10;   /* Hover / gradient end */
    --bg:         #0f0c00;   /* Main background */
    --text:       #fff8e8;   /* Primary text */
    --green:      #4caf50;   /* Done / success */
    --blue:       #4fa3e8;   /* In Progress */
    --purple:     #b06ee0;   /* Review */
    --red:        #ff5c5c;   /* High priority */
}
```

**Want to change the Pomodoro duration?** Find these lines in the `<script>` section:

```js
let pomoDuration  = 25 * 60;  // Focus session (seconds)
let breakDuration =  5 * 60;  // Break session (seconds)
```

---

## 🌐 Deployment

Since it's a single HTML file, you can host it anywhere for free:

### Netlify Drop (Easiest)
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag & drop `focusboard.html` onto the page
3. Your app is live with HTTPS instantly ⚡

### GitHub Pages
```bash
# Push to GitHub, then enable Pages in repo Settings
# Settings → Pages → Source: main branch → / (root)
```

### Vercel
```bash
npx vercel --prod
```

### Any Static Host
Upload `focusboard.html` to any host that serves static files over HTTPS.

---

## 🔒 Privacy

- **No server.** All data stays in your browser.
- **No account required.** Sign up for nothing.
- **No analytics.** Zero tracking, zero telemetry.
- **No ads.** Ever.

Your tasks never leave your device.

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🐛 Known Limitations

- **PWA install prompt requires HTTPS** — won't trigger on `file://` paths
- **Drag & drop** on touch screens is limited (mobile tap interaction works fine)
- **No sync** across devices — data is local to each browser
- **iOS PWA** does not support the native install prompt; manual Share → Add to Home Screen is required

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

```
MIT License — feel free to use, modify, and distribute.
Just give credit where it's due 🙏
```

---

<div align="center">

Made with ❤️ and ☕ — stay focused, ship great things.

<br/>

⭐ **Star this repo** if FocusBoard helped you stay productive!

<br/>

<img src="https://img.shields.io/github/stars/rehan-qx/focusboard?style=social" alt="GitHub Stars" />
&nbsp;
<img src="https://img.shields.io/github/forks/rehan-qx/focusboard?style=social" alt="GitHub Forks" />

</div>
