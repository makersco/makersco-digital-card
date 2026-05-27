/**
 * src/utils/google-wallet-generator.js
 *
 * Generates a signed JWT for a Google Wallet Generic Pass (Android Wallet).
 *
 * No annual fee — Google Wallet API is free.
 * Output: a URL you embed in your card HTML as the "Add to Google Wallet" button.
 *
 * ── SETUP (one-time, ~15 min) ──────────────────────────────────────────────
 * 1. Go to console.cloud.google.com → Create new project (e.g. "makersco-wallet")
 * 2. APIs & Services → Enable → search "Google Wallet API" → Enable
 * 3. IAM & Admin → Service Accounts → Create service account
 *    Name: wallet-signer  |  Role: none needed
 * 4. Click the service account → Keys tab → Add Key → JSON → download
 *    Save as: certs/google-service-account.json   ← gitignored
 * 5. Go to pay.google.com/business/console → Sign in with same Google account
 *    Complete issuer enrollment (business name, contact email)
 *    Copy your Issuer ID (19-digit number) → paste in ISSUER_ID below
 * 6. In Google Cloud Console → IAM → add the service account email
 *    Role: "Google Wallet Object Issuer"  (search for it)
 *
 * ── RUN ────────────────────────────────────────────────────────────────────
 * npm install   (first time only)
 * npm run generate:google
 *
 * ── OUTPUT ─────────────────────────────────────────────────────────────────
 * Prints the "Add to Google Wallet" button URL to paste into your card HTML.
 * Also saves the JWT to src/utils/google-wallet-jwt.txt
 */

"use strict";
const fs   = require("fs");
const path = require("path");
const jwt  = require("jsonwebtoken");

// ── CONFIG — update these to match your card ────────────────────────────────
const CONFIG = {
  // Identity
  name:    "Wong Soon Fook",
  title:   "Founder & Digital Builder",
  company: "MakersCo",
  phone:   "+60 19-295 3528",
  email:   "soonfookwong96@gmail.com",
  website: "https://lousycoder96.github.io/makersco-card-live/",
  cardUrl: "https://lousycoder96.github.io/makersco-card-live/src/templates/card-dark-luxury.html",
  whatsapp:"https://wa.me/60192953528?text=Hi+Soon+Fook%2C+I+found+your+digital+card!",

  // Logo — must be a publicly accessible HTTPS URL, min 660×660px recommended
  logoUrl: "https://lousycoder96.github.io/makersco-card-live/src/assets/icons/icon-512.png",

  // Background colour (hex, shown on the pass card)
  bgColor: "#0a0a0f",

  // Google Wallet Issuer ID — get from pay.google.com/business/console
  // Replace the X's with your actual 19-digit Issuer ID
  issuerId: process.env.GOOGLE_WALLET_ISSUER_ID || "3388000000023148661",

  // Unique IDs for this pass class and object
  // classId format: {issuerId}.{yourSuffix}  — only created once
  classSuffix: "makersco_biz_card",
  objectSuffix: "wsf_card_002",      // increment for each unique cardholder

  // Path to service account JSON key (gitignored)
  keyFile: path.join(__dirname, "..", "..", "certs", "google-service-account.json"),
};

