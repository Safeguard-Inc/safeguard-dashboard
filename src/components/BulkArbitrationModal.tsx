import React, { useState, useMemo } from 'react';
import {
  BulkArbitrationItem,
  filterEligibleForArbitration,
  calculateBulkArbitrationSummary,
} from '../lib/bulkArbitrationModal';

interface BulkArbitrationModalProps {
  isOpen: boolean;
  escrows: BulkArbitrationItem[];
  onConfirmArbitration: (selectedIndices: number[], releaseToRecipient: boolean) => Promise<void> | void;
  onClose: () => void;
  isActionPending?: boolean;
}

export const BulkArbitrationModal: React.FC<BulkArbitrationModalProps> = ({
  isOpen,
  escrows,
  onConfirmArbitration,
  onClose,
  isActionPending = false,
}) => {
  const eligible = useMemo(() => filterEligibleForArbitration(escrows), [escrows]);
  const [selected, setSelected] = useState<number[]>([]);
  const [verdictRelease, setVerdictRelease] = useState<boolean>(true); // true = Release to Recipient, false = Refund

  const summary = useMemo(() => {
    return calculateBulkArbitrationSummary(selected, eligible);
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
    await onConfirmArbitration(summary.selectedIndices, verdictRelease);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h3 className="text-lg font-semibold text-white">Bulk Escrow Arbitration</h3>
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
          Resolve disputed escrows in bulk by issuing an administrative ruling. Select the ruling
          direction and choose the target escrows to settle atomically.
        </p>

        {/* Verdict Direction Selector */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setVerdictRelease(true)}
            className={`p-3 rounded-xl border text-left transition ${
              verdictRelease
                ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500 text-white'
                : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <div className="text-xs font-semibold">Release to Recipient</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Disburse collateral to beneficiary</div>
          </button>

          <button
            type="button"
            onClick={() => setVerdictRelease(false)}
            className={`p-3 rounded-xl border text-left transition ${
              !verdictRelease
                ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 text-white'
                : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <div className="text-xs font-semibold">Refund to Sender</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Reverse collateral back to creator</div>
          </button>
        </div>

        <div className="flex items-center justify-between mb-3 px-1 text-xs">
          <span className="text-slate-400">
            {eligible.length} disputed escrows awaiting ruling
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-blue-400 hover:underline font-medium"
          >
            {selected.length === eligible.length ? 'Deselect All' : 'Select All Disputed'}
          </button>
        </div>

        <div className="max-h-52 overflow-y-auto space-y-2 mb-4 pr-1">
          {eligible.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No escrows currently in Disputed status.
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
                      onChange={() => {}}
                      className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-white">
                        Escrow #{escrow.escrowIndex}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        From: {escrow.sender.slice(0, 6)}...{escrow.sender.slice(-4)} → To: {escrow.recipient.slice(0, 6)}...{escrow.recipient.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {amountUnits} {escrow.tokenSymbol}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-800/40">
                      Disputed
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
              <span>Arbitration Target:</span>
              <span className="font-semibold text-white">
                {verdictRelease ? 'Disburse to Recipients' : 'Refund to Senders'} ({summary.count})
              </span>
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
                ? verdictRelease
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isActionPending
              ? 'Executing Rulings...'
              : `Execute Ruling (${summary.count})`}
          </button>
        </div>
      </div>
    </div>
  );
};

