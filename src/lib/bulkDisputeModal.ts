export interface BulkDisputeItem {
  id: number | string;
  escrowIndex: number;
  amountStroops: string;
  tokenSymbol: string;
  sender: string;
  recipient: string;
  status: string;
}

export interface BulkDisputeSummary {
  count: number;
  totalXlmUnits: string;
  tokenBreakdown: Record<string, string>;
  selectedIndices: number[];
  isValid: boolean;
}

/**
 * Filter escrows eligible for dispute (must be in Pending status, and caller must be party if specified).
 */
export function filterEligibleForDispute(
  items: BulkDisputeItem[],
  callerAddress?: string
): BulkDisputeItem[] {
  return items.filter((item) => {
    if (item.status !== 'Pending') return false;
    if (!callerAddress) return true;
    return item.sender === callerAddress || item.recipient === callerAddress;
  });
}

/**
 * Calculates aggregate volume and metrics across selected dispute escrows.
 */
export function calculateBulkDisputeSummary(
  selectedIndices: number[],
  items: BulkDisputeItem[]
): BulkDisputeSummary {
  const selectedItems = items.filter(
    (item) => selectedIndices.includes(item.escrowIndex) && item.status === 'Pending'
  );

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

