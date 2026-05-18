# Wallet Pass Setup — Start Here
**Card:** Wong Soon Fook (`wong-soonfook.html`)

This is the master guide. Read this first, then follow the detailed guide for your chosen path.

---

## Service reality check

These are the services I originally considered and what they actually are:

| Service | Status | What it actually is |
|---|---|---|
| walletpasses.io | ❌ Wrong recommendation | Android **viewer app** only — cannot create passes |
| pass.camp | ❌ Gone | Domain expired and parked |
| passkit.com | ✅ Works | Real service — 45-day trial, then **$39.50/month** |
| passcreator.com | ✅ Works | Real service — has a free test option |

---

## Pick your path

| Goal | Path | Cost |
|---|---|---|
| Google Wallet only, no monthly fee | **Path A** — run the generator script | **Free forever** |
| Apple Wallet only | **Path B** — Apple Developer + generator script | $99/year |
| Both wallets, no code, just fill a form | **Path C** — Passcreator free test | Free to start |
| Both wallets, test before paying | **Path D** — PassKit 45-day trial | Free for 45 days |

**Recommendation:** Start with Path A (Google Wallet free) today. Add Apple Wallet later via Path B when you need it for clients.

---

## Path A — Google Wallet only (Free, ~20 min)

Everything is already built. You just need a Google Cloud account.

**Full steps:** see `GOOGLE_WALLET_SETUP.md` in this folder.

**Quick version:**
```
1. console.cloud.google.com → New Project
2. Enable Google Wallet API
3. IAM & Admin → Service Accounts → Create → download JSON key
   Save as: certs/google-service-account.json
4. pay.google.com/business/console → enrol as issuer → copy Issuer ID
5. Open generate_google_wallet_pass.js → paste your Issuer ID
6. npm install jsonwebtoken
7. node generate_google_wallet_pass.js
8. Copy the JWT output
9. Open wong-soonfook.html → find:
      const GOOGLE_WALLET_JWT = "";
   Paste JWT between the quotes → save
```

Android Wallet button works. Free forever. No monthly fee.

---

## Path B — Apple Wallet (Apple Developer account required)

**Full steps:** see `APPLE_WALLET_SETUP.md` in this folder.

**Quick version:**
```
1. developer.apple.com → $99/year account
2. Create Pass Type ID → generate certificate → download .cer
3. Export .p12 from Keychain Access
4. Convert to .pem files:
      openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certs/signerCert.pem -legacy
      openssl pkcs12 -in cert.p12 -nocerts -nodes  -out certs/signerKey.pem  -legacy
      curl -o certs/wwdr.cer https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
      openssl x509 -in certs/wwdr.cer -inform DER -out certs/wwdr.pem
5. Add icon images to src/assets/pass-icons/
6. npm install passkit-generator
7. node generate_wallet_pass.js
   → outputs src/cards/wong-soonfook.pkpass
8. Host wong-soonfook.pkpass online (Netlify, GitHub Pages)
9. Open wong-soonfook.html → find:
      const PKPASS_URL = "";
   Paste hosted URL → save
```

---

## Path C — Passcreator (both wallets, no code)

Supports both Apple Wallet and Google Wallet. Has a free test option.

```
1. Go to app.passcreator.com/en/register
2. Sign up with email (no credit card needed for test)
3. Create new pass → choose Generic / Business Card type
4. Fill in your details:
      Name:     Wong Soon Fook
      Title:    Founder & Digital Builder
      Company:  MakersCo
      Phone:    +60192953528
      Email:    soonfookwong96@gmail.com
      Website:  https://lousycoder96.github.io/Makers-Co-Website/
5. Publish → they give you:
      Apple Wallet:  a .pkpass hosted URL
      Google Wallet: a pay.google.com/gp/v/save/... URL
6. Open wong-soonfook.html → set both constants:
      const PKPASS_URL        = "https://...your-apple-url...";
      const GOOGLE_WALLET_JWT = "eyJhbGci...your-google-jwt...";
7. Save → re-host on Netlify → both buttons live
```

---

## Path D — PassKit 45-day free trial (both wallets, most polished)

Best option if you want to test before deciding on a paid plan.

```
1. Go to app.passkit.com/signup
2. Sign up (no credit card required for trial)
3. Create pass → choose Business Card template
4. Customise with your details (same as Path C above)
5. Publish → copy Apple + Google Wallet URLs
6. Paste into wong-soonfook.html (same as Path C step 6–7)
```

After 45 days: $39.50/month if you continue. Good for selling cards to clients.

---

## Activating the buttons in wong-soonfook.html

Both wallet buttons check a constant at the top of the script section.
Find these two lines and fill them in:

```js
// Apple Wallet — paste .pkpass URL (from Path B, C, or D)
const PKPASS_URL = "";

// Google Wallet — paste JWT token (from Path A, C, or D)
const GOOGLE_WALLET_JWT = "";
```

- **Empty string `""`** → button shows info modal (current state)
- **URL/JWT filled in** → button triggers real wallet save

---

## File map

```
digital-card-platform/
├── generate_wallet_pass.js           ← Path B: generates Apple .pkpass
├── generate_google_wallet_pass.js    ← Path A: generates Google Wallet JWT
├── certs/
│   ├── signerCert.pem                ← Path B: Apple cert (you create this)
│   ├── signerKey.pem                 ← Path B: Apple key (you create this)
│   ├── wwdr.pem                      ← Path B: Apple WWDR (free from Apple)
│   └── google-service-account.json  ← Path A: Google service account key
└── src/cards/
    ├── wong-soonfook.html            ← your card (edit PKPASS_URL + GOOGLE_WALLET_JWT)
    ├── wong-soonfook.pkpass          ← Path B output (generated, then host online)
    ├── google-wallet-jwt.txt         ← Path A output (paste into HTML)
    ├── WALLET_SETUP.md               ← this file (start here)
    ├── APPLE_WALLET_SETUP.md         ← Path B full step-by-step
    └── GOOGLE_WALLET_SETUP.md        ← Path A full step-by-step
```
