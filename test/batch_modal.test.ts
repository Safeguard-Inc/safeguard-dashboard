import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBatchSummary,
  type BatchSimulationItem,
} from '../src/lib/formatters.ts';

describe('Safeguard Dashboard Batch Simulation Calculation Tests', () => {
  const sampleItems: BatchSimulationItem[] = [
    {
      sender: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      recipient: 'GCXKG6RN4ONIEPCMNFB732A436Z5PNDSRLGHD7UYWU7JZX2TM7GXM5YF',
      amountStroops: '50000000', // 5 XLM
      decision: 'APPROVE',
    },
    {
      sender: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      recipient: 'GB222222222222222222222222222222222222222222222222222222',
      amountStroops: 150000000n, // 15 XLM
      decision: 'FLAG',
      reason: 'Exceeds cap, routing to escrow',
    },
    {
      sender: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      recipient: 'GCV4I3P3F2OMWYZGRXD5PR5AC3K7MUDSBMKDBPEMJ2MFHLVUAGJEK4DT',
      amountStroops: 25000000, // 2.5 XLM
      decision: 'BLOCK',
      reason: 'Sanctioned recipient',
    },
    {
      sender: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      recipient: 'GCXKG6RN4ONIEPCMNFB732A436Z5PNDSRLGHD7UYWU7JZX2TM7GXM5YF',
      amountStroops: '10000000', // 1 XLM
      decision: 'APPROVE',
    },
  ];

  it('calculates totals, breakdown counts, and approval percentage correctly', () => {
    const summary = calculateBatchSummary(sampleItems);

    assert.equal(summary.total, 4);
    assert.equal(summary.approvedCount, 2);
    assert.equal(summary.escrowedCount, 1);
    assert.equal(summary.blockedCount, 1);
    assert.equal(summary.approvalRatioPercent, 50); // 2 of 4 = 50%
    assert.equal(summary.totalVolumeStroops, 235000000n); // 50M + 150M + 25M + 10M = 235M
  });

  it('handles empty batch input without dividing by zero', () => {
    const summary = calculateBatchSummary([]);

    assert.equal(summary.total, 0);
    assert.equal(summary.approvedCount, 0);
    assert.equal(summary.escrowedCount, 0);
    assert.equal(summary.blockedCount, 0);
    assert.equal(summary.approvalRatioPercent, 0);
    assert.equal(summary.totalVolumeStroops, 0n);
  });

  it('handles 100% approved batch ratio', () => {
    const approvedOnly: BatchSimulationItem[] = [
      {
        sender: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        recipient: 'GCXKG6RN4ONIEPCMNFB732A436Z5PNDSRLGHD7UYWU7JZX2TM7GXM5YF',
        amountStroops: 10000000n,
        decision: 'APPROVE',
      },
    ];

    const summary = calculateBatchSummary(approvedOnly);
    assert.equal(summary.total, 1);
    assert.equal(summary.approvedCount, 1);
    assert.equal(summary.approvalRatioPercent, 100);
  });
});
