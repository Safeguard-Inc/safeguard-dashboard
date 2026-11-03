import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  gradeRpcLatency,
  formatHealthBadge,
  type DeepHealthMetrics,
} from '../src/lib/deepHealth.ts';

describe('Safeguard Dashboard Deep Health Indicator Tests', () => {
  it('grades RPC latency according to defined SLA thresholds', () => {
    const optimal = gradeRpcLatency(120);
    assert.equal(optimal.level, 'optimal');
    assert.ok(optimal.label.includes('Optimal'));
    assert.equal(optimal.dotColor, 'bg-emerald-400');

    const normal = gradeRpcLatency(450);
    assert.equal(normal.level, 'acceptable');
    assert.ok(normal.label.includes('Normal'));
    assert.equal(normal.dotColor, 'bg-emerald-500');

    const degraded = gradeRpcLatency(950);
    assert.equal(degraded.level, 'degraded');
    assert.ok(degraded.label.includes('High Latency'));
    assert.equal(degraded.dotColor, 'bg-amber-400');

    const offline = gradeRpcLatency(-1);
    assert.equal(offline.level, 'offline');
    assert.equal(offline.label, 'Unreachable');
    assert.equal(offline.dotColor, 'bg-rose-500');
  });

  it('formats badge style for healthy synced state without errors', () => {
    const healthy: DeepHealthMetrics = {
      status: 'healthy',
      latencyMs: 140,
      lastLedger: 5123999,
      eventsProcessed: 42,
      consecutiveErrors: 0,
    };

    const badge = formatHealthBadge(healthy);
    assert.equal(badge.statusText, 'Soroban Synced');
    assert.ok(badge.badgeBg.includes('emerald'));
    assert.ok(badge.badgeText.includes('emerald'));
  });

  it('formats badge style for sync lag or active retries', () => {
    const degraded: DeepHealthMetrics = {
      status: 'healthy',
      latencyMs: 300,
      lastLedger: 5123999,
      eventsProcessed: 42,
      consecutiveErrors: 2, // Active retries
    };

    const badge = formatHealthBadge(degraded);
    assert.equal(badge.statusText, 'Sync Lag / Retrying');
    assert.ok(badge.badgeBg.includes('amber'));
  });

  it('formats badge style for offline RPC connection', () => {
    const down: DeepHealthMetrics = {
      status: 'down',
      latencyMs: -1,
      lastLedger: 0,
      eventsProcessed: 0,
    };

    const badge = formatHealthBadge(down);
    assert.equal(badge.statusText, 'RPC Unreachable');
    assert.ok(badge.badgeBg.includes('rose'));
  });
});
