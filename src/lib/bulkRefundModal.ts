export interface BulkRefundItem {
  id: number | string;
  escrowIndex: number;
  amountStroops: string;
  tokenSymbol: string;
  sender: string;
  expiresAt: number;
  status: string;
}

export interface BulkRefundSummary {
  count: number;
  totalXlmUnits: string;
  tokenBreakdown: Record<string, string>;
  selectedIndices: number[];
  isValid: boolean;
}

/**
 * Filter escrows that are currently eligible for refund.
 * Admin can refund any Pending escrow; non-admin can only refund after timelock expires.
 */
export function filterEligibleForRefund(
  items: BulkRefundItem[],
  nowSeconds: number = Math.floor(Date.now() / 1000),
  isAdmin = true
): BulkRefundItem[] {
  return items.filter((item) => {
    if (item.status !== 'Pending') return false;
    if (isAdmin) return true;
    return item.expiresAt <= nowSeconds;
  });
}

/**
 * Aggregate metrics and volume across selected escrow refund records.
 */
export function calculateBulkRefundSummary(
  selectedIndices: number[],
  items: BulkRefundItem[],
  nowSeconds: number = Math.floor(Date.now() / 1000),
  isAdmin = true
): BulkRefundSummary {
  const eligible = filterEligibleForRefund(items, nowSeconds, isAdmin);
  const selectedItems = eligible.filter((item) => selectedIndices.includes(item.escrowIndex));

  let totalXlmStroops = 0n;
  const breakdown: Record<string, bigint> = {};

  for (const item of selectedItems) {
    try {
      const amount = BigInt(item.amountStroops);
      breakdown[item.tokenSymbol] = (breakdown[item.tokenSymbol] || 0n) + amount;
      if (item.tokenSymbol === 'XLM' || item.tokenSymbol === 'native') {
        totalXlmStroops += amount;
      }
    } catch {}
  }

  const tokenBreakdownFormatted: Record<string, string> = {};
  for (const [sym, stroops] of Object.entries(breakdown)) {
    const units = Number(stroops) / 10_000_000;
    tokenBreakdownFormatted[sym] = units.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
  }

  const xlmUnits = Number(totalXlmStroops) / 10_000_000;

  return {
    count: selectedItems.length,
    totalXlmUnits: xlmUnits.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    }),
    tokenBreakdown: tokenBreakdownFormatted,
    selectedIndices: selectedItems.map((i) => i.escrowIndex),
    isValid: selectedItems.length > 0,
  };
}

