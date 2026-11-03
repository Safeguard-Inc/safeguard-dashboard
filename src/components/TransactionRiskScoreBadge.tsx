import React from 'react';
import { getRiskBadgeConfig } from '../lib/riskBadge';

interface TransactionRiskScoreBadgeProps {
  score: number;
  showMeter?: boolean;
}

export const TransactionRiskScoreBadge: React.FC<TransactionRiskScoreBadgeProps> = ({
  score,
  showMeter = false,
}) => {
  const config = getRiskBadgeConfig(score);

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${config.bgClass} ${config.colorClass} ${config.borderClass}`}
      >
        <span className="font-mono">{config.score}</span>
        <span className="opacity-60">/ 100</span>
        <span className="text-[10px] font-bold uppercase tracking-wider ml-0.5">
          ({config.label})
        </span>
      </span>

      {showMeter && (
        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
          <div
            className={`h-1.5 rounded-full ${
              config.band === 'HIGH'
                ? 'bg-rose-500'
                : config.band === 'MEDIUM'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${config.score}%` }}
          />
        </div>
      )}
    </div>
  );
};
