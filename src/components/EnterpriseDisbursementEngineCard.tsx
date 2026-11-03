'use client';

import React, { useState } from 'react';
import {
  type DisbursementItem,
  calculateDisbursementPlan,
} from '../lib/disbursementEngineCard';

export interface EnterpriseDisbursementEngineCardProps {
  initialItems?: DisbursementItem[];
  onExecute?: (planItems: DisbursementItem[]) => Promise<void> | void;
}

const DEFAULT_DEMO_ITEMS: DisbursementItem[] = [
  { recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', amount: '15000.00', asset: 'USDC', memo: 'Payroll #101' },
  { recipient: 'GCKFJVO4U56WSCUD477755D66FNY375P3TUQZ4I6222N4GDFV6VTR27P', amount: '8500.50', asset: 'USDC', memo: 'Vendor Settlement' },
  { recipient: 'GDRQ3HCSOULH6G6WWRD7B6J3F2WDFCGK3K2C3A7A645UETU3C7C6PQW7', amount: '12400.00', asset: 'USDC', memo: 'Liquidity Provider' },
  { recipient: 'GCH2NQ6WGLS3E4YF7QYCGDPR54C75DCLP4SBLX4F2M4J53U7JGF75LDF', amount: '450.00', asset: 'XLM', memo: 'Fee Reimbursement' },
];

export function EnterpriseDisbursementEngineCard({
  initialItems = DEFAULT_DEMO_ITEMS,
  onExecute,
}: EnterpriseDisbursementEngineCardProps) {
  const [items] = useState<DisbursementItem[]>(initialItems);
  const [chunkSize, setChunkSize] = useState<number>(2);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const plan = calculateDisbursementPlan(items, chunkSize);

  const handleExecute = async () => {
    setIsExecuting(true);
    setSuccessMessage(null);
    try {
      if (onExecute) {
        await onExecute(items);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      setSuccessMessage(`Successfully partitioned and dispatched ${plan.chunkCount} batch chunk(s) across ${plan.validCount} valid destination accounts.`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">⚡</span>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Enterprise Batch Disbursement Engine
            </h3>
            <p className="text-xs text-slate-400">
              Atomic multi-recipient payouts partitioned into Soroban-safe execution chunks
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          Chunk Size: {chunkSize} / tx
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Recipients</div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {plan.validCount} <span className="text-xs font-normal text-slate-500">/ {plan.totalCount}</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Gross Volume</div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            ${plan.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Tx Chunks</div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {plan.chunkCount} <span className="text-xs font-normal text-slate-500">chunks</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Est. Stellar Fee</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {plan.estimatedFeeXlm} <span className="text-xs font-normal text-slate-500">XLM</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Recipient Queue Preview</span>
          <div className="flex items-center space-x-2">
            <span>Partition Limit:</span>
            <select
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200"
            >
              <option value={2}>2 per chunk</option>
              <option value={5}>5 per chunk</option>
              <option value={10}>10 per chunk</option>
              <option value={25}>25 per chunk</option>
            </select>
          </div>
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded p-2 text-xs"
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-300">
                  {item.recipient.slice(0, 6)}...{item.recipient.slice(-6)}
                </span>
                {item.memo && (
                  <span className="px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-400 rounded">
                    {item.memo}
                  </span>
                )}
              </div>
              <div className="font-semibold text-slate-200">
                {item.amount} <span className="text-indigo-400">{item.asset}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
          {successMessage}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleExecute}
          disabled={isExecuting || plan.invalidCount > 0 || plan.totalCount === 0}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
        >
          {isExecuting ? 'Dispatching Batch Chunks...' : 'Execute Batch Settlement'}
        </button>
      </div>
    </div>
  );
}
