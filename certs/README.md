# Wallet Credentials

This folder holds signing certificates and service account keys.
**All files here are gitignored — never committed.**

## Apple Wallet
- `wwdr.pem`       — Apple WWDR G4 root cert (public, downloadable)
- `signerCert.pem` — Your Pass Type ID certificate (from Apple Developer portal)
- `signerKey.pem`  — Private key exported from your .p12

## Google Wallet
- `google-service-account.json` — Service account JSON key (from Google Cloud Console)

See WALLET_SETUP.md in the project root for step-by-step instructions.
