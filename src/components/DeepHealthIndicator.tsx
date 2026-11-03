'use client';

import React from 'react';
import {
  gradeRpcLatency,
  formatHealthBadge,
  type DeepHealthMetrics,
} from '../lib/deepHealth';

interface DeepHealthIndicatorProps {
  metrics: DeepHealthMetrics;
  className?: string;
}

export const DeepHealthIndicator: React.FC<DeepHealthIndicatorProps> = ({
  metrics,
  className = '',
}) => {
  const latencyInfo = gradeRpcLatency(metrics.latencyMs);
  const badgeStyle = formatHealthBadge(metrics);

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${badgeStyle.badgeBg} ${badgeStyle.badgeBorder} ${badgeStyle.badgeText} ${className}`}
      title={`Ledger: #${metrics.lastLedger} | Events: ${metrics.eventsProcessed}`}
    >
      <span className={`w-2 h-2 rounded-full ${latencyInfo.dotColor} animate-pulse`} />
      <span>{badgeStyle.statusText}</span>
      <span className="text-[10px] opacity-75 font-mono">({latencyInfo.label})</span>
    </div>
  );
};
