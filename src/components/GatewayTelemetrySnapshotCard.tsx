import React, { useMemo } from 'react';
import {
  type SnapshotTelemetryData,
  formatSyncBadge,
  formatStroopVolumeToXlm,
  formatLedgerLagWarning,
} from '../lib/telemetrySnapshotCard';

interface GatewayTelemetrySnapshotCardProps {
  initialData?: SnapshotTelemetryData;
  onRefresh?: () => void;
}

const DEFAULT_DATA: SnapshotTelemetryData = {
  sequence: 148,
  escrowCount: 42,
  volumeStroops: '125000000000', // 12,500 XLM
  spendCapStroops: '1000000000', // 100 XLM
  syncStatus: 'IN_SYNC',
  lagSeconds: 2,
  isPaused: false,
};

export const GatewayTelemetrySnapshotCard: React.FC<GatewayTelemetrySnapshotCardProps> = ({
  initialData = DEFAULT_DATA,
  onRefresh,
}) => {
  const badge = useMemo(() => formatSyncBadge(initialData.syncStatus), [initialData.syncStatus]);
  const volumeFormatted = useMemo(() => formatStroopVolumeToXlm(initialData.volumeStroops), [initialData.volumeStroops]);
  const spendCapFormatted = useMemo(() => formatStroopVolumeToXlm(initialData.spendCapStroops), [initialData.spendCapStroops]);
  const lagWarning = useMemo(() => formatLedgerLagWarning(initialData.lagSeconds), [initialData.lagSeconds]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Gateway Telemetry Snapshot</h3>
            <p className="text-[11px] text-slate-400">On-chain consensus nonces and cumulative settlement volumes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge.badgeClass}`}>
            {badge.icon} {badge.label}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-slate-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg border border-slate-700 transition"
              title="Refresh Telemetry"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Sequence Nonces</div>
          <div className="text-lg font-bold font-mono text-white">#{initialData.sequence.toLocaleString()}</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Total Escrows</div>
          <div className="text-lg font-bold font-mono text-cyan-300">{initialData.escrowCount.toLocaleString()}</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Processed Volume</div>
          <div className="text-sm font-bold font-mono text-emerald-400">{volumeFormatted} XLM</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Active Spend Cap</div>
          <div className="text-sm font-bold font-mono text-amber-300">{spendCapFormatted} XLM</div>
        </div>
      </div>

      {lagWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] p-2.5 rounded-xl text-center">
          {lagWarning}
        </div>
      )}
    </div>
  );
};
