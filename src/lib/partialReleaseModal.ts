export interface PartialReleaseValidation {
  isValid: boolean;
  error?: string;
  releaseAmountStroops?: string;
  remainingStroops?: string;
  isFullRelease?: boolean;
}

export interface ReleasePreview {
  totalUnits: string;
  releaseUnits: string;
  remainingUnits: string;
  percentage: number;
}

/**
 * Validates partial release inputs against current escrow balance in stroops.
 */
export function validatePartialRelease(
  releaseAmountUnits: string,
  totalAmountStroops: string
): PartialReleaseValidation {
  const trimmed = releaseAmountUnits.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Release amount is required' };
  }

  const num = parseFloat(trimmed);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Release amount must be greater than 0' };
  }

  try {
    const releaseStroops = BigInt(Math.round(num * 10_000_000));
    const totalStroops = BigInt(totalAmountStroops);

    if (releaseStroops <= 0n) {
      return { isValid: false, error: 'Release amount must be greater than zero' };
    }

    if (releaseStroops > totalStroops) {
      return { isValid: false, error: 'Release amount exceeds current escrow balance' };
    }

    const remaining = totalStroops - releaseStroops;
    return {
      isValid: true,
      releaseAmountStroops: releaseStroops.toString(),
      remainingStroops: remaining.toString(),
      isFullRelease: remaining === 0n,
    };
  } catch {
    return { isValid: false, error: 'Invalid numeric amount' };
  }
}

/**
 * Formats escrow milestone disbursement preview.
 */
export function formatEscrowReleasePreview(
  totalStroops: string,
  releaseStroops: string,
  symbol: string = 'XLM'
): ReleasePreview {
  try {
    const total = BigInt(totalStroops);
    const release = BigInt(releaseStroops);
    const remaining = total >= release ? total - release : 0n;

    const totalUnits = (Number(total) / 10_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
    const releaseUnits = (Number(release) / 10_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
    const remainingUnits = (Number(remaining) / 10_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });

    const percentage = total > 0n ? Number(((release * 10000n) / total)) / 100 : 0;

    return {
      totalUnits: `${totalUnits} ${symbol}`,
      releaseUnits: `${releaseUnits} ${symbol}`,
      remainingUnits: `${remainingUnits} ${symbol}`,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  } catch {
    return {
      totalUnits: `0 ${symbol}`,
      releaseUnits: `0 ${symbol}`,
      remainingUnits: `0 ${symbol}`,
      percentage: 0,
    };
  }
}
