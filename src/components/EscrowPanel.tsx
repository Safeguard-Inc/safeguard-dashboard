/**
 * EscrowPanel.tsx
 *
 * Admin panel displaying pending on-chain escrows fetched from the backend
 * (GET /api/escrows) with a demo-data fallback.  Shows release/refund action
 * buttons (gated on wallet connection) and a live timelock countdown.
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Lock, RefreshCw, CheckCircle2, RotateCcw, Clock } from 'lucide-react';

interface EscrowRecord {
  id: string;
  escrowIndex: number;
  amount: string;
  token: string;
  sender: string;
  recipient: string;
  /** Unix timestamp (seconds) when the timelock expires */
  expiresAt: number;
  status: 'Pending' | 'Released' | 'Refunded';
}

const DEMO_ESCROWS: EscrowRecord[] = [
  {
    id: 'escrow-1',
    escrowIndex: 1,
    amount: '150',
    token: 'XLM',
    sender: 'GC5MCMHH…ODW4',
    recipient: 'GA6LW724…CVLT',
    expiresAt: Math.floor(Date.now() / 1000) + 3600 * 18, // ~18 h from now
    status: 'Pending',
  },
  {
    id: 'escrow-2',
    escrowIndex: 2,
    amount: '500',
    token: 'XLM',
    sender: 'GC5MCMHH…ODW4',
    recipient: 'GBZXN7ZS…9KJL',
    expiresAt: Math.floor(Date.now() / 1000) + 3600 * 2, // ~2 h from now
    status: 'Pending',
  },
];

async function fetchEscrows(): Promise<EscrowRecord[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('http://localhost:4000/api/escrows', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    if (!res.ok) return DEMO_ESCROWS;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return DEMO_ESCROWS;
    return data as EscrowRecord[];
  } catch {
    return DEMO_ESCROWS;
  }
}

function CountdownClock({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(expiresAt - Math.floor(Date.now() / 1000));

  useEffect(() => {
    const tick = setInterval(() => {
      setRemaining(expiresAt - Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [expiresAt]);

  if (remaining <= 0) return <span className="text-rose-400 font-mono text-xs">Expired</span>;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const color = remaining < 3600 ? 'text-rose-400' : remaining < 7200 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <span className={`font-mono text-xs ${color}`}>
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

interface EscrowPanelProps {
  walletConnected: boolean;
}

export default function EscrowPanel({ walletConnected }: EscrowPanelProps) {
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioned, setActioned] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchEscrows();
    setEscrows(data.filter((e) => e.status === 'Pending'));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = (id: string, action: 'release' | 'refund') => {
    if (!walletConnected) return;
    // Optimistically update UI (real implementation would sign + submit tx)
    setActioned((prev) => new Set(prev).add(id));
    setEscrows((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: action === 'release' ? 'Released' : 'Refunded' } : e
      )
    );
  };

  const pendingEscrows = escrows.filter((e) => !actioned.has(e.id));

  return (
    <div className="bg-slate-900/50 border border-indigo-950/60 rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
            <Lock className="h-5 w-5 text-amber-400" />
            <span>Escrow Vault Admin</span>
          </h2>
          <p className="text-xs text-slate-400">
            Pending on-chain escrows awaiting admin release or timelock refund.
          </p>
        </div>
        <button
          onClick={load}
          aria-label="Refresh escrow list"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Loading escrows…
        </div>
      ) : pendingEscrows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-indigo-950/60 rounded-2xl text-center p-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-400/40 mb-2" />
          <p className="text-sm font-medium text-slate-300">No pending escrows</p>
          <p className="text-xs text-slate-500 mt-1">All escrowed funds have been released or refunded.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-indigo-950/80 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Escrow #</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Timelock Expiry</span>
                  </span>
                </th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/40">
              {pendingEscrows.map((escrow) => (
                <tr key={escrow.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                      #{escrow.escrowIndex}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {escrow.amount} {escrow.token}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{escrow.sender}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{escrow.recipient}</td>
                  <td className="py-3.5 px-4">
                    <CountdownClock expiresAt={escrow.expiresAt} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={!walletConnected}
                        onClick={() => handleAction(escrow.id, 'release')}
                        title={walletConnected ? 'Release funds to recipient' : 'Connect Freighter to execute'}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Release</span>
                      </button>
                      <button
                        disabled={!walletConnected}
                        onClick={() => handleAction(escrow.id, 'refund')}
                        title={walletConnected ? 'Refund to sender' : 'Connect Freighter to execute'}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Refund</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
