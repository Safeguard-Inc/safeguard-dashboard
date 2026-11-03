export interface EscrowTelemetryData {
  totalEscrows: number;
  pendingCount: number;
  disputedCount: number;
  settledCount: number;
  totalLockedStroops: string;
  averageLockRemainingSeconds?: number;
}

export interface VolumeDisplay {
  amountXlm: string;
  badgeLabel: string;
  isHighExposure: boolean;
}

/**
 * Formats locked collateral stroops into human-friendly XLM notation and assesses exposure risk level.
 */
export function formatLockedVolumeDisplay(stroops: string): VolumeDisplay {
  let stroopsBn = 0n;
  try {
    stroopsBn = BigInt(stroops);
  } catch {
    stroopsBn = 0n;
  }

  const xlmUnits = Number(stroopsBn) / 10_000_000;
  const isHighExposure = xlmUnits >= 10_000;
  const badgeLabel = isHighExposure ? 'High Exposure' : 'Normal Exposure';

  return {
    amountXlm: xlmUnits.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }),
    badgeLabel,
    isHighExposure,
  };
}

/**
 * Converts remaining lock seconds into human-readable duration notation.
 */
export function formatDurationRemaining(seconds?: number): string {
  if (seconds === undefined || seconds === null) return 'N/A';
  if (seconds <= 0) return 'Matured';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds % 60}s`;
}

/**
 * Calculates historical settlement completion ratio as a percentage.
 */
export function calculateSettlementRatio(settled: number, total: number): { ratioPercent: number; formatted: string } {
  if (total <= 0) {
    return { ratioPercent: 100, formatted: '100%' };
  }
  const ratio = Math.min(100, Math.max(0, (settled / total) * 100));
  return {
    ratioPercent: Math.round(ratio),
    formatted: `${ratio.toFixed(1)}%`,
  };
}

