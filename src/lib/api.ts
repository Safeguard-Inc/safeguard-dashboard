/**
 * api.ts
 *
 * Thin HTTP client layer for the Safeguard backend REST API.
 * All functions fall back to seeded demo data when the backend is offline
 * so the dashboard remains functional in a standalone / demo context.
 */

import { TxItem } from '@/types/tx';

const BACKEND_BASE = 'http://localhost:4000';

/** Seeded fallback transactions shown when the backend is unreachable */
export const FALLBACK_TRANSACTIONS: TxItem[] = [
  {
    id: 'tx-1',
    sender: 'GC5MCMHH...ODW4',
    recipient: 'GA6LW724...CVLT',
    token: 'XLM',
    amount: '50',
    status: 'Approved',
    reason: 'Direct settlement (Within spend cap & compliant recipient)',
    timestamp: 'Testnet 2026-10-05',
    txHash: 'c762b42f818387aa584ea33d3da006f22671071ed6e182068994ea6597395e6c',
  },
  {
    id: 'tx-2',
    sender: 'GC5MCMHH...ODW4',
    recipient: 'GA6LW724...CVLT',
    token: 'XLM',
    amount: '150',
    status: 'Escrowed',
    reason: 'Exceeds the 100 XLM spend cap; held as escrow #1, later released',
    timestamp: 'Testnet 2026-10-05',
    txHash: '2d83231685f03b17e1a001e6c82c38453459b4f67b416ef60f9be73133026f0e',
  },
  {
    id: 'tx-3',
    sender: 'GC5MCMHH...ODW4',
    recipient: 'GCV4I3P3...K4DT',
    token: 'XLM',
    amount: '1',
    status: 'Blocked',
    reason: 'Contract Error #11 (RecipientDenylisted)',
    timestamp: 'Testnet 2026-10-05',
    txHash: 'rejected at simulation (no fee)',
  },
];

/**
 * Fetches the recent transaction list from the Safeguard backend.
 *
 * @returns Array of TxItem records sorted newest-first.
 *          Falls back to FALLBACK_TRANSACTIONS on any network/parse error.
 */
export async function fetchTransactions(): Promise<TxItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${BACKEND_BASE}/api/transactions`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (!res.ok) return FALLBACK_TRANSACTIONS;

    const data: unknown = await res.json();

    if (!Array.isArray(data)) return FALLBACK_TRANSACTIONS;

    // Map backend shape → TxItem (gracefully handle field name differences)
    return (data as Record<string, unknown>[]).map((row, i) => ({
      id: String(row['id'] ?? row['_id'] ?? `tx-remote-${i}`),
      sender: String(row['sender'] ?? ''),
      recipient: String(row['recipient'] ?? ''),
      token: String(row['token'] ?? 'XLM'),
      amount: String(row['amount'] ?? '0'),
      status: (row['status'] as TxItem['status']) ?? 'Approved',
      reason: String(row['reason'] ?? ''),
      timestamp: String(row['timestamp'] ?? row['createdAt'] ?? ''),
      txHash: String(row['txHash'] ?? row['tx_hash'] ?? ''),
    }));
  } catch {
    return FALLBACK_TRANSACTIONS;
  }
}
