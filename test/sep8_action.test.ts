import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSep8Response,
  formatSep8StatusBadge,
  shouldPromptUserAction,
} from '../src/lib/sep8Action.ts';

describe('SEP-0008 Regulated Asset Helper Tests', () => {
  test('parses action_required response with external KYC URL', () => {
    const raw = {
      status: 'action_required',
      asset_code: 'EURB',
      asset_issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      action_url: 'https://issuer.example.com/kyc/prompt?id=1234',
      message: 'KYC identity verification requires customer renewal',
    };

    const parsed = parseSep8Response(raw);
    assert.equal(parsed.status, 'action_required');
    assert.equal(parsed.assetCode, 'EURB');
    assert.equal(parsed.actionUrl, 'https://issuer.example.com/kyc/prompt?id=1234');
    assert.equal(shouldPromptUserAction(parsed), true);

    const badge = formatSep8StatusBadge(parsed.status);
    assert.equal(badge.label, 'Action Required');
    assert.match(badge.colorClass, /amber/);
  });

  test('parses approved response for regulated transfer', () => {
    const raw = {
      status: 'success',
      asset_code: 'USDC',
      asset_issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      tx_hash: '3389e9f0f73b444b7e2313a606d43f7250a6c51c127a195b88309b3294fa6bce',
    };

    const parsed = parseSep8Response(raw);
    assert.equal(parsed.status, 'approved');
    assert.equal(parsed.assetCode, 'USDC');
    assert.equal(shouldPromptUserAction(parsed), false);

    const badge = formatSep8StatusBadge(parsed.status);
    assert.equal(badge.label, 'Approved');
    assert.match(badge.colorClass, /emerald/);
  });

  test('handles pending approval and rejection states correctly', () => {
    const pending = parseSep8Response({ status: 'pending', asset_code: 'TOKEN' });
    assert.equal(pending.status, 'pending');
    assert.equal(formatSep8StatusBadge('pending').label, 'Approval Pending');

    const rejected = parseSep8Response({ status: 'rejected', asset_code: 'TOKEN' });
    assert.equal(rejected.status, 'rejected');
    assert.equal(formatSep8StatusBadge('rejected').label, 'Approval Rejected');
  });
});
