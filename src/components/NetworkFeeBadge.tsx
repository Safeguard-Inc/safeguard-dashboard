'use client';

import React from 'react';
import { formatStroopsToXlm } from '../lib/formatters';

export interface NetworkFeeBadgeProps {
  feeStroops: number | string;
  tier?: 'low' | 'normal' | 'priority';
  isEscrow?: boolean;
  className?: string;
}

export function formatFeeDisplay(feeStroops: number | string): { stroops: string; xlm: string } {
  const stroopsNum = typeof feeStroops === 'number' ? feeStroops : parseInt(String(feeStroops), 10) || 0;
  const xlm = formatStroopsToXlm(stroopsNum);
  return {
    stroops: stroopsNum.toLocaleString(),
    xlm,
  };
}

export function getFeeBadgeStyle(isEscrow: boolean, tier: string = 'normal'): {
  border: string;
  bg: string;
  text: string;
  label: string;
} {
  if (isEscrow) {
    return {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      label: 'Escrow State Rent',
    };
  }
  if (tier === 'priority') {
    return {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      label: 'Priority Surge',
    };
  }
  return {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    label: 'Standard Transfer',
  };
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
