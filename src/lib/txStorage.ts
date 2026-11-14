/**
 * txStorage.ts
 *
 * Domain helper for persisting and restoring recent dashboard transactions
 * in browser localStorage (Issue #51) so the feed survives page reloads.
 */

import type { TxItem } from '../types/tx';

export const TX_STORAGE_KEY = 'safeguard.recent_transactions.v1';
export const MAX_PERSISTED_TRANSACTIONS = 50;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

const VALID_STATUSES = new Set<TxItem['status']>(['Approved', 'Escrowed', 'Blocked']);

/**
 * Validates whether an unknown value conforms to TxItem.
 */
export function isValidTxItem(item: unknown): item is TxItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.sender === 'string' &&
    typeof candidate.recipient === 'string' &&
    typeof candidate.token === 'string' &&
    typeof candidate.amount === 'string' &&
    typeof candidate.status === 'string' &&
    VALID_STATUSES.has(candidate.status as TxItem['status']) &&
    typeof candidate.reason === 'string' &&
    typeof candidate.timestamp === 'string' &&
    typeof candidate.txHash === 'string'
  );
}

/**
 * Deduplicates transactions by id while preserving order and capping at maxCount.
 */
export function deduplicateAndCapTransactions(
  items: TxItem[],
  maxCount = MAX_PERSISTED_TRANSACTIONS
): TxItem[] {
  const seen = new Set<string>();
  const result: TxItem[] = [];
  for (const item of items) {
    if (!isValidTxItem(item)) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
    if (result.length >= maxCount) break;
  }
  return result;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Persists recent transactions into localStorage safely (no-op during SSR or quota error).
 */
export function persistTransactions(
  items: TxItem[],
  storage: StorageLike | null = getDefaultStorage(),
  maxCount = MAX_PERSISTED_TRANSACTIONS
): TxItem[] {
  const sanitized = deduplicateAndCapTransactions(items, maxCount);
  if (!storage) return sanitized;
  try {
    storage.setItem(TX_STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Ignore storage quota or private-mode security errors
  }
  return sanitized;
}

/**
 * Restores persisted transactions from localStorage, falling back to `fallback`
 * when storage is empty, unavailable, or corrupted.
 */
export function loadPersistedTransactions(
  fallback: TxItem[] = [],
  storage: StorageLike | null = getDefaultStorage(),
  maxCount = MAX_PERSISTED_TRANSACTIONS
): TxItem[] {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(TX_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const valid = deduplicateAndCapTransactions(parsed as TxItem[], maxCount);
    return valid.length > 0 ? valid : fallback;
  } catch {
    return fallback;
  }
}
