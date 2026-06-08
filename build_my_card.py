#!/usr/bin/env python3
"""
build_my_card.py
Generates Wong Soon Fook's personal digital business card.
Dark-luxury gold design (mock-2-restaurant-fnb style) +
all glassmorphism features + Apple Wallet modal.

Run:  python3 build_my_card.py
Output: src/cards/wong-soonfook.html
"""

import os, textwrap

OUT_DIR  = os.path.join(os.path.dirname(__file__), "src", "cards")
OUT_FILE = os.path.join(OUT_DIR, "wong-soonfook.html")
os.makedirs(OUT_DIR, exist_ok=True)

# ─── Personal data ────────────────────────────────────────────────────────────
CONFIG = {
    "name":          "Wong Soon Fook",
    "initials":      "WSF",
    "title":         "Founder & Digital Builder",
    "company":       "MakersCo",
    "phone":         "+60192953528",
    "phone_display": "+60 19-295 3528",
    "email":         "soonfookwong96@gmail.com",
    "website":       "https://makersco.github.io/Makers-Co-Website/",
    "website_short": "Makers-Co-Website",
    "location":      "Malaysia",
    "wa_message":    "Hi Soon Fook, I found your digital card and would like to connect!",
    "social": {
        "linkedin":  "",
        "instagram": "",
        "github":    "https://github.com/makersco",
        "twitter":   "",
    },
    "custom_links": [
        {"icon": "🚀", "label": "Visit My Portfolio", "url": "https://makersco.github.io/Makers-Co-Website/"},
    ],
    "booking_url": "",
    "maps_url":    "https://maps.google.com/?q=Malaysia",
}

# ─── HTML ─────────────────────────────────────────────────────────────────────
HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="description" content="{CONFIG['name']} — {CONFIG['title']} at {CONFIG['company']} | Digital Business Card"/>
<title>{CONFIG['name']} — Digital Card</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
:root{{
  --gold:#C9A96E;
  --gold-light:#E2C99A;
  --gold-dark:#A07840;
  --gold-glow:rgba(201,169,110,.18);
  --gold-border:rgba(201,169,110,.22);
  --dark:#0A0603;
  --dark-mid:#110C05;
  --surface:#1A1008;
  --surface2:#221505;
  --text:#F0E6D3;
  --text2:rgba(240,230,211,.65);
  --text3:rgba(240,230,211,.35);
}}
body{{
  font-family:'Inter',sans-serif;
  background:var(--dark);
  color:var(--text);
  min-height:100vh;
  display:flex;flex-direction:column;align-items:center;
  padding:40px 20px 80px;
  -webkit-font-smoothing:antialiased;
}}

/* ── Ambient glow ── */
body::before{{
  content:'';position:fixed;top:0;left:0;right:0;height:50vh;
  background:radial-gradient(ellipse at 50% -10%,rgba(201,169,110,.06) 0%,transparent 70%);
  pointer-events:none;z-index:0;
}}

