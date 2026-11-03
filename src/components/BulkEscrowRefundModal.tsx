import React, { useState, useMemo } from 'react';
import {
  BulkRefundItem,
  filterEligibleForRefund,
  calculateBulkRefundSummary,
} from '../lib/bulkRefundModal';

interface BulkEscrowRefundModalProps {
  isOpen: boolean;
  escrows: BulkRefundItem[];
  onConfirmRefund: (selectedIndices: number[]) => Promise<void> | void;
  onClose: () => void;
  isAdmin?: boolean;
  isActionPending?: boolean;
}

export const BulkEscrowRefundModal: React.FC<BulkEscrowRefundModalProps> = ({
  isOpen,
  escrows,
  onConfirmRefund,
  onClose,
  isAdmin = true,
  isActionPending = false,
}) => {
  const eligible = useMemo(() => filterEligibleForRefund(escrows, undefined, isAdmin), [escrows, isAdmin]);
  const [selected, setSelected] = useState<number[]>([]);

  const summary = useMemo(() => {
    return calculateBulkRefundSummary(selected, eligible, undefined, isAdmin);
  }, [selected, eligible, isAdmin]);

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
    await onConfirmRefund(summary.selectedIndices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <h3 className="text-lg font-semibold text-white">Bulk Escrow Refund</h3>
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
          Select eligible escrows to execute bulk refunds back to their respective originators.
        </p>

        <div className="flex items-center justify-between mb-3 px-1 text-xs">
          <span className="text-slate-400">
            {eligible.length} eligible escrows
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-blue-400 hover:underline font-medium"
          >
            {selected.length === eligible.length ? 'Deselect All' : 'Select All Eligible'}
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1">
          {eligible.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No escrows currently eligible for refund.
            </div>
          ) : (
            eligible.map((escrow) => {
              const isChecked = selected.includes(escrow.escrowIndex);
              const amountUnits = (Number(escrow.amountStroops) / 10_000_000).toLocaleString();
              return (
                <div
                  key={escrow.escrowIndex}
                  onClick={() => handleToggle(escrow.escrowIndex)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition ${
                    isChecked
                      ? 'border-blue-500/50 bg-blue-950/20'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-white">
                        Escrow #{escrow.escrowIndex}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {escrow.sender.slice(0, 8)}...{escrow.sender.slice(-6)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {amountUnits} {escrow.tokenSymbol}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                      {escrow.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {summary.count > 0 && (
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 mb-5 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Selected Escrows:</span>
              <span className="font-semibold text-white">{summary.count}</span>
            </div>
            {Object.entries(summary.tokenBreakdown).map(([sym, amt]) => (
              <div key={sym} className="flex justify-between text-slate-300">
                <span>Total {sym}:</span>
                <span className="font-mono text-emerald-400 font-semibold">{amt}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!summary.isValid || isActionPending}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition ${
              summary.isValid && !isActionPending
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isActionPending
              ? 'Processing Refunds...'
              : `Confirm Refund (${summary.count})`}
          </button>
        </div>
      </div>
    </div>
  );
};

