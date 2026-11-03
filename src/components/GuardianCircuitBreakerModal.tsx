import React from 'react';
import {
  CircuitBreakerState,
  canTriggerGuardianPause,
  canResumeGateway,
  formatGatewayOperatingStatus,
  resolveUserRole,
} from '../lib/circuitBreaker';

interface GuardianCircuitBreakerModalProps {
  isOpen: boolean;
  state: CircuitBreakerState;
  onClose: () => void;
  onTriggerPause: () => Promise<void> | void;
  onResume: () => Promise<void> | void;
  isActionPending?: boolean;
}

export const GuardianCircuitBreakerModal: React.FC<GuardianCircuitBreakerModalProps> = ({
  isOpen,
  state,
  onClose,
  onTriggerPause,
  onResume,
  isActionPending,
}) => {
  if (!isOpen) return null;

  const statusInfo = formatGatewayOperatingStatus(state.isPaused);
  const role = resolveUserRole(state);
  const canPause = canTriggerGuardianPause(state);
  const canResume = canResumeGateway(state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h3 className="text-lg font-semibold text-white">Emergency Circuit Breaker</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-5">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs text-slate-400">Gateway Status</p>
              <p className="text-sm font-bold text-white mt-0.5">{statusInfo.status}</p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusInfo.colorClass}`}
            >
              {statusInfo.badge}
            </span>
          </div>

          <div className="text-xs space-y-1.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="flex justify-between">
              <span className="text-slate-400">Your Connected Role:</span>
              <span className="font-semibold text-white">{role}</span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-slate-400">Admin Address:</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px]">
                {state.adminAddress}
              </span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-slate-400">Guardian Address:</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px]">
                {state.guardianAddress || 'None configured'}
              </span>
            </div>
          </div>

          {state.isPaused ? (
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs text-amber-200">
              ⚠️ The gateway is frozen. All incoming payment transactions are halted on-chain until the admin signs a resume transaction.
            </div>
          ) : (
            <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-lg text-xs text-rose-200">
              🚨 Triggering the circuit breaker halts all payment routing immediately. Only the Guardian or Admin can execute this action.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Close
          </button>

          {!state.isPaused && canPause && (
            <button
              onClick={onTriggerPause}
              disabled={isActionPending}
              className="px-4 py-2 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition disabled:opacity-50"
            >
              {isActionPending ? 'Freezing Gateway...' : 'Trigger Emergency Pause'}
            </button>
          )}

          {state.isPaused && canResume && (
            <button
              onClick={onResume}
              disabled={isActionPending}
              className="px-4 py-2 text-xs rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {isActionPending ? 'Resuming Gateway...' : 'Resume Gateway Operations'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
