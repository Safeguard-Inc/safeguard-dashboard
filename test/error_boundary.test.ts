import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyRuntimeError } from '../src/lib/errorBoundary.ts';

describe('App Router Error Boundary Domain Logic Tests (Issue #56)', () => {
  it('classifies Soroban RPC and Horizon network errors as NETWORK_RPC', () => {
    const err = Object.assign(new Error('Failed to fetch from Soroban RPC endpoint'), {
      digest: 'ERR_RPC_503',
    });
    const summary = classifyRuntimeError(err);
    assert.equal(summary.category, 'NETWORK_RPC');
    assert.equal(summary.digest, 'ERR_RPC_503');
    assert.equal(summary.recoveryActionLabel, 'Retry RPC Sync');
  });

  it('classifies Freighter wallet extension errors as WALLET_SIGNING', () => {
    const err = new Error('Freighter wallet connection rejected by user');
    const summary = classifyRuntimeError(err);
    assert.equal(summary.category, 'WALLET_SIGNING');
    assert.equal(summary.recoveryActionLabel, 'Reconnect Wallet View');
  });

  it('classifies contract & escrow errors as CONTRACT_POLICY', () => {
    const err = new Error('Escrow vault state simulation failed');
    const summary = classifyRuntimeError(err);
    assert.equal(summary.category, 'CONTRACT_POLICY');
    assert.equal(summary.recoveryActionLabel, 'Reload Contract State');
  });

  it('provides safe fallback for generic or empty runtime errors', () => {
    const summary = classifyRuntimeError(new Error(''));
    assert.equal(summary.category, 'RUNTIME_UI');
    assert.equal(summary.message, 'An unexpected client error occurred.');
    assert.equal(summary.recoveryActionLabel, 'Reset Console View');
  });
});
