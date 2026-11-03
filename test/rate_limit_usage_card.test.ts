import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTierLabel,
  calculateTierUsage,
} from '../src/lib/tieredRateLimitDisplay.ts';

describe('Rate Limit Quota & Tier Display Domain Tests', () => {
  test('formats tier labels, styling classes, and icons accurately', () => {
    const pub = formatTierLabel('public');
    assert.equal(pub.name, 'Public Tier');
    assert.equal(pub.icon, '🌐');

    const std = formatTierLabel('standard');
    assert.equal(std.name, 'Standard Tier');
    assert.equal(std.icon, '⚡');
    assert.match(std.badgeClass, /blue/);

    const ent = formatTierLabel('enterprise');
    assert.equal(ent.name, 'Enterprise Tier');
    assert.equal(ent.icon, '👑');
    assert.match(ent.badgeClass, /purple/);
  });

  test('calculates nominal usage percentage when quota is abundant', () => {
    // 50 remaining out of 60 limit = 10 used = 16.7% used
    const usage = calculateTierUsage(50, 60);
    assert.equal(usage.status, 'nominal');
    assert.equal(usage.remaining, 50);
    assert.equal(usage.limit, 60);
    assert.equal(usage.percentUsed, 16.7);
    assert.match(usage.barColorClass, /blue/);
  });

  test('detects warning status when consumption exceeds 80%', () => {
    // 10 remaining out of 100 limit = 90 used = 90% used
    const usage = calculateTierUsage(10, 100);
    assert.equal(usage.status, 'warning');
    assert.equal(usage.percentUsed, 90.0);
    assert.match(usage.barColorClass, /amber/);
  });

  test('detects exhausted status when remaining tokens drop to zero', () => {
    const usage = calculateTierUsage(0, 100);
    assert.equal(usage.status, 'exhausted');
    assert.equal(usage.remaining, 0);
    assert.equal(usage.percentUsed, 100.0);
    assert.match(usage.barColorClass, /rose/);
  });

  test('clamps negative remaining inputs safely to zero', () => {
    const usage = calculateTierUsage(-5, 60);
    assert.equal(usage.remaining, 0);
    assert.equal(usage.status, 'exhausted');
  });
});
