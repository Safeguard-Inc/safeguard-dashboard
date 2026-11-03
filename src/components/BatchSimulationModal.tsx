'use client';

import React from 'react';
import {
  abbreviateAddress,
  formatStroopsToXlm,
  calculateBatchSummary,
  BatchSimulationItem,
} from '../lib/formatters';

interface BatchSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  items: BatchSimulationItem[];
  isSubmitting?: boolean;
}

export const BatchSimulationModal: React.FC<BatchSimulationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  items,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  const summary = calculateBatchSummary(items);
  const approvedPct = summary.total > 0 ? (summary.approvedCount / summary.total) * 100 : 0;
  const escrowedPct = summary.total > 0 ? (summary.escrowedCount / summary.total) * 100 : 0;
  const blockedPct = summary.total > 0 ? (summary.blockedCount / summary.total) * 100 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 id="batch-modal-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm">⚡ Batch</span>
              Batch Simulation Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Soroban pre-flight simulation review across {summary.total} payment transactions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Aggregate Stats Summary */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium">Total</span>
            <div className="text-lg font-bold text-white mt-0.5">{summary.total}</div>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-xs text-emerald-400 font-medium">Approved</span>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">{summary.approvedCount}</div>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <span className="text-xs text-amber-400 font-medium">Escrowed</span>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{summary.escrowedCount}</div>
          </div>
          <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            <span className="text-xs text-rose-400 font-medium">Blocked</span>
            <div className="text-lg font-bold text-rose-300 mt-0.5">{summary.blockedCount}</div>
          </div>
        </div>

        {/* Approval Ratio Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5">
            <span className="font-semibold">Compliance Approval Ratio</span>
            <span className="font-bold text-emerald-400">{summary.approvalRatioPercent}% Passed</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${approvedPct}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Approved: ${summary.approvedCount}`}
            />
            <div
              style={{ width: `${escrowedPct}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Escrowed: ${summary.escrowedCount}`}
            />
            <div
              style={{ width: `${blockedPct}%` }}
              className="bg-rose-500 transition-all duration-300"
              title={`Blocked: ${summary.blockedCount}`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
            <span>Total Volume: {formatStroopsToXlm(summary.totalVolumeStroops)}</span>
            <span>Policy Status: Active</span>
          </div>
        </div>

        {/* Payment Line Items */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 divide-y divide-slate-800/50">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="pt-2 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">#{idx + 1}</span>
                  <span className="font-mono text-slate-200">{abbreviateAddress(item.sender)}</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-mono text-slate-200">{abbreviateAddress(item.recipient)}</span>
                </div>
                {item.reason && (
                  <div className="text-[11px] text-slate-400 italic pl-6">{item.reason}</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-mono font-medium text-white">
                  {formatStroopsToXlm(item.amountStroops)}
                </div>
                <div>
                  {item.decision === 'APPROVE' && (
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-semibold">
                      Approved
                    </span>
                  )}
                  {item.decision === 'FLAG' && (
                    <span className="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-semibold">
                      Escrowed
                    </span>
                  )}
                  {item.decision === 'BLOCK' && (
                    <span className="inline-block px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] font-semibold">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isSubmitting || summary.approvedCount + summary.escrowedCount === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? 'Submitting Batch...' : `Execute Eligible (${summary.approvedCount + summary.escrowedCount})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
