/**
 * Domain logic for MultiCurrencySettlementSummaryCard: disbursement aggregation,
 * coverage analysis, and token badge rendering.
 */

export interface DisbursementSummaryLine {
  tokenSymbol: string;
  totalAmount: string;
  recipientCount: number;
  unitPriceUsd: number;
  estimatedUsdCost: number;
  liquidityBuffer: string;
  treasuryBalance: string;
  isSufficient: boolean;
}

/**
 * Calculates sum of estimated USD costs across all disbursement lines.
 */
export function computeTotalUsdDisbursement(lines: DisbursementSummaryLine[]): number {
  if (!lines || lines.length === 0) return 0;
  const total = lines.reduce((acc, l) => acc + l.estimatedUsdCost, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Evaluates whether all required currencies have sufficient funding in the treasury.
 */
export function evaluateOverallFundingStatus(lines: DisbursementSummaryLine[]): {
  isFullyFunded: boolean;
  deficitTokens: string[];
} {
  const deficitTokens = lines.filter((l) => !l.isSufficient).map((l) => l.tokenSymbol);
  return {
    isFullyFunded: deficitTokens.length === 0,
    deficitTokens,
  };
}

/**
 * Maps token symbol to visual icon.
 */
export function formatTokenIcon(symbol: string): string {
  switch ((symbol || '').toUpperCase()) {
    case 'XLM':
      return '🚀';
    case 'USDC':
      return '💵';
    case 'EURC':
      return '💶';
    case 'PYUSD':
      return '🅿️';
    default:
      return '🪙';
  }
}
