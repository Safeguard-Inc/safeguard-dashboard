import test from 'node:test';
import assert from 'node:assert/strict';
import {
  type BalanceSheetTokenSummary,
  calculateAggregatedUsdExposure,
  buildBalanceSheetExportUrl,
  formatChecksumAbbreviation,
} from '../src/lib/balanceSheetModal.ts';

test('calculateAggregatedUsdExposure calculates total exposure and top asset', () => {
  const tokens: BalanceSheetTokenSummary[] = [
    { tokenSymbol: 'USDC', lockedAmount: '100,000.00', settledAmount: '200,000.00', usdValue: 100000 },
    { tokenSymbol: 'XLM', lockedAmount: '500,000.00', settledAmount: '1,000,000.00', usdValue: 60000 },
    { tokenSymbol: 'EURC', lockedAmount: '120,000.00', settledAmount: '300,000.00', usdValue: 129600 },
  ];

  const exposure = calculateAggregatedUsdExposure(tokens);
  // Total = 100000 + 60000 + 129600 = 289600
  assert.equal(exposure.totalUsd, 289600);
  assert.equal(exposure.topToken, 'EURC');
});

test('calculateAggregatedUsdExposure handles empty inputs safely', () => {
  const res = calculateAggregatedUsdExposure([]);
  assert.equal(res.totalUsd, 0);
  assert.equal(res.topToken, 'None');
});

test('buildBalanceSheetExportUrl builds query parameter URLs cleanly', () => {
  const url = buildBalanceSheetExportUrl({
    organization: 'FinTech Treasury Corp',
    format: 'markdown',
    download: true,
  });

  assert.ok(url.startsWith('/api/export/balance-sheet?'));
  assert.ok(url.includes('format=markdown'));
  assert.ok(url.includes('organization=FinTech+Treasury+Corp') || url.includes('organization=FinTech%20Treasury%20Corp'));
  assert.ok(url.includes('download=true'));
});

test('formatChecksumAbbreviation shortens hashes safely', () => {
  const hash = 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890';
  assert.equal(formatChecksumAbbreviation(hash), '0xa1b2c3...7890');

  const withPrefix = '0xa1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890';
  assert.equal(formatChecksumAbbreviation(withPrefix), '0xa1b2c3...7890');

  assert.equal(formatChecksumAbbreviation('short'), 'short');
  assert.equal(formatChecksumAbbreviation(''), 'N/A');
});
