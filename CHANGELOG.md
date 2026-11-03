# Changelog

All notable changes to the `safeguard-dashboard` repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-03

### Added
- **Global Protocol Status Banner**: Real-time sticky top alert tracking emergency circuit breaker state, timelock countdowns, and ledger synchronization lag.
- **Dedicated Treasury & Operations Console**:
  - `GatewayTelemetrySnapshotCard`: Consensus sequence number, total volume, active escrows, and spend cap telemetry.
  - `EmergencyPauseStatusCard`: Timelocked pause duration management and guardian control.
  - `LiquidityPoolRoutingCard`: Soroban AMM path estimate telemetry and slippage tolerance.
  - `MultiCurrencySettlementSummaryCard`: Aggregate multi-asset liquidity planning.
  - `EnterpriseDisbursementEngineCard`: Validated batch payout partitions with gas fee estimations.
- **Regulatory Reporting & Export Modals**:
  - `BalanceSheetExportModal`: Verified collateral statements in Markdown and JSON formats.
  - `CompliancePacketExportModal`: Sealed archive export bundles with SHA-256 tamper-evident digests.
  - `AuditLogExportModal`: Structured streaming audit exports.
- **Full Escrow Vault Management**:
  - Partial escrow release modal (`PartialEscrowReleaseModal`).
  - Dispute filing and bulk dispute modals (`BulkDisputeModal`, `DisputeModal`).
  - Bulk arbitration modal (`BulkArbitrationModal`).
  - Bulk release and refund modals (`BulkEscrowReleaseModal`, `BulkEscrowRefundModal`).
- **Comprehensive Unit Testing Suite**: 192 unit tests across 40 test suites covering all domain helpers.
- **Stellar Wallet Adapter & Freighter Integration**: Live balance queries, transaction dispatch, and multi-wallet discovery.

### Changed
- Integrated all new treasury, telemetry, and export modals into `src/app/page.tsx`.
- Enabled `"allowImportingTsExtensions": true` in `tsconfig.json` for strict TypeScript verification.
