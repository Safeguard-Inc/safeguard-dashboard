/**
 * Domain logic for BalanceSheetExportModal: aggregation, URL building, and checksum formatting.
 */

export interface BalanceSheetTokenSummary {
  tokenSymbol: string;
  lockedAmount: string;
  settledAmount: string;
  usdValue: number;
}

export interface BalanceSheetExportConfig {
  organization: string;
  format: 'json' | 'markdown';
  download?: boolean;
}

/**
 * Calculates total USD exposure across all token balances and identifies primary asset.
 */
export function calculateAggregatedUsdExposure(tokens: BalanceSheetTokenSummary[]): {
  totalUsd: number;
  topToken: string;
} {
  if (!tokens || tokens.length === 0) {
    return { totalUsd: 0, topToken: 'None' };
  }

  let total = 0;
  let topToken = tokens[0].tokenSymbol;
  let maxVal = -1;

  for (const t of tokens) {
    total += t.usdValue;
    if (t.usdValue > maxVal) {
      maxVal = t.usdValue;
      topToken = t.tokenSymbol;
    }
  }

  return {
    totalUsd: Math.round(total * 100) / 100,
    topToken,
  };
}

/**
 * Constructs backend query URL for balance sheet statement export.
 */
export function buildBalanceSheetExportUrl(config: BalanceSheetExportConfig): string {
  const params = new URLSearchParams();
  if (config.format) params.set('format', config.format);
  if (config.organization) params.set('organization', config.organization);
  if (config.download) params.set('download', 'true');

  return `/api/export/balance-sheet?${params.toString()}`;
}

/**
 * Abbreviates SHA-256 seal for display (e.g. "0x7a3f...9b12").
 */
export function formatChecksumAbbreviation(hash: string): string {
  if (!hash || hash.length < 12) return hash || 'N/A';
  const prefix = hash.startsWith('0x') ? hash.slice(2, 8) : hash.slice(0, 6);
  const suffix = hash.slice(-4);
  return `0x${prefix}...${suffix}`;
}
