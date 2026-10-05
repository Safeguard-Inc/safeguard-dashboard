# Safeguard Dashboard

[![CI](https://github.com/Safeguard-Inc/safeguard-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Safeguard-Inc/safeguard-dashboard/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Vercel-Live_Demo-brightgreen.svg)](https://safeguard-dashboard-mocha.vercel.app)

**Web console and interactive checkout demo for Safeguard on Stellar.**

This dashboard allows operators and merchants to:
* Connect Freighter wallet on Stellar Testnet.
* Evaluate and execute policy-guarded payments in SEP-41 SAC tokens (USDC, EURC, XLM).
* Configure spend caps, denylists, and escrow timelocks in real-time.
* Inspect live telemetry for approved, escrowed, and blocked transactions.

---

## Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS & Lucide Icons
* **Wallet:** Freighter API & `@stellar/stellar-sdk`
* **Deployment:** Vercel

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server on http://localhost:3000
npm run dev

# Build production bundle
npm run build
```

---

## 🌊 Contributing & Stellar Drips Wave Sprints

We participate in the **Stellar Drips Wave** sprint program!

Browse our **[Issue Backlog](https://github.com/Safeguard-Inc/safeguard-dashboard/issues)** for UI and frontend tasks:
* Issues are tagged with `Stellar Wave` and complexity ratings (`complexity: trivial`, `complexity: small`, `complexity: medium`).
* Focus areas: Freighter wallet session persistence, dark/light theme polish, responsive mobile layout, and CSV export.

---

## License

Apache-2.0
