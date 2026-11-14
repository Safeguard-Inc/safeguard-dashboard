import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TX_STORAGE_KEY,
  isValidTxItem,
  deduplicateAndCapTransactions,
  persistTransactions,
  loadPersistedTransactions,
  type StorageLike,
} from '../src/lib/txStorage.ts';
import type { TxItem } from '../src/types/tx.ts';

function createMemoryStorage(): StorageLike & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
}

const sampleTxA: TxItem = {
  id: 'tx-101',
  sender: 'GC5M...ODW4',
  recipient: 'GA6L...CVLT',
  token: 'XLM',
  amount: '50',
  status: 'Approved',
  reason: 'Within spend cap and compliant recipient',
  timestamp: 'Just now',
  txHash: 'c762b42f818387aa584ea33d3da006f22671071ed6e182068994ea6597395e6c',
};

const sampleTxB: TxItem = {
  id: 'tx-102',
  sender: 'GC5M...ODW4',
  recipient: 'GBZX...9KJL',
  token: 'USDC',
  amount: '250',
  status: 'Escrowed',
  reason: 'Amount exceeds 100 XLM spend cap',
  timestamp: '2 mins ago',
  txHash: '2d83231685f03b17e1a001e6c82c38453459b4f67b416ef60f9be73133026f0e',
};

describe('Recent Transactions localStorage Persistence Tests (Issue #51)', () => {
  it('persists and restores valid transactions across reloads', () => {
    const storage = createMemoryStorage();
    persistTransactions([sampleTxA, sampleTxB], storage);

    assert.ok(storage.getItem(TX_STORAGE_KEY));
    const restored = loadPersistedTransactions([], storage);
    assert.equal(restored.length, 2);
    assert.deepEqual(restored[0], sampleTxA);
    assert.deepEqual(restored[1], sampleTxB);
  });

  it('deduplicates transactions by id and enforces maxCount cap', () => {
    const deduped = deduplicateAndCapTransactions(
      [sampleTxA, sampleTxA, sampleTxB],
      1
    );
    assert.equal(deduped.length, 1);
    assert.equal(deduped[0].id, 'tx-101');
  });

  it('falls back gracefully when localStorage contains malformed JSON or invalid records', () => {
    const storage = createMemoryStorage();
    storage.setItem(TX_STORAGE_KEY, '{corrupted-json');

    const fallback = [sampleTxA];
    const restored = loadPersistedTransactions(fallback, storage);
    assert.deepEqual(restored, fallback);

    storage.setItem(TX_STORAGE_KEY, JSON.stringify([{ invalid: true }]));
    const restoredFromInvalid = loadPersistedTransactions(fallback, storage);
    assert.deepEqual(restoredFromInvalid, fallback);
  });

  it('validates TxItem structure and status enum strictly', () => {
    assert.equal(isValidTxItem(sampleTxA), true);
    assert.equal(isValidTxItem({ ...sampleTxA, status: 'Unknown' }), false);
    assert.equal(isValidTxItem(null), false);
  });
});
