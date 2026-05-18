# MakersCo Digital Business Card Platform — Build Plan
Updated: 2026-05-17 | Target: 1 Week (Phases 1–5 per original docx — Phase 6 Analytics removed)

---

## GROUND RULES

### Rule 1 — Daily Token Resume Tracker
Every script writes a checkpoint.json after each completed step.
If Opus tokens run out mid-session:
  - Script detects exhaustion, saves progress, sleeps
  - On next run, reads checkpoint.json, skips completed steps
  - Detects token reset when: date changes OR token count drops back to 0
  - Resumes automatically from where it stopped
  - Token file: /tmp/makersco_card_tokens_{date}.txt (separate from ecommerce bot)

### Rule 2 — Model Architecture
  - Planning & spec writing → Claude Opus 4.7 (creative, strategic, uses Pro plan CLI)
  - HTML building → Claude Sonnet (latest) (cheaper, excellent at code, uses Pro plan CLI)
  - Fallback for both → local Ollama qwen3:8b if CLI unavailable
  - Qwen is NEVER used for primary work — only true last resort fallback

### Rule 3 — Private GitHub Repo
  - Repo is PRIVATE: github.com/lousycoder96/makersco-digital-card
  - Do NOT publish or make public until owner decides
  - Phase 6 (Analytics) REMOVED from week 1 — descoped, add in Month 2
  - Phase 4 (Interactive Elements) KEPT — social links, gallery, video, custom buttons
  - Firebase config stored in .env.local (gitignored)

### Rule 4 — Customer Dashboard
  - Single HTML file: customer-dashboard.html
  - Shows features as benefits, NOT technical details
  - 3 pricing tiers: Starter (single) · Business (5–20) · Enterprise (100+)
  - Malaysian Ringgit pricing (RM)
  - Never reveals: Firebase, API keys, how it works internally
  - CTA: WhatsApp enquiry (pre-filled message per plan)
  - Offline + online features clearly labelled per tier

---

## MODEL USAGE PER SESSION

| Task | Model | Est. Tokens | CLI Command |
|---|---|---|---|
| Planning each phase | Opus 4.7 | ~3K | claude -p prompt --model claude-opus-4-7 |
| Writing build spec | Opus 4.7 | ~4K | claude -p prompt --model claude-opus-4-7 |
| Building each HTML | Sonnet | ~5K | claude -p prompt --model claude-sonnet-4-5 |
| Fallback (no tokens) | Ollama qwen3:8b | 0 (free) | Ollama API |

Full week build estimate: ~120K tokens (Opus ~40K + Sonnet ~80K)
Daily safe limit: 30K tokens/day across 4 days

---

## WEEK PLAN — 6 DAYS

| Day | Phase | Output |
|---|---|---|
| Day 1 | Phase 1 — Core Web Card | card-core.html · vCard · QR |
| Day 2 | Phase 2 — Wallet & Exports | Apple Wallet · Google Wallet · PDF |
| Day 3 | Phase 3 — Design & Customization | 5 templates · brand colors · dark mode |
| Day 4 | Phase 4 — Interactive Elements | Social links · gallery · video · custom buttons |
| Day 5 | Phase 5 — Sharing & Distribution | Email sig · PWA · Zoom BG · NFC URL |
| Day 6 | Dashboard + Integration | customer-dashboard.html · Firebase setup |

---

## PHASE 1 — Core Web Card
Day 1 | Model: Opus plans → Sonnet builds | Tokens: ~12K

### What gets built
- card-core.html — self-contained, zero external dependencies at load time
- Profile section: photo, name, title, company, bio, pronouns
- Contact buttons: Call · Email · WhatsApp (with pre-filled message)
- Flip animation: CSS 3D rotateY, spring physics cubic-bezier(0.34,1.56,0.64,1)
  Both faces: position:absolute; top:0; left:0; width:100%; height:100% (flip bug prevention)
- Save Contact (.vcf vCard download) — opens phone contacts directly
- QR code: qrcode.js (loaded inline as base64 script, no CDN call)
- Share panel: Copy link · WhatsApp share · SMS share
- Mobile-first: 100vw, touch-friendly 44px tap targets
- Offline-ready: no external fonts at load (system font stack first load)

### Card data structure (JSON config at top of HTML)
```json
{
  "name": "Ahmad Faris bin Razak",
  "title": "Founder & CEO",
  "company": "Pixel Reka Sdn Bhd",
  "phone": "+60123456789",
  "email": "faris@pixelreka.com.my",
  "website": "pixelreka.com.my",
  "location": "Kuala Lumpur, Malaysia",
  "bio": "Building digital solutions for Malaysian SMEs",
  "pronouns": "He/Him",
  "photo": "data:image/jpeg;base64,...",
  "color": "#6366f1",
  "style": "dark-luxury",
  "whatsapp_message": "Hi Faris, I found your digital card!"
}
```

