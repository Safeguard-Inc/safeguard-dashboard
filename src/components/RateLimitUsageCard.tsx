import React from 'react';
import {
  RateLimitTier,
  formatTierLabel,
  calculateTierUsage,
} from '../lib/tieredRateLimitDisplay';

interface RateLimitUsageCardProps {
  tier: RateLimitTier;
  remaining: number;
  limit: number;
  resetSeconds?: number;
  apiKeyIdentifier?: string;
}

export const RateLimitUsageCard: React.FC<RateLimitUsageCardProps> = ({
  tier,
  remaining,
  limit,
  resetSeconds = 60,
  apiKeyIdentifier,
}) => {
  const tierInfo = formatTierLabel(tier);
  const usage = calculateTierUsage(remaining, limit);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <div>
            <h4 className="font-semibold text-white text-sm">API Quota Utilization</h4>
            {apiKeyIdentifier && (
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Key: {apiKeyIdentifier}
              </p>
            )}
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${tierInfo.badgeClass}`}
        >
          <span>{tierInfo.icon}</span>
          <span>{tierInfo.name}</span>
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Requests Remaining:</span>
          <span className="font-semibold font-mono text-white">
            {usage.remaining} / {usage.limit}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${usage.barColorClass}`}
            style={{ width: `${Math.min(100, Math.max(0, 100 - usage.percentUsed))}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
          <span>{usage.percentUsed}% consumed</span>
          <span>Refills in ~{resetSeconds}s</span>
        </div>

        {tier === 'public' && (
          <div className="mt-2 p-2.5 bg-blue-950/30 border border-blue-900/40 rounded-xl text-[11px] text-blue-300">
            💡 Provide a Standard or Enterprise API token to unlock up to 600 req/min.
          </div>
        )}
      </div>
    </div>
  );
};
