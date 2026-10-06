# Contributing to Safeguard Dashboard

We welcome pull requests from community frontend and Web3 developers!

## Local Setup
```bash
git clone https://github.com/Safeguard-Inc/safeguard-dashboard.git
cd safeguard-dashboard
npm install
npm run dev
```

Before opening a PR, ensure `npm run build` succeeds cleanly.
## Architecture Overview

Safeguard Dashboard is a **Next.js 14** App Router application for the Stellar ecosystem.

### Tech Stack
- **Framework:** Next.js 14.2.11 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 + clsx + tailwind-merge
- **Icons:** Lucide React
- **Stellar SDK:** @stellar/freighter-api (wallet connection)
- **Build:** Turbopack-compatible, 
ext build for production

### App Structure
`
app/                  # Next.js App Router pages + layouts
  page.tsx           # Dashboard home
  not-found.tsx      # 404 page
src/
  components/         # Reusable React components
  lib/               # Business logic and utilities
    stellar/         # Stellar-specific helpers (Freighter, friendbot)
public/              # Static assets
`

### Data Flow
1. **Wallet Connection:** @stellar/freighter-api detects installed Freighter extension and requests public key
2. **Stellar Network:** All on-chain reads go to public Stellar Horizon API (testnet or mainnet based on environment)
3. **State Management:** Client components use React hooks; server components fetch directly
4. **Styling:** Tailwind utility classes, merged via clsx + 	ailwind-merge for conditional classes

### Key Design Decisions
- **No backend server** — this is a frontend-only dApp; all writes go directly to Stellar via Freighter signatures
- **Client-side only** for wallet interaction — no private keys ever touch the browser
- **Testnet-first** — friendbot button and testnet defaults make onboarding easy for new contributors