// ── Build pass object ───────────────────────────────────────────────────────
function buildPassObject(issuerId) {
  const classId  = `${issuerId}.${CONFIG.classSuffix}`;
  const objectId = `${issuerId}.${CONFIG.objectSuffix}`;

  return {
    id:          objectId,
    classId:     classId,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    state:       "ACTIVE",

    hexBackgroundColor: CONFIG.bgColor,

    logo: {
      sourceUri: { uri: CONFIG.logoUrl },
      contentDescription: {
        defaultValue: { language: "en-US", value: "MakersCo Logo" }
      }
    },

    cardTitle: {
      defaultValue: { language: "en-US", value: CONFIG.company }
    },
    subheader: {
      defaultValue: { language: "en-US", value: CONFIG.title }
    },
    header: {
      defaultValue: { language: "en-US", value: CONFIG.name }
    },

    // Front of pass — text modules
    textModulesData: [
      { id: "company", header: "Company", body: `${CONFIG.company} · Malaysia` },
      { id: "phone",   header: "Phone",   body: CONFIG.phone },
    ],

    // Back of pass — tappable links
    linksModuleData: {
      uris: [
        { id: "email",    uri: `mailto:${CONFIG.email}`,   description: `✉️  ${CONFIG.email}` },
        { id: "phone",    uri: `tel:${CONFIG.phone.replace(/\s/g,"")}`, description: `📞  ${CONFIG.phone}` },
        { id: "website",  uri: CONFIG.website,             description: "🌐  Digital Card" },
        { id: "whatsapp", uri: CONFIG.whatsapp,            description: "💬  WhatsApp Me" },
      ],
    },

    // Hero banner — wide image shown at top of pass
    heroImage: {
      sourceUri: {
        uri: "https://lousycoder96.github.io/makersco-card-live/src/assets/wallet-hero-banner.png"
      },
      contentDescription: {
        defaultValue: { language: "en-US", value: "MakersCo Digital Business Card" }
      }
    },

    // QR code on pass → opens card URL
    barcode: {
      type:          "QR_CODE",
      value:         CONFIG.cardUrl,
      alternateText: "Scan to open card",
    },
  };
}

// ── Generate JWT ─────────────────────────────────────────────────────────────
function generateJWT() {
  if (!fs.existsSync(CONFIG.keyFile)) {
    console.error("\n❌  Service account key not found at:", CONFIG.keyFile);
    console.error("    Follow the SETUP steps in this file's header comment.");
    console.error("    Then save your JSON key as: certs/google-service-account.json\n");
    process.exit(1);
  }

  const issuerId = CONFIG.issuerId;
  if (/^X+$/.test(issuerId)) {
    console.error("\n❌  ISSUER_ID is still a placeholder.");
    console.error("    Get your 19-digit Issuer ID from: pay.google.com/business/console");
    console.error("    Then set GOOGLE_WALLET_ISSUER_ID env var or update CONFIG.issuerId\n");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(CONFIG.keyFile, "utf8"));
  const passObject     = buildPassObject(issuerId);
  const classId        = `${issuerId}.${CONFIG.classSuffix}`;

  // Pass class definition — included in JWT so Google auto-creates it if it
  // doesn't exist yet. This fixes "Something Went Wrong" errors in demo mode.
  const passClass = {
    id:         classId,
    issuerName: CONFIG.company,
  };

  const payload = {
    iss:     serviceAccount.client_email,
    aud:     "google",
    typ:     "savetowallet",
    iat:     Math.floor(Date.now() / 1000),
    payload: {
      genericClasses: [passClass],   // ← auto-creates class if absent
      genericObjects: [passObject],
    },
  };

  const token     = jwt.sign(payload, serviceAccount.private_key, { algorithm: "RS256" });
  const walletUrl = `https://pay.google.com/gp/v/save/${token}`;

  // Save JWT for embedding
  const outFile = path.join(__dirname, "google-wallet-jwt.txt");
  fs.writeFileSync(outFile, token, "utf8");

  console.log("\n✅  Google Wallet JWT generated!\n");
  console.log("━".repeat(70));
  console.log("Add to Google Wallet button URL (paste into your card HTML):");
  console.log(walletUrl);
  console.log("━".repeat(70));
  console.log("\nHTML button snippet:");
  console.log(`<a href="${walletUrl}" target="_blank">`);
  console.log(`  <img src="https://pay.google.com/about/static/sample-assets/cartes/googlepay-wallet-badge-fill.svg"`);
  console.log(`       alt="Add to Google Wallet" height="48">`);
  console.log(`</a>`);
  console.log("━".repeat(70));
  console.log(`\nJWT also saved to: ${outFile}`);
  console.log("\n⚠️  JWT expires: JWTs are stateless — regenerate if pass data changes.\n");
}

generateJWT();
