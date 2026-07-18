#!/usr/bin/env node
/**
 * generate-pkpass.js
 *
 * Generates an Apple Wallet (.pkpass) file for a digital business card.
 *
 * Install:
 *   npm install passkit-generator sharp qrcode
 *
 * Run:
 *   APPLE_WWDR_CERT=./certs/wwdr.pem \
 *   APPLE_SIGNER_CERT=./certs/signerCert.pem \
 *   APPLE_SIGNER_KEY=./certs/signerKey.pem \
 *   APPLE_SIGNER_KEY_PASSPHRASE=secret \
 *   node generate-pkpass.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { PKPass } = require('passkit-generator');
const sharp = require('sharp');
const QRCode = require('qrcode');

// ---------------------------------------------------------------------------
// CONFIG — edit these values to customise the pass.
// ---------------------------------------------------------------------------
const CONFIG = {
  // Pass identity (must match values registered in your Apple Developer account)
  passTypeIdentifier: 'pass.com.makersco.digitalcard',
  teamIdentifier: 'ABCD123456',
  organizationName: 'Makers & Co.',
  serialNumber: `card-${Date.now()}`,

  // Card holder
  holder: {
    name: 'Wong Soon Fook',
    title: 'Founder & Engineer',
    company: 'Makers & Co.',
    phone: '+60 12 345 6789',
    email: 'hello@makers.co',
    website: 'https://makers.co/wong-soonfook',
  },

  // QR code destination (scanned to open the digital card)
  cardUrl: 'https://makers.co/c/wong-soonfook',

  // Colour palette (design rules: no pure black, accent saturation < 80%)
  colors: {
    background: '#0b0f1a',   // deep navy, not #000
    foreground: '#f5f5f7',   // off-white
    label:      '#9aa3b2',   // muted slate
    accentFrom: '#5b8def',   // calm blue (HSL S ≈ 78%)
    accentTo:   '#7c5cff',   // soft violet
  },

  // Strip image dimensions (Apple spec: 375x123 @1x, 750x246 @2x, 1125x369 @3x)
  strip: {
    width:  1125,
    height: 369,
  },

  // Icon & logo dimensions
  icon: { width: 87,  height: 87  }, // @3x of 29x29
  logo: { width: 480, height: 150 }, // @3x of 160x50

  // Certificate paths (from environment, with sensible fallbacks)
  certs: {
    wwdr:            process.env.APPLE_WWDR_CERT            || './certs/wwdr.pem',
    signerCert:      process.env.APPLE_SIGNER_CERT          || './certs/signerCert.pem',
    signerKey:       process.env.APPLE_SIGNER_KEY           || './certs/signerKey.pem',
    signerKeyPass:   process.env.APPLE_SIGNER_KEY_PASSPHRASE || '',
  },

  // Output
  outputDir:  path.resolve(__dirname, 'output'),
  outputFile: 'card.pkpass',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertReadable(filePath, label) {
  if (!filePath) {
    throw new Error(`Missing ${label}. Set the corresponding environment variable or update CONFIG.certs.`);
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Cannot find ${label} at "${filePath}". Check the path and try again.`);
  }
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch {
    throw new Error(`No read permission for ${label} at "${filePath}".`);
  }
}

function hexToRgb(hex) {
  const m = hex.replace('#', '');
  const v = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function rgbCss(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Build the gradient strip as an SVG, then rasterise to PNG with sharp.
 * Uses transform/opacity-friendly static art (no animations needed at runtime).
 */
