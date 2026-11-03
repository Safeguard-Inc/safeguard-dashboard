import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSyncBadge,
  formatStroopVolumeToXlm,
  formatLedgerLagWarning,
} from '../src/lib/telemetrySnapshotCard.ts';

test('formatSyncBadge returns correct classes and labels for all statuses', () => {
  const inSync = formatSyncBadge('IN_SYNC');
  assert.equal(inSync.label, 'Consensus In-Sync');
  assert.ok(inSync.badgeClass.includes('emerald'));
  assert.equal(inSync.icon, '🟢');

  const lag = formatSyncBadge('INDEXING_LAG');
  assert.equal(lag.label, 'Indexing Minor Lag');
  assert.ok(lag.badgeClass.includes('amber'));
  assert.equal(lag.icon, '🟡');

  const desync = formatSyncBadge('DESYNCHRONIZED');
  assert.equal(desync.label, 'Desynchronized Alert');
  assert.ok(desync.badgeClass.includes('rose'));
  assert.equal(desync.icon, '🔴');
});

test('formatStroopVolumeToXlm converts stroops correctly', () => {
  assert.equal(formatStroopVolumeToXlm('10000000'), '1.00');
  assert.equal(formatStroopVolumeToXlm('5000000000'), '500.00');
  assert.equal(formatStroopVolumeToXlm('0'), '0.00');
  assert.equal(formatStroopVolumeToXlm('invalid'), '0.00');
});

test('formatLedgerLagWarning produces accurate warnings based on threshold', () => {
  assert.equal(formatLedgerLagWarning(2), null);
  assert.equal(formatLedgerLagWarning(5), null);
  assert.equal(formatLedgerLagWarning(10), 'Notice: Node ledger sync is approximately 10s behind network tip.');
  assert.equal(formatLedgerLagWarning(30), 'Warning: Substantial indexing lag detected (30s). Reconciliation required.');
});
