import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatKycExpiration } from '../src/lib/kycBadge.ts';

describe('KYC Expiration Badge Formatting Tests', () => {
  const BASE_TIME = 1_800_000_000;

  test('formats permanent attestation as compliant and non-expiring', () => {
    const badge = formatKycExpiration(0, BASE_TIME);
    assert.equal(badge.status, 'Permanent');
    assert.equal(badge.label, 'Permanent');
    assert.equal(badge.icon, '♾️');
    assert.equal(badge.isCompliant, true);
    assert.equal(badge.daysRemaining, null);
    assert.match(badge.badgeClass, /emerald/);
  });

  test('formats unverified attestation when timestamp is missing', () => {
    const badgeUndef = formatKycExpiration(undefined, BASE_TIME);
    assert.equal(badgeUndef.status, 'Unverified');
    assert.equal(badgeUndef.isCompliant, false);
    assert.equal(badgeUndef.icon, '⚪');

    const badgeNull = formatKycExpiration(null, BASE_TIME);
    assert.equal(badgeNull.status, 'Unverified');
  });

  test('formats expired attestation with negative days and alert icon', () => {
    // Expired 3 days ago: 3 * 86400 = 259200
    const badge = formatKycExpiration(BASE_TIME - 259_200, BASE_TIME);
    assert.equal(badge.status, 'Expired');
    assert.equal(badge.isCompliant, false);
    assert.equal(badge.icon, '🚨');
    assert.match(badge.subtext, /Expired 3d ago/);
    assert.match(badge.badgeClass, /rose/);
  });

  test('formats expiring soon attestation within warning horizon', () => {
    // 4 days in future: within default 7-day horizon
    const badge = formatKycExpiration(BASE_TIME + 4 * 86_400, BASE_TIME);
    assert.equal(badge.status, 'ExpiringSoon');
    assert.equal(badge.label, 'Expires in 4d');
    assert.equal(badge.isCompliant, false);
    assert.equal(badge.icon, '⚠️');
    assert.match(badge.badgeClass, /amber/);
  });

  test('formats active compliant attestation with positive remaining days', () => {
    // 30 days in future
    const badge = formatKycExpiration(BASE_TIME + 30 * 86_400, BASE_TIME);
    assert.equal(badge.status, 'Active');
    assert.equal(badge.label, 'Valid (30d)');
    assert.equal(badge.isCompliant, true);
    assert.equal(badge.icon, '✅');
    assert.match(badge.badgeClass, /blue/);
  });

  test('respects custom warning threshold days parameter', () => {
    // 10 days in future: with threshold 14, should be ExpiringSoon
    const badge = formatKycExpiration(BASE_TIME + 10 * 86_400, BASE_TIME, 14);
    assert.equal(badge.status, 'ExpiringSoon');
    assert.equal(badge.label, 'Expires in 10d');
  });
});
