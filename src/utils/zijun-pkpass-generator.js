#!/usr/bin/env node
/**
 * zijun-pkpass-generator.js
 *
 * Builds the signed Apple Wallet pass (.pkpass) for Ng Zi Jun's digital card.
 * Sibling of pkpass-generator.js (Wong Soon Fook) — same pass type ID and
 * signing material, different artwork, fields and barcode.
 *
 * Two things make this pass different from the Makers Co one:
 *   1. The artwork is drawn from the RFS Consultants palette (navy + gold)
 *      instead of the Makers Co dark/gold one, and every image is generated
 *      as SVG here rather than shipped as a PNG, so the strip is authored at
 *      Wallet's real 2.6:1 slot aspect and never gets aspect-filled/cropped.
 *   2. The barcode carries the SAME payload as the printed QR sheet
 *      (zijun-qr.html) — a wa.me deep link whose prefilled message ends with
 *      the digital-card URL. Scanning the pass and scanning the sheet do the
 *      identical thing: open WhatsApp to Zi Jun with the card link attached.
 *
 * Run:
 *   npm run generate:zijun
 *   # or: APPLE_SIGNER_KEY_PASSPHRASE=… node src/utils/zijun-pkpass-generator.js
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

/**
 * The QR payload. This string must stay byte-identical to the one encoded in
 * src/assets/zijun-qr-code.png and linked from zijun-qr.html — the pass, the
 * printed sheet and the card all point at the same WhatsApp entry point.
 */
const WHATSAPP_QR =
  'https://wa.me/60172798221?text=Hi%20Zi%20Jun%2C%20I%20would%20love%20to%20connect%20%F0%9F%98%8A%20https%3A//makersco.github.io/makersco-digital-card/zijun';

const CARD_URL = 'https://makersco.github.io/makersco-digital-card/zijun';

const CONFIG = {
  // Pass identity — the signer certificate in certs/ is issued for this pass
  // type ID, so it can't be changed without a new certificate from Apple.
  passTypeIdentifier: 'pass.co.dummy',
  teamIdentifier: 'D5V8NK8DVE',
  organizationName: 'RFS Consultants Sdn Bhd',

  // Stable serial: re-running this script updates the pass already in someone's
  // Wallet instead of adding a second copy alongside it.
  serialNumber: 'ng-zi-jun-001',

  holder: {
    name: 'Ng Zi Jun',
    role: 'Wealth Advisory',
    company: 'RFS Consultants Sdn Bhd',
    companyShort: 'RFS Consultants',
    reg: '527056-W',
    mobile: '+60 17-279 8221',
    office: '+603-7666 3815',
    fax: '+603-7931 6016',
    email: 'zijunnn98@gmail.com',
    address:
      'Unit 1208, Block B, 12th Floor, Phileo Damansara 1,\n9, Jalan 16/11, Off Jalan Damansara,\n46350 Petaling Jaya, Selangor',
  },

  // Palette taken from the printed card itself, not from the dark card page:
  // white stock, navy ink, gold only on the RFS mark and the diamond, grey for
  // the italic secondary lines. The whole pass wears it — strip, icon and the
  // pass.json colours — so the thing in Wallet looks like the card in the hand.
  colors: {
    paper:      '#FEFEFE', // --paper, the card stock — the pass ground
    navy:       '#1F3A6E', // --rfs-navy, the card's ink — the pass foreground
    markGold:   '#C8952C', // --rfs-gold, the RFS mark and diamond
    grey:       '#5F5F5F', // --rfs-grey, the italic role and agency lines
    paperEdge:  '#C9A15A', // --gold-border, the card's frame
  },

  // Wallet renders the storeCard strip slot at ~2.6:1 (375x144 @1x), not the
  // 3:1 the older docs suggest. The artwork is drawn at exactly that aspect so
  // the resize is a straight scale — nothing is cropped off the sides.
  strip: { w: 375, h: 144 },

  certs: {
    wwdr:          process.env.APPLE_WWDR_CERT             || path.resolve(__dirname, '..', '..', 'certs', 'wwdr.pem'),
    signerCert:    process.env.APPLE_SIGNER_CERT           || path.resolve(__dirname, '..', '..', 'certs', 'signerCert.pem'),
    signerKey:     process.env.APPLE_SIGNER_KEY            || path.resolve(__dirname, '..', '..', 'certs', 'signerKey.pem'),
    signerKeyPass: process.env.APPLE_SIGNER_KEY_PASSPHRASE || '',
  },

  outputDir:  path.resolve(__dirname, '..', 'cards'),
  outputFile: 'ng-zi-jun.pkpass',
};

