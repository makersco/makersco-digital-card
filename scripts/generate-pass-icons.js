/**
 * scripts/generate-pass-icons.js
 *
 * Generates placeholder PNG icons for Apple Wallet passes.
 * Run once: npm run generate:icons
 *
 * Replace the generated files with your real brand icons before production.
 * Required sizes per Apple spec:
 *   icon.png     29×29   (pass list thumbnail)
 *   icon@2x.png  58×58
 *   icon@3x.png  87×87
 *   logo.png     160×50  (top-left on pass)
 *   logo@2x.png  320×100
 */

const { createCanvas } = require("@napi-rs/canvas");
const fs   = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "src", "assets", "pass-icons");
fs.mkdirSync(OUT, { recursive: true });

// Brand colours matching the dark-luxury template
const ACCENT  = "#6366f1";   // indigo
const BG      = "#0a0a0f";   // near-black
const TEXT    = "#f5f5f7";   // off-white

function save(filename, canvas) {
  const buf  = canvas.toBuffer("image/png");
  const file = path.join(OUT, filename);
  fs.writeFileSync(file, buf);
  console.log(`  ✅  ${filename}  (${buf.length} bytes)`);
}

// ── Icon (square, initials) ──────────────────────────────────────────────────
function makeIcon(size) {
  const c   = createCanvas(size, size);
  const ctx = c.getContext("2d");

  // Background circle
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Initials "M" for MakersCo
  ctx.fillStyle = TEXT;
  ctx.font      = `bold ${Math.round(size * 0.55)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("M", size / 2, size / 2 + size * 0.03);

  return c;
}

// ── Logo (wide, wordmark) ────────────────────────────────────────────────────
function makeLogo(w, h) {
  const c   = createCanvas(w, h);
  const ctx = c.getContext("2d");

  // Transparent background (passes show the pass background behind the logo)
  ctx.clearRect(0, 0, w, h);

  // Circle mark
  const r  = Math.round(h * 0.38);
  const cx = r + Math.round(h * 0.1);
  const cy = h / 2;

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = TEXT;
  ctx.font      = `bold ${Math.round(h * 0.42)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("M", cx, cy + r * 0.05);

  // Wordmark
  ctx.fillStyle  = TEXT;
  ctx.font       = `600 ${Math.round(h * 0.38)}px Arial`;
  ctx.textAlign  = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("MakersCo", cx + r + Math.round(h * 0.15), cy);

  return c;
}

console.log("\n🎨  Generating Apple Wallet pass icons…\n");

save("icon.png",     makeIcon(29));
save("icon@2x.png",  makeIcon(58));
save("icon@3x.png",  makeIcon(87));
save("logo.png",     makeLogo(160, 50));
save("logo@2x.png",  makeLogo(320, 100));

console.log(`\n✅  All icons written to: ${OUT}`);
console.log("    Replace with real brand assets before going to production.\n");
