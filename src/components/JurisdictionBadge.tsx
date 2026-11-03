'use client';

import React from 'react';
import { getJurisdictionDisplay, formatJurisdictionTooltip } from '../lib/jurisdictionDisplay';

export interface JurisdictionBadgeProps {
  numericCode: number;
  className?: string;
}

export function JurisdictionBadge({ numericCode, className = '' }: JurisdictionBadgeProps) {
  const display = getJurisdictionDisplay(numericCode);
  const tooltip = formatJurisdictionTooltip(numericCode);

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-help transition-all ${display.bgClass} ${display.borderClass} ${display.textClass} ${className}`}
    >
      <span>{display.badgeLabel}</span>
    </span>
  );
}
