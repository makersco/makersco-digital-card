# Apple Wallet Pass — Setup Guide
**Card:** Wong Soon Fook (`wong-soon-fook-owner.html`)

There are 3 paths. Pick one. Path 1 is the fastest (10 min, free).

---

## Path 1 — Free SaaS (Recommended to start)
No code. No Apple Developer account needed.

1. Go to [pass.camp](https://pass.camp) or [walletpasses.io](https://walletpasses.io)
2. Sign up for a free account
3. Create a new **Contact / Business Card** pass type
4. Fill in your details:
   - Name: `Wong Soon Fook`
   - Title: `Founder & Digital Builder`
   - Company: `MakersCo`
   - Phone: `+60192953528`
   - Email: `soonfookwong96@gmail.com`
   - Website: `https://makers-co.org/wong-soon-fook`
5. Download or copy the hosted `.pkpass` URL they provide
6. Open `wong-soon-fook-owner.html` in a text editor
7. Find this line near the bottom of the `<script>` section:
   ```js
   const PKPASS_URL = "";
   ```
8. Paste your URL:
   ```js
   const PKPASS_URL = "https://yourpass.walletpasses.io/xxxx.pkpass";
   ```
9. Save the file. Done — the button now downloads a real Wallet pass.

---

## Path 2 — Self-generate (Apple Developer Account required)

### What you need
- Apple Developer account → [developer.apple.com](https://developer.apple.com) ($99/year)
- Node.js installed (`node -v` to check)
- The file `generate_wallet_pass.js` (already in the project root)

### Step 1 — Create a Pass Type ID
1. Log in to [developer.apple.com](https://developer.apple.com)
2. Go to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → `+` → **Pass Type IDs**
4. Description: `MakersCo Soon Fook Card`
5. Identifier: `pass.co.makersco.soonfook`
6. Click **Register**

### Step 2 — Generate & download the certificate
1. On the Pass Type ID page, click **Create Certificate**
2. Follow Apple's instructions to create a `.certSigningRequest` using **Keychain Access** on your Mac:
   - Open **Keychain Access** → Menu bar → **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
   - Email: your Apple ID email
   - Select **Saved to disk** → Save as `CertificateSigningRequest.certSigningRequest`
3. Upload the `.certSigningRequest` to Apple → Download the resulting `.cer` file
4. Double-click the `.cer` file → it installs into Keychain Access

### Step 3 — Export certificate as .p12
1. Open **Keychain Access** → **My Certificates**
2. Find `Pass Type ID: pass.co.makersco.soonfook`
3. Right-click → **Export** → save as `cert.p12`
4. Set a passphrase or leave blank (remember your choice)

### Step 4 — Convert certificates to .pem
Open Terminal, `cd` to the project root, then run:

```bash
# Create certs folder
mkdir -p certs

# Convert .p12 → signerCert.pem and signerKey.pem
openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certs/signerCert.pem -legacy
openssl pkcs12 -in cert.p12 -nocerts -nodes  -out certs/signerKey.pem  -legacy

# Download Apple's WWDR certificate (free)
curl -o certs/wwdr.cer https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer

# Convert WWDR from DER to PEM
openssl x509 -in certs/wwdr.cer -inform DER -out certs/wwdr.pem
```

> If `openssl pkcs12` fails without `-legacy`, try removing that flag (depends on your OpenSSL version).

### Step 5 — Add pass icon images
Create the folder `src/assets/pass-icons/` and add these PNG files:

| File | Size | Notes |
|---|---|---|
| `icon.png` | 29 × 29 px | Required |
| `icon@2x.png` | 58 × 58 px | Required |
| `logo.png` | 160 × 50 px | Optional (shown top-left of pass) |
| `logo@2x.png` | 320 × 100 px | Optional |

> Quick option: use any square PNG for `icon.png` and resize. The monogram **WSF** on a dark gold background works well.

### Step 6 — Update generate_wallet_pass.js
Open `generate_wallet_pass.js` and set your Team ID:

```js
const PASS_TYPE_ID = "pass.co.makersco.soonfook";  // ← already set
const TEAM_ID      = "XXXXXXXXXX";                  // ← replace with your 10-char Apple Team ID
```

> Find your Team ID: [developer.apple.com/account](https://developer.apple.com/account) → top right under your name.

If you set a passphrase in Step 3, set it here too:
```js
signerKeyPassphrase: "your_passphrase_here",
```

### Step 7 — Install and run
```bash
# From the project root
npm install passkit-generator

node generate_wallet_pass.js
# → Output: src/cards/wong-soon-fook.pkpass
```

### Step 8 — Wire up the card button
Open `wong-soon-fook-owner.html`, find:
```js
const PKPASS_URL = "";
```
Change to:
```js
const PKPASS_URL = "./wong-soon-fook.pkpass";
```

### Step 9 — Host both files together
Upload **both** `wong-soon-fook-owner.html` and `wong-soon-fook.pkpass` to the same folder on:
- **Netlify Drop** → drag the whole `src/cards/` folder to [drop.netlify.com](https://drop.netlify.com)
- **GitHub Pages** → push to your repo, enable Pages
- Any web host

> The `.pkpass` file **must be served over HTTPS** — iOS will not open it from `file://` or plain HTTP.

---

## Path 3 — Dynamic API (for selling to clients)

When you want to generate passes for each customer automatically, you'll need a small backend.

**Tech stack:**
- Node.js + Express
- `passkit-generator` npm package
- Same certs from Path 2

**Basic endpoint:**
```js
app.get('/pass/:id', async (req, res) => {
  const customer = await db.getCustomer(req.params.id);
  const pass = await generatePass(customer);  // your generate_wallet_pass.js logic
  res.set('Content-Type', 'application/vnd.apple.pkpass');
  res.send(await pass.getAsBuffer());
});
```

Deploy free on: [Render](https://render.com) · [Railway](https://railway.app) · [Fly.io](https://fly.io)

This is planned for a future phase of MakersCo.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `ENOENT: certs/wwdr.pem` | Run the `curl` + `openssl` commands in Step 4 |
| `ENOENT: icon.png` | Add PNG files to `src/assets/pass-icons/` |
| `Invalid signature` | Certificate mismatch — re-export from Keychain and redo Step 4 |
| iOS says "Cannot Open Item" | File not served over HTTPS, or wrong MIME type |
| OpenSSL `-legacy` error | Remove the `-legacy` flag and retry |
| Pass opens but shows blank | Check `TEAM_ID` and `PASS_TYPE_ID` match your Apple Developer account |

---

## Quick reference

```
digital-card-platform/
├── generate_wallet_pass.js   ← run this to create the .pkpass
├── certs/
│   ├── signerCert.pem        ← from your Apple cert
│   ├── signerKey.pem         ← from your Apple cert
│   └── wwdr.pem              ← downloaded from Apple (free)
├── src/
│   ├── assets/pass-icons/
│   │   ├── icon.png          ← 29×29
│   │   ├── icon@2x.png       ← 58×58
│   │   ├── logo.png          ← 160×50
│   │   └── logo@2x.png       ← 320×100
│   └── cards/
│       ├── wong-soon-fook-owner.html        ← your card
│       ├── wong-soon-fook.pkpass      ← generated output
│       └── APPLE_WALLET_SETUP.md    ← this file
```