const SERIF = "'Times New Roman', Times, Tinos, serif";
const SANS  = 'Helvetica, Arial, sans-serif';   // for the small letterspaced labels

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertReadable(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Cannot find ${label} at "${filePath}".`);
  }
  fs.accessSync(filePath, fs.constants.R_OK);
}

function hexToRgb(hex) {
  const v = hex.replace('#', '');
  const full = v.length === 3 ? v.split('').map(c => c + c).join('') : v;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbCss(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Render an SVG string at an explicit pixel size. */
function renderSvg(svg, width, height) {
  return sharp(Buffer.from(svg)).resize(width, height).png().toBuffer();
}

/**
 * The boxed "RFS" mark from the printed card, as SVG. Shared by the strip, the
 * icon and the logo so all three stay in step: a gold hairline square with the
 * letters centred inside it.
 */
function rfsMark({ x, y, size, stroke, color, fontSize, border = CONFIG.colors.markGold }) {
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="none"
          stroke="${border}" stroke-width="${stroke}"/>
    <text x="${x + size / 2}" y="${y + size / 2}" text-anchor="middle" dominant-baseline="central"
          font-family="${SERIF}" font-weight="700" font-size="${fontSize}"
          letter-spacing="${fontSize * 0.04}" fill="${color}">RFS</text>
  `;
}

const WORDMARK_PATH = path.join(__dirname, '..', 'assets', 'makersco-wordmark-only.png');

/**
 * Makers Co watermark, as a data URI plus its aspect ratio (height ÷ width, so
 * the caller can size it off the strip width).
 *
 * The shipped wordmark is cream on transparent — drawn for dark grounds — and
 * the strip is white card stock, where cream is invisible. So the artwork is
 * re-tinted: keep its alpha channel as the shape, and paint that shape in the
 * card's own ink. .raw() matters — joinChannel wants pixels, and the default
 * encoder would hand it a PNG-compressed buffer instead.
 */
