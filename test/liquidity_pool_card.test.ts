import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateConstantProductEstimate,
  calculateMinimumReceived,
  formatReserveRatio,
  classifyPriceImpact,
} from '../src/lib/liquidityPoolCard.ts';

test('calculateConstantProductEstimate computes expected output and price impact', () => {
  // Pool: 100,000 token A, 100,000 token B. Swap: 1,000 token A.
  const reserveA = 100000_0000000n;
  const reserveB = 100000_0000000n;
  const amountIn = 1000_0000000n;

  const result = calculateConstantProductEstimate(amountIn, reserveA, reserveB, 30n);
  // idealOutput = 1000_0000000n
  // amountInWithFee = 1000_0000000 * 9970 = 9970000000000
  // denominator = 100000_0000000 * 10000 + 9970000000000 = 1000000000000000 + 9970000000000 = 1009970000000000
  // output is approx 987.15 token B
  assert.ok(result.amountOut > 980_0000000n);
  assert.ok(result.amountOut < 1000_0000000n);
  assert.ok(result.priceImpactBps > 0);
  assert.ok(result.priceImpactBps < 200); // approx 1.28%
});

test('calculateConstantProductEstimate handles zero or negative inputs', () => {
  const zeroRes = calculateConstantProductEstimate(0n, 1000n, 1000n);
  assert.equal(zeroRes.amountOut, 0n);
  assert.equal(zeroRes.priceImpactBps, 0);

  const emptyPool = calculateConstantProductEstimate(100n, 0n, 1000n);
  assert.equal(emptyPool.amountOut, 0n);
});

test('calculateMinimumReceived deducts slippage correctly', () => {
  const amountOut = 10000n;
  // 50 bps = 0.5% => min = 9950
  assert.equal(calculateMinimumReceived(amountOut, 50), 9950n);
  // 100 bps = 1.0% => min = 9900
  assert.equal(calculateMinimumReceived(amountOut, 100), 9900n);
  // 0 bps => min = 10000
  assert.equal(calculateMinimumReceived(amountOut, 0), 10000n);
});

test('formatReserveRatio formats decimal reserve proportions correctly', () => {
  const resA = 500000_0000000n; // 500k USDC
  const resB = 5000000_0000000n; // 5M XLM
  const ratio = formatReserveRatio(resA, 7, resB, 7);
  // 5,000,000 / 500,000 = 10.000
  assert.equal(ratio, '10.000');
});

test('classifyPriceImpact categorizes risk thresholds', () => {
  const low = classifyPriceImpact(45);
  assert.equal(low.warning, false);
  assert.ok(low.label.includes('Low Impact'));

  const mod = classifyPriceImpact(180);
  assert.equal(mod.warning, false);
  assert.ok(mod.label.includes('Moderate Impact'));

  const high = classifyPriceImpact(420);
  assert.equal(high.warning, true);
  assert.ok(high.label.includes('High Slippage Risk'));
});
