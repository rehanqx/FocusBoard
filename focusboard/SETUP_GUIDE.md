# FocusBoard — Firebase Visitor Tracking
## Complete Setup Guide

---

## STEP 1 — Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `focusboard` (or anything you like)
4. Disable Google Analytics if you don't need it → **Create project**

---

## STEP 2 — Enable Firestore Database

1. In your Firebase project, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (you'll set rules below)
4. Pick a region close to you → **Enable**

### Set Firestore Security Rules

In Firestore → **Rules** tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Anyone can ADD a visitor record (write only, no read)
    match /visitors/{doc} {
      allow create: true;
      allow read, update, delete: if false; // blocked from client
    }
  }
}
```

Click **Publish**.

> **Why?** This lets `client.js` write visits, but no one can read
> or delete visitor data from the browser. Admin reads happen via
> a server-side query (you'll add Firebase Auth later if needed).

---

## STEP 3 — Get Your Firebase Config

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll to **"Your apps"** → Click **"</>"** (Web)
3. Register app name: `FocusBoard Web`
4. Copy the config object — it looks like this:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "focusboard-xyz.firebaseapp.com",
  projectId:         "focusboard-xyz",
  storageBucket:     "focusboard-xyz.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

5. Paste these values into **both** `client.js` AND `admin.js`
   where it says `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc.

---

## STEP 4 — Add client.js to Your Pages

In every HTML page you want to track, add this **just before
`</body>`**:

```html
<!-- Visitor tracking — ES Module -->
<script type="module" src="client.js"></script>
```

> For the FocusBoard app specifically, add it to `index.html`
> (the main app file). One line, done.

---

## STEP 5 — Set Admin Password

Open `admin.js` and change line:

```javascript
const ADMIN_PASSWORD = "focusboard2025";
```

To a strong password of your choice.

> For production, upgrade to Firebase Authentication:
> https://firebase.google.com/docs/auth/web/password-auth

---

## STEP 6 — Install Firebase CLI

```bash
# Install globally (requires Node.js)
npm install -g firebase-tools

# Verify install
firebase --version
```

---

## STEP 7 — Login to Firebase CLI

```bash
firebase login
```

Your browser will open for Google authentication.

---

## STEP 8 — Initialize Firebase Hosting

Navigate to your project folder:

```bash
cd /path/to/your/focusboard/folder
firebase init hosting
```

Answer the prompts:

```
? Which Firebase project? → select "focusboard" (your project)
? What's your public directory? → . (dot = current folder)
? Configure as single-page app? → No
? Set up automatic builds with GitHub? → No
? File ./index.html already exists. Overwrite? → No
```

This creates two files: `firebase.json` and `.firebaserc`

---

## STEP 9 — Your Project File Structure

```
focusboard/
├── index.html       ← main app (your FocusBoard app)
├── client.js        ← visitor tracking (ES module)
├── admin.html       ← admin panel
├── admin.js         ← admin logic (ES module)
├── firebase.json    ← Firebase Hosting config (auto-generated)
└── .firebaserc      ← project alias (auto-generated)
```

---

## STEP 10 — Configure firebase.json

Open `firebase.json` and make sure it looks like this:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, max-age=0"
          }
        ]
      }
    ]
  }
}
```

---

## STEP 11 — Deploy

```bash
firebase deploy
```

Output will look like:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/focusboard-xyz
Hosting URL:     https://focusboard-xyz.web.app
```

Your live URLs:
- **App:**   `https://focusboard-xyz.web.app`
- **Admin:** `https://focusboard-xyz.web.app/admin.html`

---

## STEP 12 — Verify Tracking is Working

1. Visit your hosted app URL
2. Go to Firebase Console → Firestore → `visitors` collection
3. You should see a new document appear with your visit data

---

## HOW IT ALL WORKS (Summary)

```
User visits site
      ↓
client.js fires
      ↓
Writes to Firestore "visitors" collection
      ↓
Admin opens admin.html → logs in
      ↓
admin.js queries Firestore (up to 2000 docs)
      ↓
Chart.js draws daily/hourly line graph
Table shows all visits with search filter
```

---

## OPTIONAL UPGRADES

### A. Firestore Read Rules for Admin (secure)

For a proper admin setup, add Firebase Auth and update rules:

```
match /visitors/{doc} {
  allow create: true;
  allow read: if request.auth != null && request.auth.token.admin == true;
}
```

### B. Real-time Updates

Replace `getDocs` in `admin.js` with `onSnapshot` for live updates:

```javascript
import { onSnapshot } from "firebase-firestore.js";

onSnapshot(q, snapshot => {
  allVisitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  updateStats(); redrawChart(); renderTable(allVisitors);
});
```

### C. Prevent Bot/Self-Tracking

Add to `client.js` before `trackVisit()`:

```javascript
// Skip tracking for admin
if (window.location.pathname.includes("admin")) return;
// Skip localhost
if (window.location.hostname === "localhost") return;
```

---

## TROUBLESHOOTING

| Problem | Fix |
|---|---|
| `permission-denied` error | Check Firestore security rules — allow `create: true` |
| Chart not showing | Make sure Chart.js CDN loaded, check browser console |
| `client.js` not tracking | Must use `<script type="module">` tag |
| Admin login not working | Check `ADMIN_PASSWORD` constant in `admin.js` |
| Deploy fails | Run `firebase login` again, check project ID |

---

*FocusBoard Analytics — Built with Firebase + Chart.js + Vanilla JS*
