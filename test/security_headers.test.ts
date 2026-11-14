import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  buildContentSecurityPolicy,
  getNextSecurityHeaderRules,
} from '../src/lib/securityHeaders.ts';
import nextConfig from '../next.config.mjs';

describe('Security Headers Configuration Tests (Issue #62)', () => {
  it('builds a valid Content-Security-Policy header with Stellar RPC & Horizon origins', () => {
    const csp = buildContentSecurityPolicy(CSP_DIRECTIVES);
    assert.ok(csp.includes("default-src 'self'"));
    assert.ok(csp.includes('https://soroban-testnet.stellar.org'));
    assert.ok(csp.includes('https://horizon-testnet.stellar.org'));
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.ok(csp.includes("object-src 'none'"));
  });

  it('includes mandatory CSP, X-Frame-Options, and Referrer-Policy headers', () => {
    const map = new Map(SECURITY_HEADERS.map((h) => [h.key, h.value]));
    assert.equal(map.get('X-Frame-Options'), 'DENY');
    assert.equal(map.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
    assert.equal(map.get('X-Content-Type-Options'), 'nosniff');
    assert.ok(map.get('Content-Security-Policy')?.includes("default-src 'self'"));
  });

  it('exposes global route security headers via next.config.mjs headers()', async () => {
    assert.equal(typeof nextConfig.headers, 'function');
    const rules = await nextConfig.headers!();
    const expected = getNextSecurityHeaderRules();
    assert.equal(rules.length, 1);
    assert.equal(rules[0].source, '/(.*)');
    assert.deepEqual(rules, expected);
  });
});
