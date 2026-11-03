/**
 * Domain logic for EnterpriseDisbursementEngineCard: batch partition calculation,
 * address format validation, and network fee projections.
 */

export interface DisbursementItem {
  recipient: string;
  amount: string;
  asset: string;
  memo?: string;
}

export interface DisbursementPlanSummary {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  totalVolume: number;
  chunkCount: number;
  estimatedFeeXlm: string;
}

/**
 * Validates Stellar public key strkey formatting (G..., 56 chars).
 */
export function validateDisbursementAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return /^G[A-Z2-7]{55}$/.test(trimmed);
}

/**
 * Calculates aggregate plan metrics for batch disbursements.
 */
export function calculateDisbursementPlan(
  items: DisbursementItem[],
  maxChunkSize: number = 25
): DisbursementPlanSummary {
  if (!items || items.length === 0) {
    return {
      totalCount: 0,
      validCount: 0,
      invalidCount: 0,
      totalVolume: 0,
      chunkCount: 0,
      estimatedFeeXlm: '0.0000',
    };
  }

  const effectiveChunkSize = Math.max(1, maxChunkSize);
  let validCount = 0;
  let invalidCount = 0;
  let totalVolume = 0;

  for (const item of items) {
    if (validateDisbursementAddress(item.recipient)) {
      validCount++;
    } else {
      invalidCount++;
    }

    const parsed = parseFloat(item.amount);
    if (!Number.isNaN(parsed) && parsed > 0) {
      totalVolume += parsed;
    }
  }

  const chunkCount = Math.ceil(items.length / effectiveChunkSize);
  // Estimate ~10,000 stroops base fee per chunk in Soroban
  const totalStroops = BigInt(chunkCount) * 10_000n;
  const estimatedFeeXlm = (Number(totalStroops) / 10_000_000).toFixed(4);

  return {
    totalCount: items.length,
    validCount,
    invalidCount,
    totalVolume: Math.round(totalVolume * 100) / 100,
    chunkCount,
    estimatedFeeXlm,
  };
}
