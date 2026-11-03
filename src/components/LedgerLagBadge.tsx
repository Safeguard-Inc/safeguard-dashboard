'use client';

import React from 'react';
import { calculateLedgerLag, getLedgerLagDisplay } from '../lib/ledgerLag';

export interface LedgerLagBadgeProps {
  networkLedger: number;
  indexerLedger: number;
  className?: string;
}

export function LedgerLagBadge({
  networkLedger,
  indexerLedger,
  className = '',
}: LedgerLagBadgeProps) {
  const lag = calculateLedgerLag(networkLedger, indexerLedger);
  const display = getLedgerLagDisplay(lag);

  return (
    <div
      title={display.tooltipText}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium cursor-help transition-all ${display.bgClass} ${display.borderClass} ${display.textClass} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${display.dotClass}`} />
      <span>{display.badgeLabel}</span>
      <span className="text-[10px] opacity-60 font-mono">
        (#{indexerLedger} / #{networkLedger})
      </span>
    </div>
  );
}
