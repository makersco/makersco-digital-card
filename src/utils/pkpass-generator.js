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
const LINKS = require('../config/links.json');

// ---------------------------------------------------------------------------
// CONFIG — edit these values to customise the pass.
// ---------------------------------------------------------------------------
const CONFIG = {
  // Pass identity (must match values registered in your Apple Developer account)
  passTypeIdentifier: 'pass.co.dummy',
  teamIdentifier: 'D5V8NK8DVE',
  organizationName: LINKS.person.company,
  serialNumber: `card-${Date.now()}`,

  // Card holder (back-of-pass contact info)
  holder: {
    name: LINKS.person.name,
    email: LINKS.person.email,
    website: LINKS.card.public,
  },

  // Front-of-pass fields — the name/title already appear inside the hero strip image,
  // so these only need the two rows shown below the strip.
  front: {
    company: 'Makers Co',
    role: 'Owner & Founder',
    phone: LINKS.person.phoneDisplay,
    name: LINKS.person.name,
  },

  // QR code destination (scanned to open the digital card)
  cardUrl: LINKS.card.public,

  // Colour palette — matches the MakersCo gold/dark brand theme.
  colors: {
    background: '#15100A',
    foreground: '#F5E9D6',
    label:      '#C9A96E',
  },

  // Strip image sizes (Apple spec: 375x123 @1x, 750x246 @2x, 1125x369 @3x)
  strip: {
    w1x: 375, h1x: 123,
    w2x: 750, h2x: 246,
    w3x: 1125, h3x: 369,
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

  // Output — written straight into src/cards so it can be committed and hosted
  // alongside wong-soon-fook-owner.html (see PKPASS_URL there).
  outputDir:  path.resolve(__dirname, '..', 'cards'),
  outputFile: 'wong-soon-fook-owner.pkpass',
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

const STRIP_PATH = path.join(__dirname, '..', 'assets', 'wallet-hero-banner-wsf2.png');

/** Hero strip — the branded photo strip (name/title baked in), cropped to Apple's strip aspect. */
async function buildStripPng(width, height) {
  return sharp(STRIP_PATH)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();
}

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'makersco-wordmark-only.png');

/** Accent-gradient square icon (shown in notifications/Apple Watch, not on the pass face). */
async function buildIconPng(size) {
  const { accentFrom, accentTo } = CONFIG.colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accentFrom}"/>
          <stop offset="100%" stop-color="${accentTo}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="${size * 0.18}" fill="url(#g)"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
            font-family="-apple-system,Helvetica,Arial,sans-serif" font-weight="700"
            font-size="${size * 0.52}" fill="#ffffff">W</text>
    </svg>
  `.trim();
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Logo PNG — the real Makers Co wordmark, letterboxed onto a transparent canvas. */
async function buildLogoPng(width, height) {
  return sharp(LOGO_PATH)
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
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
  const { holder, front, cardUrl, colors } = CONFIG;
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

    // storeCard is the pass style that supports a strip image — the name/title/
    // logo are already baked into the hero strip photo, so primaryFields stays empty.
    storeCard: {
      primaryFields: [],
      secondaryFields: [
        { key: 'company', label: 'COMPANY', value: front.company },
        { key: 'role',    label: 'ROLE',    value: front.role, textAlignment: 'PKTextAlignmentRight' },
      ],
      auxiliaryFields: [
        { key: 'phone', label: 'PHONE', value: front.phone, dataDetectorTypes: ['PKDataDetectorTypePhoneNumber'] },
        { key: 'name',  label: 'NAME',  value: front.name, textAlignment: 'PKTextAlignmentRight' },
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
  let stripPng, strip2x, strip3x, icon1x, icon2x, icon3x, logo1x, logo2x, logo3x, qrPng;
  try {
    [stripPng, strip2x, strip3x, icon1x, icon2x, icon3x, logo1x, logo2x, logo3x, qrPng] = await Promise.all([
      buildStripPng(CONFIG.strip.w1x, CONFIG.strip.h1x),
      buildStripPng(CONFIG.strip.w2x, CONFIG.strip.h2x),
      buildStripPng(CONFIG.strip.w3x, CONFIG.strip.h3x),
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
        'strip.png':         stripPng,
        'strip@2x.png':      strip2x,
        'strip@3x.png':      strip3x,
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