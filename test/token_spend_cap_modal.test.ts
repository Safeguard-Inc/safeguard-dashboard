import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCapDisplay,
  validateSpendCapInput,
} from '../src/lib/tokenSpendCapModal.ts';

describe('Token Spend Cap Modal Domain Logic Tests', () => {
  test('formats custom spend cap display text with localized units', () => {
    // 500 units = 5,000,000,000 stroops
    const custom = formatCapDisplay('5000000000');
    assert.equal(custom.isOverride, true);
    assert.match(custom.text, /500 Units \(Custom\)/);
  });

  test('formats global default spend cap display text when override is absent', () => {
    const fallback = formatCapDisplay(undefined, '1000000000');
    assert.equal(fallback.isOverride, false);
    assert.match(fallback.text, /100 Units \(Default\)/);
  });

  test('validates positive numerical spend cap inputs into stroop strings', () => {
    const valid = validateSpendCapInput('250.5');
    assert.equal(valid.isValid, true);
    assert.equal(valid.stroops, '2505000000');
  });

  test('rejects negative, zero, non-numeric or empty spend cap inputs', () => {
    assert.equal(validateSpendCapInput('').isValid, false);
    assert.equal(validateSpendCapInput('   ').isValid, false);
    assert.equal(validateSpendCapInput('-50').isValid, false);
    assert.equal(validateSpendCapInput('0').isValid, false);
    assert.equal(validateSpendCapInput('invalid-text').isValid, false);
  });
});
