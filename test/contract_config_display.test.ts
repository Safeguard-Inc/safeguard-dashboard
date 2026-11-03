import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatNetworkBadge,
  formatCircuitBreakerStatus,
  abbreviateContractId,
  type DeployedContractTelemetry,
} from '../src/lib/contractConfigDisplay.ts';

describe('ContractConfigCard Domain Tests', () => {
  test('formatNetworkBadge differentiates Mainnet and Testnet', () => {
    const mainnet = formatNetworkBadge('mainnet');
    assert.equal(mainnet.label, 'Stellar Mainnet');
    assert.ok(mainnet.badgeClass.includes('text-emerald-400'));

    const testnet = formatNetworkBadge('testnet');
    assert.equal(testnet.label, 'Soroban Testnet');
    assert.ok(testnet.badgeClass.includes('text-blue-400'));

    const def = formatNetworkBadge('');
    assert.equal(def.label, 'Soroban Testnet');
  });

  test('formatCircuitBreakerStatus returns appropriate labels and icons', () => {
    const active = formatCircuitBreakerStatus(false);
    assert.equal(active.status, 'ACTIVE');
    assert.equal(active.label, 'Gateway Operational');
    assert.equal(active.icon, '⚡');

    const paused = formatCircuitBreakerStatus(true);
    assert.equal(paused.status, 'PAUSED');
    assert.equal(paused.label, 'Circuit Breaker Active (Paused)');
    assert.equal(paused.icon, '🛑');
  });

  test('abbreviateContractId abbreviates addresses safely', () => {
    const longId = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM';
    assert.equal(abbreviateContractId(longId), 'CAAAAA...AAD2KM');

    const shortId = 'C1234';
    assert.equal(abbreviateContractId(shortId), 'C1234');

    assert.equal(abbreviateContractId(''), '');
  });
});