async function buildStripPng(width, height) {
  const { accentFrom, accentTo, background } = CONFIG.colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="${accentFrom}"/>
          <stop offset="100%" stop-color="${accentTo}"/>
        </linearGradient>
        <radialGradient id="glow" cx="20%" cy="30%" r="60%">
          <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="${background}"/>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
    </svg>
  `.trim();
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Solid square PNG used as the icon placeholder. */
async function buildIconPng(size) {
  const { background, accentFrom, accentTo, foreground } = CONFIG.colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="${accentFrom}"/>
          <stop offset="100%" stop-color="${accentTo}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="18" ry="18" fill="${background}"/>
      <rect x="8" y="8" width="${size - 16}" height="${size - 16}" rx="14" ry="14" fill="url(#g)"/>
      <text x="50%" y="58%" text-anchor="middle"
            font-family="Geist, Outfit, 'Space Grotesk', sans-serif"
            font-size="${Math.floor(size * 0.5)}"
            font-weight="800"
            fill="${foreground}">M</text>
    </svg>
  `.trim();
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Wordmark logo PNG. */
async function buildLogoPng(width, height) {
  const { foreground } = CONFIG.colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <text x="0" y="70%"
            font-family="Geist, Outfit, 'Space Grotesk', sans-serif"
            font-size="${Math.floor(height * 0.7)}"
            font-weight="700"
            fill="${foreground}">${CONFIG.organizationName}</text>
    </svg>
  `.trim();
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Generate a transparent PNG with the QR code (used as a fallback visual). */
async function buildQrPng(text, size = 480) {
  return QRCode.toBuffer(text, {
    type: 'png',
    width: size,
    margin: 1,
    color: { dark: '#0b0f1aff', light: '#ffffffff' },
  });
}

// ---------------------------------------------------------------------------
// pass.json template
// ---------------------------------------------------------------------------

function buildPassJson() {
  const { holder, cardUrl, colors } = CONFIG;
  return {
    formatVersion: 1,
    passTypeIdentifier: CONFIG.passTypeIdentifier,
    teamIdentifier:     CONFIG.teamIdentifier,
    organizationName:   CONFIG.organizationName,
    serialNumber:       CONFIG.serialNumber,
    description:        `${holder.name} — Digital Business Card`,

    foregroundColor: rgbCss(colors.foreground),
    backgroundColor: rgbCss(colors.background),
    labelColor:      rgbCss(colors.label),

    generic: {
      primaryFields: [
        { key: 'name',  label: 'NAME',  value: holder.name  },
        { key: 'title', label: 'TITLE', value: holder.title },
      ],
      secondaryFields: [
        { key: 'company', label: 'COMPANY', value: holder.company },
        { key: 'phone',   label: 'PHONE',   value: holder.phone   },
      ],
      auxiliaryFields: [
        { key: 'email',   label: 'EMAIL',   value: holder.email   },
        { key: 'website', label: 'WEBSITE', value: holder.website },
      ],
      backFields: [
        { key: 'about', label: 'About',   value: `Tap the QR code on the front to open the full digital card.` },
        { key: 'url',   label: 'Website', value: holder.website },
        { key: 'mail',  label: 'Email',   value: holder.email   },
      ],
    },

    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: cardUrl,
        messageEncoding: 'iso-8859-1',
        altText: cardUrl.replace(/^https?:\/\//, ''),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Validate certificate inputs early with helpful messages.
  try {
    assertReadable(CONFIG.certs.wwdr,       'Apple WWDR certificate (APPLE_WWDR_CERT)');
    assertReadable(CONFIG.certs.signerCert, 'Pass signer certificate (APPLE_SIGNER_CERT)');
    assertReadable(CONFIG.certs.signerKey,  'Pass signer private key (APPLE_SIGNER_KEY)');
  } catch (err) {
    console.error('\n[cert-check] ' + err.message);
    console.error('Tip: export the three env vars before running, e.g.\n' +
      '  export APPLE_WWDR_CERT=./certs/wwdr.pem\n' +
      '  export APPLE_SIGNER_CERT=./certs/signerCert.pem\n' +
      '  export APPLE_SIGNER_KEY=./certs/signerKey.pem\n' +
      '  export APPLE_SIGNER_KEY_PASSPHRASE=...\n');
    process.exit(1);
  }

  if (!CONFIG.certs.signerKeyPass) {
    console.warn('[cert-check] APPLE_SIGNER_KEY_PASSPHRASE is empty — only fine if your key really has no passphrase.');
  }

  // 2. Ensure output directory exists.
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  // 3. Generate image assets in parallel.
  let stripPng, strip2x, icon1x, icon2x, icon3x, logo1x, logo2x, logo3x, qrPng;
  try {
    [stripPng, strip2x, icon1x, icon2x, icon3x, logo1x, logo2x, logo3x, qrPng] = await Promise.all([
      buildStripPng(CONFIG.strip.width, CONFIG.strip.height),
      buildStripPng(Math.round(CONFIG.strip.width / 1.5), Math.round(CONFIG.strip.height / 1.5)),
      buildIconPng(29),
      buildIconPng(58),
      buildIconPng(CONFIG.icon.width),
      buildLogoPng(160, 50),
      buildLogoPng(320, 100),
      buildLogoPng(CONFIG.logo.width, CONFIG.logo.height),
      buildQrPng(CONFIG.cardUrl, 480),
    ]);
  } catch (err) {
    console.error('[assets] Failed to render pass artwork:', err.message);
    process.exit(1);
  }

  // 4. Build pass.json.
  const passJson = buildPassJson();

  // 5. Read certificate material.
  let wwdrPem, signerCertPem, signerKeyPem;
  try {
    wwdrPem       = fs.readFileSync(CONFIG.certs.wwdr);
    signerCertPem = fs.readFileSync(CONFIG.certs.signerCert);
    signerKeyPem  = fs.readFileSync(CONFIG.certs.signerKey);
  } catch (err) {
    console.error('[cert-read] Failed to read certificate file:', err.message);
    process.exit(1);
  }

  // 6. Compose & sign the pass.
  let pass;
  try {
    pass = new PKPass(
      {
        'pass.json':         Buffer.from(JSON.stringify(passJson)),
        'icon.png':          icon1x,
        'icon@2x.png':       icon2x,
        'icon@3x.png':       icon3x,
        'logo.png':          logo1x,
        'logo@2x.png':       logo2x,
        'logo@3x.png':       logo3x,
        'strip.png':         strip2x,
        'strip@2x.png':      stripPng,
        'thumbnail.png':     qrPng,
        'thumbnail@2x.png':  qrPng,
      },
      {
        wwdr: wwdrPem,
        signerCert: signerCertPem,
        signerKey: signerKeyPem,
        signerKeyPassphrase: CONFIG.certs.signerKeyPass || undefined,
      },
    );
  } catch (err) {
    console.error('[pkpass] Failed to assemble pass bundle:', err.message);
    console.error('Common causes: wrong cert/key pair, expired WWDR, or missing pass.json fields.');
    process.exit(1);
  }

  // 7. Serialise and write to disk.
  let buffer;
  try {
    buffer = pass.getAsBuffer();
  } catch (err) {
    console.error('[pkpass] Failed to sign pass:', err.message);
    console.error('Check that the signer cert matches the Pass Type ID "' + CONFIG.passTypeIdentifier + '"');
    console.error('and that the passphrase for APPLE_SIGNER_KEY is correct.');
    process.exit(1);
  }

  const outPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
  try {
    fs.writeFileSync(outPath, buffer);
  } catch (err) {
    console.error('[output] Failed to write file:', err.message);
    process.exit(1);
  }

  console.log(`[ok] Wrote ${outPath} (${buffer.length.toLocaleString()} bytes)`);
  console.log(`[ok] Serial: ${CONFIG.serialNumber}`);
  console.log(`[ok] QR target: ${CONFIG.cardUrl}`);
}

main().catch(err => {
  console.error('[fatal]', err && err.stack ? err.stack : err);
  process.exit(1);
});