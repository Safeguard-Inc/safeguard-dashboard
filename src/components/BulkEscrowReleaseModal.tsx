import React, { useState, useMemo } from 'react';
import {
  BulkEscrowItem,
  filterEligibleForRelease,
  calculateBulkReleaseSummary,
} from '../lib/bulkEscrowModal';

interface BulkEscrowReleaseModalProps {
  isOpen: boolean;
  escrows: BulkEscrowItem[];
  onConfirmRelease: (selectedIndices: number[]) => Promise<void> | void;
  onClose: () => void;
  isActionPending?: boolean;
}

export const BulkEscrowReleaseModal: React.FC<BulkEscrowReleaseModalProps> = ({
  isOpen,
  escrows,
  onConfirmRelease,
  onClose,
  isActionPending = false,
}) => {
  const eligible = useMemo(() => filterEligibleForRelease(escrows), [escrows]);
  const [selected, setSelected] = useState<number[]>([]);

  const summary = useMemo(() => {
    return calculateBulkReleaseSummary(selected, eligible);
  }, [selected, eligible]);

  if (!isOpen) return null;

  const handleToggle = (index: number) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === eligible.length) {
      setSelected([]);
    } else {
      setSelected(eligible.map((e) => e.escrowIndex));
    }
  };

  const handleConfirm = async () => {
    if (summary.selectedIndices.length === 0) return;
    await onConfirmRelease(summary.selectedIndices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <h3 className="text-lg font-semibold text-white">Bulk Escrow Settlement</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Select multiple pending escrows to disburse in a single atomic settlement transaction.
        </p>

        <div className="flex items-center justify-between mb-3 px-1 text-xs">
          <span className="text-slate-400">
            {eligible.length} eligible pending escrows
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-blue-400 hover:underline font-medium"
          >
            {selected.length === eligible.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-1">
          {eligible.map((item) => {
            const isChecked = selected.includes(item.escrowIndex);
            const units = Number(BigInt(item.amountStroops)) / 10_000_000;

            return (
              <div
                key={item.escrowIndex}
                onClick={() => handleToggle(item.escrowIndex)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isChecked
                    ? 'bg-blue-950/40 border-blue-600'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-200">
                        #{item.escrowIndex}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 font-mono">
                        {units.toLocaleString()} {item.tokenSymbol}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      To: {item.recipient.slice(0, 6)}...{item.recipient.slice(-6)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {summary.isValid && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Selected for Release:</span>
              <span className="font-semibold text-white">{summary.count} escrows</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Volume:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {Object.entries(summary.tokenBreakdown)
                  .map(([sym, amt]) => `${amt} ${sym}`)
                  .join(', ')}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isActionPending || !summary.isValid}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
          >
            {isActionPending ? 'Releasing...' : `Release ${summary.count} Escrows`}
          </button>
        </div>
      </div>
    </div>
  );
};
