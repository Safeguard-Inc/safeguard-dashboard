import React, { useState, useMemo } from 'react';
import {
  BulkDisputeItem,
  filterEligibleForDispute,
  calculateBulkDisputeSummary,
} from '../lib/bulkDisputeModal';

interface BulkDisputeModalProps {
  isOpen: boolean;
  escrows: BulkDisputeItem[];
  onConfirmDispute: (selectedIndices: number[]) => Promise<void> | void;
  onClose: () => void;
  callerAddress?: string;
  isActionPending?: boolean;
}

export const BulkDisputeModal: React.FC<BulkDisputeModalProps> = ({
  isOpen,
  escrows,
  onConfirmDispute,
  onClose,
  callerAddress,
  isActionPending = false,
}) => {
  const eligible = useMemo(() => filterEligibleForDispute(escrows, callerAddress), [escrows, callerAddress]);
  const [selected, setSelected] = useState<number[]>([]);

  const summary = useMemo(() => {
    return calculateBulkDisputeSummary(selected, eligible);
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
    await onConfirmDispute(summary.selectedIndices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h3 className="text-lg font-semibold text-white">Initiate Bulk Escrow Dispute</h3>
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
          Flag multiple pending escrows for arbitration. Disputed funds remain securely locked
          in the smart contract until an administrator or appointed arbiter issues a ruling.
        </p>

        <div className="flex items-center justify-between mb-3 px-1 text-xs">
          <span className="text-slate-400">
            {eligible.length} dispute-eligible escrows
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-rose-400 hover:underline font-medium"
          >
            {selected.length === eligible.length ? 'Deselect All' : 'Select All Eligible'}
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1">
          {eligible.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No escrows currently eligible for dispute.
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
                      ? 'border-rose-500/50 bg-rose-950/20'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-white">
                        Escrow #{escrow.escrowIndex}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        To: {escrow.recipient.slice(0, 8)}...{escrow.recipient.slice(-6)}
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
              <span>Selected for Dispute:</span>
              <span className="font-semibold text-rose-400">{summary.count}</span>
            </div>
            {Object.entries(summary.tokenBreakdown).map(([sym, amt]) => (
              <div key={sym} className="flex justify-between text-slate-300">
                <span>Total {sym}:</span>
                <span className="font-mono text-white font-semibold">{amt}</span>
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
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isActionPending
              ? 'Submitting Claims...'
              : `Submit Dispute (${summary.count})`}
          </button>
        </div>
      </div>
    </div>
  );
};