/* ── Sticky banner ── */
.banner{{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:linear-gradient(90deg,#0A0603,#1A1008,#0A0603);
  border-bottom:1px solid var(--gold-border);
  padding:8px 20px;text-align:center;
  font-size:11px;font-weight:500;letter-spacing:.08em;
  color:var(--text2);
}}
.banner span{{color:var(--gold)}}

/* ── Card flip ── */
.card-wrap{{
  width:360px;height:220px;
  perspective:1200px;
  cursor:pointer;
  margin:50px auto 12px;
  flex-shrink:0;
  position:relative;z-index:1;
}}
.card-inner{{
  width:100%;height:100%;
  position:relative;
  transform-style:preserve-3d;
  transition:transform .65s cubic-bezier(.22,.61,.36,1);
}}
.card-inner.flipped{{transform:rotateY(180deg)}}
.card-face{{
  position:absolute;top:0;left:0;
  width:100%;height:100%;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;
  border-radius:18px;
  overflow:hidden;
}}

/* ── Front face ── */
.card-front{{
  background:linear-gradient(135deg,#1A1008 0%,#221505 40%,#2A1C0A 100%);
  border:1px solid var(--gold-border);
  box-shadow:0 24px 60px rgba(0,0,0,.7),0 0 40px rgba(201,169,110,.04);
  display:flex;flex-direction:column;justify-content:space-between;
  padding:20px 22px;
  position:relative;
}}
/* Art deco corner accent */
.card-front::before{{
  content:'';position:absolute;top:0;right:0;
  width:56px;height:56px;
  border-top:1px solid var(--gold-border);
  border-right:1px solid var(--gold-border);
  border-radius:0 18px 0 0;pointer-events:none;
}}
/* Bottom shimmer line */
.card-front::after{{
  content:'';position:absolute;bottom:0;left:10%;right:10%;height:1px;
  background:linear-gradient(90deg,transparent,var(--gold-dark),var(--gold),var(--gold-dark),transparent);
  opacity:.5;pointer-events:none;
}}
.front-top{{display:flex;justify-content:space-between;align-items:flex-start}}
.monogram{{
  width:38px;height:38px;border-radius:10px;
  background:linear-gradient(135deg,var(--gold-dark),var(--gold));
  color:var(--dark);font-size:12px;font-weight:700;
  letter-spacing:.04em;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}}
.front-badge{{
  font-size:9px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;
  color:var(--text3);border:1px solid var(--gold-border);
  padding:3px 10px;border-radius:20px;
  background:rgba(201,169,110,.05);
}}
.front-bottom{{display:flex;flex-direction:column;gap:3px}}
.card-name{{
  font-family:'Playfair Display',serif;
  font-size:21px;font-weight:600;line-height:1.15;
  background:linear-gradient(90deg,var(--gold-dark),var(--gold),var(--gold-light));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}}
.gold-rule{{width:24px;height:1px;background:var(--gold);margin:5px 0;opacity:.6}}
.card-title{{font-size:11px;font-weight:300;color:var(--text2);letter-spacing:.02em;font-style:italic}}
.card-company{{font-size:9px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-top:2px}}

/* ── Back face ── */
.card-back{{
  background:linear-gradient(135deg,#110C05 0%,#1A1008 100%);
  border:1px solid var(--gold-border);
  box-shadow:0 24px 60px rgba(0,0,0,.7);
  transform:rotateY(180deg);
  display:flex;flex-direction:column;justify-content:space-between;
  padding:16px 20px;
}}
.back-header{{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px}}
.back-label{{font-size:8px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--text3)}}
.back-monogram{{font-family:'Playfair Display',serif;font-size:12px;color:var(--gold);letter-spacing:.06em}}
.back-contacts{{display:flex;flex-direction:column;gap:7px;flex:1;justify-content:center}}
.c-row{{display:flex;align-items:center;gap:10px}}
.c-dot{{width:4px;height:4px;border-radius:50%;background:var(--gold);flex-shrink:0;opacity:.6}}
.c-info{{display:flex;flex-direction:column}}
.c-key{{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3)}}
.c-val{{font-size:11px;color:var(--text2)}}
.c-val a{{color:inherit;text-decoration:none}}
.back-divider{{height:1px;background:var(--gold-border);opacity:.5}}
.back-note{{font-size:9px;font-style:italic;color:var(--text3);letter-spacing:.02em}}
.back-flip-btn{{
  align-self:flex-end;
  font-size:10px;font-weight:600;letter-spacing:.08em;
  color:var(--gold);opacity:.7;
  background:none;border:none;cursor:pointer;padding:0;
  display:flex;align-items:center;gap:4px;
}}
.back-flip-btn:hover{{opacity:1}}

/* ── Flip hint ── */
.flip-hint{{
  font-size:10px;color:var(--text3);text-align:center;
  letter-spacing:.06em;margin-bottom:20px;
  position:relative;z-index:1;
}}

/* ── Info panel ── */
.info-panel{{
  width:360px;margin:0 auto 12px;
  background:var(--surface);
  border:1px solid var(--gold-border);
  border-radius:14px;padding:14px 18px;
  display:flex;flex-direction:column;
  position:relative;z-index:1;
}}
.info-row{{display:flex;align-items:center;gap:12px;padding:8px 0}}
.info-row+.info-row{{border-top:1px solid rgba(201,169,110,.08)}}
.info-icon{{
  width:30px;height:30px;border-radius:9px;
  background:rgba(201,169,110,.08);
  border:1px solid rgba(201,169,110,.15);
  display:flex;align-items:center;justify-content:center;
  font-size:13px;flex-shrink:0;
}}
.info-key{{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:2px}}
.info-val{{font-size:12px;color:var(--text2)}}
.info-val a{{color:inherit;text-decoration:none}}
.info-val a:hover{{color:var(--gold-light)}}

/* ── Buttons ── */
.actions{{width:360px;margin:0 auto;display:flex;flex-direction:column;gap:9px;position:relative;z-index:1}}
.btn{{
  width:100%;height:48px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;gap:8px;
  font-family:'Inter',sans-serif;
  font-size:14px;font-weight:600;letter-spacing:.01em;
  cursor:pointer;border:none;text-decoration:none;
  transition:transform .15s,opacity .15s,box-shadow .15s;
}}
.btn:hover{{transform:translateY(-1px);opacity:.92}}
.btn:active{{transform:scale(.98)}}
.btn-gold{{
  background:linear-gradient(135deg,var(--gold-dark),var(--gold));
  color:var(--dark);
  box-shadow:0 4px 20px rgba(201,169,110,.25);
}}
.btn-wa{{background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.28);color:#25d366}}
.btn-wallet{{
  background:rgba(0,0,0,.4);
  border:1px solid rgba(255,255,255,.15);
  color:var(--text);
  position:relative;overflow:hidden;
}}
.btn-wallet::before{{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.04),transparent);
  pointer-events:none;
}}
.btn-outline{{background:var(--surface);border:1px solid var(--gold-border);color:var(--text2)}}
.share-row{{display:flex;gap:8px}}
.share-row .btn{{font-size:12px;height:42px}}

