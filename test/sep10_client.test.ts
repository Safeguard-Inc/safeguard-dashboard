import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidBase64Xdr,
  createAuthSession,
  isSessionActive,
  formatSessionRemaining,
} from '../src/lib/sep10Client.ts';

describe('Safeguard Dashboard SEP-0010 Client Auth Tests', () => {
  it('validates base64 XDR challenge transaction strings', () => {
    const validXdr =
      'AAAAAgAAAABuDqX+3vJkU1Z7TfJ2g4Y1o4x6e2Xy2yK8xYQ9Zz12AAAAZAAACWAAAABrAAAAAAAAAAAAAAABAAAA';
    assert.equal(isValidBase64Xdr(validXdr), true);

    assert.equal(isValidBase64Xdr(''), false);
    assert.equal(isValidBase64Xdr('short'), false);
    assert.equal(isValidBase64Xdr('not-valid-base64!@#$%^&*()'), false);
    assert.equal(isValidBase64Xdr(null as any), false);
  });

  it('creates active authentication session with configurable TTL', () => {
    const now = 1700000000000;
    const session = createAuthSession(
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      'safeguard.finance',
      3600, // 1 hour
      now
    );

    assert.equal(session.address, 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
    assert.equal(session.homeDomain, 'safeguard.finance');
    assert.equal(session.issuedAt, now);
    assert.equal(session.expiresAt, now + 3600 * 1000);
  });

  it('evaluates session active status against current timestamp', () => {
    const now = 1700000000000;
    const session = createAuthSession(
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      'safeguard.finance',
      300,
      now
    );

    assert.equal(isSessionActive(session, now + 1000), true);
    assert.equal(isSessionActive(session, now + 300 * 1000 - 1), true);
    assert.equal(isSessionActive(session, now + 300 * 1000 + 1), false);
  });

  it('formats remaining session time in human-readable notation', () => {
    const now = 1700000000000;
    const sessionLong = createAuthSession(
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      'safeguard.finance',
      7300, // 2h 1m 40s
      now
    );

    assert.equal(formatSessionRemaining(sessionLong, now), '2h 1m remaining');

    const sessionShort = createAuthSession(
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      'safeguard.finance',
      1200, // 20m
      now
    );
    assert.equal(formatSessionRemaining(sessionShort, now), '20m remaining');

    assert.equal(formatSessionRemaining(sessionShort, now + 2000 * 1000), 'Expired');
  });
});
