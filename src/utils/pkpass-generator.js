/**
 * generate-card-pkpass.js
 *
 * Generates a signed Apple Wallet .pkpass for a digital business card.
 *
 * Install:
 *   npm install passkit-generator canvas
 *
 * Required env vars:
 *   PASS_CERT_DIR        Directory containing wwdr.pem, signerCert.pem, signerKey.pem
 *   PASS_KEY_PASSPHRASE  (optional) signerKey passphrase
 *   PASS_TYPE_ID         e.g. pass.com.example.card
 *   PASS_TEAM_ID         10-char Apple Team ID
 *
 * Run:
 *   node generate-card-pkpass.js
 */

const fs = require("fs");
const path = require("path");
const { PKPass } = require("passkit-generator");
const { createCanvas } = require("canvas");

// ── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  // Identity
  name:    "Wong Soon Fook",
  title:   "Founder & Digital Builder",
  company: "MakersCo",
  phone:   "+60 19-295 3528",
  email:   "hello@makersco.example",
  website: "https://makersco.example",
  cardUrl: "https://makersco.example/card",

  // Pass identifiers (overridable via env)
  passTypeId:   process.env.PASS_TYPE_ID || "pass.com.example.card",
  teamId:       process.env.PASS_TEAM_ID || "XXXXXXXXXX",
  serialNumber: "card-001",
  description:  "Digital Business Card",
  organization: "MakersCo",
  logoText:     "MakersCo",

  // Colors — design rules: no pure #000, accent saturation < 80%
  background: "#0a0a0f",            // approved dark surface
  foreground: "#f5f5f7",            // off-white text
  label:      "#a1a1aa",            // muted neutral label
  accent:     "#6366f1",            // indigo, ~67% saturation
  accentTo:   "#8b5cf6",            // violet, ~76% saturation

  // Paths
  certDir:    process.env.PASS_CERT_DIR || path.join(__dirname, "certs"),
  passphrase: process.env.PASS_KEY_PASSPHRASE || "",
  outDir:     path.join(__dirname, "output"),
  outFile:    "card.pkpass",
  iconsDir:   path.join(__dirname, "src", "assets", "pass-icons"),

  // Strip dimensions (Apple spec)
  stripWidth:  375,
  stripHeight: 144,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgbString(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgb(${r},${g},${b})`;
}

function readOrFail(file, hint) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing file: ${file}\n  → ${hint}`);
  }
  return fs.readFileSync(file);
}

function buildStripImage(width, height, fromHex, toHex) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, fromHex);
  gradient.addColorStop(1, toHex);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  return canvas.toBuffer("image/png");
}

function buildPassJson() {
  return {
    formatVersion:      1,
    passTypeIdentifier: CONFIG.passTypeId,
    teamIdentifier:     CONFIG.teamId,
    serialNumber:       CONFIG.serialNumber,
    description:        CONFIG.description,
    organizationName:   CONFIG.organization,
    logoText:           CONFIG.logoText,
    backgroundColor:    hexToRgbString(CONFIG.background),
    foregroundColor:    hexToRgbString(CONFIG.foreground),
    labelColor:         hexToRgbString(CONFIG.label),
    generic: {
      primaryFields: [
        { key: "name",  label: "Name",  value: CONFIG.name  },
        { key: "title", label: "Title", value: CONFIG.title },
      ],
      secondaryFields: [
        { key: "company", label: "Company", value: CONFIG.company },
        {
          key:   "phone",
          label: "Phone",
          value: CONFIG.phone,
          dataDetectorTypes: ["PKDataDetectorTypePhoneNumber"],
        },
      ],
      auxiliaryFields: [
        {
          key:   "email",
          label: "Email",
          value: CONFIG.email,
          dataDetectorTypes: ["PKDataDetectorTypeLink"],
        },
        {
          key:   "website",
          label: "Website",
          value: CONFIG.website,
          dataDetectorTypes: ["PKDataDetectorTypeLink"],
        },
      ],
      backFields: [
        { key: "card", label: "Card URL", value: CONFIG.cardUrl,
          dataDetectorTypes: ["PKDataDetectorTypeLink"] },
      ],
    },
    barcodes: [
      {
        message:         CONFIG.cardUrl,
        format:          "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
        altText:         "Scan to open card",
      },
    ],
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function generate() {
  if (CONFIG.teamId === "XXXXXXXXXX") {
    throw new Error("PASS_TEAM_ID env var is not set (or still placeholder).");
  }

  const wwdr       = readOrFail(path.join(CONFIG.certDir, "wwdr.pem"),
    "Download Apple WWDR certificate and convert to PEM.");
  const signerCert = readOrFail(path.join(CONFIG.certDir, "signerCert.pem"),
    "Export your Pass Type ID cert from Keychain → .p12 → signerCert.pem.");
  const signerKey  = readOrFail(path.join(CONFIG.certDir, "signerKey.pem"),
    "Export the private key from your .p12 → signerKey.pem.");

  const icon    = readOrFail(path.join(CONFIG.iconsDir, "icon.png"),
    "Provide a 29×29 icon.png in src/assets/pass-icons/.");
  const icon2x  = readOrFail(path.join(CONFIG.iconsDir, "icon@2x.png"),
    "Provide a 58×58 icon@2x.png in src/assets/pass-icons/.");
  const logo    = readOrFail(path.join(CONFIG.iconsDir, "logo.png"),
    "Provide a logo.png (max 160×50) in src/assets/pass-icons/.");
  const logo2x  = readOrFail(path.join(CONFIG.iconsDir, "logo@2x.png"),
    "Provide a logo@2x.png (max 320×100) in src/assets/pass-icons/.");

  const strip   = buildStripImage(CONFIG.stripWidth, CONFIG.stripHeight,
    CONFIG.accent, CONFIG.accentTo);
  const strip2x = buildStripImage(CONFIG.stripWidth * 2, CONFIG.stripHeight * 2,
    CONFIG.accent, CONFIG.accentTo);

  const passJson = buildPassJson();

  const pass = new PKPass(
    {
      "pass.json":     Buffer.from(JSON.stringify(passJson)),
      "icon.png":      icon,
      "icon@2x.png":   icon2x,
      "logo.png":      logo,
      "logo@2x.png":   logo2x,
      "strip.png":     strip,
      "strip@2x.png":  strip2x,
    },
    {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: CONFIG.passphrase,
    }
  );

  const buf = pass.getAsBuffer();
  fs.mkdirSync(CONFIG.outDir, { recursive: true });
  const outPath = path.join(CONFIG.outDir, CONFIG.outFile);
  fs.writeFileSync(outPath, buf);

  console.log("Pass written:", outPath);
  console.log("Size:", Math.round(buf.length / 1024) + " KB");
}

generate().catch((err) => {
  console.error("Pass generation failed:", err.message);
  if (err.message.includes("Missing file")) {
    console.error("\nExpected layout:");
    console.error("  certs/wwdr.pem  certs/signerCert.pem  certs/signerKey.pem");
    console.error("  src/assets/pass-icons/{icon,icon@2x,logo,logo@2x}.png");
  } else if (err.code === "MODULE_NOT_FOUND") {
    console.error("\nRun: npm install passkit-generator canvas");
  } else if (/passphrase|decrypt|bad decrypt/i.test(err.message)) {
    console.error("\nThe signerKey passphrase is wrong or missing.");
    console.error("Set PASS_KEY_PASSPHRASE env var to the key's export passphrase.");
  } else if (/team|identifier/i.test(err.message)) {
    console.error("\nCheck PASS_TYPE_ID and PASS_TEAM_ID match your Apple Developer account.");
  }
  process.exit(1);
});