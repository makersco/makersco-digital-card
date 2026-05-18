#!/usr/bin/env python3
"""
fix_links_and_flip.py
Fixes two issues across all card templates:
1. Phone / email / website / location as tappable <a> links (tel:, mailto:, https:, maps)
2. Glassmorphism hover CSS overriding back-face rotateY → overlap bug
"""

import os, re

BASE = os.path.join(os.path.dirname(__file__), "src", "templates")

def read(path):
    return open(path, encoding="utf-8", errors="ignore").read()

def write(path, content):
    open(path, "w", encoding="utf-8").write(content)
    print(f"  [OK] {os.path.basename(path)}")

# ────────────────────────────────────────────────────────────────────
# 1. GLASSMORPHISM — fix hover overriding back-face transform
# ────────────────────────────────────────────────────────────────────

def fix_glassmorphism(path):
    html = read(path)

    # The hover rule that breaks the back face:
    # .card-wrapper:hover .card-face { ... transform: translateY(-2px) scale(1.005); ... }
    # Fix: restrict to .card-front only, leave .card-back alone

    old_hover = """.card-wrapper:hover .card-face {
            left: 0;
            top: 0;
            transform: translateY(-2px) scale(1.005);
            border-color: var(--card-border-hover);
        }"""

    new_hover = """.card-wrapper:hover .card-front {
            left: 0;
            top: 0;
            transform: translateY(-2px) scale(1.005);
            border-color: var(--card-border-hover);
        }
        /* Back face always stays rotated — hover must not override it */
        .card-back {
            transform: rotateY(180deg) !important;
        }
        .card-wrapper:hover .card-inner.flipped .card-back {
            transform: rotateY(180deg) translateY(-2px) scale(1.005) !important;
        }"""

    if old_hover in html:
        html = html.replace(old_hover, new_hover)
        print("    glassmorphism: fixed hover flip bug")
    elif "card-wrapper:hover .card-front" in html:
        print("    glassmorphism: hover already fixed")
    else:
        print("    glassmorphism: WARNING — hover pattern not found, check manually")

    write(path, html)


# ────────────────────────────────────────────────────────────────────
# 2. ALL SMALL TEMPLATES — make info-panel + card-back values clickable
# ────────────────────────────────────────────────────────────────────

# We patch the JS populate section to use innerHTML with <a> tags
# instead of plain textContent assignments.

LINK_PATCHES = {
    "card-core.html": [
        # Card back
        ("document.getElementById('bPhone').textContent      = CONFIG.phone_display;",
         "document.getElementById('bPhone').innerHTML        = `<a href=\"tel:${CONFIG.phone}\" style=\"color:inherit;text-decoration:none\">${CONFIG.phone_display}</a>`;"),
        ("document.getElementById('bEmail').textContent      = CONFIG.email;",
         "document.getElementById('bEmail').innerHTML        = `<a href=\"mailto:${CONFIG.email}\" style=\"color:inherit;text-decoration:none\">${CONFIG.email}</a>`;"),
        ("document.getElementById('bWeb').textContent        = CONFIG.website;",
         "document.getElementById('bWeb').innerHTML          = `<a href=\"https://${CONFIG.website}\" target=\"_blank\" rel=\"noopener\" style=\"color:inherit;text-decoration:none\">${CONFIG.website}</a>`;"),
        # Info panel
        ("document.getElementById('iWa').textContent         = CONFIG.phone_display;",
         "document.getElementById('iWa').innerHTML           = `<a href=\"https://wa.me/${CONFIG.phone}\" target=\"_blank\" rel=\"noopener\" style=\"color:inherit;text-decoration:none\">${CONFIG.phone_display}</a>`;"),
        ("document.getElementById('iEmail').textContent      = CONFIG.email;",
         "document.getElementById('iEmail').innerHTML        = `<a href=\"mailto:${CONFIG.email}\" style=\"color:inherit;text-decoration:none\">${CONFIG.email}</a>`;"),
        ("document.getElementById('iWeb').textContent        = CONFIG.website;",
         "document.getElementById('iWeb').innerHTML          = `<a href=\"https://${CONFIG.website}\" target=\"_blank\" rel=\"noopener\" style=\"color:inherit;text-decoration:none\">${CONFIG.website}</a>`;"),
    ],
    "card-dark-luxury.html": [
        # Card back
        ("document.getElementById('bPhone').textContent    = CONFIG.phone_display;",
         "document.getElementById('bPhone').innerHTML      = `<a href=\"tel:${CONFIG.phone}\" style=\"color:inherit;text-decoration:none\">${CONFIG.phone_display}</a>`;"),
        ("document.getElementById('bEmail').textContent    = CONFIG.email;",
         "document.getElementById('bEmail').innerHTML      = `<a href=\"mailto:${CONFIG.email}\" style=\"color:inherit;text-decoration:none\">${CONFIG.email}</a>`;"),
        # Info panel
        ("document.getElementById('iPhone').textContent    = CONFIG.phone_display;",
         "document.getElementById('iPhone').innerHTML      = `<a href=\"tel:${CONFIG.phone}\" style=\"color:inherit;text-decoration:none\">${CONFIG.phone_display}</a>`;"),
        ("document.getElementById('iEmail').textContent    = CONFIG.email;",
         "document.getElementById('iEmail').innerHTML      = `<a href=\"mailto:${CONFIG.email}\" style=\"color:inherit;text-decoration:none\">${CONFIG.email}</a>`;"),
        ("document.getElementById('iLoc').textContent      = CONFIG.location;",
         "document.getElementById('iLoc').innerHTML        = `<a href=\"https://maps.google.com/?q=${encodeURIComponent(CONFIG.location)}\" target=\"_blank\" rel=\"noopener\" style=\"color:inherit;text-decoration:none\">${CONFIG.location}</a>`;"),
    ],
    "card-vibrant-bold.html": [
        # Card back
        ("document.getElementById('bPhone').textContent    = CONFIG.phone_display;",
         "document.getElementById('bPhone').innerHTML      = `<a href=\"tel:${CONFIG.phone}\" style=\"color:inherit;text-decoration:none\">${CONFIG.phone_display}</a>`;"),
        ("document.getElementById('bEmail').textContent    = CONFIG.email;",
         "document.getElementById('bEmail').innerHTML      = `<a href=\"mailto:${CONFIG.email}\" style=\"color:inherit;text-decoration:none\">${CONFIG.email}</a>`;"),
        # Info panel
        ("document.getElementById('iWa').textContent       = CONFIG.phone_display;",
         "document.getElementById('iWa').innerHTML         = `<a href=\"https://wa.me/${CONFIG.phone}\" target=\"_blank\" rel=\"noopener\" style=\"color:inherit;text-decoration:none\">${CONFIG.phone_display}</a>`;"),
        ("document.getElementById('iEmail').textContent    = CONFIG.email;",
         "document.getElementById('iEmail').innerHTML      = `<a href=\"mailto:${CONFIG.email}\" style=\"color:inherit;text-decoration:none\">${CONFIG.email}</a>`;"),
        ("document.getElementById('iLoc').textContent      = CONFIG.location;",
         "document.getElementById('iLoc').innerHTML        = `<a href=\"https://maps.google.com/?q=${encodeURIComponent(CONFIG.location)}\" target=\"_blank\" rel=\"noopener\" style=\"color:inherit;text-decoration:none\">${CONFIG.location}</a>`;"),
    ],
}

