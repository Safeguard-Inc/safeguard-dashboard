import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPauseRemainingTime,
  evaluateProtocolStatusAlerts,
  type ProtocolOperationalState,
} from '../src/lib/protocolStatusBanner.ts';

test('formatPauseRemainingTime formats durations accurately', () => {
  assert.equal(formatPauseRemainingTime(0), 'Expired');
  assert.equal(formatPauseRemainingTime(-10), 'Expired');
  assert.equal(formatPauseRemainingTime(45), '45s');
  assert.equal(formatPauseRemainingTime(90), '1m 30s');
  assert.equal(formatPauseRemainingTime(3600), '60m 0s');
});

test('evaluateProtocolStatusAlerts returns normal state when healthy and in-sync', () => {
  const healthyState: ProtocolOperationalState = {
    isCircuitBreakerPaused: false,
    pauseRemainingSeconds: 0,
    ledgerLagSeconds: 1,
    networkTipLedger: 5000000,
    isHealthy: true,
  };

  const alert = evaluateProtocolStatusAlerts(healthyState);
  assert.equal(alert.showAlert, false);
  assert.equal(alert.severity, 'normal');
  assert.equal(alert.badgeText, 'OPERATIONAL');
});

test('evaluateProtocolStatusAlerts elevates to critical when circuit breaker is paused', () => {
  const pausedState: ProtocolOperationalState = {
    isCircuitBreakerPaused: true,
    pauseRemainingSeconds: 600,
    ledgerLagSeconds: 0,
    networkTipLedger: 5000000,
    isHealthy: true,
  };

  const alert = evaluateProtocolStatusAlerts(pausedState);
  assert.equal(alert.showAlert, true);
  assert.equal(alert.severity, 'critical');
  assert.equal(alert.badgeText, 'PAUSED');
  assert.ok(alert.message.includes('10m 0s'));
});

test('evaluateProtocolStatusAlerts raises warning on ledger lag or unhealthy indexing', () => {
  const lagState: ProtocolOperationalState = {
    isCircuitBreakerPaused: false,
    pauseRemainingSeconds: 0,
    ledgerLagSeconds: 25,
    networkTipLedger: 5000100,
    isHealthy: true,
  };

  const alert = evaluateProtocolStatusAlerts(lagState);
  assert.equal(alert.showAlert, true);
  assert.equal(alert.severity, 'warning');
  assert.equal(alert.badgeText, 'INDEXING LAG');
  assert.ok(alert.message.includes('25s behind'));
});
