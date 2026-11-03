export interface StorageFootprintStats {
  instanceBytes: number;
  persistentBytes: number;
  temporaryBytes?: number;
  totalBytes: number;
  entryCount: number;
}

export interface LedgerTtlStatus {
  ledgersRemaining: number;
  daysRemaining: number;
  status: 'healthy' | 'warning' | 'critical';
  label: string;
  badgeClass: string;
}

export interface RentProjectionSummary {
  estimatedStroops: number;
  estimatedXlm: string;
  extensionDays: number;
}

/**
 * Format raw byte size into human-readable string.
 */
export function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Calculate TTL status and warning levels based on current and liveUntil ledgers.
 */
export function formatLedgerTtlStatus(
  currentLedger: number,
  liveUntilLedger: number,
  ledgersPerDay: number = 17280
): LedgerTtlStatus {
  const ledgersRemaining = Math.max(0, liveUntilLedger - currentLedger);
  const daysRemaining = Number((ledgersRemaining / ledgersPerDay).toFixed(1));

  if (daysRemaining <= 3) {
    return {
      ledgersRemaining,
      daysRemaining,
      status: 'critical',
      label: `Critical: ${daysRemaining}d remaining`,
      badgeClass: 'border-rose-600 bg-rose-950/60 text-rose-300',
    };
  }

  if (daysRemaining <= 14) {
    return {
      ledgersRemaining,
      daysRemaining,
      status: 'warning',
      label: `Warning: ${daysRemaining}d remaining`,
      badgeClass: 'border-amber-600 bg-amber-950/60 text-amber-300',
    };
  }

  return {
    ledgersRemaining,
    daysRemaining,
    status: 'healthy',
    label: `Healthy: ${daysRemaining}d remaining`,
    badgeClass: 'border-emerald-600 bg-emerald-950/60 text-emerald-300',
  };
}

/**
 * Project estimated rent extension fee in stroops and XLM.
 */
export function calculateRentProjectionDisplay(
  totalBytes: number,
  entryCount: number = 2,
  extensionDays: number = 30
): RentProjectionSummary {
  // Base cost 200 stroops per entry + 5 stroops per byte per day
  const baseCost = entryCount * 200;
  const byteCost = totalBytes * extensionDays * 5;
  const totalStroops = baseCost + byteCost;
  const xlm = (totalStroops / 10_000_000).toFixed(7);

  return {
    estimatedStroops: totalStroops,
    estimatedXlm: `${xlm} XLM`,
    extensionDays,
  };
}
