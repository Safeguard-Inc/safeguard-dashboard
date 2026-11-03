import test from 'node:test';
import assert from 'node:assert/strict';
import {
  type CircuitBreakerStatus,
  formatRemainingDuration,
  formatCircuitBreakerBadge,
  isCallerGuardianOrAdmin,
  calculateTimelockExpirySeconds,
} from '../src/lib/emergencyPauseCard.ts';

test('formatRemainingDuration formats countdown intervals cleanly', () => {
  assert.equal(formatRemainingDuration(0), 'Expired / Indefinite');
  assert.equal(formatRemainingDuration(-10), 'Expired / Indefinite');
  assert.equal(formatRemainingDuration(45), '45s');
  assert.equal(formatRemainingDuration(125), '2m 5s');
  assert.equal(formatRemainingDuration(120), '2m');
  assert.equal(formatRemainingDuration(3720), '1h 2m');
});

test('formatCircuitBreakerBadge maps operational states to badge styles', () => {
  const norm = formatCircuitBreakerBadge('NORMAL_OPERATIONAL');
  assert.equal(norm.label, 'Operational (Normal)');
  assert.equal(norm.icon, '🛡️');
  assert.ok(norm.badgeClass.includes('emerald'));

  const time = formatCircuitBreakerBadge('TIMELOCKED_PAUSED');
  assert.equal(time.label, 'Timelocked Defense Active');
  assert.equal(time.icon, '⏳');
  assert.ok(time.badgeClass.includes('amber'));

  const manual = formatCircuitBreakerBadge('ACTIVE_PAUSED');
  assert.equal(manual.label, 'Emergency Paused (Manual)');
  assert.equal(manual.icon, '🛑');
  assert.ok(manual.badgeClass.includes('rose'));
});

test('isCallerGuardianOrAdmin verifies authorized accounts', () => {
  const admin = 'GADMIN1111111111111111111111111111111111111111111111111111';
  const guardian = 'GGUARDIAN22222222222222222222222222222222222222222222222222';
  const stranger = 'GSTRANGER33333333333333333333333333333333333333333333333333';

  assert.equal(isCallerGuardianOrAdmin(admin, admin, guardian), true);
  assert.equal(isCallerGuardianOrAdmin(admin.toLowerCase(), admin, guardian), true);
  assert.equal(isCallerGuardianOrAdmin(guardian, admin, guardian), true);
  assert.equal(isCallerGuardianOrAdmin(stranger, admin, guardian), false);
  assert.equal(isCallerGuardianOrAdmin('', admin, guardian), false);
});

test('calculateTimelockExpirySeconds converts presets to seconds', () => {
  assert.equal(calculateTimelockExpirySeconds('5m'), 300);
  assert.equal(calculateTimelockExpirySeconds('1h'), 3600);
  assert.equal(calculateTimelockExpirySeconds('24h'), 86400);
  assert.equal(calculateTimelockExpirySeconds('indefinite'), 0);
});
