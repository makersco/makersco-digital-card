#!/usr/bin/env python3
"""
build_card.py — MakersCo Digital Business Card Platform builder.

Runs all phases in order. Resumes from checkpoint if tokens ran out.

Usage:
  python3 build_card.py                    # run all phases
  python3 build_card.py --phase 1          # run only phase 1 (valid: 1,2,3,4,5)
  python3 build_card.py --dry-run          # plan only, no files written
  python3 build_card.py --reset            # clear checkpoint, start fresh
  python3 build_card.py --status           # show progress and token usage
"""
from __future__ import annotations
import sys, argparse, time
from shared_card import (
    check_env, show_progress, print_token_status,
    is_step_done, mark_step_started, mark_step_done,
    ask_opus, ask_sonnet, build_html, write_src, write_project,
    DESIGN_PRINCIPLES, CHECKPOINT_FILE, TODAY,
)
import os, json


def run_phase1():
    """Phase 1 — Core Web Card (Foundation)"""
    STEP = "phase1-core-card"
    if is_step_done(STEP):
        return

    print("\n" + "="*60)
    print("  📱 PHASE 1 — Core Web Card")
    print("="*60)
    mark_step_started(STEP)

    # Opus plans the card structure
    plan_prompt = f"""You are a senior frontend architect planning a digital business card.
{DESIGN_PRINCIPLES}

Plan a complete self-contained HTML digital business card with these requirements:
1. Card data stored in a const CONFIG object at top of <script>
2. Flip animation: CSS 3D rotateY, spring cubic-bezier(0.34,1.56,0.64,1)
   CRITICAL: both faces must have position:absolute; top:0; left:0; width:100%; height:100%
3. Front face: profile photo circle, name, title, company
4. Back face: phone, email, location, specialty tagline
5. Below card: contact action buttons (Call, Email, WhatsApp, Save Contact)
6. vCard (.vcf) download — generates from CONFIG data inline
7. QR code — use qrcode.js loaded as CDN: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
8. Share panel: Copy link, WhatsApp share, SMS share
9. Mobile-first, 100vw, system font stack for instant load
10. All <script> tags at bottom of <body> only

Write a precise, literal HTML build specification listing:
- Exact CSS custom properties and hex values for dark-luxury style
- Exact DOM structure with class names
- Exact JS functions needed (generateVCard, initQR, shareCard, flipCard)
- Exact button layout and order

Output the specification, not the code yet."""

    print("  🧠 Opus planning card structure...")
    spec = ask_opus(plan_prompt)

    # Sonnet builds the HTML from the spec
    build_prompt = f"""You are a code-generation engine. Build a complete digital business card HTML file.

SPECIFICATION FROM ARCHITECT:
{spec}

SAMPLE CONFIG (Sonnet must include this exact structure in the file):
<script>
const CONFIG = {{
  name: "Ahmad Faris bin Razak",
  title: "Founder & CEO",
  company: "Pixel Reka Sdn Bhd",
  phone: "+60123456789",
  email: "faris@pixelreka.com.my",
  website: "https://pixelreka.com.my",
  location: "Kuala Lumpur, Malaysia",
  bio: "Building digital solutions for Malaysian SMEs",
  pronouns: "He/Him",
  photo: "",
  color: "#6366f1",
  style: "dark-luxury",
  whatsapp_message: "Hi Faris, I found your digital card and would like to connect!",
  linkedin: "",
  instagram: "",
  custom_links: []
}};
</script>

MANDATORY TECHNICAL RULES:
1. ALL script tags at BOTTOM of <body> — never in <head>
2. Card faces: position:absolute; top:0; left:0; width:100%; height:100%; backface-visibility:hidden
3. QR code CDN in <head>: <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
4. vCard download uses Blob + URL.createObjectURL (no server needed)
5. WhatsApp link: https://wa.me/60123456789?text=encodeURIComponent(CONFIG.whatsapp_message)
6. Copy link uses navigator.clipboard.writeText(window.location.href)
7. Minimum 400 lines of complete HTML/CSS/JS

Output ONLY raw HTML starting with <!DOCTYPE html>. No fences. No explanation."""

    print("  ✨ Sonnet building card HTML...")
    html = build_html(build_prompt, min_chars=8000)
    if html:
        write_src("templates/card-core.html", html)
        mark_step_done(STEP)
    else:
        print("  ❌ Phase 1 failed — check token status")


