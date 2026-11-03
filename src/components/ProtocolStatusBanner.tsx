'use client';

import React from 'react';
import {
  type ProtocolOperationalState,
  evaluateProtocolStatusAlerts,
} from '../lib/protocolStatusBanner';

export interface ProtocolStatusBannerProps {
  state?: ProtocolOperationalState;
  onDismiss?: () => void;
}

const DEFAULT_OPERATIONAL_STATE: ProtocolOperationalState = {
  isCircuitBreakerPaused: false,
  pauseRemainingSeconds: 0,
  ledgerLagSeconds: 2,
  networkTipLedger: 5410982,
  isHealthy: true,
};

export function ProtocolStatusBanner({
  state = DEFAULT_OPERATIONAL_STATE,
  onDismiss,
}: ProtocolStatusBannerProps) {
  const alert = evaluateProtocolStatusAlerts(state);

  if (!alert.showAlert) {
    return null;
  }

  const isCritical = alert.severity === 'critical';

  return (
    <div
      className={`w-full py-2.5 px-4 border-b flex items-center justify-between text-xs transition-all ${
        isCritical
          ? 'bg-rose-950/80 border-rose-800/80 text-rose-200'
          : 'bg-amber-950/80 border-amber-800/80 text-amber-200'
      }`}
    >
      <div className="flex items-center space-x-3 max-w-5xl">
        <span className="text-base">{isCritical ? '🛑' : '⚠️'}</span>
        <div>
          <span className="font-bold tracking-wide mr-2">{alert.title}:</span>
          <span className="opacity-90">{alert.message}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
            isCritical
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {alert.badgeText}
        </span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="hover:opacity-75 font-bold px-1 text-slate-400"
            title="Dismiss banner"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
