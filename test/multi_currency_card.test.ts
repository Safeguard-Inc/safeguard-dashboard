import test from 'node:test';
import assert from 'node:assert/strict';
import {
  type DisbursementSummaryLine,
  computeTotalUsdDisbursement,
  evaluateOverallFundingStatus,
  formatTokenIcon,
} from '../src/lib/multiCurrencyCard.ts';

test('computeTotalUsdDisbursement sums estimated USD costs accurately', () => {
  const lines: DisbursementSummaryLine[] = [
    {
      tokenSymbol: 'USDC',
      totalAmount: '1000.00',
      recipientCount: 2,
      unitPriceUsd: 1.0,
      estimatedUsdCost: 1000,
      liquidityBuffer: '20.00',
      treasuryBalance: '2000.00',
      isSufficient: true,
    },
    {
      tokenSymbol: 'EURC',
      totalAmount: '500.00',
      recipientCount: 1,
      unitPriceUsd: 1.08,
      estimatedUsdCost: 540,
      liquidityBuffer: '10.00',
      treasuryBalance: '600.00',
      isSufficient: true,
    },
  ];

  assert.equal(computeTotalUsdDisbursement(lines), 1540);
  assert.equal(computeTotalUsdDisbursement([]), 0);
});

test('evaluateOverallFundingStatus evaluates funding status accurately', () => {
  const fundedLines: DisbursementSummaryLine[] = [
    {
      tokenSymbol: 'USDC',
      totalAmount: '100.00',
      recipientCount: 1,
      unitPriceUsd: 1.0,
      estimatedUsdCost: 100,
      liquidityBuffer: '2.00',
      treasuryBalance: '500.00',
      isSufficient: true,
    },
  ];

  const fundedRes = evaluateOverallFundingStatus(fundedLines);
  assert.equal(fundedRes.isFullyFunded, true);
  assert.equal(fundedRes.deficitTokens.length, 0);

  const deficitLines: DisbursementSummaryLine[] = [
    ...fundedLines,
    {
      tokenSymbol: 'XLM',
      totalAmount: '50000.00',
      recipientCount: 5,
      unitPriceUsd: 0.12,
      estimatedUsdCost: 6000,
      liquidityBuffer: '1000.00',
      treasuryBalance: '10000.00',
      isSufficient: false,
    },
  ];

  const deficitRes = evaluateOverallFundingStatus(deficitLines);
  assert.equal(deficitRes.isFullyFunded, false);
  assert.deepEqual(deficitRes.deficitTokens, ['XLM']);
});

test('formatTokenIcon returns distinct icons for supported Stellar assets', () => {
  assert.equal(formatTokenIcon('XLM'), '🚀');
  assert.equal(formatTokenIcon('USDC'), '💵');
  assert.equal(formatTokenIcon('EURC'), '💶');
  assert.equal(formatTokenIcon('PYUSD'), '🅿️');
  assert.equal(formatTokenIcon('UNKNOWN'), '🪙');
});
