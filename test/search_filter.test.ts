import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTransactions,
  matchesTransaction,
  type FilterableTransaction,
} from '../src/lib/searchFilter.ts';

const SAMPLE_TXS: FilterableTransaction[] = [
  {
    id: 'tx-1',
    txHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    sender: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    recipient: 'GCEXAMPLEADDRESS11111111111111111111111111111111111111111',
    token: 'USDC',
    amount: 500,
    status: 'approved',
  },
  {
    id: 'tx-2',
    txHash: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01',
    sender: 'GCEXAMPLEADDRESS11111111111111111111111111111111111111111',
    recipient: 'GDYAZQ7E6B23XJTXN2W2K6N3H3Y564L4O5IELJ4LGF6333YXZMND2P4M',
    token: 'XLM',
    amount: 1250,
    status: 'pending',
  },
  {
    id: 'tx-3',
    txHash: 'c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012',
    sender: 'GDYAZQ7E6B23XJTXN2W2K6N3H3Y564L4O5IELJ4LGF6333YXZMND2P4M',
    recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    token: 'EURC',
    amount: 25,
    status: 'disputed',
  },
];

describe('TransactionSearchFilter Match Predicate Tests', () => {
  test('filters transactions by Stellar transaction hash prefix', () => {
    const results = filterTransactions(SAMPLE_TXS, { query: 'a1b2c3d4' });
    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'tx-1');
  });

  test('filters transactions by account address', () => {
    const results = filterTransactions(SAMPLE_TXS, { query: 'GDYAZQ7E6' });
    assert.equal(results.length, 2);
  });

  test('filters transactions by status filter', () => {
    const pendingResults = filterTransactions(SAMPLE_TXS, { status: 'pending' });
    assert.equal(pendingResults.length, 1);
    assert.equal(pendingResults[0].id, 'tx-2');

    const disputedResults = filterTransactions(SAMPLE_TXS, { status: 'disputed' });
    assert.equal(disputedResults.length, 1);
    assert.equal(disputedResults[0].id, 'tx-3');
  });

  test('filters transactions by token symbol', () => {
    const usdc = filterTransactions(SAMPLE_TXS, { token: 'USDC' });
    assert.equal(usdc.length, 1);
    assert.equal(usdc[0].token, 'USDC');
  });

  test('combines token filter with amount range criteria', () => {
    const results = filterTransactions(SAMPLE_TXS, {
      token: 'XLM',
      minAmount: 1000,
      maxAmount: 2000,
    });
    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'tx-2');

    const empty = filterTransactions(SAMPLE_TXS, {
      token: 'XLM',
      minAmount: 2000,
    });
    assert.equal(empty.length, 0);
  });
});
