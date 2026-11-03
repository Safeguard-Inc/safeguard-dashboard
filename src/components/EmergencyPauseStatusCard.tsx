import React, { useState } from 'react';
import {
  type CircuitBreakerStatus,
  type EmergencyPauseData,
  formatRemainingDuration,
  formatCircuitBreakerBadge,
  isCallerGuardianOrAdmin,
  calculateTimelockExpirySeconds,
} from '../lib/emergencyPauseCard';

interface EmergencyPauseStatusCardProps {
  initialData?: EmergencyPauseData;
  adminAddress?: string;
  guardianAddress?: string;
  connectedWallet?: string;
  onTriggerPause?: (durationSeconds: number) => Promise<void>;
  onClearPause?: () => Promise<void>;
}

const DEFAULT_DATA: EmergencyPauseData = {
  isPaused: false,
  pausedUntil: 0,
  pausedBy: null,
  remainingSeconds: 0,
  circuitBreakerState: 'NORMAL_OPERATIONAL',
};

export const EmergencyPauseStatusCard: React.FC<EmergencyPauseStatusCardProps> = ({
  initialData = DEFAULT_DATA,
  adminAddress = 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
  guardianAddress = 'GGUARDIAN44444444444444444444444444444444444444444444444',
  connectedWallet = '',
  onTriggerPause,
  onClearPause,
}) => {
  const [data, setData] = useState<EmergencyPauseData>(initialData);
  const [selectedDuration, setSelectedDuration] = useState<'5m' | '1h' | '24h' | 'indefinite'>('1h');
  const [loading, setLoading] = useState(false);

  const badge = formatCircuitBreakerBadge(data.circuitBreakerState);
  const isAuthorized = isCallerGuardianOrAdmin(connectedWallet, adminAddress, guardianAddress);

  const handlePause = async () => {
    if (!onTriggerPause) return;
    setLoading(true);
    try {
      const sec = calculateTimelockExpirySeconds(selectedDuration);
      await onTriggerPause(sec);
      setData({
        isPaused: true,
        pausedUntil: sec > 0 ? Math.floor(Date.now() / 1000) + sec : 0,
        pausedBy: connectedWallet || 'Current User',
        remainingSeconds: sec,
        circuitBreakerState: sec > 0 ? 'TIMELOCKED_PAUSED' : 'ACTIVE_PAUSED',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!onClearPause) return;
    setLoading(true);
    try {
      await onClearPause();
      setData({
        isPaused: false,
        pausedUntil: 0,
        pausedBy: null,
        remainingSeconds: 0,
        circuitBreakerState: 'NORMAL_OPERATIONAL',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{badge.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Emergency Circuit Breaker</h3>
            <p className="text-[11px] text-slate-400">On-chain timelocked defense and guardian controls</p>
          </div>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge.badgeClass}`}>
          {badge.label}
        </span>
      </div>

      {/* Status Details */}
      <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800/80 mb-4 text-xs space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Operating Status:</span>
          <span className={data.isPaused ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {data.isPaused ? 'Halted / Paused' : 'Active / Processing'}
          </span>
        </div>
        {data.isPaused && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Triggered By:</span>
              <span className="font-mono text-slate-300">
                {data.pausedBy ? `${data.pausedBy.slice(0, 6)}...${data.pausedBy.slice(-4)}` : 'Admin'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Timelock Window:</span>
              <span className="font-mono text-amber-300 font-semibold">
                {formatRemainingDuration(data.remainingSeconds)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {data.isPaused ? (
        <div className="space-y-2">
          <button
            onClick={handleClear}
            disabled={loading}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            {loading ? 'Resuming...' : 'Clear Emergency Pause (Resume Operations)'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Timelock Duration:</span>
            <div className="flex gap-1">
              {(['5m', '1h', '24h', 'indefinite'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedDuration(preset)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                    selectedDuration === preset
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handlePause}
            disabled={loading}
            className="w-full py-2 bg-rose-600/90 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            {loading ? 'Engaging...' : `Engage Circuit Breaker (${selectedDuration})`}
          </button>
        </div>
      )}

      {connectedWallet && !isAuthorized && (
        <p className="text-[10px] text-amber-400/80 mt-2 text-center">
          Note: Current account is neither admin nor guardian; transactions may revert on-chain.
        </p>
      )}
    </div>
  );
};
