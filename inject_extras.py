#!/usr/bin/env python3
"""
inject_extras.py
Injects Phase 4 social links, custom buttons, and booking/location
into all 6 card templates as fully self-contained inline JS.
Safe to re-run — skips templates that already have initExtras().
"""

import os, re

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "src", "templates")

# ── CSS block to inject before </style> ────────────────────────────────────
EXTRAS_CSS = """
/* ── Phase 4 Extras ─────────────────────────────────────────────────────── */
.extras-section{width:340px;margin:10px auto 0;display:flex;flex-direction:column;gap:9px}
.social-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding:4px 0}
.social-btn{
  width:40px;height:40px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  text-decoration:none;border:none;cursor:pointer;
  transition:transform .15s,opacity .15s;flex-shrink:0;
}
.social-btn:hover{transform:translateY(-2px);opacity:.85}
.social-btn svg{width:18px;height:18px;flex-shrink:0}
.extra-btn{
  width:100%;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;gap:8px;
  font-size:13px;font-weight:600;
  text-decoration:none;cursor:pointer;border:none;
  transition:transform .15s,opacity .15s;
}
.extra-btn:hover{transform:translateY(-1px);opacity:.9}
.extra-btn:active{transform:scale(.98)}
/* ── End Phase 4 Extras ──────────────────────────────────────────────────── */
"""

# ── JS + HTML block to inject before </body> ───────────────────────────────
EXTRAS_JS = """
<!-- Phase 4: Social Links, Custom Buttons, Booking/Location -->
<script>
(function(){
  var C = window.CONFIG || {};

  // Social platform definitions
  var PLATFORMS = [
    { key:'linkedin',  label:'LinkedIn',  bg:'#0A66C2', fg:'#fff',
      svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' },
    { key:'instagram', label:'Instagram', bg:'#E1306C', fg:'#fff',
      svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' },
    { key:'facebook',  label:'Facebook',  bg:'#1877F2', fg:'#fff',
      svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
    { key:'twitter',   label:'X / Twitter', bg:'#000', fg:'#fff',
      svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
    { key:'tiktok',    label:'TikTok',    bg:'#010101', fg:'#fff',
      svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/></svg>' },
    { key:'youtube',   label:'YouTube',   bg:'#FF0000', fg:'#fff',
      svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
    { key:'pinterest', label:'Pinterest', bg:'#E60023', fg:'#fff',
      svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>' }
  ];

  // Accent color from CSS variable or fallback
  function getAccent() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#6366f1';
  }

  function hexToRgb(hex) {
    var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? [parseInt(r[1],16), parseInt(r[2],16), parseInt(r[3],16)] : [99,102,241];
  }

  function buildSection() {
    var social   = C.social || {};
    var links    = C.custom_links || [];
    var booking  = C.booking_url || '';
    var location = C.location || '';
    var mapsUrl  = C.maps_url || ('https://maps.google.com/?q=' + encodeURIComponent(location));

    var hasSocial  = PLATFORMS.some(function(p){ return social[p.key]; });
    var hasLinks   = links.length > 0;
    var hasBooking = !!booking;
    var hasLoc     = !!location;

    if (!hasSocial && !hasLinks && !hasBooking && !hasLoc) return;

    var accent = getAccent();
    var rgb    = hexToRgb(accent);
    var accentRgba = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',';

    var section = document.createElement('div');
    section.className = 'extras-section';

    // ── Social icons ──
    if (hasSocial) {
      var row = document.createElement('div');
      row.className = 'social-row';
      PLATFORMS.forEach(function(p) {
        var url = social[p.key];
        if (!url) return;
        var a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'social-btn';
        a.title = p.label;
        a.style.cssText = 'background:'+accentRgba+'0.12);border:1px solid '+accentRgba+'0.3);color:'+accent+';';
        a.innerHTML = p.svg;
        row.appendChild(a);
      });
      section.appendChild(row);
    }

    // ── Custom link buttons ──
    links.forEach(function(link) {
      if (!link.url) return;
      var a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'extra-btn';
      a.style.cssText = 'background:'+accentRgba+'0.1);border:1px solid '+accentRgba+'0.25);color:'+accent+';font-family:inherit;';
      a.innerHTML = (link.icon ? '<span style="font-size:16px">'+link.icon+'</span> ' : '') + (link.label || link.url);
      section.appendChild(a);
    });

    // ── Booking button ──
    if (hasBooking) {
      var ab = document.createElement('a');
      ab.href = booking;
      ab.target = '_blank';
      ab.rel = 'noopener noreferrer';
      ab.className = 'extra-btn';
      ab.style.cssText = 'background:'+accentRgba+'0.12);border:1px solid '+accentRgba+'0.3);color:'+accent+';font-family:inherit;';
      ab.innerHTML = '<span style="font-size:16px">📅</span> Book a Meeting';
      section.appendChild(ab);
    }

    // ── Location button ──
    if (hasLoc) {
      var al = document.createElement('a');
      al.href = mapsUrl;
      al.target = '_blank';
      al.rel = 'noopener noreferrer';
      al.className = 'extra-btn';
      al.style.cssText = 'background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#10b981;font-family:inherit;';
      al.innerHTML = '<span style="font-size:16px">📍</span> ' + location;
      section.appendChild(al);
    }

    // Insert: find .qr-section and insert before it, or append to body
    var qr = document.querySelector('.qr-section');
    if (qr) {
      qr.parentNode.insertBefore(section, qr);
    } else {
      document.body.appendChild(section);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSection);
  } else {
    buildSection();
  }
})();
</script>
<!-- End Phase 4 Extras -->
"""

def inject(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        html = f.read()

    if 'initExtras' in html or 'Phase 4: Social Links' in html:
        print(f"  [SKIP] {os.path.basename(path)} — already has extras")
        return

    # Remove any partial social CSS left by previous spacing-fix injection
    # (the 3 templates that had .social-row, .social-links, .social-icons stubs)
    partial_pattern = re.compile(
        r'/\* Social icons row \*/\s*\.social-row,\s*\.social-links,\s*\.social-icons\s*\{[^}]+\}\s*',
        re.DOTALL
    )
    html = partial_pattern.sub('', html)

    # Inject CSS before </style>
    if EXTRAS_CSS.strip() not in html:
        html = html.replace('</style>', EXTRAS_CSS + '</style>', 1)

    # Inject JS before </body>
    html = html.replace('</body>', EXTRAS_JS + '</body>', 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  [OK]   {os.path.basename(path)}")

def main():
    templates = sorted([
        os.path.join(TEMPLATES_DIR, fn)
        for fn in os.listdir(TEMPLATES_DIR)
        if fn.endswith('.html')
    ])
    print(f"Processing {len(templates)} templates in {TEMPLATES_DIR}\n")
    for t in templates:
        inject(t)
    print("\nDone.")

if __name__ == '__main__':
    main()
