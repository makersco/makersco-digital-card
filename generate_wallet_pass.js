/**
 * generate_wallet_pass.js
 * Generates a signed Apple Wallet Pass (.pkpass) for Wong Soon Fook.
 *
 * SETUP (one-time):
 *   1. Apple Developer account ($99/yr) → developer.apple.com
 *   2. Certificates, Identifiers & Profiles → New Pass Type ID
 *      e.g.  pass.co.makersco.soonfook
 *   3. Generate certificate, download as .cer, double-click → Keychain Access
 *   4. Export as .p12 from Keychain → convert to .pem:
 *        openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certs/signerCert.pem -legacy
 *        openssl pkcs12 -in cert.p12 -nocerts -nodes  -out certs/signerKey.pem  -legacy
 *   5. Download Apple WWDR certificate (free):
 *        curl -o certs/wwdr.pem https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
 *        # If that's a .cer, convert:
 *        openssl x509 -in certs/wwdr.pem -inform DER -out certs/wwdr.pem
 *
 * INSTALL:
 *   npm install passkit-generator
 *
 * RUN:
 *   node generate_wallet_pass.js
 *   # Outputs: src/cards/wong-soon-fook.pkpass
 */

const { PKPass } = require("passkit-generator");
const fs   = require("fs");
const path = require("path");
const LINKS = require("./src/config/links.json");

// ── Paths ────────────────────────────────────────────────────────────────────
const CERTS_DIR  = path.join(__dirname, "certs");
const OUT_FILE   = path.join(__dirname, "src", "cards", "wong-soon-fook.pkpass");
const ICONS_DIR  = path.join(__dirname, "src", "assets", "pass-icons");

// ── Your Apple Developer Pass Type ID ────────────────────────────────────────
const PASS_TYPE_ID = "pass.co.makersco.soonfook";   // ← change to your Pass Type ID
const TEAM_ID      = "XXXXXXXXXX";                   // ← your Apple Team ID (10 chars)

async function generate() {
  const pass = await PKPass.from(
    {
      model: {
        // ── Required images (PNG format) ────────────────────────────────────
        // Minimum: icon.png (29×29) + icon@2x.png (58×58)
        // Optional: logo.png (160×50) + logo@2x.png (320×100)
        // Optional: thumbnail.png (90×90) + thumbnail@2x.png (180×180)
        "icon.png":     fs.readFileSync(path.join(ICONS_DIR, "icon.png")),
        "icon@2x.png":  fs.readFileSync(path.join(ICONS_DIR, "icon@2x.png")),
        "logo.png":     fs.readFileSync(path.join(ICONS_DIR, "logo.png")),
        "logo@2x.png":  fs.readFileSync(path.join(ICONS_DIR, "logo@2x.png")),
      },
      certificates: {
        wwdr:       fs.readFileSync(path.join(CERTS_DIR, "wwdr.pem")),
        signerCert: fs.readFileSync(path.join(CERTS_DIR, "signerCert.pem")),
        signerKey:  fs.readFileSync(path.join(CERTS_DIR, "signerKey.pem")),
        signerKeyPassphrase: "",  // ← passphrase if you set one during .p12 export
      },
    },
    {
      // ── Pass metadata ────────────────────────────────────────────────────
      passTypeIdentifier: PASS_TYPE_ID,
      teamIdentifier:     TEAM_ID,
      serialNumber:       "wsf-card-001",
      description:        "Wong Soon Fook — Digital Business Card",
      organizationName:   "MakersCo",
      formatVersion:      1,

      // ── Visual style: contact card (generic) ─────────────────────────────
      // Use "generic" for a business card style pass
      // backgroundColor:  "rgb(10,6,3)",    // dark background
      // foregroundColor:  "rgb(240,230,211)", // cream text
      // labelColor:       "rgb(201,169,110)", // gold labels
      backgroundColor:   "rgb(26,16,8)",
      foregroundColor:   "rgb(240,230,211)",
      labelColor:        "rgb(201,169,110)",
      logoText:          "MakersCo",

      // ── Fields layout ───────────────────────────────────────────────────
      generic: {
        // Primary: shown large on the front
        primaryFields: [
          {
            key:   "name",
            label: "Name",
            value: LINKS.person.name,
          }
        ],
        // Secondary: shown below primary
        secondaryFields: [
          {
            key:   "title",
            label: "Title",
            value: LINKS.person.title,
          },
          {
            key:   "company",
            label: "Company",
            value: LINKS.person.company,
          }
        ],
        // Auxiliary: smaller row
        auxiliaryFields: [
          {
            key:        "phone",
            label:      "Phone",
            value:      LINKS.person.phoneDisplay,
            dataDetectorTypes: ["PKDataDetectorTypePhoneNumber"],
          },
          {
            key:        "email",
            label:      "Email",
            value:      LINKS.person.email,
            dataDetectorTypes: ["PKDataDetectorTypeLink"],
          }
        ],
        // Back of the pass (swipe up)
        backFields: [
          {
            key:   "website",
            label: "Digital Card",
            value: LINKS.card.public,
            dataDetectorTypes: ["PKDataDetectorTypeLink"],
          },
          {
            key:   "whatsapp",
            label: "WhatsApp",
            value: `https://wa.me/${LINKS.person.whatsappNumber}`,
            dataDetectorTypes: ["PKDataDetectorTypeLink"],
          },
          {
            key:   "location",
            label: "Location",
            value: "Malaysia",
          }
        ]
      },

      // ── Barcodes ─────────────────────────────────────────────────────────
      barcodes: [
        {
          message:         LINKS.card.public,
          format:          "PKBarcodeFormatQR",
          messageEncoding: "iso-8859-1",
          altText:         "Scan to view digital card",
        }
      ],

      // ── NFC (iPhone 7+ with NFC entitlement) ─────────────────────────────
      // Uncomment if you have NFC entitlement on your developer account
      // nfc: {
      //   message: LINKS.card.public,
      // }
    }
  );

  // Write to disk
  const buf = await pass.getAsBuffer();
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, buf);
  console.log("✅  Pass generated:", OUT_FILE);
  console.log("    Size:", Math.round(buf.length / 1024) + " KB");
  console.log("\nNext step: host wong-soon-fook.pkpass alongside your HTML card.");
  console.log("Then update the Wallet button href to point to the .pkpass file.");
}

generate().catch(err => {
  console.error("❌  Generation failed:", err.message);
  if (err.message.includes("ENOENT")) {
    console.error("\nMissing file. Check your certs/ folder has:");
    console.error("  certs/wwdr.pem");
    console.error("  certs/signerCert.pem");
    console.error("  certs/signerKey.pem");
    console.error("\nAnd src/assets/pass-icons/ has:");
    console.error("  icon.png (29×29), icon@2x.png (58×58)");
    console.error("  logo.png (160×50), logo@2x.png (320×100)");
  }
  process.exit(1);
});
