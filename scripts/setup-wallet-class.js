/**
 * scripts/setup-wallet-class.js
 *
 * Diagnoses Google Wallet auth and pre-creates the GenericClass via REST API.
 * Run once before using the "Add to Google Wallet" button.
 *
 *   node scripts/setup-wallet-class.js
 *
 * If it prints ✅ Class ready — your wallet button will work.
 * If it prints ❌ — read the error; it tells you exactly what's missing.
 */

"use strict";
const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const fs   = require("fs");

const KEY_FILE  = path.join(__dirname, "..", "certs", "google-service-account.json");
const ISSUER_ID = "3388000000023148661";
const CLASS_ID  = `${ISSUER_ID}.makersco_biz_card`;
const BASE_URL  = "https://walletobjects.googleapis.com/walletobjects/v1";

async function main() {
  // ── 1. Key file ────────────────────────────────────────────────────────────
  if (!fs.existsSync(KEY_FILE)) {
    console.error("❌  Key file not found:", KEY_FILE);
    process.exit(1);
  }
  console.log("✅  Key file found:", KEY_FILE);

  // ── 2. Authenticate ────────────────────────────────────────────────────────
  let client;
  try {
    const auth = new GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
    });
    client = await auth.getClient();
    await client.getAccessToken();          // throws if credentials are bad
    console.log("✅  Service account authenticated OK");
    const key = JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));
    console.log("    Email:", key.client_email);
  } catch (err) {
    console.error("❌  Authentication failed:", err.message);
    console.error("    Check that certs/google-service-account.json is valid.");
    process.exit(1);
  }

  // ── 3. Try GET class ───────────────────────────────────────────────────────
  console.log("\n🔍  Looking up Generic Pass class:", CLASS_ID);
  try {
    const res = await client.request({
      url:    `${BASE_URL}/genericClass/${encodeURIComponent(CLASS_ID)}`,
      method: "GET",
    });
    console.log("✅  Class already exists — no action needed.");
    console.log("    State:", res.data.reviewStatus || "active");
    console.log("\n🎉  Everything is ready. Your wallet button should work!\n");
    return;
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      console.log("   Class not found — will create it now.");
    } else if (status === 401 || status === 403) {
      console.error(`\n❌  Authorization error (HTTP ${status}):`);
      console.error("    The service account does not have permission to access the Wallet API.");
      console.error("\n    Fix — do ONE of the following:");
      console.error("    A) Google Cloud Console → IAM & Admin → IAM");
      console.error(`       Add principal: ${JSON.parse(fs.readFileSync(KEY_FILE,"utf8")).client_email}`);
      console.error("       Role: search 'walletobjects' → 'Google Wallet Object Issuer'");
      console.error("       (If role not found, the Wallet API may not be enabled on this project)");
      console.error("\n    B) Google Pay & Wallet Console → gear icon → Users → Add service account");
      console.error("       Role: Developer");
      console.error("\n    C) Make sure the Google Wallet API is enabled:");
      console.error("       console.cloud.google.com → APIs & Services → Enabled APIs");
      console.error("       Search 'Google Wallet API' — must show as Enabled");
      console.error("\n    Detailed error:", JSON.stringify(err.response?.data, null, 4));
      process.exit(1);
    } else {
      console.error(`\n❌  Unexpected error (HTTP ${status}):`, JSON.stringify(err.response?.data, null, 2));
      process.exit(1);
    }
  }

  // ── 4. Create class ────────────────────────────────────────────────────────
  console.log("🔧  Creating class:", CLASS_ID);
  try {
    const res = await client.request({
      url:    `${BASE_URL}/genericClass`,
      method: "POST",
      data: {
        id:         CLASS_ID,
        issuerName: "MakersCo",
      },
    });
    console.log("✅  Class created!", res.data.id);
    console.log("\n🎉  Everything is ready. Your wallet button should work!\n");
  } catch (err) {
    const status = err.response?.status;
    if (status === 409) {
      console.log("✅  Class already exists (conflict = already created). You're good!");
      console.log("\n🎉  Everything is ready. Your wallet button should work!\n");
    } else {
      console.error(`\n❌  Failed to create class (HTTP ${status}):`);
      console.error(JSON.stringify(err.response?.data, null, 2));
      process.exit(1);
    }
  }
}

main();
