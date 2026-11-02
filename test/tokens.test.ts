import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_TOKENS, getSupportedToken } from '../src/lib/tokens.ts';

describe('Safeguard Dashboard Supported Tokens Tests', () => {
  it('defines native XLM and Circle USDC SAC tokens', () => {
    assert.ok(SUPPORTED_TOKENS.XLM);
    assert.strictEqual(SUPPORTED_TOKENS.XLM.symbol, 'XLM');
    assert.strictEqual(SUPPORTED_TOKENS.XLM.decimals, 7);

    assert.ok(SUPPORTED_TOKENS.USDC);
    assert.strictEqual(SUPPORTED_TOKENS.USDC.symbol, 'USDC');
    assert.strictEqual(SUPPORTED_TOKENS.USDC.decimals, 7);
  });

  it('defines EURC and PYUSD SAC tokens', () => {
    assert.ok(SUPPORTED_TOKENS.EURC);
    assert.strictEqual(SUPPORTED_TOKENS.EURC.symbol, 'EURC');

    assert.ok(SUPPORTED_TOKENS.PYUSD);
    assert.strictEqual(SUPPORTED_TOKENS.PYUSD.symbol, 'PYUSD');
  });

  it('getSupportedToken correctly looks up tokens case-insensitively', () => {
    const usdc = getSupportedToken('usdc');
    assert.strictEqual(usdc.symbol, 'USDC');

    const pyusd = getSupportedToken('Pyusd');
    assert.strictEqual(pyusd.symbol, 'PYUSD');

    // Unknown falls back to XLM
    const unknown = getSupportedToken('UNKNOWN_TOKEN');
    assert.strictEqual(unknown.symbol, 'XLM');
  });
});
