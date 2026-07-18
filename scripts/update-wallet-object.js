/**
 * scripts/update-wallet-object.js
 *
 * Force-pushes an update to an existing Google Wallet object.
 * Tapping "Add to Google Wallet" again does NOT refresh a pass that's
 * already saved — Google just deep-links to the existing pass instead of
 * re-syncing its fields. The only way to update an already-saved pass is
 * to PATCH it directly via the Wallet Objects REST API, which is what
 * this script does.
 *
 *   node scripts/update-wallet-object.js
 */

"use strict";
const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const fs   = require("fs");
const LINKS = require("../src/config/links.json");

const KEY_FILE  = path.join(__dirname, "..", "certs", "google-service-account.json");
const ISSUER_ID = "3388000000023148661";
const CLASS_ID  = `${ISSUER_ID}.makersco_biz_card`;
const OBJECT_ID = `${ISSUER_ID}.wsf_card_003`;
const BASE_URL  = "https://walletobjects.googleapis.com/walletobjects/v1";

const passObject = {
  id: OBJECT_ID,
  classId: CLASS_ID,
  genericType: "GENERIC_TYPE_UNSPECIFIED",
  hexBackgroundColor: "#1A1008",
  logo: {
    sourceUri: { uri: LINKS.assets.logo },
    contentDescription: {
      defaultValue: { language: "en-US", value: `${LINKS.business.name} Logo` }
    }
  },
  cardTitle: {
    defaultValue: { language: "en-US", value: LINKS.business.name }
  },
  subheader: {
    defaultValue: { language: "en-US", value: "Digital Business Card" }
  },
  header: {
    defaultValue: { language: "en-US", value: LINKS.person.name }
  },
  textModulesData: [
    { id: "title", header: "Title", body: LINKS.person.title },
    { id: "company", header: "Company", body: `${LINKS.person.company} · Malaysia` }
  ],
  linksModuleData: {
    uris: [
      { uri: `tel:${LINKS.person.phone}`, description: `📞 ${LINKS.person.phoneDisplay}`, id: "phone" },
      { uri: `mailto:${LINKS.person.email}`, description: `✉️ ${LINKS.person.email}`, id: "email" },
      { uri: LINKS.card.public, description: "🌐 Digital Card", id: "website" },
      { uri: `https://wa.me/${LINKS.person.whatsappNumber}?text=${encodeURIComponent(LINKS.person.whatsappMessage)}`, description: "💬 WhatsApp Me", id: "whatsapp" },
      { uri: LINKS.business.github, description: "👨‍💻 GitHub", id: "github" }
    ]
  },
  barcode: {
    type: "QR_CODE",
    value: LINKS.card.public,
    alternateText: "Scan to view digital card"
  },
  state: "ACTIVE"
};

async function main() {
  if (!fs.existsSync(KEY_FILE)) {
    console.error("❌  Key file not found:", KEY_FILE);
    process.exit(1);
  }

  const auth = new GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
  const client = await auth.getClient();

  console.log("🔧  Patching object:", OBJECT_ID);
  try {
    const res = await client.request({
      url:    `${BASE_URL}/genericObject/${encodeURIComponent(OBJECT_ID)}`,
      method: "PATCH",
      data:   passObject,
    });
    console.log("✅  Object updated. New barcode.value:", res.data.barcode.value);
    console.log("\nGoogle pushes this to devices that already saved the pass —");
    console.log("give it a minute, then reopen the pass in Google Wallet.\n");
  } catch (err) {
    console.error(`❌  PATCH failed (HTTP ${err.response?.status}):`);
    console.error(JSON.stringify(err.response?.data, null, 2));
    process.exit(1);
  }
}

main();