def run_phase2():
    """Phase 2 — Wallet & Contact Exports"""
    STEP = "phase2-wallet-exports"
    if is_step_done(STEP):
        return

    print("\n" + "="*60)
    print("  👛 PHASE 2 — Wallet & Contact Exports")
    print("="*60)
    mark_step_started(STEP)

    steps_done = []

    # 2a: PDF Export component
    sub = "phase2a-pdf-export"
    if not is_step_done(sub):
        mark_step_started(STEP, "pdf-export")
        prompt = f"""Build a self-contained JavaScript module for PDF export of a digital business card.
{DESIGN_PRINCIPLES}

Requirements:
- Uses html2canvas (CDN: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js)
- Uses jsPDF (CDN: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)
- Captures the .card-wrapper element
- Standard business card size: 85mm × 54mm (landscape)
- Adds clickable links in PDF for phone, email, website
- Download filename: firstname-lastname-card.pdf
- Button: "Download PDF" with loading spinner during export
- Works inline — no server needed

Output ONLY a complete HTML snippet with <style>, the button HTML, and <script> at bottom.
Include the CDN script tags in the snippet header."""

        html = build_html(prompt, min_chars=1500)
        if html:
            write_src("components/pdf-export.html", html)
            mark_step_done(sub)
            steps_done.append(sub)

    # 2b: QR Export component
    sub = "phase2b-qr-export"
    if not is_step_done(sub):
        mark_step_started(STEP, "qr-export")
        prompt = """Build a QR code export component that downloads in PNG and SVG formats.

Requirements:
- Uses qrcode.js (already loaded on page)
- PNG download: renders QR to canvas, exports as image/png, downloads as qr-card.png
- SVG download: generates QR SVG string, downloads as qr-card.svg
- High-res option: 1024×1024px for PNG (print quality)
- Color options: foreground and background color pickers (hex inputs)
- Live preview updates as colors change
- Two buttons: "Download PNG" and "Download SVG"

Output ONLY a complete HTML snippet with inline <style> and <script> at bottom. No fences."""

        html = build_html(prompt, min_chars=1500)
        if html:
            write_src("components/qr-export.html", html)
            mark_step_done(sub)
            steps_done.append(sub)

    # 2c: Apple Wallet instructions + pass template
    sub = "phase2c-apple-wallet"
    if not is_step_done(sub):
        mark_step_started(STEP, "apple-wallet")
        prompt = f"""Write a complete Node.js script that generates an Apple Wallet .pkpass file for a digital business card.
{DESIGN_PRINCIPLES}

Requirements:
- Uses passkit-generator npm package (npm install passkit-generator)
- Creates a generic pass (type: generic)
- Pass fields: primaryFields (name + title), secondaryFields (company, phone), auxiliaryFields (email, website)
- Strip image: gradient using card accent color
- QR code barcode pointing to card URL
- pass.json template for all required fields
- Signs using Apple Developer certificate (cert path from environment variable)
- Outputs: output/card.pkpass
- Full error handling with helpful messages

CONFIG object at top of script for easy customisation.
Output ONLY the complete Node.js script. No fences."""

        code = ask_opus(prompt)
        if code:
            write_src("utils/pkpass-generator.js", code)
            mark_step_done(sub)
            steps_done.append(sub)

    # 2d: Export panel UI
    sub = "phase2d-export-panel"
    if not is_step_done(sub):
        mark_step_started(STEP, "export-panel")
        prompt = f"""Build a complete export panel UI HTML component for a digital business card.
{DESIGN_PRINCIPLES}

This panel sits below the main card and shows all export options.
Design: dark background (#0b0f1a), accent color via CSS variable --color-accent

Include these export options as styled buttons with icons:
1. "Save to Contacts" — vCard download (primary CTA, full width, accent color)
2. "Download PDF Card" — triggers pdf-export.js
3. "Download QR Code" — expands to show PNG/SVG options inline
4. "Add to Apple Wallet" — shows "Coming Soon" badge if cert not configured
5. "Add to Google Wallet" — same as above

Each button:
- Height: 48px, border-radius: 12px, font-weight: 600
- Icon: emoji or simple SVG inline
- Hover: translateY(-1px) + shadow
- Loading state: spinner replaces icon while processing

Output ONLY complete HTML with inline <style> and <script> at end. No fences."""

        html = build_html(prompt, min_chars=3000)
        if html:
            write_src("components/export-panel.html", html)
            mark_step_done(sub)
            steps_done.append(sub)

    if steps_done:
        mark_step_done(STEP)
    else:
        print("  ⚠️  Phase 2 had no new steps to complete")


