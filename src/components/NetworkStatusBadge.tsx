/**
 * NetworkStatusBadge.tsx
 *
 * Polls the Horizon Testnet /fee_stats endpoint every 15 seconds to derive
 * network health and the latest ledger number.
 *
 * States:
 *  - Green  'Testnet'  — reachable, latency < 2 s
 *  - Amber  'Degraded' — reachable, latency ≥ 2 s
 *  - Red    'Offline'  — fetch failed / timed out
 */

'use client';

import React, { useEffect, useState } from 'react';

type NetworkState = 'online' | 'degraded' | 'offline' | 'loading';

interface FeeStatsResponse {
  last_ledger: string;
}

const HORIZON_FEE_STATS = 'https://horizon-testnet.stellar.org/fee_stats';
const POLL_INTERVAL_MS = 15_000;

export default function NetworkStatusBadge() {
  const [status, setStatus] = useState<NetworkState>('loading');
  const [ledger, setLedger] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(HORIZON_FEE_STATS, {
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeout);

        const latency = Date.now() - start;

        if (!res.ok) {
          setStatus('offline');
          return;
        }

        const data: FeeStatsResponse = await res.json();
        setLedger(data.last_ledger ?? null);
        setStatus(latency > 2000 ? 'degraded' : 'online');
      } catch {
        setStatus('offline');
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const dotColor =
    status === 'online'
      ? 'bg-emerald-400'
      : status === 'degraded'
      ? 'bg-amber-400'
      : status === 'offline'
      ? 'bg-rose-500'
      : 'bg-slate-500';

  const textColor =
    status === 'online'
      ? 'text-emerald-400'
      : status === 'degraded'
      ? 'text-amber-400'
      : status === 'offline'
      ? 'text-rose-400'
      : 'text-slate-400';

  const label =
    status === 'online'
      ? 'Testnet'
      : status === 'degraded'
      ? 'Degraded'
      : status === 'offline'
      ? 'Offline'
      : '…';

  return (
    <div
      className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 ${textColor} text-xs font-medium`}
      title={`Horizon Testnet — ${status}${ledger ? ` — Ledger #${ledger}` : ''}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${dotColor} ${status === 'online' ? 'animate-pulse' : ''}`}
      />
      <span>{label}</span>
      {ledger && status !== 'offline' && (
        <span className="text-slate-500 font-mono text-[10px]">#{ledger}</span>
      )}
    </div>
  );
}