/* ── QR section ── */
.qr-section{{
  width:360px;margin:12px auto 0;
  background:var(--surface);border:1px solid var(--gold-border);
  border-radius:14px;padding:14px 18px;
  display:flex;align-items:center;gap:14px;
  position:relative;z-index:1;
}}
.qr-box{{
  width:64px;height:64px;
  background:#fff;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;flex-shrink:0;
}}
.qr-text h4{{font-family:'Playfair Display',serif;font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px}}
.qr-text p{{font-size:10px;color:var(--text3);line-height:1.5;font-style:italic}}

/* ── Phase 4 Extras ── */
.extras-section{{
  width:360px;margin:10px auto 0;
  display:flex;flex-direction:column;gap:9px;
  position:relative;z-index:1;
}}
.social-row{{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding:4px 0}}
.social-btn{{
  width:40px;height:40px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  text-decoration:none;border:1px solid var(--gold-border);
  background:rgba(201,169,110,.07);
  color:var(--gold);
  cursor:pointer;transition:transform .15s,opacity .15s,background .15s;
}}
.social-btn:hover{{transform:translateY(-2px);background:rgba(201,169,110,.15)}}
.social-btn svg{{width:18px;height:18px}}
.extra-btn{{
  width:100%;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;gap:8px;
  font-size:13px;font-weight:600;font-family:'Inter',sans-serif;
  text-decoration:none;cursor:pointer;border:none;
  background:rgba(201,169,110,.08);border:1px solid var(--gold-border);
  color:var(--gold);
  transition:transform .15s,opacity .15s;
}}
.extra-btn:hover{{transform:translateY(-1px);background:rgba(201,169,110,.14)}}
.extra-btn:active{{transform:scale(.98)}}

/* ── Apple Wallet modal ── */
.modal-overlay{{
  position:fixed;inset:0;background:rgba(0,0,0,.75);
  display:flex;align-items:center;justify-content:center;
  z-index:200;padding:20px;
  opacity:0;pointer-events:none;transition:opacity .25s;
}}
.modal-overlay.open{{opacity:1;pointer-events:all}}
.modal-box{{
  background:var(--surface);
  border:1px solid var(--gold-border);
  border-radius:20px;padding:28px 24px 24px;
  max-width:360px;width:100%;
  position:relative;
  box-shadow:0 32px 80px rgba(0,0,0,.8);
}}
.modal-close{{
  position:absolute;top:14px;right:14px;
  width:30px;height:30px;border-radius:50%;
  background:rgba(201,169,110,.08);
  border:1px solid var(--gold-border);
  color:var(--gold);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:14px;
}}
.modal-icon{{font-size:2.8rem;text-align:center;margin-bottom:14px}}
.modal-title{{font-family:'Playfair Display',serif;font-size:1.3rem;text-align:center;color:var(--text);margin-bottom:8px}}
.modal-sub{{font-size:12px;color:var(--text2);text-align:center;line-height:1.6;margin-bottom:18px}}
.modal-features{{
  background:rgba(201,169,110,.06);border:1px solid var(--gold-border);
  border-radius:12px;padding:16px;margin-bottom:20px;
  display:flex;flex-direction:column;gap:10px;
}}
.modal-feat{{display:flex;align-items:flex-start;gap:10px}}
.modal-feat-icon{{color:var(--gold);font-size:12px;margin-top:1px;flex-shrink:0}}
.modal-feat-text{{font-size:12px;color:var(--text2);line-height:1.5}}
.modal-divider{{height:1px;background:var(--gold-border);opacity:.4;margin-bottom:16px}}
.modal-note{{font-size:11px;color:var(--text3);text-align:center;font-style:italic;margin-bottom:16px}}

