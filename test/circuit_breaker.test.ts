import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  canTriggerGuardianPause,
  canResumeGateway,
  formatGatewayOperatingStatus,
  resolveUserRole,
  type CircuitBreakerState,
} from '../src/lib/circuitBreaker.ts';

describe('Guardian Circuit Breaker Domain Logic Tests', () => {
  const admin = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const guardian = 'GCEXAMPLEADDRESS11111111111111111111111111111111111111111';
  const stranger = 'GDYAZQ7E6B23XJTXN2W2K6N3H3Y564L4O5IELJ4LGF6333YXZMND2P4M';

  test('correctly resolves user roles across admin, guardian, and observer', () => {
    const baseState: CircuitBreakerState = {
      isPaused: false,
      adminAddress: admin,
      guardianAddress: guardian,
    };

    assert.equal(resolveUserRole({ ...baseState, activeAccount: admin }), 'ADMIN');
    assert.equal(resolveUserRole({ ...baseState, activeAccount: guardian }), 'GUARDIAN');
    assert.equal(resolveUserRole({ ...baseState, activeAccount: stranger }), 'OBSERVER');
    assert.equal(resolveUserRole({ ...baseState, activeAccount: undefined }), 'OBSERVER');
  });

  test('permits pause only for admin and guardian accounts', () => {
    const state: CircuitBreakerState = {
      isPaused: false,
      adminAddress: admin,
      guardianAddress: guardian,
    };

    assert.equal(canTriggerGuardianPause({ ...state, activeAccount: admin }), true);
    assert.equal(canTriggerGuardianPause({ ...state, activeAccount: guardian }), true);
    assert.equal(canTriggerGuardianPause({ ...state, activeAccount: stranger }), false);
    assert.equal(canTriggerGuardianPause({ ...state, activeAccount: undefined }), false);
  });

  test('permits resume only for admin account', () => {
    const state: CircuitBreakerState = {
      isPaused: true,
      adminAddress: admin,
      guardianAddress: guardian,
    };

    assert.equal(canResumeGateway({ ...state, activeAccount: admin }), true);
    assert.equal(canResumeGateway({ ...state, activeAccount: guardian }), false);
    assert.equal(canResumeGateway({ ...state, activeAccount: stranger }), false);
  });

  test('formats operating status labels and badges accurately', () => {
    const operational = formatGatewayOperatingStatus(false);
    assert.equal(operational.status, 'OPERATIONAL');
    assert.match(operational.colorClass, /emerald/);

    const paused = formatGatewayOperatingStatus(true);
    assert.equal(paused.status, 'EMERGENCY PAUSED');
    assert.match(paused.colorClass, /rose/);
  });
});
