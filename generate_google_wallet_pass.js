/**
 * generate_google_wallet_pass.js
 * Generates a signed JWT for Google Wallet Generic Pass.
 *
 * Key difference from Apple Wallet:
 * - No annual developer fee (Google Cloud free tier is enough)
 * - No certificate files — just a service account JSON key
 * - Output is a JWT string you embed directly in your HTML
 * - Button URL: https://pay.google.com/gp/v/save/{JWT}
 *
 * SETUP (one-time, ~15 min):
 *   See GOOGLE_WALLET_SETUP.md in this folder for full step-by-step.
 *
 * QUICK SETUP SUMMARY:
 *   1. Go to console.cloud.google.com → New Project
 *   2. Enable "Google Wallet API"
 *   3. IAM & Admin → Service Accounts → Create → download JSON key
 *      Save as: certs/google-service-account.json
 *   4. Go to pay.google.com/business/console → enrol as issuer
 *      Get your Issuer ID (10-digit number)
 *   5. Update ISSUER_ID below
 *   6. npm install google-auth-library jsonwebtoken
 *   7. node generate_google_wallet_pass.js
 *      → Outputs the JWT to paste into wong-soonfook.html
 *
 * INSTALL:
 *   npm install google-auth-library jsonwebtoken
 *
 * RUN:
 *   node generate_google_wallet_pass.js
 */

const fs  = require("fs");
const path = require("path");
const jwt  = require("jsonwebtoken");

// ── Your Google Wallet Issuer ID ──────────────────────────────────────────────
// Get this from: pay.google.com/business/console
const ISSUER_ID = "3388000000XXXXXXXXX";   // ← replace with your 19-digit Issuer ID
const CLASS_ID  = `${ISSUER_ID}.wsf_business_card`;
const OBJECT_ID = `${ISSUER_ID}.wsf_card_001`;

// ── Service account key ───────────────────────────────────────────────────────
const KEY_FILE  = path.join(__dirname, "certs", "google-service-account.json");

// ── Pass data ─────────────────────────────────────────────────────────────────
const passObject = {
  id: OBJECT_ID,
  classId: CLASS_ID,
  genericType: "GENERIC_TYPE_UNSPECIFIED",

  // ── Visual ──────────────────────────────────────────────────────────────────
  hexBackgroundColor: "#1A1008",   // dark gold-brown (matches card design)

  logo: {
    sourceUri: {
      // Replace with your hosted logo URL (must be HTTPS, min 660×660px recommended)
      uri: "https://lousycoder96.github.io/Makers-Co-Website/assets/logo.png"
    },
    contentDescription: {
      defaultValue: { language: "en-US", value: "MakersCo Logo" }
    }
  },

  // ── Pass text fields ─────────────────────────────────────────────────────────
  cardTitle: {
    defaultValue: { language: "en-US", value: "MakersCo" }
  },
  subheader: {
    defaultValue: { language: "en-US", value: "Digital Business Card" }
  },
  header: {
    defaultValue: { language: "en-US", value: "Wong Soon Fook" }
  },

  // ── Text modules (shown on the front of the pass) ────────────────────────────
  textModulesData: [
    {
      id: "title",
      header: "Title",
      body: "Founder & Digital Builder"
    },
    {
      id: "company",
      header: "Company",
      body: "MakersCo · Malaysia"
    }
  ],

  // ── Clickable links (shown on the back of the pass) ──────────────────────────
  linksModuleData: {
    uris: [
      {
        uri: "tel:+60192953528",
        description: "📞 +60 19-295 3528",
        id: "phone"
      },
      {
        uri: "mailto:soonfookwong96@gmail.com",
        description: "✉️ soonfookwong96@gmail.com",
        id: "email"
      },
      {
        uri: "https://lousycoder96.github.io/Makers-Co-Website/",
        description: "🌐 Makers-Co-Website",
        id: "website"
      },
      {
        uri: "https://wa.me/60192953528?text=Hi+Soon+Fook%2C+I+found+your+digital+card+and+would+like+to+connect!",
        description: "💬 WhatsApp Me",
        id: "whatsapp"
      },
      {
        uri: "https://github.com/lousycoder96",
        description: "👨‍💻 GitHub",
        id: "github"
      }
    ]
  },

  // ── QR code on the pass ───────────────────────────────────────────────────────
  barcode: {
    type: "QR_CODE",
    value: "https://lousycoder96.github.io/Makers-Co-Website/",
    alternateText: "Scan to visit portfolio"
  },

  // ── State ─────────────────────────────────────────────────────────────────────
  state: "ACTIVE"
};

// ── Generate JWT ───────────────────────────────────────────────────────────────
function generateJWT() {
  if (!fs.existsSync(KEY_FILE)) {
    console.error("❌  Service account key not found:", KEY_FILE);
    console.error("    Download it from Google Cloud Console → IAM & Admin → Service Accounts");
    console.error("    Save as: certs/google-service-account.json");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));

  const payload = {
    iss: serviceAccount.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    payload: {
      genericObjects: [passObject]
    }
  };

  const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: "RS256" });

  const walletUrl = `https://pay.google.com/gp/v/save/${token}`;

  console.log("\n✅  Google Wallet JWT generated!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Add to Google Wallet URL:");
  console.log(walletUrl);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("JWT token only (for embedding in HTML):");
  console.log(token);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nNext step:");
  console.log('  Open wong-soonfook.html, find: const GOOGLE_WALLET_JWT = ""');
  console.log("  Paste the JWT token above between the quotes.");
  console.log("  Save and host — the Android Wallet button will work.\n");

  // Save JWT to file for convenience
  const outFile = path.join(__dirname, "src", "cards", "google-wallet-jwt.txt");
  fs.writeFileSync(outFile, token, "utf8");
  console.log(`  JWT also saved to: ${outFile}`);
}

generateJWT();
