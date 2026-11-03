import React from 'react';
import {
  DrawerMultiSigTx,
  calculateProgressPercentage,
  canActiveUserSign,
  formatSigningThresholdBadge,
} from '../lib/multiSigDrawer';

interface MultiSigSigningDrawerProps {
  isOpen: boolean;
  tx?: DrawerMultiSigTx;
  userAddress?: string;
  onClose: () => void;
  onSign: (txId: string) => Promise<void> | void;
  onSubmitToLedger?: (txId: string) => Promise<void> | void;
  isPendingAction?: boolean;
}

export const MultiSigSigningDrawer: React.FC<MultiSigSigningDrawerProps> = ({
  isOpen,
  tx,
  userAddress,
  onClose,
  onSign,
  onSubmitToLedger,
  isPendingAction,
}) => {
  if (!isOpen || !tx) return null;

  const progress = calculateProgressPercentage(tx.currentWeight, tx.requiredWeight);
  const badge = formatSigningThresholdBadge(tx);
  const canSign = canActiveUserSign(tx, userAddress);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl text-slate-100 animate-slide-left">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✍️</span>
              <h3 className="font-semibold text-lg text-white">Multi-Sig Signing Drawer</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Threshold Progress</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.bgClass} ${badge.textClass}`}>
                  {badge.label}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    tx.isReady ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Authorized Signers ({tx.signers.length})
              </h4>
              <div className="space-y-2">
                {tx.signers.map((s, idx) => (
                  <div
                    key={`${s.publicKey}-${idx}`}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-mono text-slate-200 truncate">{s.publicKey}</p>
                      <p className="text-[11px] text-slate-400">Weight: {s.weight}</p>
                    </div>
                    {s.hasSigned ? (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                        ✓ Signed
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
          {canSign && (
            <button
              onClick={() => onSign(tx.id)}
              disabled={isPendingAction}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition disabled:opacity-50"
            >
              {isPendingAction ? 'Signing with Wallet...' : 'Sign with Connected Account'}
            </button>
          )}

          {tx.isReady && onSubmitToLedger && (
            <button
              onClick={() => onSubmitToLedger(tx.id)}
              disabled={isPendingAction}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition disabled:opacity-50"
            >
              {isPendingAction ? 'Submitting to Stellar...' : 'Submit Transaction to Ledger'}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