# For glassmorphism / minimal-clean / neo-brutalist the contact values
# already have data-copy click behaviour. We'll make the displayed text
# a real link too, injecting a post-DOM JS block.

BIGCARD_LINK_JS = """
<script>
/* MakersCo: Make contact values tappable */
(function(){
  var C = window.CONFIG || {};
  function linkify(id, href, text) {
    var el = document.getElementById(id);
    if (!el || !href) return;
    el.innerHTML = '<a href="' + href + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">' + (text || el.textContent) + '</a>';
  }
  document.addEventListener('DOMContentLoaded', function(){
    if (C.phone) {
      linkify('phoneDisplay', 'tel:' + C.phone.replace(/\\D/g,''));
    }
    if (C.email) {
      linkify('emailDisplay', 'mailto:' + C.email);
    }
    if (C.website) {
      var url = C.website.startsWith('http') ? C.website : 'https://' + C.website;
      linkify('websiteDisplay', url);
    }
    if (C.location) {
      linkify('locationDisplay', 'https://maps.google.com/?q=' + encodeURIComponent(C.location));
    }
  });
})();
</script>
"""

BIG_TEMPLATES = ["card-glassmorphism.html", "card-minimal-clean.html", "card-neo-brutalist.html"]


def fix_small_links(path, patches):
    html = read(path)
    changed = 0
    for old, new in patches:
        if old in html:
            html = html.replace(old, new)
            changed += 1
        elif new.split("innerHTML")[0] in html:
            pass  # already patched
    if changed:
        print(f"    {os.path.basename(path)}: patched {changed} link(s)")
    write(path, html)


def fix_big_links(path):
    html = read(path)
    if "MakersCo: Make contact values tappable" in html:
        print(f"    {os.path.basename(path)}: contact links already patched")
        write(path, html)
        return
    # Insert before </body>
    html = html.replace("</body>", BIGCARD_LINK_JS + "</body>", 1)
    print(f"    {os.path.basename(path)}: injected contact link JS")
    write(path, html)


# ────────────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────────────

print("=== fix_links_and_flip.py ===\n")

print("[1] Fixing glassmorphism hover/flip overlap...")
fix_glassmorphism(os.path.join(BASE, "card-glassmorphism.html"))

print("\n[2] Making info-panel links tappable (small templates)...")
for fname, patches in LINK_PATCHES.items():
    fix_small_links(os.path.join(BASE, fname), patches)

print("\n[3] Making contact values tappable (big templates)...")
for fname in BIG_TEMPLATES:
    fix_big_links(os.path.join(BASE, fname))

print("\nAll done.")
