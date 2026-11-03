import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterEligibleForRelease,
  calculateBulkReleaseSummary,
  type BulkEscrowItem,
} from '../src/lib/bulkEscrowModal.ts';

describe('Bulk Escrow Release Modal Domain Tests', () => {
  const items: BulkEscrowItem[] = [
    {
      id: 1,
      escrowIndex: 1,
      amountStroops: '1000000000', // 100 XLM
      tokenSymbol: 'XLM',
      recipient: 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
      status: 'Pending',
    },
    {
      id: 2,
      escrowIndex: 2,
      amountStroops: '500000000', // 50 USDC
      tokenSymbol: 'USDC',
      recipient: 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
      status: 'Pending',
    },
    {
      id: 3,
      escrowIndex: 3,
      amountStroops: '250000000', // 25 XLM
      tokenSymbol: 'XLM',
      recipient: 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
      status: 'Released', // Not eligible
    },
  ];

  test('filters eligible escrows strictly to Pending status', () => {
    const eligible = filterEligibleForRelease(items);
    assert.equal(eligible.length, 2);
    assert.equal(eligible[0].escrowIndex, 1);
    assert.equal(eligible[1].escrowIndex, 2);
  });

  test('calculates summary volume and token breakdowns accurately across selected escrows', () => {
    const summary = calculateBulkReleaseSummary([1, 2], items);
    assert.equal(summary.count, 2);
    assert.equal(summary.isValid, true);
    assert.deepEqual(summary.selectedIndices, [1, 2]);

    // Token breakdown contains both XLM and USDC
    assert.match(summary.tokenBreakdown['XLM'], /100/);
    assert.match(summary.tokenBreakdown['USDC'], /50/);
  });

  test('ignores already-settled escrows even if their indices are passed in selected list', () => {
    // Escrow #3 is Released, not Pending
    const summary = calculateBulkReleaseSummary([1, 3], items);
    assert.equal(summary.count, 1);
    assert.deepEqual(summary.selectedIndices, [1]);
  });

  test('returns invalid status when no items are selected', () => {
    const summary = calculateBulkReleaseSummary([], items);
    assert.equal(summary.count, 0);
    assert.equal(summary.isValid, false);
  });
});
