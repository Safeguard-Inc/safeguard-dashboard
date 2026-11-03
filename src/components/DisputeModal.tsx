'use client';

import React, { useState } from 'react';
import {
  DisputeDetails,
  DisputeResolutionDecision,
  getResolutionActionLabel,
  validateArbitrationResolution,
} from '../lib/disputeModal';

export interface DisputeModalProps {
  isOpen: boolean;
  dispute: DisputeDetails | null;
  onClose: () => void;
  onResolve: (escrowId: number, releaseToRecipient: boolean, rationale: string) => Promise<void>;
}

export function DisputeModal({ isOpen, dispute, onClose, onResolve }: DisputeModalProps) {
  const [decision, setDecision] = useState<DisputeResolutionDecision>('release_to_recipient');
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !dispute) return null;

  const validation = validateArbitrationResolution(dispute, decision);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    setIsSubmitting(true);
    try {
      await onResolve(dispute.escrowId, decision === 'release_to_recipient', rationale);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-amber-400">⚖️</span> Dispute Arbitration Review
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Escrow ID:</span>
              <span className="font-mono font-medium">#{dispute.escrowId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="font-semibold text-emerald-400">
                {dispute.amount} {dispute.token}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sender:</span>
              <span className="font-mono text-xs">{dispute.sender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient:</span>
              <span className="font-mono text-xs">{dispute.recipient}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Arbitration Ruling</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('release_to_recipient')}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  decision === 'release_to_recipient'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                Release to Recipient
              </button>
              <button
                type="button"
                onClick={() => setDecision('refund_to_sender')}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  decision === 'refund_to_sender'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-sm'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                Refund to Sender
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Arbitration Rationale (Audit Record)
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="State the compliance justification or dispute outcome notes..."
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !validation.isValid}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${
                decision === 'release_to_recipient'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              } disabled:opacity-50`}
            >
              {isSubmitting ? 'Submitting Ruling...' : getResolutionActionLabel(decision)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