/* ── Toast ── */
.toast{{
  position:fixed;bottom:24px;left:50%;
  transform:translateX(-50%) translateY(60px);
  background:var(--surface2);border:1px solid var(--gold-border);
  color:var(--text);padding:9px 22px;
  border-radius:24px;font-size:13px;font-weight:600;
  transition:transform .25s cubic-bezier(.34,1.56,.64,1);
  pointer-events:none;white-space:nowrap;z-index:999;
}}
.toast.show{{transform:translateX(-50%) translateY(0)}}

/* ── Powered by footer ── */
.powered{{
  width:360px;margin:24px auto 0;
  text-align:center;font-size:10px;color:var(--text3);
  letter-spacing:.06em;
  position:relative;z-index:1;
}}
.powered span{{color:var(--gold);opacity:.8}}

@media(max-width:400px){{
  .card-wrap,.info-panel,.actions,.qr-section,.extras-section,.powered{{width:100%!important}}
}}
</style>
</head>
<body>

<!-- Sticky banner -->
<div class="banner">
  ✦ &nbsp;Digital Business Card by&nbsp;<span>Makers Co</span>&nbsp; · &nbsp;soonfookwong96@gmail.com&nbsp; ✦
</div>

<!-- Apple Wallet modal -->
<div class="modal-overlay" id="walletModal">
  <div class="modal-box">
    <button class="modal-close" onclick="closeWalletModal()">✕</button>
    <div class="modal-icon">📲</div>
    <div class="modal-title">Apple Wallet Ready</div>
    <div class="modal-sub">
      This digital card supports <strong style="color:var(--gold)">Apple Wallet Pass (.pkpass)</strong> integration.
      Add it to your iPhone Wallet — always one swipe away.
    </div>
    <div class="modal-features">
      <div class="modal-feat">
        <div class="modal-feat-icon">✦</div>
        <div class="modal-feat-text">Contact info always in your pocket — no app needed</div>
      </div>
      <div class="modal-feat">
        <div class="modal-feat-icon">✦</div>
        <div class="modal-feat-text">Push updates when details change</div>
      </div>
      <div class="modal-feat">
        <div class="modal-feat-icon">✦</div>
        <div class="modal-feat-text">NFC tap-to-share on compatible iPhone & Apple Watch</div>
      </div>
    </div>
    <div class="modal-divider"></div>
    <div class="modal-note">Wallet Pass is generated &amp; signed by Makers Co for your card</div>
    <a href="https://wa.me/60192953528?text=Hi+Soon+Fook!+I+want+to+add+your+digital+card+to+Apple+Wallet."
       target="_blank" class="btn btn-gold" style="text-decoration:none;width:100%">
      💬 Enquire About Wallet Pass
    </a>
  </div>
</div>

