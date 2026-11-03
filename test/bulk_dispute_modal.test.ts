import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterEligibleForDispute,
  calculateBulkDisputeSummary,
  type BulkDisputeItem,
} from '../src/lib/bulkDisputeModal.ts';

describe('Bulk Dispute Modal Domain Tests', () => {
  const items: BulkDisputeItem[] = [
    {
      id: 1,
      escrowIndex: 301,
      amountStroops: '1000000000', // 100 XLM
      tokenSymbol: 'XLM',
      sender: 'GB_SENDER_1',
      recipient: 'GA_REC_1',
      status: 'Pending',
    },
    {
      id: 2,
      escrowIndex: 302,
      amountStroops: '500000000', // 50 USDC
      tokenSymbol: 'USDC',
      sender: 'GB_SENDER_2',
      recipient: 'GA_REC_2',
      status: 'Pending',
    },
    {
      id: 3,
      escrowIndex: 303,
      amountStroops: '250000000', // 25 XLM
      tokenSymbol: 'XLM',
      sender: 'GB_SENDER_1',
      recipient: 'GA_REC_1',
      status: 'Released', // Not eligible
    },
  ];

  test('filters eligible escrows strictly to Pending status', () => {
    const eligible = filterEligibleForDispute(items);
    assert.equal(eligible.length, 2);
    assert.equal(eligible[0].escrowIndex, 301);
    assert.equal(eligible[1].escrowIndex, 302);
  });

  test('filters eligible escrows by caller address when supplied', () => {
    const sender1Eligible = filterEligibleForDispute(items, 'GB_SENDER_1');
    assert.equal(sender1Eligible.length, 1);
    assert.equal(sender1Eligible[0].escrowIndex, 301);

    const rec2Eligible = filterEligibleForDispute(items, 'GA_REC_2');
    assert.equal(rec2Eligible.length, 1);
    assert.equal(rec2Eligible[0].escrowIndex, 302);

    const strangerEligible = filterEligibleForDispute(items, 'STRANGER_ADDR');
    assert.equal(strangerEligible.length, 0);
  });

  test('calculates summary volume and token breakdowns accurately across selected escrows', () => {
    const summary = calculateBulkDisputeSummary([301, 302], items);
    assert.equal(summary.count, 2);
    assert.equal(summary.isValid, true);
    assert.deepEqual(summary.selectedIndices, [301, 302]);
    assert.ok(summary.tokenBreakdown['XLM']);
    assert.ok(summary.tokenBreakdown['USDC']);
  });

  test('returns invalid status when no items are selected', () => {
    const summary = calculateBulkDisputeSummary([], items);
    assert.equal(summary.count, 0);
    assert.equal(summary.isValid, false);
    assert.deepEqual(summary.selectedIndices, []);
  });
});
