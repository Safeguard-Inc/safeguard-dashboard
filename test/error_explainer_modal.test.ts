import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveErrorExplanation,
  searchErrorCatalog,
  TOTAL_ERROR_CODES,
} from '../src/lib/errorExplainerModal.ts';

describe('Error Code Explainer Modal Domain Logic Tests (Issue #40)', () => {
  it('verifies canonical catalog contains 270 error codes', () => {
    assert.equal(TOTAL_ERROR_CODES, 270);
  });

  it('resolves known numeric code 1000 with SERVER_FAULT severity', () => {
    const view = resolveErrorExplanation(1000);
    assert.equal(view.code, 1000);
    assert.equal(view.formattedCode, 'SG-1000');
    assert.equal(view.mnemonic, 'HOST_BUDGET_EXCEEDED');
    assert.equal(view.domain, 'Host & Soroban VM');
    assert.equal(view.httpStatus, 500);
    assert.equal(view.severityLabel, 'SERVER_FAULT');
    assert.equal(view.isKnownCatalogCode, true);
  });

  it('resolves known mnemonic REENTRANCY_DETECTED (1002) with CONFLICT_OR_LOCKED severity', () => {
    const view = resolveErrorExplanation('REENTRANCY_DETECTED');
    assert.equal(view.code, 1002);
    assert.equal(view.httpStatus, 409);
    assert.equal(view.severityLabel, 'CONFLICT_OR_LOCKED');
    assert.equal(view.isKnownCatalogCode, true);
  });

  it('resolves client validation error 1001 with CLIENT_ERROR severity', () => {
    const view = resolveErrorExplanation('1001');
    assert.equal(view.code, 1001);
    assert.equal(view.mnemonic, 'INVALID_LEDGER_SEQUENCE');
    assert.equal(view.severityLabel, 'CLIENT_ERROR');
    assert.equal(view.isKnownCatalogCode, true);
  });

  it('falls back gracefully for unknown error codes', () => {
    const view = resolveErrorExplanation(999999);
    assert.equal(view.isKnownCatalogCode, false);
    assert.equal(view.code, 1022);
    assert.ok(view.description.includes('999999'));
  });

  it('filters catalog entries by code, mnemonic, or domain', () => {
    const results = searchErrorCatalog('REENTRANCY', 5);
    assert.ok(results.length >= 1);
    assert.equal(results[0].code, 1002);
  });
});