### Delivery formats unlocked
- Web page (URL link) ✅
- QR code (auto-generated from URL) ✅
- vCard (.vcf) download ✅
- iMessage / WhatsApp contact card ✅

### Files
- src/templates/card-core.html
- src/utils/vcard-generator.js (inline)
- src/utils/qr-generator.js (qrcode.js bundled inline)
- src/utils/share-utils.js (inline)

### Checkpoint key: "phase1-core-card"

---

## PHASE 2 — Wallet & Contact Exports
Day 2 | Model: Opus plans → Sonnet builds | Tokens: ~15K

### What gets built

#### Apple Wallet (.pkpass)
- Node.js signing script (passkit-generator npm, free)
- Pass fields: name, title, company, phone, email, QR strip
- Requires: Apple Developer account + Pass Type ID cert (user's responsibility)
- Output: signed .pkpass bundle, downloadable from card
- Auto-appears on Apple Watch once saved to Wallet

#### Google Wallet Pass
- Google Wallet API (free for generic passes)
- JWT-signed pass object
- Same data as Apple Wallet
- Share via Google Pay / Wallet app

#### PDF Export (client-side, zero cost)
- html2canvas (captures card DOM) + jsPDF (converts to PDF)
- Standard business card: 85mm × 54mm
- Clickable links preserved in PDF
- Brand colors + fonts from card config
- Download button on card

#### QR Code Export
- PNG download (qrcode.js toDataURL)
- SVG download (qrcode.js raw SVG string)
- High-res 1024×1024 for print
- Customisable colors matching card accent

### Delivery formats unlocked
- Apple Wallet (.pkpass) ✅
- Google Wallet ✅
- PDF (print-ready) ✅
- QR export PNG + SVG ✅
- Apple Watch (automatic via Wallet) ✅

### Files
- src/utils/pkpass-generator.js (Node.js server)
- src/utils/google-wallet-pass.js
- src/utils/pdf-export.js (html2canvas + jsPDF)
- src/utils/qr-export.js (PNG + SVG)
- src/components/export-panel.html (UI for all exports)

### Checkpoint key: "phase2-wallet-exports"

---

## PHASE 3 — Design System (5 Templates)
Day 3 | Model: Opus plans all 5 → Sonnet builds each | Tokens: ~35K

### What gets built
5 complete HTML templates, each self-contained, sharing the same card JSON config.
Opus plans each template with exact CSS values. Sonnet executes each one.

#### Template 1: dark-luxury
- Background: #0a0a0a · Font: Cormorant Garamond (serif, 300/600/700)
- Card: linear-gradient(135deg,#1a1a1a,#0d0d0d) · Border: #C9A96244
- Accent gold: #C9A962 · Thin art-deco rule lines
- Feel: Law firm, corporate executive, financial advisor

#### Template 2: glassmorphism
- Background: radial mesh #0f0c29 → #302b63
- Card: rgba(255,255,255,0.08) · backdrop-filter:blur(20px)
- Border: rgba(255,255,255,0.18) · Font: DM Sans
- Feel: Tech startup, SaaS founder, creative agency

#### Template 3: neo-brutalist
- Background: cream #FFFBF0 · Font: Space Grotesk (700/800)
- Card front: accent color · border: 3px solid #000 · shadow: 4px 4px 0 #000
- No border-radius · Loud typography · Feel: Creative freelancer, designer, artist

#### Template 4: vibrant-bold
- Background: dark #0d0d0d · Font: Outfit (300/800)
- Card: gradient of accent color · glow box-shadow
- Large hero name 22px/800 · Feel: F&B, retail, fitness coach

#### Template 5: minimal-clean
- Background: #FAFAFA (light) · Font: Inter (300/400/600)
- Card: white · border: 1px solid #E5E7EB · subtle shadow
- Color accent used only for CTA · Feel: Doctor, educator, consultant

### Theme Engine
- All 5 templates use CSS custom properties:
  --color-accent, --color-bg, --color-surface, --color-text, --font-primary
- Switching template = swapping a CSS class on <body>
- No JavaScript framework needed
- Google Fonts loaded async (non-render-blocking)

### Files
- src/templates/card-dark-luxury.html
- src/templates/card-glassmorphism.html
- src/templates/card-neo-brutalist.html
- src/templates/card-vibrant-bold.html
- src/templates/card-minimal-clean.html
- src/components/theme-engine.js

### Checkpoint key: "phase3-design-system"

---

## PHASE 4 — Interactive Elements
Day 4 | Model: Opus plans → Sonnet builds | Tokens: ~20K

### What gets built
Card becomes a mini-website, not just contact info.
Everything here is optional — card owner toggles what to show.

#### Social Media Links
- Platforms: LinkedIn · Instagram · Facebook · Twitter/X · TikTok · YouTube · Pinterest
- Each as a branded icon button row below card
- Starter: up to 3 · Business: up to 10 · Enterprise: unlimited
- Icons: inline SVG (no CDN needed)

#### Custom Link Buttons
- Unlimited configurable buttons: {label, url, icon, color}
- Use cases: portfolio, pricing page, booking, PDF download, Shopee store
- Stored in CONFIG.custom_links array
- Renders as pill buttons with custom accent color per button

#### Image Gallery / Portfolio
- Max 5 images, Firebase Storage (free tier covers this)
- Tap to expand to full-screen lightbox (CSS only, no JS library)
- Caption per image
- Lazy loaded (IntersectionObserver)

#### Embedded Video
- YouTube or Vimeo URL stored in CONFIG
- Renders as thumbnail preview with play button overlay
- Tap → expands to full iframe (nocookie domain)
- Does not autoplay (respects user intent)

#### Calendly / Booking Button
- CONFIG.booking_url → renders as "Book a Meeting" CTA button
- Opens in new tab
- Styled to match card accent color

#### Location Map Link
- CONFIG.location + CONFIG.maps_url → "Get Directions" button
- Opens Google Maps deep link
- Shows city/area text below button

### Files
- src/components/social-links.js
- src/components/custom-links.js
- src/components/gallery.js
- src/components/video-embed.js

### Checkpoint key: "phase4-interactive"

---

## PHASE 5 — Sharing & Distribution
Day 4 | Model: Opus plans → Sonnet builds | Tokens: ~20K

### What gets built

#### Email Signature Generator
- 600px HTML table (email client safe: no flexbox, no grid)
- Profile photo: 60×60px circle
- Name · title · company in clean type
- Icon row: phone · email · website · LinkedIn · WhatsApp
- QR thumbnail: 80×80px linking to full card
- "View My Digital Card →" branded CTA button
- Output: copy-paste HTML for Gmail / Outlook / Apple Mail
- Preview: live render in browser before copy

#### PWA (Progressive Web App)
- manifest.json: name, icons, theme_color, display:standalone
- service-worker.js: cache card HTML + assets for offline
- Add to Home Screen prompt on iOS Safari + Android Chrome
- App icons: 192×192 + 512×512 maskable
- Works offline after first visit

#### Zoom / Google Meet Background
- Canvas API: 1920×1080px PNG generation
- Layout: left 2/3 = branding / right 1/3 = QR + contact
- Colors match card accent
- "Scan to connect" label below QR
- Download as PNG button

#### NFC-Ready URL
- Clean short URL formatter: yoursite.com/c/{slug}
- Instructions: how to encode onto NFC sticker/ring/card
- No hardware sold — just the URL for any NFC writer app

#### Share Panel (full)
- WhatsApp · Telegram · SMS · Email (pre-filled links)
- Copy link to clipboard
- Native Web Share API (mobile: opens OS share sheet)
- Custom URL slug display

#### Open Graph Meta Tags
- og:title · og:description · og:image (card screenshot) · og:url
- Twitter Card: summary_large_image
- Rich preview when link shared on Telegram, Slack, Discord, WhatsApp, iMessage

### Files
- src/utils/email-signature-generator.html
- src/utils/service-worker.js
- src/utils/zoom-background-generator.js
- src/components/share-panel.js
- manifest.json
- src/assets/icons/ (192.png, 512.png, maskable-192.png)

### Checkpoint key: "phase5-sharing-distribution"

---

## PHASE 6 — Analytics (REMOVED from Week 1)
Descoped. Will be added in Month 2.
Reason: Analytics requires Firebase Realtime DB setup + dashboard — adds backend complexity
outside the 1-week target. The card works perfectly without it.

What Phase 6 covers (Month 2):
- View counter (Firebase Realtime DB)
- Click count per button
- Device type split (mobile vs desktop)
- Time-based stats (morning / afternoon / evening)
- Analytics dashboard (card owner only, Firebase Auth gated)
- Weekly summary email (SendGrid)
- Privacy-first: no cookies, no IP, aggregate counts only
- Compliant: GDPR · PDPA Malaysia · CCPA

### What gets built

#### Optional Contact Form
- Toggle: card owner turns form on/off in card config
- Fields: Name · Email (required) · Phone (optional) · Message
- Validation: HTML5 + JS inline
- Storage: Firebase Firestore (free: 50K reads + 20K writes/day)
- Shown below card, clean collapsible panel

#### Form Notifications
- Firebase Cloud Function triggers on new submission
- SendGrid free tier: 100 emails/day
- Email to card owner: sender name, email, message, timestamp
- Reply-to set to submitter's email for easy response

#### Submission Counter
- Shows on card: "3 people reached out" (count, not names)
- Firestore counter (not exposing submitter data)

#### CSV Export
- Card owner dashboard: download all submissions
- Client-side CSV generation (no server needed)
- Columns: Date · Name · Email · Phone · Message

### Files
- src/components/contact-form.js
- src/components/contact-form.html
- src/utils/csv-export.js
- functions/notify-on-submission.js (Firebase Function)

### Checkpoint key: "phase6-contact-capture"

---

## CUSTOMER DASHBOARD (Day 6)
customer-dashboard.html — the product page you show clients

### Business Strategy
- Show BENEFITS not features (customers buy outcomes, not specs)
- 3 tiers: Starter · Business · Enterprise
- Malaysian pricing in RM, annual saves 25%
- WhatsApp CTA per plan (different pre-filled messages)
- Offline + Online clearly labelled per feature
- Never mention: Firebase, API, HTML, hosting, how it works

### Pricing (RM, Malaysian Market)

| | Starter | Business | Enterprise |
|---|---|---|---|
| Who | 1 person | 5–20 people | 100+ people |
| Monthly | RM 29/mo | RM 149/mo | RM 599/mo |
| Annual | RM 249/yr | RM 1,299/yr | RM 4,999/yr |
| Annual saving | Save 28% | Save 27% | Save 30% |

### Feature Display Strategy (what customer sees vs what we're selling)

| Customer sees | What it actually is |
|---|---|
| "Digital Business Card" | card-core.html |
| "Save to Phone Contacts" | vCard .vcf download |
| "Works Without Internet" | PWA offline cache |
| "Apple & Google Wallet" | .pkpass + Google Wallet pass |
| "Instant QR Code" | qrcode.js generated |
| "Share Anywhere" | WhatsApp/Telegram/SMS/Email share panel |
| "Professional Designs" | 5 templates (Starter: 2, Business: 4, Enterprise: all 5) |
| "Your Brand Colors" | CSS custom property theme engine |
| "Custom Web Address" | URL slug (yoursite.com/c/yourname) |
| "Contact Form" | Firebase Firestore form + email notification |
| "Lead Notifications" | SendGrid email on form submission |
| "Export for Printing" | PDF export (html2canvas + jsPDF) |
| "Email Signature" | HTML email signature generator |
| "Team Management" | Multi-card admin (Phase 8, shown as "coming soon") |
| "Video Background" | Zoom PNG generator |

### Feature Tiers

| Feature | Starter | Business | Enterprise |
|---|---|---|---|
| Digital card + QR | ✅ | ✅ | ✅ |
| Save to contacts | ✅ | ✅ | ✅ |
| Works offline | ✅ | ✅ | ✅ |
| WhatsApp button | ✅ | ✅ | ✅ |
| Social links | 3 links | 10 links | Unlimited |
| Design templates | 2 styles | 4 styles | All 5 styles |
| Custom brand colors | ❌ | ✅ | ✅ |
| Apple/Google Wallet | ❌ | ✅ | ✅ |
| PDF export | ❌ | ✅ | ✅ |
| Email signature | ❌ | ✅ | ✅ |
| Contact form | ❌ | ✅ | ✅ |
| Lead notifications | ❌ | ✅ | ✅ |
| Custom web address | ❌ | ✅ | ✅ |
| Zoom background | ❌ | ✅ | ✅ |
| Video background | ❌ | ❌ | ✅ |
| Multiple cards | ❌ | ❌ | ✅ |
| Team dashboard | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ |
| Setup & training | ❌ | ❌ | ✅ |

---

## TOKEN RESUME TRACKER — HOW IT WORKS

### Checkpoint file: /tmp/makersco_card_checkpoint.json
```json
{
  "date": "2026-05-17",
  "completed": ["phase1-core-card", "phase2-wallet-exports"],
  "in_progress": "phase3-design-system",
  "in_progress_step": "template-2-glassmorphism",
  "opus_tokens_today": 45000,
  "sonnet_tokens_today": 72000,
  "last_updated": "2026-05-17T14:30:00"
}
```

### Resume logic in build_card.py
1. On start: read checkpoint.json
2. Check date — if date changed, token counts reset to 0
3. Check if in_progress step was partially done — re-run it
4. Skip all steps in completed[]
5. If opus_tokens_today >= OPUS_LIMIT:
   - Print "Opus limit reached — waiting for reset"
   - Save checkpoint, exit cleanly
   - Next run: same logic, date check will show reset
6. If sonnet_tokens_today >= SONNET_LIMIT:
   - Fall back to qwen3:8b for remaining HTML builds
   - Log which files used fallback

### Daily limits
- Opus: 80,000 tokens/day (planning + specs)
- Sonnet: 200,000 tokens/day (HTML building)
- Reset: detected by date change in checkpoint.json
