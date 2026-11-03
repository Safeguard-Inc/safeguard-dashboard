import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterEligibleForRefund,
  calculateBulkRefundSummary,
  type BulkRefundItem,
} from '../src/lib/bulkRefundModal.ts';

describe('Bulk Escrow Refund Modal Domain Tests', () => {
  const now = 2000;
  const items: BulkRefundItem[] = [
    {
      id: 1,
      escrowIndex: 101,
      amountStroops: '1000000000', // 100 XLM
      tokenSymbol: 'XLM',
      sender: 'GB_SENDER_1',
      expiresAt: 1500, // Timelock passed
      status: 'Pending',
    },
    {
      id: 2,
      escrowIndex: 102,
      amountStroops: '500000000', // 50 USDC
      tokenSymbol: 'USDC',
      sender: 'GB_SENDER_2',
      expiresAt: 2500, // Timelock NOT passed
      status: 'Pending',
    },
    {
      id: 3,
      escrowIndex: 103,
      amountStroops: '250000000', // 25 XLM
      tokenSymbol: 'XLM',
      sender: 'GB_SENDER_1',
      expiresAt: 1000,
      status: 'Refunded', // Already settled
    },
  ];

  test('admin can refund any pending escrow regardless of timelock', () => {
    const adminEligible = filterEligibleForRefund(items, now, true);
    assert.equal(adminEligible.length, 2);
    assert.equal(adminEligible[0].escrowIndex, 101);
    assert.equal(adminEligible[1].escrowIndex, 102);
  });

  test('non-admin can only refund pending escrows whose timelock has passed', () => {
    const senderEligible = filterEligibleForRefund(items, now, false);
    assert.equal(senderEligible.length, 1);
    assert.equal(senderEligible[0].escrowIndex, 101);
  });

  test('calculates summary volume and token breakdowns accurately across selected refunds', () => {
    const summary = calculateBulkRefundSummary([101, 102], items, now, true);
    assert.equal(summary.count, 2);
    assert.equal(summary.isValid, true);
    assert.deepEqual(summary.selectedIndices, [101, 102]);

    assert.ok(summary.tokenBreakdown['XLM']);
    assert.ok(summary.tokenBreakdown['USDC']);
  });

  test('returns invalid status when no items are selected', () => {
    const summary = calculateBulkRefundSummary([], items, now, true);
    assert.equal(summary.count, 0);
    assert.equal(summary.isValid, false);
    assert.deepEqual(summary.selectedIndices, []);
  });

  test('ignores already-settled escrows even if their indices are passed in selected list', () => {
    const summary = calculateBulkRefundSummary([101, 103], items, now, true);
    assert.equal(summary.count, 1);
    assert.deepEqual(summary.selectedIndices, [101]);
  });
});
