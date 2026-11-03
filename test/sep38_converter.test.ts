import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAvailableCurrencies,
  computeConversion,
  DEFAULT_CONVERSION_RATES,
  type ConversionCalculationResult,
} from '../src/lib/sep38Converter.ts';

describe('Sep38Converter Domain Tests', () => {
  test('getAvailableCurrencies returns standard currencies', () => {
    const list = getAvailableCurrencies();
    assert.ok(list.includes('XLM'));
    assert.ok(list.includes('USDC'));
    assert.ok(list.includes('EURC'));
  });

  test('computeConversion converts standard pairs accurately', () => {
    // 100 XLM to USDC (rate 0.125) -> 12.50
    const res = computeConversion('100', 'XLM', 'USDC');
    assert.equal(res.isValid, true);
    assert.equal(res.buyAmount, '12.50');
    assert.ok(res.rateDisplay.includes('0.1250'));
  });

  test('computeConversion handles same asset conversions', () => {
    const same = computeConversion('50', 'USDC', 'USDC');
    assert.equal(same.isValid, true);
    assert.equal(same.buyAmount, '50.00');
    assert.equal(same.rateDisplay, '1 USDC = 1.00 USDC');
  });

  test('computeConversion respects custom rate overrides', () => {
    const custom = computeConversion('100', 'XLM', 'USDC', 0.2);
    assert.equal(custom.isValid, true);
    assert.equal(custom.buyAmount, '20.00');
    assert.ok(custom.rateDisplay.includes('0.2000'));
  });

  test('computeConversion flags invalid non-positive numbers', () => {
    const zero = computeConversion('0', 'XLM', 'USDC');
    assert.equal(zero.isValid, false);
    assert.equal(zero.buyAmount, '0.00');

    const neg = computeConversion('-10', 'XLM', 'USDC');
    assert.equal(neg.isValid, false);

    const badStr = computeConversion('invalid', 'XLM', 'USDC');
    assert.equal(badStr.isValid, false);
  });
});
