import React from 'react';
import { formatKycExpiration } from '../lib/kycBadge';

interface KycExpirationBadgeProps {
  expiresAt: number | null | undefined;
  level?: number;
  showSubtext?: boolean;
  warningThresholdDays?: number;
}

export const KycExpirationBadge: React.FC<KycExpirationBadgeProps> = ({
  expiresAt,
  level,
  showSubtext = false,
  warningThresholdDays = 7,
}) => {
  const info = formatKycExpiration(expiresAt, undefined, warningThresholdDays);

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${info.badgeClass}`}
        title={info.subtext}
      >
        <span>{info.icon}</span>
        <span>{info.label}</span>
      </span>

      {level !== undefined && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
          L{level}
        </span>
      )}

      {showSubtext && (
        <span className="text-[11px] text-slate-400 ml-1">
          {info.subtext}
        </span>
      )}
    </div>
  );
};
