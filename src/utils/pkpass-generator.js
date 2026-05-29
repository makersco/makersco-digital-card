const fs = require('fs');
const path = require('path');
const { PKPass } = require('passkit-generator');
const { createCanvas } = require('canvas');

const CONFIG = {
  card: {
    name: 'Alex Morgan',
    title: 'Product Designer',
    company: 'Northwind Studio',
    phone: '+1 (415) 555-0142',
    email: 'alex@northwind.studio',
    website: 'https://northwind.studio/alex',
    cardUrl: 'https://cards.northwind.studio/alex'
  },
  pass: {
    passTypeIdentifier: 'pass.studio.northwind.card',
    teamIdentifier: process.env.APPLE_TEAM_ID || 'ABCDE12345',
    organizationName: 'Northwind Studio',
    description: 'Northwind Digital Business Card',
    serialNumber: `card-${Date.now()}`,
    formatVersion: 1
  },
  colors: {
    background: '#0b0f1a',
    foreground: '#f4f4f5',
    label: '#a1a1aa',
    accentStart: '#4f46e5',
    accentEnd: '#9333ea'
  },
  paths: {
    modelDir: path.resolve(__dirname, 'pass-model'),
    outputDir: path.resolve(__dirname, 'output'),
    outputFile: 'card.pkpass',
    signerCert: process.env.APPLE_SIGNER_CERT || path.resolve(__dirname, 'certs/signerCert.pem'),
    signerKey: process.env.APPLE_SIGNER_KEY || path.resolve(__dirname, 'certs/signerKey.pem'),
    wwdr: process.env.APPLE_WWDR_CERT || path.resolve(__dirname, 'certs/wwdr.pem'),
    signerKeyPassphrase: process.env.APPLE_SIGNER_KEY_PASSPHRASE || ''
  }
};

function hexToRgb(hex) {
  const v = hex.replace('#', '');
  return {
    r: parseInt(v.substring(0, 2), 16),
    g: parseInt(v.substring(2, 4), 16),
    b: parseInt(v.substring(4, 6), 16)
  };
}

function rgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

function buildPassJson() {
  const { card, pass, colors } = CONFIG;
  return {
    formatVersion: pass.formatVersion,
    passTypeIdentifier: pass.passTypeIdentifier,
    teamIdentifier: pass.teamIdentifier,
    organizationName: pass.organizationName,
    description: pass.description,
    serialNumber: pass.serialNumber,
    backgroundColor: rgbString(colors.background),
    foregroundColor: rgbString(colors.foreground),
    labelColor: rgbString(colors.label),
    sharingProhibited: false,
    generic: {
      primaryFields: [
        { key: 'name', label: 'NAME', value: card.name },
        { key: 'title', label: 'TITLE', value: card.title }
      ],
      secondaryFields: [
        { key: 'company', label: 'COMPANY', value: card.company },
        { key: 'phone', label: 'PHONE', value: card.phone }
      ],
      auxiliaryFields: [
        { key: 'email', label: 'EMAIL', value: card.email },
        { key: 'website', label: 'WEBSITE', value: card.website }
      ],
      backFields: [
        { key: 'cardUrl', label: 'Card Link', value: card.cardUrl },
        { key: 'about', label: 'About', value: `${card.name} — ${card.title} at ${card.company}` }
      ]
    },
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: card.cardUrl,
        messageEncoding: 'iso-8859-1',
        altText: card.cardUrl
      }
    ]
  };
}

function buildStripImage(width, height) {
  const { accentStart, accentEnd, background } = CONFIG.colors;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, accentStart);
  gradient.addColorStop(1, accentEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, 'rgba(11, 15, 26, 0.0)');
  overlay.addColorStop(1, 'rgba(11, 15, 26, 0.35)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  return canvas.toBuffer('image/png');
}

function buildIconImage(size) {
  const { accentStart, accentEnd, foreground } = CONFIG.colors;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, accentStart);
  gradient.addColorStop(1, accentEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = foreground;
  ctx.font = `700 ${Math.round(size * 0.5)}px Geist, Outfit, "DM Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = CONFIG.card.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  ctx.fillText(initials, size / 2, size / 2 + size * 0.03);

  return canvas.toBuffer('image/png');
}

function buildLogoImage(width, height) {
  const { foreground } = CONFIG.colors;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = foreground;
  ctx.font = `700 ${Math.round(height * 0.7)}px Geist, Outfit, "Space Grotesk", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(CONFIG.pass.organizationName, 8, height / 2);

  return canvas.toBuffer('image/png');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readCertOrThrow(p, label) {
  if (!fs.existsSync(p)) {
    throw new Error(
      `Missing ${label} at "${p}". Set the appropriate environment variable (APPLE_SIGNER_CERT / APPLE_SIGNER_KEY / APPLE_WWDR_CERT) or place the file at the default path.`
    );
  }
  return fs.readFileSync(p);
}

async function generatePass() {
  const { paths } = CONFIG;

  ensureDir(paths.outputDir);

  const signerCert = readCertOrThrow(paths.signerCert, 'signer certificate');
  const signerKey = readCertOrThrow(paths.signerKey, 'signer key');
  const wwdr = readCertOrThrow(paths.wwdr, 'Apple WWDR certificate');

  const passJson = buildPassJson();

  const icon = buildIconImage(29);
  const icon2x = buildIconImage(58);
  const icon3x = buildIconImage(87);
  const logo = buildLogoImage(160, 50);
  const logo2x = buildLogoImage(320, 100);
  const strip = buildStripImage(320, 84);
  const strip2x = buildStripImage(640, 168);

  const buffers = {
    'pass.json': Buffer.from(JSON.stringify(passJson, null, 2)),
    'icon.png': icon,
    'icon@2x.png': icon2x,
    'icon@3x.png': icon3x,
    'logo.png': logo,
    'logo@2x.png': logo2x,
    'strip.png': strip,
    'strip@2x.png': strip2x
  };

  const pass = new PKPass(buffers, {
    wwdr,
    signerCert,
    signerKey,
    signerKeyPassphrase: paths.signerKeyPassphrase
  });

  pass.type = 'generic';

  const stream = pass.getAsBuffer();
  const outPath = path.join(paths.outputDir, paths.outputFile);
  fs.writeFileSync(outPath, stream);
  return outPath;
}

(async () => {
  try {
    const outPath = await generatePass();
    console.log(`Pass generated: ${outPath}`);
  } catch (err) {
    console.error('Failed to generate .pkpass');
    console.error(`Reason: ${err.message}`);
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error('Install dependencies: npm install passkit-generator canvas');
    }
    if (/certificate|key|pem/i.test(err.message)) {
      console.error(
        'Check your Apple Developer certificates. Required env vars: APPLE_TEAM_ID, APPLE_SIGNER_CERT, APPLE_SIGNER_KEY, APPLE_WWDR_CERT, APPLE_SIGNER_KEY_PASSPHRASE (optional).'
      );
    }
    process.exit(1);
  }
})();