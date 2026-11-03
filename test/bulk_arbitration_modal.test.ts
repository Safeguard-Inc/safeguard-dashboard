import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterEligibleForArbitration,
  calculateBulkArbitrationSummary,
  type BulkArbitrationItem,
} from '../src/lib/bulkArbitrationModal.ts';

describe('Bulk Arbitration Modal Domain Tests', () => {
  const items: BulkArbitrationItem[] = [
    {
      id: 1,
      escrowIndex: 601,
      amountStroops: '1000000000', // 100 XLM
      tokenSymbol: 'XLM',
      sender: 'GB_SENDER_1',
      recipient: 'GA_REC_1',
      status: 'Disputed',
    },
    {
      id: 2,
      escrowIndex: 602,
      amountStroops: '500000000', // 50 USDC
      tokenSymbol: 'USDC',
      sender: 'GB_SENDER_2',
      recipient: 'GA_REC_2',
      status: 'Pending', // Not eligible for arbitration
    },
    {
      id: 3,
      escrowIndex: 603,
      amountStroops: '250000000', // 25 XLM
      tokenSymbol: 'XLM',
      sender: 'GB_SENDER_1',
      recipient: 'GA_REC_1',
      status: 'Disputed',
    },
  ];

  test('filters eligible escrows strictly to Disputed status', () => {
    const eligible = filterEligibleForArbitration(items);
    assert.equal(eligible.length, 2);
    assert.equal(eligible[0].escrowIndex, 601);
    assert.equal(eligible[1].escrowIndex, 603);
  });

  test('calculates summary volume and token breakdowns accurately across selected escrows', () => {
    const summary = calculateBulkArbitrationSummary([601, 603], items);
    assert.equal(summary.count, 2);
    assert.equal(summary.isValid, true);
    assert.deepEqual(summary.selectedIndices, [601, 603]);
    assert.ok(summary.tokenBreakdown['XLM']);
  });

  test('ignores non-disputed escrows even if their indices are passed in selected list', () => {
    const summary = calculateBulkArbitrationSummary([601, 602], items);
    assert.equal(summary.count, 1);
    assert.deepEqual(summary.selectedIndices, [601]);
  });

  test('returns invalid status when no items are selected', () => {
    const summary = calculateBulkArbitrationSummary([], items);
    assert.equal(summary.count, 0);
    assert.equal(summary.isValid, false);
    assert.deepEqual(summary.selectedIndices, []);
  });
});
