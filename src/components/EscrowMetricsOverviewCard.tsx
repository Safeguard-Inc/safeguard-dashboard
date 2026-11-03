import React from 'react';
import {
  EscrowTelemetryData,
  formatLockedVolumeDisplay,
  formatDurationRemaining,
  calculateSettlementRatio,
} from '../lib/escrowMetricsCard';

interface EscrowMetricsOverviewCardProps {
  metrics: EscrowTelemetryData;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const EscrowMetricsOverviewCard: React.FC<EscrowMetricsOverviewCardProps> = ({
  metrics,
  onRefresh,
  isLoading = false,
}) => {
  const volume = formatLockedVolumeDisplay(metrics.totalLockedStroops);
  const duration = formatDurationRemaining(metrics.averageLockRemainingSeconds);
  const settlement = calculateSettlementRatio(metrics.settledCount, metrics.totalEscrows);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-sm font-semibold text-white">Escrow Collateral Telemetry</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              volume.isHighExposure
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {volume.badgeLabel}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-white transition disabled:opacity-50"
              title="Refresh Telemetry"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Total Locked */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Locked Collateral</span>
          <div className="text-base font-bold text-white font-mono">
            {volume.amountXlm} <span className="text-xs text-blue-400 font-sans">XLM</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {metrics.pendingCount} active escrows
          </span>
        </div>

        {/* Settlement Ratio */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Settlement Rate</span>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {settlement.formatted}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {metrics.settledCount} settled of {metrics.totalEscrows}
          </span>
        </div>

        {/* Disputed Count */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Active Disputes</span>
          <div
            className={`text-base font-bold font-mono ${
              metrics.disputedCount > 0 ? 'text-rose-400' : 'text-slate-300'
            }`}
          >
            {metrics.disputedCount}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {metrics.disputedCount > 0 ? 'Requires arbitration' : 'No open claims'}
          </span>
        </div>

        {/* Avg Remaining Timelock */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Avg Remaining Lock</span>
          <div className="text-base font-bold text-cyan-400 font-mono">
            {duration}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Until timelock expiry
          </span>
        </div>
      </div>
    </div>
  );
};