def run_phase3():
    """Phase 3 — Design System (5 Templates)"""
    STEP = "phase3-design-system"
    if is_step_done(STEP):
        return

    print("\n" + "="*60)
    print("  🎨 PHASE 3 — Design System")
    print("="*60)
    mark_step_started(STEP)

    templates = [
        {
            "key": "dark-luxury",
            "font": "Cormorant+Garamond:wght@300;600;700",
            "bg": "#0a0a0a",
            "card_front": "linear-gradient(135deg,#1a1a1a,#0d0d0d)",
            "card_back": "#111111",
            "accent": "#C9A962",
            "border": "rgba(201,169,98,0.27)",
            "feel": "Law firm, corporate executive, financial advisor, senior management",
        },
        {
            "key": "glassmorphism",
            "font": "DM+Sans:wght@300;400;600;700",
            "bg": "radial-gradient(ellipse at 50% 0%,#302b63,#0f0c29)",
            "card_front": "rgba(255,255,255,0.08)",
            "card_back": "rgba(255,255,255,0.05)",
            "accent": "#818cf8",
            "border": "rgba(255,255,255,0.18)",
            "feel": "Tech startup, SaaS founder, creative agency, product designer",
        },
        {
            "key": "neo-brutalist",
            "font": "Space+Grotesk:wght@400;600;700",
            "bg": "#FFFBF0",
            "card_front": "ACCENT_COLOR",
            "card_back": "#000000",
            "accent": "#FF5C39",
            "border": "3px solid #000000",
            "feel": "Creative freelancer, graphic designer, artist, streetwear brand",
        },
        {
            "key": "vibrant-bold",
            "font": "Outfit:wght@300;400;600;800",
            "bg": "#0d0d0d",
            "card_front": "gradient(accent)",
            "card_back": "#1a1a1a",
            "accent": "#EC4899",
            "border": "none",
            "feel": "F&B, retail, fitness coach, influencer, events",
        },
        {
            "key": "minimal-clean",
            "font": "Inter:wght@300;400;600;700",
            "bg": "#FAFAFA",
            "card_front": "#FFFFFF",
            "card_back": "#F9FAFB",
            "accent": "#6366f1",
            "border": "1px solid #E5E7EB",
            "feel": "Doctor, educator, consultant, NGO, government officer",
        },
    ]

    built = 0
    for t in templates:
        sub = f"phase3-{t['key']}"
        if is_step_done(sub):
            continue

        mark_step_started(STEP, t['key'])

        plan_prompt = f"""You are a 2026 UI/UX designer. Write a precise HTML build specification for a digital business card template.
{DESIGN_PRINCIPLES}

Style: {t['key']}
Target audience: {t['feel']}
Font: Google Fonts — {t['font']}
Background: {t['bg']}
Card front: {t['card_front']}
Card back: {t['card_back']}
Accent color: {t['accent']}
Card border: {t['border']}

Write the exact specification:
1. All CSS custom property values (exact hex codes)
2. Font usage: which weights for name/title/company/labels
3. Card front layout (exact element positions and sizes)
4. Card back layout (exact contact row format)
5. Unique visual detail that makes this style distinctive
6. Animation timing and easing
7. Button styles for this template's aesthetic
8. What NOT to do (anti-patterns for this specific style)"""

        print(f"\n  🧠 Opus planning {t['key']} template...")
        spec = ask_opus(plan_prompt)

        build_prompt = f"""You are a code-generation engine. Build a complete digital business card HTML for the {t['key']} style.

STYLE SPECIFICATION:
{spec}

TECHNICAL REQUIREMENTS:
- Include Google Fonts @import in <head>: https://fonts.googleapis.com/css2?family={t['font']}&display=swap
- Card wrapper: width:340px; height:200px; perspective:1000px; margin:0 auto; cursor:pointer
- Card inner: width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.6s cubic-bezier(0.34,1.56,0.64,1)
- BOTH card faces: position:absolute; top:0; left:0; width:100%; height:100%; backface-visibility:hidden; -webkit-backface-visibility:hidden
- Card back gets: transform:rotateY(180deg) on its own CSS rule
- .card-inner.flipped gets: transform:rotateY(180deg)
- QR CDN in <head>: <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
- All other <script> tags at BOTTOM of <body>
- vCard download via Blob inline
- WhatsApp + Copy link + Share buttons below card
- Minimum 500 lines

Config object at top of script:
const CONFIG = {{ name:"Ahmad Faris bin Razak", title:"Founder & CEO", company:"Pixel Reka Sdn Bhd",
  phone:"+60123456789", email:"faris@pixelreka.com.my", website:"https://pixelreka.com.my",
  location:"Kuala Lumpur, Malaysia", bio:"Building digital solutions for Malaysian SMEs",
  color:"{t['accent']}", whatsapp_message:"Hi Faris, I found your digital card!" }};

Output ONLY raw HTML starting with <!DOCTYPE html>. No fences. No explanation."""

        print(f"  ✨ Sonnet building {t['key']}...")
        html = build_html(build_prompt, min_chars=8000)
        if html:
            write_src(f"templates/card-{t['key']}.html", html)
            mark_step_done(sub)
            built += 1
        else:
            print(f"  ❌ Failed to build {t['key']} — will retry next run")

    if built == len(templates):
        mark_step_done(STEP)
    else:
        print(f"  ⚠️  Built {built}/{len(templates)} templates — resume next run")


