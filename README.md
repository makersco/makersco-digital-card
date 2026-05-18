# MakersCo — Digital Business Card Platform

A realistic, non-physical digital business card platform built to compete with Mole, Blinq, and HiHello.

## What This Is
Each card is a self-contained web page — shareable via link, QR code, Apple Wallet, Google Wallet.
No app to download. Works on any device. Offline-capable (PWA).

## Stack
- Frontend: Vanilla HTML / CSS / JS (no framework — fast, portable)
- Backend: Firebase (Auth, Firestore, Storage, Hosting)
- PWA: Service Worker + Web App Manifest
- PDF export: html2canvas + jsPDF (client-side, free)
- QR: qrcode.js (inline, free)
- vCard: hand-built .vcf string generation

## Phases
See PHASES.md for full breakdown.

Phase 1 → Core card (MVP)
Phase 2 → Design templates + customization
Phase 3 → Interactive elements (gallery, video, custom links)
Phase 4 → Analytics (privacy-first)
Phase 5 → Sharing & export tools
Phase 6 → Contact capture & lead generation
Phase 7 → Multiple cards + team/business
Phase 8 → PWA + offline + accessibility

## Project Structure
```
digital-card-platform/
├── README.md
├── PHASES.md
├── src/
│   ├── templates/        # Card HTML templates per design style
│   ├── components/       # Reusable JS components (gallery, form, analytics)
│   ├── utils/            # Helpers (qr-export, pdf-export, vcard, csv)
│   └── assets/           # Icons, fonts, images
└── phases/               # Phase-specific notes and specs
```

## Do Not Push Until
- Phase 1 core card is complete and tested on mobile
- Firebase project is created and config is added to .env


Option 1 — GitHub Pages (free, instant, permanent URL)
You already use it for ecommerce-daily-builds. Push the card to any public repo:

# In your digital-card-platform folder
gh repo create makersco-digital-card --public   # public = GitHub Pages works
git init && git add src/templates/card-dark-luxury.html
git commit -m "feat: add dark luxury card template"
git push -u origin main

# Then enable GitHub Pages in repo settings → Branch: main
# Card URL: https://lousycoder96.github.io/makersco-digital-card/src/templates/card-dark-luxury.html
Option 2 — Netlify Drop (instant, no account needed)
Go to drop.netlify.com, drag and drop the HTML file. Get a URL like https://random-name-123.netlify.app in 10 seconds. Free forever.

Option 3 — Send the HTML file directly
Since every card is fully self-contained (no external files needed), just:

Attach the .html file to a WhatsApp message
Customer downloads it, opens in browser — works completely offline
Good for demos but not for long-term sharing
For production (when you're ready)
Buy a .my domain (~RM 30/year), point to Firebase Hosting or GitHub Pages, and cards become yoursite.my/c/clientname. That's Phase 5's custom URL slug feature.

Quickest path right now: Use Option 2 — drag the HTML onto Netlify Drop, get a URL in 10 seconds, send to client.