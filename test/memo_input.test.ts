import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateDashboardMemo } from '../src/lib/memoInput.ts';

describe('Transaction Memo Validation Tests', () => {
  test('approves empty or none memo types', () => {
    assert.equal(validateDashboardMemo('none', '').isValid, true);
    assert.equal(validateDashboardMemo('none', 'any text').isValid, true);
    assert.equal(validateDashboardMemo('text', '').isValid, true);
  });

  test('validates MEMO_TEXT within 28 bytes boundary', () => {
    const valid = validateDashboardMemo('text', 'Payment 1234');
    assert.equal(valid.isValid, true);
    assert.equal(valid.bytesUsed, 12);
    assert.equal(valid.bytesLimit, 28);

    const tooLong = validateDashboardMemo('text', 'A very long description that exceeds twenty-eight bytes');
    assert.equal(tooLong.isValid, false);
    assert.match(tooLong.error || '', /cannot exceed 28 UTF-8 bytes/);
  });

  test('validates MEMO_ID unsigned 64-bit bounds', () => {
    const valid = validateDashboardMemo('id', '987654321');
    assert.equal(valid.isValid, true);
    assert.equal(valid.bytesUsed, 8);

    const max = validateDashboardMemo('id', '18446744073709551615');
    assert.equal(max.isValid, true);

    const overflow = validateDashboardMemo('id', '18446744073709551616');
    assert.equal(overflow.isValid, false);
    assert.match(overflow.error || '', /out of 64-bit unsigned range/);

    const alphabetic = validateDashboardMemo('id', 'abc123');
    assert.equal(alphabetic.isValid, false);
    assert.match(alphabetic.error || '', /digits only/);
  });

  test('validates MEMO_HASH and MEMO_RETURN 64-character hex strings', () => {
    const validHex = 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0';
    const hashRes = validateDashboardMemo('hash', validHex);
    assert.equal(hashRes.isValid, true);
    assert.equal(hashRes.bytesUsed, 32);

    const returnRes = validateDashboardMemo('return', validHex);
    assert.equal(returnRes.isValid, true);

    const invalidShort = validateDashboardMemo('hash', 'a1b2c3d4');
    assert.equal(invalidShort.isValid, false);
    assert.match(invalidShort.error || '', /64 hexadecimal characters/);
  });
});
