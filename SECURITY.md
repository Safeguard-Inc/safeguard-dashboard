# Security Policy

Safeguard Dashboard connects operators, treasury managers, and compliance officers directly to Soroban contracts on Stellar.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Send all security reports to **`security@safeguard.inc`**.

Please include:
* Component and route affected
* Browser, extension (Freighter, Albedo, xBull), and OS environment
* Steps to reproduce the issue
* Impact on wallet authorization, transaction signing, or telemetry leakage

## Frontend Security Controls

* **Zero-Private-Key Storage**: The dashboard never stores or handles private keys. All signing delegates to verified Stellar wallet adapters.
* **Strict Type Safety**: Full TypeScript strict mode checking preventing prototype pollution and runtime casting errors.
* **Content Security**: Sanitized dynamic parameters with CSP protections on production deployments.
