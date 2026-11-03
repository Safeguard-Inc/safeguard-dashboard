# Contributing to Safeguard Dashboard

Thank you for your interest in contributing to Safeguard Dashboard! We welcome contributions, bug fixes, accessibility passes, and UI enhancements.

## Code of Conduct

All contributors and maintainers are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development Workflow

### Prerequisites
* Node.js 20+ (Node 22 and 25 supported)
* npm 10+
* Freighter browser extension (recommended for testing live transactions)

### Setup
```bash
git clone https://github.com/Safeguard-Inc/safeguard-dashboard.git
cd safeguard-dashboard
npm ci
npm test
npm run build
npm run dev
```

### Pull Request & Commit Guidelines
* We adhere to Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `ui:`.
* Ensure TypeScript strict checking (`npx tsc --noEmit`) and unit tests (`npm test`) pass with zero errors.
* Verify production build (`npm run build`) completes without regressions.

## Security Vulnerabilities
Please refer to [SECURITY.md](SECURITY.md) and report security findings to `security@safeguard.inc`.
