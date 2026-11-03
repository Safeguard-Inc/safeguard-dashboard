import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePartialRelease,
  formatEscrowReleasePreview,
} from '../src/lib/partialReleaseModal.ts';

describe('Partial Escrow Release Modal Domain Logic Tests', () => {
  // Total balance: 100 XLM = 1,000,000,000 stroops
  const TOTAL_STROOPS = '1000000000';

  test('validates valid partial release within balance', () => {
    // Release 40 XLM
    const res = validatePartialRelease('40', TOTAL_STROOPS);
    assert.equal(res.isValid, true);
    assert.equal(res.releaseAmountStroops, '400000000');
    assert.equal(res.remainingStroops, '600000000');
    assert.equal(res.isFullRelease, false);
  });

  test('detects full release when releasing entire balance', () => {
    // Release 100 XLM
    const res = validatePartialRelease('100', TOTAL_STROOPS);
    assert.equal(res.isValid, true);
    assert.equal(res.releaseAmountStroops, '1000000000');
    assert.equal(res.remainingStroops, '0');
    assert.equal(res.isFullRelease, true);
  });

  test('rejects over-release exceeding balance', () => {
    const res = validatePartialRelease('105', TOTAL_STROOPS);
    assert.equal(res.isValid, false);
    assert.match(res.error || '', /exceeds current escrow balance/i);
  });

  test('rejects zero, negative, empty or invalid inputs', () => {
    assert.equal(validatePartialRelease('', TOTAL_STROOPS).isValid, false);
    assert.equal(validatePartialRelease('   ', TOTAL_STROOPS).isValid, false);
    assert.equal(validatePartialRelease('0', TOTAL_STROOPS).isValid, false);
    assert.equal(validatePartialRelease('-10', TOTAL_STROOPS).isValid, false);
    assert.equal(validatePartialRelease('abc', TOTAL_STROOPS).isValid, false);
  });

  test('formats milestone preview with amounts, symbols and percentage', () => {
    const preview = formatEscrowReleasePreview(TOTAL_STROOPS, '250000000', 'USDC');
    assert.match(preview.totalUnits, /100.*USDC/);
    assert.match(preview.releaseUnits, /25.*USDC/);
    assert.match(preview.remainingUnits, /75.*USDC/);
    assert.equal(preview.percentage, 25.0);
  });

  test('handles invalid numeric strings gracefully in preview formatter', () => {
    const fallback = formatEscrowReleasePreview('invalid', '100', 'XLM');
    assert.equal(fallback.percentage, 0);
    assert.equal(fallback.totalUnits, '0 XLM');
  });
});
