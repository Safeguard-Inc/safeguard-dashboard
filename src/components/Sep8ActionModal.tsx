import React from 'react';
import { Sep8ActionResult, formatSep8StatusBadge } from '../lib/sep8Action';

interface Sep8ActionModalProps {
  isOpen: boolean;
  actionResult: Sep8ActionResult;
  onClose: () => void;
  onRetry?: () => void;
}

export const Sep8ActionModal: React.FC<Sep8ActionModalProps> = ({
  isOpen,
  actionResult,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  const badge = formatSep8StatusBadge(actionResult.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h3 className="text-lg font-semibold text-white">SEP-0008 Regulated Asset Authorization</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400">Asset:</span>
            <span className="font-mono text-sm font-medium text-emerald-400">
              {actionResult.assetCode}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.colorClass}`}
            >
              {badge.label}
            </span>
          </div>

          {actionResult.assetIssuer && (
            <p className="text-xs text-slate-400 font-mono truncate mb-2">
              Issuer: {actionResult.assetIssuer}
            </p>
          )}

          {actionResult.message && (
            <div className="p-3 bg-slate-800/80 rounded-lg text-sm text-slate-200 border border-slate-700/60 mb-3">
              {actionResult.message}
            </div>
          )}

          {actionResult.actionUrl && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg mb-4">
              <p className="text-xs text-amber-200 font-medium mb-1.5">
                External Authorization Required by Issuer:
              </p>
              <a
                href={actionResult.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-400 hover:underline break-all inline-block"
              >
                {actionResult.actionUrl} ↗
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Dismiss
          </button>
          {actionResult.actionUrl && (
            <a
              href={actionResult.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition inline-flex items-center gap-1"
            >
              Complete Verification ↗
            </a>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition"
            >
              Re-verify Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
