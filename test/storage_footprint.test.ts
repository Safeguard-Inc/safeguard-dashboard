import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatStorageBytes,
  formatLedgerTtlStatus,
  calculateRentProjectionDisplay,
} from '../src/lib/storageFootprint.ts';

describe('Storage Footprint & TTL Telemetry Domain Tests', () => {
  test('formats byte sizes across B, KB, and MB scales', () => {
    assert.equal(formatStorageBytes(512), '512 B');
    assert.equal(formatStorageBytes(2048), '2.0 KB');
    assert.equal(formatStorageBytes(1024 * 1024 * 3.5), '3.50 MB');
  });

  test('formats healthy TTL status when remaining days exceed 14', () => {
    const currentLedger = 100_000;
    // 30 days remaining = 30 * 17280 = 518400 ledgers
    const liveUntil = currentLedger + 518_400;

    const status = formatLedgerTtlStatus(currentLedger, liveUntil);
    assert.equal(status.status, 'healthy');
    assert.equal(status.daysRemaining, 30.0);
    assert.equal(status.ledgersRemaining, 518_400);
    assert.match(status.badgeClass, /emerald/);
  });

  test('formats warning TTL status when remaining days are between 3 and 14', () => {
    const currentLedger = 200_000;
    // 7 days remaining = 7 * 17280 = 120960 ledgers
    const liveUntil = currentLedger + 120_960;

    const status = formatLedgerTtlStatus(currentLedger, liveUntil);
    assert.equal(status.status, 'warning');
    assert.equal(status.daysRemaining, 7.0);
    assert.match(status.badgeClass, /amber/);
  });

  test('formats critical TTL status when remaining days are 3 or less', () => {
    const currentLedger = 300_000;
    // 2 days remaining = 2 * 17280 = 34560 ledgers
    const liveUntil = currentLedger + 34_560;

    const status = formatLedgerTtlStatus(currentLedger, liveUntil);
    assert.equal(status.status, 'critical');
    assert.equal(status.daysRemaining, 2.0);
    assert.match(status.badgeClass, /rose/);
  });

  test('calculates rent projection and formats XLM accurately', () => {
    // 1000 bytes, 2 entries, 30 days:
    // Base: 2 * 200 = 400 stroops
    // Storage: 1000 * 30 * 5 = 150,000 stroops
    // Total = 150,400 stroops = 0.0150400 XLM
    const projection = calculateRentProjectionDisplay(1000, 2, 30);
    assert.equal(projection.estimatedStroops, 150_400);
    assert.equal(projection.estimatedXlm, '0.0150400 XLM');
    assert.equal(projection.extensionDays, 30);
  });
});
