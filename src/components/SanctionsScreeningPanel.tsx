import React from 'react';
import {
  SanctionsScreeningRecord,
  formatSanctionsStatusBadge,
  getSanctionsRiskRating,
} from '../lib/sanctionsScreening';

interface SanctionsScreeningPanelProps {
  records: SanctionsScreeningRecord[];
  onReviewMatch?: (record: SanctionsScreeningRecord) => void;
  isLoading?: boolean;
}

export const SanctionsScreeningPanel: React.FC<SanctionsScreeningPanelProps> = ({
  records,
  onReviewMatch,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse text-slate-400 text-sm">
        Screening against global sanctions registries (OFAC, EU, UN)...
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-sm">
        No active addresses submitted for sanctions screening.
      </div>
    );
  }

  const criticalMatches = records.filter((r) => r.status === 'CONFIRMED_MATCH');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <div>
            <h3 className="font-semibold text-white text-base">Sanctions & Watchlist Screening</h3>
            <p className="text-xs text-slate-400">
              Evaluated against on-chain policy and institutional watchlists
            </p>
          </div>
        </div>

        {criticalMatches.length > 0 ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700">
            {criticalMatches.length} Critical {criticalMatches.length === 1 ? 'Match' : 'Matches'}
          </span>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700">
            All Clear
          </span>
        )}
      </div>

      <div className="space-y-3">
        {records.map((rec, idx) => {
          const badge = formatSanctionsStatusBadge(rec.status);
          const risk = getSanctionsRiskRating(rec);

          return (
            <div
              key={`${rec.address}-${idx}`}
              className={`p-3.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                rec.status === 'CONFIRMED_MATCH'
                  ? 'bg-rose-950/20 border-rose-800/60'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-medium text-slate-300 truncate max-w-xs">
                    {rec.address}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                  >
                    {badge.label}
                  </span>
                  <span className={`text-[11px] font-bold ${risk.color}`}>
                    Risk: {risk.rating}
                  </span>
                </div>

                {rec.listId && (
                  <p className="text-xs text-slate-400">
                    Watchlist: <span className="font-mono text-slate-300">{rec.listId}</span>
                    {rec.program ? ` (${rec.program})` : ''}
                  </p>
                )}
              </div>

              {onReviewMatch && rec.status !== 'CLEAN' && (
                <button
                  onClick={() => onReviewMatch(rec)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
                >
                  Review Match
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
