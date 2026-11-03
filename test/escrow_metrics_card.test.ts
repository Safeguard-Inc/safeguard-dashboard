import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLockedVolumeDisplay,
  formatDurationRemaining,
  calculateSettlementRatio,
  type EscrowTelemetryData,
} from '../src/lib/escrowMetricsCard.ts';

describe('EscrowMetricsOverviewCard Domain Tests', () => {
  test('formatLockedVolumeDisplay converts stroops to XLM and calculates exposure tiers', () => {
    // Normal exposure: 1,000 XLM (10_000_000_000 stroops)
    const normal = formatLockedVolumeDisplay('10000000000');
    assert.equal(normal.isHighExposure, false);
    assert.equal(normal.badgeLabel, 'Normal Exposure');
    assert.ok(normal.amountXlm.includes('1,000'));

    // High exposure: 25,000 XLM (250_000_000_000 stroops)
    const high = formatLockedVolumeDisplay('250000000000');
    assert.equal(high.isHighExposure, true);
    assert.equal(high.badgeLabel, 'High Exposure');
    assert.ok(high.amountXlm.includes('25,000'));

    // Empty or malformed input defaults to 0.00
    const empty = formatLockedVolumeDisplay('invalid-amount');
    assert.equal(empty.amountXlm, '0.00');
    assert.equal(empty.isHighExposure, false);
  });

  test('formatDurationRemaining formats seconds into human-readable intervals', () => {
    assert.equal(formatDurationRemaining(undefined), 'N/A');
    assert.equal(formatDurationRemaining(0), 'Matured');
    assert.equal(formatDurationRemaining(-100), 'Matured');

    // 2 days, 3 hours (172800 + 10800 = 183600)
    assert.equal(formatDurationRemaining(183600), '2d 3h');

    // 4 hours, 15 minutes (14400 + 900 = 15300)
    assert.equal(formatDurationRemaining(15300), '4h 15m');

    // 5 minutes, 30 seconds
    assert.equal(formatDurationRemaining(330), '5m 30s');
  });

  test('calculateSettlementRatio computes ratio percentage and string format', () => {
    // Zero total -> 100%
    const zero = calculateSettlementRatio(0, 0);
    assert.equal(zero.ratioPercent, 100);
    assert.equal(zero.formatted, '100%');

    // 3 out of 10 settled -> 30%
    const thirty = calculateSettlementRatio(3, 10);
    assert.equal(thirty.ratioPercent, 30);
    assert.equal(thirty.formatted, '30.0%');

    // 8 out of 8 settled -> 100%
    const full = calculateSettlementRatio(8, 8);
    assert.equal(full.ratioPercent, 100);
    assert.equal(full.formatted, '100.0%');
  });
});