<!-- Card -->
<div class="card-wrap" id="cardWrap">
  <div class="card-inner" id="cardInner">

    <!-- Front -->
    <div class="card-face card-front">
      <div class="front-top">
        <div class="monogram">WSF</div>
        <div class="front-badge">MakersCo</div>
      </div>
      <div class="front-bottom">
        <div class="card-name">Wong Soon Fook</div>
        <div class="gold-rule"></div>
        <div class="card-title">Founder &amp; Digital Builder</div>
        <div class="card-company">Makers Co · Malaysia</div>
      </div>
    </div>

    <!-- Back -->
    <div class="card-face card-back">
      <div class="back-header">
        <div class="back-label">Contact</div>
        <div class="back-monogram">WSF</div>
      </div>
      <div class="back-contacts">
        <div class="c-row">
          <div class="c-dot"></div>
          <div class="c-info">
            <div class="c-key">Phone</div>
            <div class="c-val"><a href="tel:+60192953528">+60 19-295 3528</a></div>
          </div>
        </div>
        <div class="c-row">
          <div class="c-dot"></div>
          <div class="c-info">
            <div class="c-key">Email</div>
            <div class="c-val"><a href="mailto:soonfookwong96@gmail.com">soonfookwong96@gmail.com</a></div>
          </div>
        </div>
        <div class="c-row">
          <div class="c-dot"></div>
          <div class="c-info">
            <div class="c-key">Website</div>
            <div class="c-val"><a href="https://makersco.github.io/Makers-Co-Website/" target="_blank" rel="noopener">Makers-Co-Website</a></div>
          </div>
        </div>
      </div>
      <div class="back-divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <div class="back-note">Building digital tools for Malaysian SMEs</div>
        <button class="back-flip-btn" onclick="event.stopPropagation();flipCard()">← Flip</button>
      </div>
    </div>

  </div>
</div>

<div class="flip-hint">Tap card to flip</div>

<!-- Info panel -->
<div class="info-panel">
  <div class="info-row">
    <div class="info-icon">📱</div>
    <div>
      <div class="info-key">WhatsApp</div>
      <div class="info-val"><a href="https://wa.me/60192953528?text=Hi+Soon+Fook%2C+I+found+your+digital+card+and+would+like+to+connect!" target="_blank" rel="noopener">+60 19-295 3528</a></div>
    </div>
  </div>
  <div class="info-row">
    <div class="info-icon">✉️</div>
    <div>
      <div class="info-key">Email</div>
      <div class="info-val"><a href="mailto:soonfookwong96@gmail.com">soonfookwong96@gmail.com</a></div>
    </div>
  </div>
  <div class="info-row">
    <div class="info-icon">🌐</div>
    <div>
      <div class="info-key">Website</div>
      <div class="info-val"><a href="https://makersco.github.io/Makers-Co-Website/" target="_blank" rel="noopener">Makers-Co-Website</a></div>
    </div>
  </div>
  <div class="info-row">
    <div class="info-icon">📍</div>
    <div>
      <div class="info-key">Location</div>
      <div class="info-val"><a href="https://maps.google.com/?q=Malaysia" target="_blank" rel="noopener">Malaysia</a></div>
    </div>
  </div>
</div>

<!-- Action buttons -->
<div class="actions">
  <button class="btn btn-gold" onclick="saveContact()">💾 Save to Contacts</button>
  <button class="btn btn-wa" onclick="openWhatsApp()">💬 Chat on WhatsApp</button>

  <!-- Apple Wallet button -->
  <button class="btn btn-wallet" id="walletBtn" onclick="handleWalletBtn()">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="16" rx="3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 10h20" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
    </svg>
    Add to Apple Wallet
  </button>

  <div class="share-row">
    <button class="btn btn-outline" onclick="copyLink()">🔗 Copy Link</button>
    <button class="btn btn-outline" onclick="shareCard()">↗ Share</button>
  </div>
</div>

<!-- Extras: GitHub social + portfolio link -->
<div class="extras-section">
  <div class="social-row" id="socialRow"></div>
  <a href="https://makersco.github.io/Makers-Co-Website/" target="_blank" rel="noopener" class="extra-btn">
    🚀 Visit My Portfolio
  </a>
</div>

<!-- QR code -->
<div class="qr-section">
  <div class="qr-box"><div id="qrCode"></div></div>
  <div class="qr-text">
    <h4>Scan to Connect</h4>
    <p>Point your camera at the QR to open this card instantly on any device</p>
  </div>
</div>

<!-- Powered by -->
<div class="powered">
  Powered by <span>Makers Co</span> · Digital Business Cards
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
// ── Config ──────────────────────────────────────────────────────────────────
const CONFIG = {{
  name:          "Wong Soon Fook",
  initials:      "WSF",
  title:         "Founder & Digital Builder",
  company:       "MakersCo",
  phone:         "+60192953528",
  phone_display: "+60 19-295 3528",
  email:         "soonfookwong96@gmail.com",
  website:       "https://makersco.github.io/Makers-Co-Website/",
  location:      "Malaysia",
  wa_message:    "Hi Soon Fook, I found your digital card and would like to connect!",
  social: {{
    github: "https://github.com/makersco",
    linkedin: "",
    instagram: "",
    twitter: ""
  }}
}};
window.CONFIG = CONFIG;

