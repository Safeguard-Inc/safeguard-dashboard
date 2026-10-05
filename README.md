# Safeguard Dashboard

[![CI](https://github.com/Safeguard-Inc/safeguard-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Safeguard-Inc/safeguard-dashboard/actions/workflows/ci.yml)
[![Validations](https://img.shields.io/badge/CI%2FCD-10%2F10%20Automated%20Checks-success.svg)](.github/workflows/ci.yml)
[![Pitch Video](https://img.shields.io/badge/Pitch%20Video-5%20Minutes%20(1080p)-4ade9b.svg)](https://safeguard-docs.vercel.app/assets/video/safeguard-pitch.mp4)
[![Canonical Errors](https://img.shields.io/badge/Errors-270%20Cataloged-blue.svg)](docs/ERROR_CODES.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Vercel-Live_Console-brightgreen.svg)](https://safeguard-dashboard-mocha.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14%20App%20Router-black.svg)](https://nextjs.org)
[![Freighter](https://img.shields.io/badge/Wallet-Freighter%20Testnet-purple.svg)](https://freighter.app)

[![Watch the Safeguard Pitch Video](https://safeguard-docs.vercel.app/assets/video/safeguard-pitch-poster.jpg)](https://safeguard-docs.vercel.app/assets/video/safeguard-pitch.mp4)

**Institutional Web3 operator console and payment terminal for Safeguard policy-guarded payments on Stellar.**

Safeguard Dashboard connects institutional treasury managers, compliance officers, and merchant operations directly to Soroban smart contracts on Stellar Testnet.

---

## The Four-Tier Stack

| Repository | Role | Technology |
| :--- | :--- | :--- |
| [**`safeguard-contracts`**](https://github.com/Safeguard-Inc/safeguard-contracts) | Smart Contracts & Policy Engine | Rust, Soroban SDK, `no_std` |
| [**`safeguard-backend`**](https://github.com/Safeguard-Inc/safeguard-backend) | Pre-flight Simulation SDK & REST API | TypeScript, Node.js, Express |
| **`safeguard-dashboard`** (this repo) | Institutional Web3 Console | Next.js 14, Freighter, Tailwind |
| [**`safeguard-docs`**](https://github.com/Safeguard-Inc/safeguard-docs) | Documentation Hub & Simulator | Static Web, Vercel |

---

## Architecture Overview

```text
┌──────────────────────────────────────────────────────────┐
│                   Safeguard Dashboard                    │
│                 (Next.js 14 App Router)                  │
│                                                          │
│  ┌────────────────────┐          ┌────────────────────┐  │
│  │ Freighter Wallet   │          │ Real-Time Telemetry│  │
│  │ Connect / Sign XDR │          │ Indexed Stream     │  │
│  └─────────┬──────────┘          └─────────▲──────────┘  │
│            │                               │             │
│  ┌─────────▼──────────┐          ┌─────────┴──────────┐  │
│  │ Merchant Terminal  │          │ Policy Governance  │  │
│  │ SAC Direct/Escrow  │          │ Caps, Allow/Deny   │  │
│  └─────────┬──────────┘          └─────────▲──────────┘  │
└────────────┼───────────────────────────────┼─────────────┘
             │                               │
             ▼                               │
┌──────────────────────────────────────────────────────────┐
│           Soroban RPC Node (Stellar Testnet)             │
│                                                          │
│  • Payments Gateway: CBH4XG6K5XJHY3QMVUP7LGB4BFFG4C3X... │
│  • Policy Engine:    CAQI3YI244YV7QGZ5VODUUGKFX6C4XND... │
│  • Native SAC Token: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNI... │
└──────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Merchant Payment Terminal
* Execute policy-guarded payments using native SEP-41 Stellar Asset Contract (SAC) tokens (XLM, USDC, EURC).
* Real-time amount calculation and stroop gas fee estimation.
* Seamless branching: payments under the spend cap settle directly; high-value payments divert automatically into on-chain escrow.

### 2. Multi-Sig Policy Governance
* Dynamic spend cap adjustment with instant Soroban simulation.
* Real-time allowlist and denylist wallet management.
* Emergency circuit breaker: contract-wide pause and resume controls.

### 3. Escrow Vault Management
* Inspect locked escrow deposits, timestamped release windows, and depositor/beneficiary identities.
* One-click admin release for compliant high-value transfers.
* Timelocked depositor refund execution after the escrow holding period expires.

### 4. Canonical 270 Error Codes Inspector
* Integrated lookup tool for all 270 cataloged error codes across 9 system domains.
* Provides non-technical plain English explanations and actionable remediation steps for compliance failures.

### 5. Live Telemetry Stream
* Visual feed of approved, escrowed, and blocked payments.
* Filter by status, token, or counterparty address.
* Instant CSV and JSON audit export for regulatory reporting.

---

## Live Stellar Testnet Deployments

| Contract / Entity | Address / Contract ID | Role |
| :--- | :--- | :--- |
| **Safeguard Payments Gateway** | `CBH4XG6K5XJHY3QMVUP7LGB4BFFG4C3XQ5Z64K7Z5OC66UDF4RAGRXYZ` | Payments & Escrow Vault |
| **Safeguard Policy Engine** | `CAQI3YI244YV7QGZ5VODUUGKFX6C4XNDQ2Y64K7Z5OC66UDF4RAGRP4V` | Deterministic Rule Engine |
| **Native SAC Token (SEP-41)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | Testnet XLM / SAC Token |
| **Multi-Sig Admin** | `GDIYQ7X5E22P3H75YQ7LOUXFX6C4XNDQ2Y64K7Z5OC66UDF4RAGRP4V` | Governance Authority |

---

## Environment Variables

Configure `.env.local` or Vercel Project Settings:

```env
# Soroban RPC Endpoint
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Stellar Network Passphrase
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Smart Contract IDs
NEXT_PUBLIC_PAYMENTS_CONTRACT_ID=CBH4XG6K5XJHY3QMVUP7LGB4BFFG4C3XQ5Z64K7Z5OC66UDF4RAGRXYZ
NEXT_PUBLIC_POLICY_CONTRACT_ID=CAQI3YI244YV7QGZ5VODUUGKFX6C4XNDQ2Y64K7Z5OC66UDF4RAGRP4V
NEXT_PUBLIC_DEFAULT_SAC_TOKEN=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# Backend Integration (Optional)
NEXT_PUBLIC_BACKEND_API_URL=https://api.safeguard.inc
```

---

## Getting Started

### Prerequisites
* Node.js 20+
* [Freighter Wallet](https://www.freighter.app/) browser extension configured for **Testnet**.
* Test XLM from the [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test).

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Safeguard-Inc/safeguard-dashboard
cd safeguard-dashboard

# Install dependencies
npm ci

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the console.

### Production Build

```bash
# Compile and optimize production bundle
npm run build

# Start production server locally
npm start
```

---

## 🌊 Contributing & Stellar Drips Wave Sprints

We participate in the **Stellar Drips Wave** sprint program!

Browse our **[Issue Backlog](https://github.com/Safeguard-Inc/safeguard-dashboard/issues)**:
* Issues are tagged with `Stellar Wave` and complexity ratings (`complexity: trivial`, `complexity: small`, `complexity: medium`).
* Focus areas: Freighter wallet session persistence, dark/light theme polish, responsive mobile layout, and CSV export.

---

## License

Licensed under the Apache License, Version 2.0 ([LICENSE](LICENSE)).
