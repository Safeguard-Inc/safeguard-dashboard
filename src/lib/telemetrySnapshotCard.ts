/**
 * Domain logic for GatewayTelemetrySnapshotCard: sync badge formatting,
 * volume conversion, and lag threshold evaluation.
 */

export interface SnapshotTelemetryData {
  sequence: number;
  escrowCount: number;
  volumeStroops: string;
  spendCapStroops: string;
  syncStatus: 'IN_SYNC' | 'INDEXING_LAG' | 'DESYNCHRONIZED';
  lagSeconds: number;
  isPaused: boolean;
}

/**
 * Resolves visual indicator for on-chain reconciliation status.
 */
export function formatSyncBadge(status: 'IN_SYNC' | 'INDEXING_LAG' | 'DESYNCHRONIZED'): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  switch (status) {
    case 'IN_SYNC':
      return {
        label: 'Consensus In-Sync',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        icon: '🟢',
      };
    case 'INDEXING_LAG':
      return {
        label: 'Indexing Minor Lag',
        badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
        icon: '🟡',
      };
    case 'DESYNCHRONIZED':
    default:
      return {
        label: 'Desynchronized Alert',
        badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
        icon: '🔴',
      };
  }
}

/**
 * Converts stroop string to localized XLM/token decimal string.
 */
export function formatStroopVolumeToXlm(stroops: string): string {
  try {
    const bn = BigInt(stroops || '0');
    const xlm = Number(bn) / 10_000_000;
    return xlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } catch {
    return '0.00';
  }
}

/**
 * Formats warning note if ledger lag exceeds acceptable threshold.
 */
export function formatLedgerLagWarning(lagSeconds: number): string | null {
  if (lagSeconds <= 5) return null;
  if (lagSeconds <= 15) return `Notice: Node ledger sync is approximately ${lagSeconds}s behind network tip.`;
  return `Warning: Substantial indexing lag detected (${lagSeconds}s). Reconciliation required.`;
}
