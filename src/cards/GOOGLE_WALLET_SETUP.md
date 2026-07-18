# Google Wallet (Android) Pass — Setup Guide
**Card:** Wong Soon Fook (`wong-soon-fook-owner.html`)

## How it differs from Apple Wallet

| | Apple Wallet | Google Wallet |
|---|---|---|
| **Cost** | $99/year Apple Developer | Free |
| **Output** | `.pkpass` file download | JWT link → `pay.google.com/gp/v/save/{jwt}` |
| **Certificates** | Apple cert + WWDR cert | Google service account JSON |
| **Hosting** | Must host `.pkpass` file | JWT embedded directly in HTML — no file hosting needed |
| **Update pass** | Re-generate + re-host | Re-generate JWT, update HTML |

---

## Path 1 — Free SaaS (Easiest, 10 min)

Same services support both Apple and Google Wallet:

1. Go to [walletpasses.io](https://walletpasses.io) or [pass.camp](https://pass.camp)
2. Create your pass — both Apple and Google Wallet links are provided
3. Copy the **Google Wallet** link (looks like `https://pay.google.com/gp/v/save/eyJ...`)
4. Open `wong-soon-fook-owner.html`, find:
   ```js
   const GOOGLE_WALLET_JWT = "";
   ```
5. Extract the JWT part (everything after `/save/`) and paste it:
   ```js
   const GOOGLE_WALLET_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...";
   ```

Done. The **Android Wallet** button now works.

---

## Path 2 — Self-generate (Free, ~20 min)

No annual fee. Just a Google Cloud project and a service account.

### Step 1 — Create a Google Cloud project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Name: `MakersCo Digital Cards` → **Create**

### Step 2 — Enable Google Wallet API
1. In your new project, go to **APIs & Services** → **Library**
2. Search `Google Wallet API` → Click it → **Enable**

### Step 3 — Create a Service Account
1. Go to **IAM & Admin** → **Service Accounts** → **Create Service Account**
2. Name: `wallet-pass-generator`
3. Click **Create and Continue** → skip optional steps → **Done**
4. Click your new service account → **Keys** tab → **Add Key** → **Create new key** → **JSON**
5. Download the JSON file → save it as:
   ```
   certs/google-service-account.json
   ```

### Step 4 — Enrol as a Google Wallet Issuer
1. Go to [pay.google.com/business/console](https://pay.google.com/business/console)
2. Sign in with your Google account
3. **Accept the terms** and enrol
4. Copy your **Issuer ID** (a 19-digit number like `3388000000123456789`)

> If the console asks for business verification, use your personal name/sole proprietor. MakersCo counts.

### Step 5 — Link your Service Account to the Issuer
1. Still in [pay.google.com/business/console](https://pay.google.com/business/console)
2. Go to **API Access** → **Service Accounts**
3. Add the email of your service account (from Step 3, looks like `wallet-pass-generator@your-project.iam.gserviceaccount.com`)
4. Grant **Wallet Object Creator** permission

### Step 6 — Update generate_google_wallet_pass.js
Open `generate_google_wallet_pass.js` in the project root. Set your Issuer ID:

```js
const ISSUER_ID = "3388000000123456789";  // ← your 19-digit Issuer ID
```

That's the only change needed. Your personal info is already filled in.

### Step 7 — Install dependencies and run

```bash
# From the project root (digital-card-platform/)
npm install jsonwebtoken

node generate_google_wallet_pass.js
```

The script prints:
```
✅  Google Wallet JWT generated!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add to Google Wallet URL:
https://pay.google.com/gp/v/save/eyJhbGci...

JWT token only (for embedding in HTML):
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The JWT is also saved to `src/cards/google-wallet-jwt.txt`.

### Step 8 — Paste JWT into your card

Open `wong-soon-fook-owner.html`, find:
```js
const GOOGLE_WALLET_JWT = "";
```
Paste the JWT (the long string starting with `eyJ`):
```js
const GOOGLE_WALLET_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...";
```

Save the file. The **Android Wallet** button now works — no server, no hosting needed beyond the HTML itself.

### Step 9 — Test on Android
1. Open the card HTML on an Android phone (drag to Netlify Drop to get a URL)
2. Tap **Android Wallet**
3. A browser tab opens `pay.google.com/gp/v/save/...`
4. Google shows a preview of the pass → **Save to Google Wallet**
5. Pass appears in Google Wallet immediately

---

## What the pass looks like on Android

```
┌─────────────────────────────────────┐
│ [WSF Logo]              MakersCo    │
│                                     │
│ Wong Soon Fook                      │
│ Digital Business Card               │
│ ─────────────────────────────────   │
│ Title              Company          │
│ Founder &          MakersCo ·       │
│ Digital Builder    Malaysia         │
│                                     │
│         [QR Code: portfolio]        │
└─────────────────────────────────────┘

Back of pass (swipe up):
  📞 +60 19-295 3528
  ✉️ soonfookwong96@gmail.com
  🌐 Digital Card
  💬 WhatsApp Me
  👨‍💻 GitHub
```

---

## Updating the pass later

If your details change:
1. Edit the info in `generate_google_wallet_pass.js`
2. Re-run: `node generate_google_wallet_pass.js`
3. Replace `GOOGLE_WALLET_JWT` in `wong-soon-fook-owner.html`
4. Re-host the HTML

> Passes already saved to users' Wallets won't auto-update unless you use the Google Wallet API's **update** endpoint (requires a server). For a personal card, re-sharing the link is fine.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `Cannot find module 'jsonwebtoken'` | Run `npm install jsonwebtoken` |
| `ENOENT: certs/google-service-account.json` | Download JSON key from Google Cloud → save to `certs/` |
| `Error 400: Invalid issuer` | Check your `ISSUER_ID` matches pay.google.com/business/console exactly |
| `Error 401: Unauthorized` | Service account not linked to Issuer — redo Step 5 |
| Pass saves but shows blank | Your logo URL is not publicly accessible (must be HTTPS) |
| Button does nothing on desktop | Expected — Google Wallet is for Android/Chrome. On desktop it redirects to a preview page |

---

## File reference

```
digital-card-platform/
├── generate_google_wallet_pass.js   ← run this to create the JWT
├── certs/
│   └── google-service-account.json ← downloaded from Google Cloud
└── src/cards/
    ├── wong-soon-fook-owner.html           ← paste GOOGLE_WALLET_JWT here
    ├── google-wallet-jwt.txt        ← JWT output saved here automatically
    ├── APPLE_WALLET_SETUP.md        ← Apple Wallet guide
    └── GOOGLE_WALLET_SETUP.md       ← this file
```
