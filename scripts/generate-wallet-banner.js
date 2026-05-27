/**
 * scripts/generate-wallet-banner.js
 *
 * Generates a 1032×336px hero banner for the Google Wallet Generic Pass.
 * Matches the dark-luxury card aesthetic (near-black + gold).
 *
 * Run:  node scripts/generate-wallet-banner.js
 * Or:   npm run generate:banner
 *
 * Output: src/assets/wallet-hero-banner.png
 * Host:   https://lousycoder96.github.io/makersco-card-live/src/assets/wallet-hero-banner.png
 */

"use strict";
const { createCanvas } = require("@napi-rs/canvas");
const fs   = require("fs");
const path = require("path");

// ── Config — change these to match your card ────────────────────────────────
const CONFIG = {
  name:    "Wong Soon Fook",
  title:   "Founder & Digital Builder",
  company: "MakersCo",
  tagline: "Digital Business Card",

  // Colours
  bg:           "#0a0a0f",
  gold:         "#C9A962",
  goldDim:      "rgba(201,169,98,0.30)",
  goldFaint:    "rgba(201,169,98,0.12)",
  textPrimary:  "#f5f1e8",
  textSecond:   "rgba(245,241,232,0.65)",
  textMuted:    "rgba(245,241,232,0.38)",
};

// ── Canvas size (Google Wallet hero image — 3:1 ratio) ───────────────────────
const W = 1032, H = 336;

function drawBanner() {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = CONFIG.bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow top-left
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.7);
  glow.addColorStop(0,   "rgba(201,169,98,0.07)");
  glow.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Corner filigree marks (like card-dark-luxury) ──────────────────────────
  const M = 28, L = 16;  // margin, line-length
  ctx.strokeStyle = CONFIG.goldDim;
  ctx.lineWidth   = 1;

  // Top-left corner
  ctx.beginPath(); ctx.moveTo(M, M + L); ctx.lineTo(M, M); ctx.lineTo(M + L, M); ctx.stroke();
  // Top-right corner
  ctx.beginPath(); ctx.moveTo(W - M - L, M); ctx.lineTo(W - M, M); ctx.lineTo(W - M, M + L); ctx.stroke();
  // Bottom-left corner
  ctx.beginPath(); ctx.moveTo(M, H - M - L); ctx.lineTo(M, H - M); ctx.lineTo(M + L, H - M); ctx.stroke();
  // Bottom-right corner
  ctx.beginPath(); ctx.moveTo(W - M - L, H - M); ctx.lineTo(W - M, H - M); ctx.lineTo(W - M, H - M - L); ctx.stroke();

  // ── Left accent bar ─────────────────────────────────────────────────────────
  ctx.fillStyle = CONFIG.gold;
  ctx.fillRect(56, 68, 2, H - 136);

  // ── Company label ───────────────────────────────────────────────────────────
  ctx.fillStyle   = CONFIG.gold;
  ctx.font        = `600 13px Arial`;
  ctx.letterSpacing = "0.24em";
  ctx.textAlign   = "left";
  ctx.textBaseline = "middle";
  // Simulate letter-spacing by drawing char by char
  drawSpaced(ctx, CONFIG.company.toUpperCase(), 80, 90, 13);

  // ── Thin horizontal rule ────────────────────────────────────────────────────
  ctx.strokeStyle = CONFIG.goldDim;
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  ctx.moveTo(80, 108);
  ctx.lineTo(W - 80, 108);
  ctx.stroke();

  // ── Name ────────────────────────────────────────────────────────────────────
  ctx.fillStyle    = CONFIG.textPrimary;
  ctx.font         = `300 52px Georgia, serif`;
  ctx.letterSpacing = "0.02em";
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(CONFIG.name, 80, 178);

  // ── Title line ──────────────────────────────────────────────────────────────
  ctx.fillStyle    = CONFIG.gold;
  ctx.font         = `400 17px Georgia, serif`;
  ctx.letterSpacing = "0.06em";
  ctx.fillText(CONFIG.title, 80, 228);

  // ── Tagline / divider ───────────────────────────────────────────────────────
  ctx.strokeStyle = CONFIG.goldDim;
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  ctx.moveTo(80, 255);
  ctx.lineTo(340, 255);
  ctx.stroke();

  ctx.fillStyle    = CONFIG.textMuted;
  ctx.font         = `400 12px Arial`;
  ctx.letterSpacing = "0.18em";
  drawSpaced(ctx, CONFIG.tagline.toUpperCase(), 80, 276, 10);

  // ── Right-side decorative monogram ──────────────────────────────────────────
  const cx = W - 140, cy = H / 2, r = 72;

  // Outer ring
  ctx.strokeStyle = CONFIG.goldFaint;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = CONFIG.goldDim;
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // Initial letter
  ctx.fillStyle    = CONFIG.gold;
  ctx.font         = `300 72px Georgia, serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(CONFIG.name.charAt(0), cx, cy + 2);

  // ── Bottom border ────────────────────────────────────────────────────────────
  ctx.strokeStyle = CONFIG.goldDim;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(0, H - 1);
  ctx.lineTo(W, H - 1);
  ctx.stroke();

  return canvas;
}

/**
 * Simulate CSS letter-spacing by drawing each character with extra gap.
 */
function drawSpaced(ctx, text, x, y, spacing) {
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
}

// ── Write file ───────────────────────────────────────────────────────────────
const OUT = path.join(__dirname, "..", "src", "assets", "wallet-hero-banner.png");
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const banner = drawBanner();
const buf    = banner.toBuffer("image/png");
fs.writeFileSync(OUT, buf);

console.log(`\n✅  Hero banner written: ${OUT}`);
console.log(`   Size: ${buf.length} bytes  (${W}×${H}px)`);
console.log(`\n   Live URL (after git push):`);
console.log(`   https://lousycoder96.github.io/makersco-card-live/src/assets/wallet-hero-banner.png\n`);
