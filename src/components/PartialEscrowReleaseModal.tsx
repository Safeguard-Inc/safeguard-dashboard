import React, { useState, useMemo } from 'react';
import {
  validatePartialRelease,
  formatEscrowReleasePreview,
} from '../lib/partialReleaseModal';

interface PartialEscrowReleaseModalProps {
  isOpen: boolean;
  escrowId: number | string;
  totalAmountStroops: string;
  tokenSymbol?: string;
  recipientAddress: string;
  onConfirmRelease: (amountStroops: string) => Promise<void> | void;
  onClose: () => void;
  isActionPending?: boolean;
}

export const PartialEscrowReleaseModal: React.FC<PartialEscrowReleaseModalProps> = ({
  isOpen,
  escrowId,
  totalAmountStroops,
  tokenSymbol = 'XLM',
  recipientAddress,
  onConfirmRelease,
  onClose,
  isActionPending = false,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalUnits = useMemo(() => {
    try {
      return Number(BigInt(totalAmountStroops)) / 10_000_000;
    } catch {
      return 0;
    }
  }, [totalAmountStroops]);

  const validation = useMemo(() => {
    if (!inputVal) return null;
    return validatePartialRelease(inputVal, totalAmountStroops);
  }, [inputVal, totalAmountStroops]);

  const preview = useMemo(() => {
    if (!validation?.isValid || !validation.releaseAmountStroops) return null;
    return formatEscrowReleasePreview(totalAmountStroops, validation.releaseAmountStroops, tokenSymbol);
  }, [validation, totalAmountStroops, tokenSymbol]);

  if (!isOpen) return null;

  const handleApplyPercentage = (pct: number) => {
    const val = (totalUnits * pct) / 100;
    setInputVal(val.toString());
    setErrorMessage(null);
  };

  const handleConfirm = async () => {
    const val = validatePartialRelease(inputVal, totalAmountStroops);
    if (!val.isValid || !val.releaseAmountStroops) {
      setErrorMessage(val.error || 'Invalid release amount');
      return;
    }
    setErrorMessage(null);
    await onConfirmRelease(val.releaseAmountStroops);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h3 className="text-lg font-semibold text-white">Partial Escrow Release</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Escrow ID:</span>
              <span className="font-mono text-slate-200">#{escrowId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Current Balance:</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {totalUnits.toLocaleString()} {tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Recipient:</span>
              <span className="font-mono text-slate-300">
                {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-6)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Milestone Release Amount ({tokenSymbol})
            </label>
            <input
              type="number"
              step="any"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={`e.g. ${(totalUnits * 0.5).toFixed(2)}`}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleApplyPercentage(pct)}
                className="flex-1 py-1 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition"
              >
                {pct}%
              </button>
            ))}
          </div>

          {preview && (
            <div className="p-3 bg-blue-950/30 border border-blue-800/50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-blue-200">
                <span>Disbursing Now:</span>
                <span className="font-semibold font-mono">{preview.releaseUnits} ({preview.percentage.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Remaining in Escrow:</span>
                <span className="font-mono text-slate-300">{preview.remainingUnits}</span>
              </div>
              {validation?.isFullRelease && (
                <p className="text-[11px] text-amber-400 pt-1">
                  ⚠️ This release will disburse 100% of the funds and mark the escrow as fully Released.
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isActionPending || !validation?.isValid}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
          >
            {isActionPending ? 'Authorizing...' : 'Confirm Release'}
          </button>
        </div>
      </div>
    </div>
  );
};