// ── Flip ────────────────────────────────────────────────────────────────────
function flipCard() {{
  document.getElementById('cardInner').classList.toggle('flipped');
}}
document.getElementById('cardWrap').addEventListener('click', flipCard);

// ── QR Code ─────────────────────────────────────────────────────────────────
new QRCode(document.getElementById('qrCode'), {{
  text: window.location.href,
  width: 64, height: 64,
  colorDark: "#000000", colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.M
}});

// ── vCard ────────────────────────────────────────────────────────────────────
function saveContact() {{
  const vcf = [
    'BEGIN:VCARD','VERSION:3.0',
    `FN:${{CONFIG.name}}`,
    `N:${{CONFIG.name.split(' ').slice(-1)[0]}};${{CONFIG.name.split(' ')[0]}};;;`,
    `ORG:${{CONFIG.company}}`,
    `TITLE:${{CONFIG.title}}`,
    `TEL;TYPE=CELL:${{CONFIG.phone}}`,
    `EMAIL:${{CONFIG.email}}`,
    `URL:${{CONFIG.website}}`,
    `ADR;TYPE=WORK:;;;${{CONFIG.location}};;;`,
    `NOTE:Building digital tools for Malaysian SMEs`,
    'END:VCARD'
  ].join('\\r\\n');
  const a = Object.assign(document.createElement('a'), {{
    href: URL.createObjectURL(new Blob([vcf], {{type:'text/vcard'}})),
    download: `${{CONFIG.name.replace(/\\s+/g,'-')}}.vcf`
  }});
  a.click();
  showToast('Contact saved! ✓');
}}

// ── WhatsApp ─────────────────────────────────────────────────────────────────
function openWhatsApp() {{
  window.open(`https://wa.me/${{CONFIG.phone.replace(/\\D/g,'')}}?text=${{encodeURIComponent(CONFIG.wa_message)}}`, '_blank');
}}

// ── Copy / Share ──────────────────────────────────────────────────────────────
function copyLink() {{
  navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copied! 🔗'));
}}
function shareCard() {{
  if (navigator.share) {{
    navigator.share({{
      title: CONFIG.name,
      text: `${{CONFIG.title}} · ${{CONFIG.company}}`,
      url: window.location.href
    }});
  }} else {{
    copyLink();
  }}
}}

// ── Apple Wallet ─────────────────────────────────────────────────────────────
// Set PKPASS_URL to your hosted .pkpass file to make the button functional.
// Leave empty ("") to show info modal instead.
const PKPASS_URL = "";  // e.g. "./wong-soonfook.pkpass" or walletpasses.io URL

function handleWalletBtn() {{
  if (PKPASS_URL) {{
    const a = document.createElement('a');
    a.href = PKPASS_URL;
    a.download = "wong-soonfook.pkpass";
    a.click();
    showToast('Opening Apple Wallet… 🍎');
  }} else {{
    openWalletModal();
  }}
}}
function openWalletModal() {{
  document.getElementById('walletModal').classList.add('open');
}}
function closeWalletModal() {{
  document.getElementById('walletModal').classList.remove('open');
}}
document.getElementById('walletModal').addEventListener('click', function(e) {{
  if (e.target === this) closeWalletModal();
}});

// ── Social icons ─────────────────────────────────────────────────────────────
const SOCIAL_ICONS = {{
  github: {{
    label: 'GitHub',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
  }},
  linkedin: {{
    label: 'LinkedIn',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
  }},
  instagram: {{
    label: 'Instagram',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
  }},
  twitter: {{
    label: 'X / Twitter',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
  }}
}};

// Render only non-empty social links
(function() {{
  const row = document.getElementById('socialRow');
  const social = CONFIG.social || {{}};
  let hasAny = false;
  Object.entries(SOCIAL_ICONS).forEach(([key, meta]) => {{
    const url = social[key];
    if (!url) return;
    hasAny = true;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'social-btn';
    a.title = meta.label;
    a.innerHTML = meta.svg;
    row.appendChild(a);
  }});
  if (!hasAny) row.style.display = 'none';
}})();

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {{
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}}
</script>
</body>
</html>"""

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write(HTML)

print(f"Card generated: {OUT_FILE}")
print(f"Open with:  open \"{OUT_FILE}\"")
