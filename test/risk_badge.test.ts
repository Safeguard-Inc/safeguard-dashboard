import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getRiskBadgeConfig } from '../src/lib/riskBadge.ts';

describe('Transaction Risk Score Badge Formatters Tests', () => {
  test('formats LOW risk score (0-29) with emerald styling', () => {
    const config = getRiskBadgeConfig(15);
    assert.equal(config.score, 15);
    assert.equal(config.band, 'LOW');
    assert.equal(config.label, 'Low Risk');
    assert.match(config.colorClass, /emerald/);
  });

  test('formats MEDIUM risk score (30-69) with amber styling', () => {
    const config = getRiskBadgeConfig(45);
    assert.equal(config.score, 45);
    assert.equal(config.band, 'MEDIUM');
    assert.equal(config.label, 'Moderate Risk');
    assert.match(config.colorClass, /amber/);
  });

  test('formats HIGH risk score (70-100) with rose styling', () => {
    const config = getRiskBadgeConfig(85);
    assert.equal(config.score, 85);
    assert.equal(config.band, 'HIGH');
    assert.equal(config.label, 'High Risk');
    assert.match(config.colorClass, /rose/);
  });

  test('clamps out-of-bounds scores safely between 0 and 100', () => {
    assert.equal(getRiskBadgeConfig(-10).score, 0);
    assert.equal(getRiskBadgeConfig(150).score, 100);
  });
});
