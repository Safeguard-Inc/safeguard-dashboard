'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RefreshCw, ShieldCheck } from 'lucide-react';
import { classifyRuntimeError } from '../lib/errorBoundary';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorPageProps) {
  const summary = classifyRuntimeError(error);

  useEffect(() => {
    console.error('[SafeguardErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div
        role="alert"
        aria-live="assertive"
        className="max-w-lg w-full bg-slate-900/80 border border-rose-500/40 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {summary.category}
            </span>
            <h1 className="text-lg font-bold text-white mt-1">{summary.title}</h1>
          </div>
        </div>

        <p className="text-sm text-slate-300 bg-slate-950/70 border border-indigo-950/80 rounded-xl p-3.5 font-mono break-words mb-4">
          {summary.message}
        </p>

        {summary.digest && (
          <p className="text-xs font-mono text-slate-400 mb-4">
            Error Digest: <span className="text-slate-200">{summary.digest}</span>
          </p>
        )}

        <p className="text-xs text-slate-400 mb-6">{summary.recoveryHint}</p>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{summary.recoveryActionLabel}</span>
          </button>

          <span className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>On-chain funds unaffected</span>
          </span>
        </div>
      </div>
    </div>
  );
}
