/**
 * ledgerLag.ts
 *
 * Domain logic and presentation styling for Stellar ledger consensus synchronization.
 */

export type LedgerLagLevel = 'synced' | 'degraded' | 'desynced';

export interface LedgerLagDisplay {
  level: LedgerLagLevel;
  lagLedgers: number;
  lagSeconds: number;
  badgeLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  tooltipText: string;
}

export function calculateLedgerLag(networkLedger: number, indexerLedger: number): number {
  return Math.max(0, networkLedger - indexerLedger);
}

export function getLedgerLagDisplay(lagLedgers: number): LedgerLagDisplay {
  const lagSeconds = lagLedgers * 5;

  if (lagLedgers <= 2) {
    return {
      level: 'synced',
      lagLedgers,
      lagSeconds,
      badgeLabel: lagLedgers === 0 ? 'Consensus Synced' : `Lag: ${lagLedgers} ledgers (~${lagSeconds}s)`,
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30',
      dotClass: 'bg-emerald-500',
      tooltipText: 'Indexer is in real-time sync with Stellar consensus ledger (< 10s latency).',
    };
  }

  if (lagLedgers <= 10) {
    return {
      level: 'degraded',
      lagLedgers,
      lagSeconds,
      badgeLabel: `Catching Up: ${lagLedgers} ledgers (~${lagSeconds}s)`,
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
      dotClass: 'bg-amber-500',
      tooltipText: `Minor sync lag detected (~${lagSeconds}s behind Horizon tip). Processing backlog.`,
    };
  }

  return {
    level: 'desynced',
    lagLedgers,
    lagSeconds,
    badgeLabel: `Desynced: ${lagLedgers} ledgers (~${lagSeconds}s)`,
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    dotClass: 'bg-rose-500 animate-pulse',
    tooltipText: `Critical ledger divergence. Indexer is ${lagLedgers} ledgers behind consensus.`,
  };
}