def run_phase5():
    """Phase 5 — Sharing & Distribution"""
    STEP = "phase5-sharing"
    if is_step_done(STEP):
        return

    print("\n" + "="*60)
    print("  📤 PHASE 5 — Sharing & Distribution")
    print("="*60)
    mark_step_started(STEP)

    steps_done = []

    # 5a: Email Signature Generator
    sub = "phase5a-email-signature"
    if not is_step_done(sub):
        mark_step_started(STEP, "email-signature")
        prompt = f"""Build a complete email signature generator as a single HTML page.
{DESIGN_PRINCIPLES}

This page allows someone to preview and copy their email signature.
Layout: left panel = inputs | right panel = live preview

Inputs (left panel, dark theme):
- Name, Job Title, Company, Phone, Email, Website
- LinkedIn URL, WhatsApp number
- Accent color picker (hex)
- Card URL (the link their signature will point to)

Email Signature Output (right panel, renders like email):
- 600px wide HTML table (no flexbox — email client safe)
- Profile initial circle (40×40px) in accent color on left
- Name (16px bold), title (13px), company (12px gray) on right of initial
- Divider line (1px, accent color)
- Icon row: phone · email · website (plain text links, not icon fonts)
- QR code thumbnail (64×64px) — generated from card URL via qrcode.js
- "View Digital Card →" CTA button (accent color, 32px tall, inline-block)

Copy button: copies the raw HTML of the signature to clipboard
Preview button: shows rendered preview in iframe
Warning note: "Test in Gmail, Outlook, and Apple Mail before using"

Output ONLY raw HTML starting with <!DOCTYPE html>. No fences."""

        html = build_html(prompt, min_chars=6000)
        if html:
            write_src("utils/email-signature-generator.html", html)
            mark_step_done(sub)
            steps_done.append(sub)

    # 5b: PWA manifest + service worker
    sub = "phase5b-pwa"
    if not is_step_done(sub):
        mark_step_started(STEP, "pwa")

        manifest = json.dumps({
            "name": "My Digital Card",
            "short_name": "My Card",
            "description": "My professional digital business card",
            "start_url": "./",
            "display": "standalone",
            "background_color": "#0a0a0f",
            "theme_color": "#6366f1",
            "orientation": "portrait",
            "icons": [
                {"src": "src/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
                {"src": "src/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
                {"src": "src/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
            ],
        }, indent=2)
        write_project("manifest.json", manifest)

        sw_prompt = """Write a complete service worker for a digital business card PWA.

Requirements:
- Cache name versioned: 'makersco-card-v1'
- On install: cache the card HTML, manifest.json, and CDN resources
- CDN resources to pre-cache: qrcode.js CDN URL, html2canvas CDN URL, jsPDF CDN URL
- On fetch: cache-first strategy for cached assets, network-first for everything else
- On activate: delete old caches
- Offline fallback: serve cached card HTML if network unavailable
- Include cache version comment at top for easy updates

Output ONLY the complete service worker JavaScript. No fences. No explanation."""

        sw = ask_sonnet(sw_prompt)
        if sw:
            write_src("utils/service-worker.js", sw)
            mark_step_done(sub)
            steps_done.append(sub)

    # 5c: Zoom background generator
    sub = "phase5c-zoom-background"
    if not is_step_done(sub):
        mark_step_started(STEP, "zoom-background")
        prompt = f"""Build a Zoom/Google Meet virtual background generator as a single HTML page.
{DESIGN_PRINCIPLES}

This page generates a 1920×1080px PNG background image using the Canvas API.

Inputs (left panel):
- Name, Job Title, Company (pre-filled from URL params or manual)
- Accent color picker
- Card URL (for QR code)
- Layout toggle: QR on left vs QR on right

Canvas output (1920×1080px, rendered live):
- Left 65%: solid dark background in chosen accent shade
  - Large name text (80px, white, bold)
  - Title + company below (40px, white, 60% opacity)
  - Horizontal accent line (3px)
  - "makersco.my" watermark bottom-left (20px, 30% opacity)
- Right 35%: slightly lighter panel
  - "Scan to Connect" label (24px, white)
  - QR code (300×300px, white on transparent, generated with qrcode.js)
  - Card URL below QR (16px, 60% opacity)

Download button: "Download Background (PNG)" — exports canvas as PNG
Resolution note: "Optimised for Zoom, Google Meet, and Microsoft Teams"

Output ONLY raw HTML starting with <!DOCTYPE html>. No fences."""

        html = build_html(prompt, min_chars=5000)
        if html:
            write_src("utils/zoom-background-generator.html", html)
            mark_step_done(sub)
            steps_done.append(sub)

    # 5d: Share panel component
    sub = "phase5d-share-panel"
    if not is_step_done(sub):
        mark_step_started(STEP, "share-panel")
        prompt = f"""Build a share panel component for a digital business card.
{DESIGN_PRINCIPLES}

This is a bottom-sheet style panel that slides up when "Share" is tapped.

Share options (grid of 2 columns):
1. Copy Link — navigator.clipboard, shows "Copied!" confirmation
2. WhatsApp — opens wa.me with pre-filled message
3. Telegram — opens t.me share link
4. SMS — opens sms: link with card URL
5. Email — opens mailto: with subject + body
6. Native Share — navigator.share() (mobile OS sheet), hidden on desktop

Design:
- Panel: fixed bottom, full width, background #111827, border-radius 20px 20px 0 0
- Each option: 56px × 56px icon circle + label below, 14px
- Backdrop: rgba(0,0,0,0.6) blur(8px)
- Slide-up animation: transform translateY(0) from translateY(100%)
- Close button: ✕ top-right
- Share link displayed as read-only text input at top of panel

Output ONLY a complete HTML snippet (not a full page — just the panel + script + style). No fences."""

        html = build_html(prompt, min_chars=2000)
        if html:
            write_src("components/share-panel.html", html)
            mark_step_done(sub)
            steps_done.append(sub)

    if len(steps_done) >= 3:
        mark_step_done(STEP)


def build_js(prompt: str, min_chars: int = 1500) -> str | None:
    """Build a JS module with retry if output is too short."""
    code = ask_sonnet(prompt)
    if code and len(code) >= min_chars:
        return code
    if code:
        print(f"  ⚠️  JS too short ({len(code)} chars) — retrying with stronger prompt...")
    retry = (
        "IMPORTANT: Your previous response was incomplete or too short. "
        "Write the FULL, COMPLETE JavaScript module now. "
        "Do not summarise or omit any functions.\n\n" + prompt
    )
    code = ask_sonnet(retry)
    return code if code else None


def run_phase4():
    """Phase 4 — Interactive Elements (social links, gallery, video, custom buttons)"""
    STEP = "phase4-interactive"
    if is_step_done(STEP):
        return

    print("\n" + "="*60)
    print("  🎯 PHASE 4 — Interactive Elements")
    print("="*60)
    mark_step_started(STEP)

    steps_done = []

    # 4a: Social links + custom link buttons component
    sub = "phase4a-links"
    if not is_step_done(sub):
        mark_step_started(STEP, "social-and-custom-links")
        prompt = f"""Build a social media links + custom link buttons component for a digital business card.
{DESIGN_PRINCIPLES}

This component renders below the main card actions.
Reads from window.CONFIG which has:
  CONFIG.social = {{ linkedin:'', instagram:'', facebook:'', twitter:'', tiktok:'', youtube:'', pinterest:'' }}
  CONFIG.custom_links = [{{ label:'', url:'', color:'' }}]  // unlimited array

Social links section:
- Row of icon buttons (inline SVG icons, no CDN — include SVG paths directly in the JS)
- Only renders platforms that have a non-empty URL in CONFIG.social
- Each: 44×44px circle, brand color background, white icon
- Hover: scale(1.08) transform
- Platforms: LinkedIn (blue #0A66C2) · Instagram (gradient #E1306C) · Facebook (#1877F2) ·
  Twitter/X (#000) · TikTok (#010101) · YouTube (#FF0000) · Pinterest (#E60023)

Custom links section:
- Renders only if CONFIG.custom_links.length > 0
- Each button: full width, 48px height, border-radius 12px
- Background: CONFIG.custom_links[i].color or default accent
- Label text: CONFIG.custom_links[i].label · opens CONFIG.custom_links[i].url in new tab
- Hover: translateY(-2px) + box-shadow

Output ONLY a self-contained JavaScript module that creates and injects the HTML.
Export: function initInteractiveLinks(containerId) — call after DOM ready.
No fences. No HTML wrapper."""

        code = build_js(prompt)
        if code:
            write_src("components/social-links.js", code)
            mark_step_done(sub)
            steps_done.append(sub)

    # 4b: Image gallery component
    sub = "phase4b-gallery"
    if not is_step_done(sub):
        mark_step_started(STEP, "gallery")
        prompt = f"""Build an image gallery component for a digital business card.
{DESIGN_PRINCIPLES}

Reads from CONFIG.gallery = [{{ url:'', caption:'' }}] (max 5 images)
Only renders if CONFIG.gallery.length > 0

Grid layout:
- 1 image: full width
- 2 images: 2 columns equal
- 3+ images: first image full width, remaining in 2-col grid below

Each image:
- Lazy loaded via IntersectionObserver (data-src attribute, swapped to src on enter)
- Placeholder: colored div matching --color-accent at 20% opacity while loading
- Border-radius: 10px
- Caption below image in 12px muted color

Lightbox (pure CSS + minimal JS, no library):
- Click any image → fixed overlay, black background, image centered, caption below
- Close on: click outside image, Escape key, close button (✕)
- Prev/Next arrows if multiple images
- Body scroll locked while open

Output ONLY a self-contained JS module.
Export: function initGallery(containerId)
No fences. No HTML wrapper."""

        code = build_js(prompt)
        if code:
            write_src("components/gallery.js", code)
            mark_step_done(sub)
            steps_done.append(sub)

    # 4c: Video embed component
    sub = "phase4c-video"
    if not is_step_done(sub):
        mark_step_started(STEP, "video-embed")
        prompt = f"""Build a video embed component for a digital business card.
{DESIGN_PRINCIPLES}

Reads from CONFIG.video_url (YouTube or Vimeo URL, or empty string)
Only renders if CONFIG.video_url is non-empty

Video card design:
- Container: border-radius 12px, overflow hidden, margin-top 16px
- Header label: "Watch" in small caps, accent color, 11px
- Thumbnail area: 16:9 ratio (padding-top: 56.25%), dark background
  - YouTube: shows youtube thumbnail via img.youtube.com/vi/{{videoId}}/hqdefault.jpg
  - Vimeo: shows placeholder gradient
- Play button overlay: centered circle, 56px, white icon, semi-transparent dark bg
  - Hover: scale(1.1)
- Click → replaces thumbnail with actual iframe (YouTube nocookie: www.youtube-nocookie.com)
- Does NOT autoplay on page load (only plays when explicitly clicked)
- Caption: CONFIG.video_caption below (optional)

Helper: function extractVideoId(url) handles both youtube.com/watch?v= and youtu.be/ formats

Output ONLY a self-contained JS module.
Export: function initVideoEmbed(containerId)
No fences. No HTML wrapper."""

        code = build_js(prompt)
        if code:
            write_src("components/video-embed.js", code)
            mark_step_done(sub)
            steps_done.append(sub)

    # 4d: Booking + location buttons
    sub = "phase4d-booking-location"
    if not is_step_done(sub):
        mark_step_started(STEP, "booking-location")
        prompt = f"""Build a booking and location button component for a digital business card.
{DESIGN_PRINCIPLES}

Reads from CONFIG:
  CONFIG.booking_url  — Calendly, Google Calendar, or any booking link (optional)
  CONFIG.maps_url     — Google Maps URL (optional, falls back to searching CONFIG.location)
  CONFIG.location     — text like "Kuala Lumpur, Malaysia"

Booking button (only if CONFIG.booking_url is set):
- Full width, 48px, border-radius 12px
- Background: accent color at 15% opacity, border: 1px solid accent at 40%
- Icon: 📅 + "Book a Meeting" text
- Opens CONFIG.booking_url in new tab

Location button (only if CONFIG.location is set):
- Same style as booking but green tint
- Icon: 📍 + CONFIG.location text
- Opens CONFIG.maps_url or falls back to "https://maps.google.com/?q=" + encodeURIComponent(CONFIG.location)

Both wrapped in a flex column container with 8px gap.

Output ONLY a self-contained JS module.
Export: function initBookingLocation(containerId)
No fences. No HTML wrapper."""

        code = build_js(prompt)
        if code:
            write_src("components/booking-location.js", code)
            mark_step_done(sub)
            steps_done.append(sub)

    if len(steps_done) >= 3:
        mark_step_done(STEP)
    else:
        print(f"  ⚠️  Built {len(steps_done)}/4 interactive components — resume next run")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="MakersCo Digital Card Platform Builder")
    parser.add_argument("--phase",   type=int, help="Run only this phase (1-6)")
    parser.add_argument("--dry-run", action="store_true", help="Show plan only, no files written")
    parser.add_argument("--reset",   action="store_true", help="Clear checkpoint, start fresh")
    parser.add_argument("--status",  action="store_true", help="Show progress and token usage")
    args = parser.parse_args()

    if args.reset:
        if os.path.exists(CHECKPOINT_FILE):
            os.remove(CHECKPOINT_FILE)
            print("  🗑️  Checkpoint cleared — starting fresh")

    print("\n" + "="*60)
    print("  🪪  MakersCo Digital Business Card Platform")
    print(f"  📅 {TODAY}")
    print("="*60)

    check_env()
    print_token_status()

    if args.status:
        return

    if args.dry_run:
        print("\n  [dry-run] Would run phases:", end=" ")
        if args.phase:
            print(f"Phase {args.phase} only")
        else:
            print("1 → 2 → 3 → 4 → 5")
        return

    phases = {
        1: run_phase1,
        2: run_phase2,
        3: run_phase3,
        4: run_phase4,
        5: run_phase5,
    }

    if args.phase:
        fn = phases.get(args.phase)
        if fn:
            fn()
        else:
            print(f"  ❌ Phase {args.phase} not found (valid: 1,2,3,4,5)")
    else:
        for num, fn in phases.items():
            fn()
            print_token_status()

    print("\n" + "="*60)
    show_progress()
    print("="*60)


if __name__ == "__main__":
    main()