async function makersWatermark(tint = CONFIG.colors.navy) {
  const { width, height } = await sharp(WORDMARK_PATH).metadata();
  const alpha = await sharp(WORDMARK_PATH).extractChannel('alpha').raw().toBuffer();
  const { r, g, b } = hexToRgb(tint);
  const png = await sharp({ create: { width, height, channels: 3, background: { r, g, b } } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
  return {
    uri: `data:image/png;base64,${png.toString('base64')}`,
    aspect: height / width,
  };
}

/**
 * Hero strip — the pass's face, set as the printed card: white stock, navy ink,
 * gold on the mark and the diamond only. The pass ground behind it is the same
 * white, so the strip and the fields below read as one continuous card rather
 * than a picture pasted onto a different-coloured pass.
 *
 * The printed card's own composition is kept — lockup top-left, name large at
 * the foot, a vertical rule splitting off a left-aligned right-hand column —
 * compressed into a 2.6:1 slot. The office and fax numbers, the reg no and the
 * full address are not on the front: they live in the pass's back fields, where
 * there is room to read them.
 */
async function stripSvg() {
  const { colors, holder } = CONFIG;
  const W = CONFIG.strip.w, H = CONFIG.strip.h;
  const CX = 220;                 // right-hand column, set left-aligned off the rule
  const watermark = await makersWatermark(colors.navy);

  const line = (y, text, opts = {}) => `
    <text x="${CX}" y="${y}" font-family="${opts.sans ? SANS : SERIF}"
          font-size="${opts.size || 6.4}" ${opts.italic ? 'font-style="italic"' : ''}
          ${opts.bold ? 'font-weight="700"' : ''} letter-spacing="${opts.ls || 0}"
          fill="${opts.fill || colors.navy}">${text}</text>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${colors.paper}"/>

  <!-- The card page's gold frame, kept as a hairline: at strip scale the page's
       3px border would read as a heavy box around a very small picture. -->
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="none"
        stroke="${colors.paperEdge}" stroke-opacity=".45" stroke-width=".8"/>

  <!-- Lockup, top left. -->
  ${rfsMark({ x: 20, y: 18, size: 22, stroke: 1, color: colors.navy, fontSize: 8.6 })}
  <text x="50" y="28.5" font-family="${SERIF}" font-weight="700" font-size="8.8"
        letter-spacing=".4" fill="${colors.navy}">RFS CONSULTANTS SDN BHD</text>
  <rect x="50" y="34.2" width="3.2" height="3.2" fill="${colors.markGold}" transform="rotate(45 51.6 35.8)"/>
  <text x="58" y="38.6" font-family="${SERIF}" font-weight="700" font-size="4.6"
        letter-spacing="1.15" fill="${colors.markGold}">YOUR TRUSTED FINANCIAL PARTNER</text>

  <!-- Name and role, at the foot — the same place the printed card puts them. -->
  <text x="20" y="104" font-family="${SERIF}" font-weight="700" font-size="27"
        fill="${colors.navy}">${holder.name}</text>
  <text x="21" y="122" font-family="${SERIF}" font-style="italic" font-size="11.5"
        fill="${colors.grey}">${holder.role}</text>

  <!-- Vertical rule + right-hand column. -->
  <rect x="${CX - 12}" y="26" width=".7" height="${H - 52}" fill="${colors.navy}" opacity=".45"/>
  ${line(42,  holder.company,          { size: 8.2, bold: true, ls: .15 })}
  ${line(54,  'Million Dollar Agency', { size: 7.6, italic: true, fill: colors.grey })}
  ${line(90,  'MOBILE',                { size: 4.8, sans: true, ls: 1.35, fill: colors.markGold })}
  ${line(104, holder.mobile,           { size: 11 })}

  <!-- Makers Co watermark, last so it overlays everything: full card width,
       vertically centred, at 10%. Deliberately printed over the type rather
       than tucked into a corner — this is the maker's mark on the artwork.
       The 4px inset keeps the outer M and O clear of the gold frame, which
       otherwise clips them and reads as a mistake rather than a full bleed. -->
  ${(() => {
    const inset = 4, w = W - inset * 2, h = w * watermark.aspect;
    return `<image x="${inset}" y="${((H - h) / 2).toFixed(2)}"
         width="${w}" height="${h.toFixed(2)}" opacity=".1" href="${watermark.uri}"/>`;
  })()}
</svg>`.trim();
}

/**
 * Square app icon — shown in notifications, Apple Watch and the Wallet list.
 * White stock like the card, with a gold hairline inside the tile edge: a plain
 * white square would dissolve into the light list rows on iOS, and the outline
 * is what gives it a shape there.
 *
 * There is deliberately no logo.png alongside this. Wallet draws logo.png in a
 * header bar directly above the strip, and the strip already opens with the RFS
 * lockup — shipping both stacked the same mark twice at the top of the pass.
 */
function iconSvg() {
  const { colors } = CONFIG;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="87" height="87" viewBox="0 0 87 87">
  <rect width="87" height="87" rx="15.7" fill="${colors.paper}"/>
  <rect x="1.6" y="1.6" width="83.8" height="83.8" rx="14.4" fill="none"
        stroke="${colors.paperEdge}" stroke-opacity=".55" stroke-width="1.6"/>
  ${rfsMark({ x: 17, y: 17, size: 53, stroke: 2, color: colors.navy, fontSize: 20 })}
</svg>`.trim();
}

/** QR thumbnail, kept for parity with the printed sheet's artwork. */
function buildQrPng(text, size = 480) {
  return QRCode.toBuffer(text, {
    type: 'png',
    width: size,
    margin: 1,
    color: { dark: '#1F3A6Eff', light: '#ffffffff' },  // navy on white, the card's ink
  });
}

// ---------------------------------------------------------------------------
// pass.json
// ---------------------------------------------------------------------------

function buildPassJson() {
  const { holder, colors } = CONFIG;
  return {
    formatVersion: 1,
    passTypeIdentifier: CONFIG.passTypeIdentifier,
    teamIdentifier:     CONFIG.teamIdentifier,
    organizationName:   CONFIG.organizationName,
    serialNumber:       CONFIG.serialNumber,
    description:        `${holder.name} — Digital Business Card`,

    // The card's own colours, so Wallet paints the pass body and the back-field
    // text to match the strip instead of framing it in something else.
    foregroundColor: rgbCss(colors.navy),
    backgroundColor: rgbCss(colors.paper),
    labelColor:      rgbCss(colors.grey),

    // storeCard is the only style with a strip slot. The front carries no field
    // rows at all: name, role, company and mobile are set into the strip, and
    // everything else is detail that belongs on the back. A pass with no rows is
    // also the shortest one Wallet will draw, which puts the barcode high on the
    // front and as large as Wallet renders it.
    storeCard: {
      primaryFields: [],
      secondaryFields: [],
      backFields: [
        { key: 'about',   label: 'How to use', value: 'Show the QR code on the front — scanning it opens a WhatsApp chat with Zi Jun, with a link to his digital business card already in the message.' },
        { key: 'card',    label: 'Digital Card', value: CARD_URL,        dataDetectorTypes: ['PKDataDetectorTypeLink'] },
        { key: 'whats',   label: 'WhatsApp',     value: WHATSAPP_QR,     dataDetectorTypes: ['PKDataDetectorTypeLink'] },
        // The mobile is set into the strip artwork, which is a picture — this row
        // is the tappable copy.
        { key: 'mobile',  label: 'Mobile',       value: holder.mobile,   dataDetectorTypes: ['PKDataDetectorTypePhoneNumber'] },
        { key: 'office',  label: 'Office',       value: holder.office,   dataDetectorTypes: ['PKDataDetectorTypePhoneNumber'] },
        { key: 'fax',     label: 'Fax',          value: holder.fax },
        { key: 'email',   label: 'Email',        value: holder.email,    dataDetectorTypes: ['PKDataDetectorTypeLink'] },
        { key: 'address', label: 'Address',      value: holder.address,  dataDetectorTypes: ['PKDataDetectorTypeAddress'] },
        { key: 'legal',   label: 'Company',      value: `${holder.company} (${holder.reg})` },
        { key: 'maker',   label: 'Card by',      value: 'Makers Co · Digital Business Cards' },
      ],
    },

    // Same payload as the printed QR sheet — see WHATSAPP_QR above.
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: WHATSAPP_QR,
        messageEncoding: 'iso-8859-1',
        altText: 'Scan to WhatsApp Ng Zi Jun',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  try {
    assertReadable(CONFIG.certs.wwdr,       'Apple WWDR certificate (APPLE_WWDR_CERT)');
    assertReadable(CONFIG.certs.signerCert, 'Pass signer certificate (APPLE_SIGNER_CERT)');
    assertReadable(CONFIG.certs.signerKey,  'Pass signer private key (APPLE_SIGNER_KEY)');
  } catch (err) {
    console.error('\n[cert-check] ' + err.message);
    console.error('Tip: export APPLE_WWDR_CERT / APPLE_SIGNER_CERT / APPLE_SIGNER_KEY, or drop the PEMs in certs/.');
    process.exit(1);
  }

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  const strip = await stripSvg(), icon = iconSvg();
  let images;
  try {
    // No logo.png — see iconSvg(). icon.png is the only image Wallet requires.
    const [
      strip1x, strip2x, strip3x,
      icon1x, icon2x, icon3x,
      qr,
    ] = await Promise.all([
      renderSvg(strip, CONFIG.strip.w,     CONFIG.strip.h),
      renderSvg(strip, CONFIG.strip.w * 2, CONFIG.strip.h * 2),
      renderSvg(strip, CONFIG.strip.w * 3, CONFIG.strip.h * 3),
      renderSvg(icon, 29, 29),
      renderSvg(icon, 58, 58),
      renderSvg(icon, 87, 87),
      buildQrPng(WHATSAPP_QR, 480),
    ]);
    images = {
      'strip.png': strip1x, 'strip@2x.png': strip2x, 'strip@3x.png': strip3x,
      'icon.png': icon1x,   'icon@2x.png': icon2x,   'icon@3x.png': icon3x,
      'thumbnail.png': qr,  'thumbnail@2x.png': qr,
    };
  } catch (err) {
    console.error('[assets] Failed to render pass artwork:', err.message);
    process.exit(1);
  }

  let pass;
  try {
    pass = new PKPass(
      { 'pass.json': Buffer.from(JSON.stringify(buildPassJson())), ...images },
      {
        wwdr:       fs.readFileSync(CONFIG.certs.wwdr),
        signerCert: fs.readFileSync(CONFIG.certs.signerCert),
        signerKey:  fs.readFileSync(CONFIG.certs.signerKey),
        signerKeyPassphrase: CONFIG.certs.signerKeyPass || undefined,
      },
    );
  } catch (err) {
    console.error('[pkpass] Failed to assemble pass bundle:', err.message);
    console.error('Common causes: wrong cert/key pair, expired WWDR, or a pass.json field Apple rejects.');
    process.exit(1);
  }

  let buffer;
  try {
    buffer = pass.getAsBuffer();
  } catch (err) {
    console.error('[pkpass] Failed to sign pass:', err.message);
    console.error(`Check the signer cert matches Pass Type ID "${CONFIG.passTypeIdentifier}" and the key passphrase is right.`);
    process.exit(1);
  }

  const outPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
  fs.writeFileSync(outPath, buffer);

  // The owner page (zijun-wallet-owner.html) shows the strip so the user can see
  // the pass before adding it. Writing it here rather than by hand keeps the
  // preview from drifting away from the artwork actually inside the bundle.
  const previewPath = path.resolve(__dirname, '..', 'assets', 'zijun-pass-strip.png');
  fs.writeFileSync(previewPath, images['strip@3x.png']);

  console.log(`[ok] Wrote ${outPath} (${buffer.length.toLocaleString()} bytes)`);
  console.log(`[ok] Wrote ${previewPath}`);
  console.log(`[ok] Serial: ${CONFIG.serialNumber}`);
  console.log(`[ok] QR target: ${WHATSAPP_QR}`);
}

// Exported so the preview script can render the same artwork without signing.
module.exports = { CONFIG, WHATSAPP_QR, CARD_URL, stripSvg, iconSvg, buildPassJson };

if (require.main === module) {
  main().catch(err => {
    console.error('[fatal]', err && err.stack ? err.stack : err);
    process.exit(1);
  });
}
