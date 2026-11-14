'use client';

import React, { useState } from 'react';
import { AlertTriangle, BookOpen, Search, ShieldAlert, X, Wrench } from 'lucide-react';
import {
  resolveErrorExplanation,
  searchErrorCatalog,
  TOTAL_ERROR_CODES,
} from '../lib/errorExplainerModal';

export interface ErrorCodeExplainerModalProps {
  isOpen: boolean;
  initialCode?: number | string;
  onClose: () => void;
}

export function ErrorCodeExplainerModal({
  isOpen,
  initialCode = 1000,
  onClose,
}: ErrorCodeExplainerModalProps) {
  const [selectedCode, setSelectedCode] = useState<number | string>(initialCode);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const active = resolveErrorExplanation(selectedCode);
  const matches = searchErrorCatalog(searchQuery, 8);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-explainer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="bg-slate-900 border border-indigo-900/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-indigo-950/80">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 id="error-explainer-title" className="text-base font-bold text-white">
                Safeguard Error Code Explainer
              </h2>
              <p className="text-[11px] text-slate-400">
                Canonical {TOTAL_ERROR_CODES}-Code Diagnostic Reference Catalog
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close error code explainer"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. 1000), mnemonic (HOST_BUDGET_EXCEEDED), or domain..."
              className="w-full bg-slate-950/90 border border-indigo-950/90 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {matches.map((entry) => (
              <button
                key={entry.code}
                type="button"
                onClick={() => setSelectedCode(entry.code)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
                  active.code === entry.code
                    ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                    : 'bg-slate-950/60 border-indigo-950/80 text-slate-300 hover:border-indigo-700'
                }`}
              >
                #{entry.code} {entry.mnemonic}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 bg-slate-950/80 border border-indigo-950/90 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold">
                {active.formattedCode}
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {active.mnemonic}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {active.domain}
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${active.severityBadgeClass}`}
              >
                HTTP {active.httpStatus} · {active.severityLabel}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 text-xs text-slate-200 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300 mb-0.5">Diagnostic Description</p>
              <p className="text-slate-400">{active.description}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 text-xs text-slate-200 bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30">
            <Wrench className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300 mb-0.5">Recommended Recovery Hint</p>
              <p className="text-emerald-200/80">{active.recoveryHint}</p>
            </div>
          </div>

          {!active.isKnownCatalogCode && (
            <div className="flex items-center space-x-2 text-[11px] text-amber-300 font-mono">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Code not found in primary index; showing default fallback diagnostic.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorCodeExplainerModal;
