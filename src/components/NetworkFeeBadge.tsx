'use client';

import React from 'react';
import { formatFeeDisplay, getFeeBadgeStyle } from '../lib/formatters';

export { formatFeeDisplay, getFeeBadgeStyle };

export interface NetworkFeeBadgeProps {
  feeStroops: number | string;
  tier?: 'low' | 'normal' | 'priority';
  isEscrow?: boolean;
  className?: string;
}

export function NetworkFeeBadge({
  feeStroops,
  tier = 'normal',
  isEscrow = false,
  className = '',
}: NetworkFeeBadgeProps) {
  const { stroops, xlm } = formatFeeDisplay(feeStroops);
  const style = getFeeBadgeStyle(isEscrow, tier);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-sm ${style.bg} ${style.border} ${style.text} ${className}`}
      title={`Network fee: ${stroops} stroops (${style.label})`}
    >
      <span className="flex h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      <span className="font-semibold">{xlm}</span>
      <span className="opacity-70 text-[10px] hidden sm:inline">({style.label})</span>
    </div>
  );
}
