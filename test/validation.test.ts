import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidStellarAddress,
  isValidContractId,
  isValidMuxedAddress,
  isValidStellarRecipient,
  classifyAddressType,
  validatePaymentAmount,
  validatePaymentMemo,
} from '../src/lib/validation.ts';

describe('Safeguard Dashboard Validation Tests', () => {
  const VALID_ACCOUNT = 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT';
  const VALID_CONTRACT = 'CDC6KVX7QT7CD3GOVGX44NQUNS7FMSZKIAXTV3TDGSXQKJRQMDZRSRCN';
  const INVALID_ADDRESS = 'GA6LW724INVALIDBADCHECKSUM34D7BOWPO6J7MIJATKGKEC6TYORN4SR';

  test('isValidStellarAddress accepts valid Ed25519 addresses', () => {
    assert.equal(isValidStellarAddress(VALID_ACCOUNT), true);
    assert.equal(isValidStellarAddress('GCV4I3P3F2OMWYZGRXD5PR5AC3K7MUDSBMKDBPEMJ2MFHLVUAGJEK4DT'), true);
  });

  test('isValidStellarAddress rejects invalid addresses', () => {
    assert.equal(isValidStellarAddress(''), false);
    assert.equal(isValidStellarAddress('GA123'), false);
    assert.equal(isValidStellarAddress(INVALID_ADDRESS), false);
    assert.equal(isValidStellarAddress(VALID_CONTRACT), false); // contract is not account
  });

  test('isValidContractId validates Soroban contract identifiers', () => {
    assert.equal(isValidContractId(VALID_CONTRACT), true);
    assert.equal(isValidContractId(VALID_ACCOUNT), false);
    assert.equal(isValidContractId('CDC6KVX7'), false);
  });

  test('classifyAddressType categorizes accounts, contracts, and invalid strings', () => {
    assert.equal(classifyAddressType(VALID_ACCOUNT), 'account');
    assert.equal(classifyAddressType(VALID_CONTRACT), 'contract');
    assert.equal(classifyAddressType('not-an-address'), 'invalid');
    assert.equal(classifyAddressType(''), 'invalid');
  });

  test('isValidStellarRecipient permits both accounts and contracts', () => {
    assert.equal(isValidStellarRecipient(VALID_ACCOUNT), true);
    assert.equal(isValidStellarRecipient(VALID_CONTRACT), true);
    assert.equal(isValidStellarRecipient('bad-recipient'), false);
  });

  test('validatePaymentAmount correctly enforces positive amounts and 7-decimal limit', () => {
    const validStandard = validatePaymentAmount('100');
    assert.equal(validStandard.valid, true);
    assert.equal(validStandard.amount, 100);

    const validFractional = validatePaymentAmount('0.1234567');
    assert.equal(validFractional.valid, true);
    assert.equal(validFractional.amount, 0.1234567);

    const zero = validatePaymentAmount('0');
    assert.equal(zero.valid, false);

    const negative = validatePaymentAmount('-15');
    assert.equal(negative.valid, false);

    const tooManyDecimals = validatePaymentAmount('1.12345678');
    assert.equal(tooManyDecimals.valid, false);
    assert.ok(tooManyDecimals.error?.includes('7 decimal places'));

    const notANumber = validatePaymentAmount('foo');
    assert.equal(notANumber.valid, false);
  });

  test('validatePaymentMemo correctly enforces Stellar memo limits', () => {
    // None type
    assert.equal(validatePaymentMemo('', 'none').valid, true);
    assert.equal(validatePaymentMemo('some memo', 'none').valid, true);

    // Text memo (28 bytes limit)
    assert.equal(validatePaymentMemo('Invoice #1042', 'text').valid, true);
    assert.equal(validatePaymentMemo('1234567890123456789012345678', 'text').valid, true); // 28 chars
    const tooLongText = validatePaymentMemo('12345678901234567890123456789', 'text'); // 29 chars
    assert.equal(tooLongText.valid, false);
    assert.ok(tooLongText.error?.includes('28-byte limit'));

    // ID memo (unsigned 64-bit integer)
    assert.equal(validatePaymentMemo('123456789', 'id').valid, true);
    assert.equal(validatePaymentMemo('0', 'id').valid, true);
    assert.equal(validatePaymentMemo('18446744073709551615', 'id').valid, true); // max uint64
    assert.equal(validatePaymentMemo('-1', 'id').valid, false);
    assert.equal(validatePaymentMemo('abc', 'id').valid, false);

    // Hash memo (32 bytes = 64 hex characters)
    const validHash = 'a'.repeat(64);
    assert.equal(validatePaymentMemo(validHash, 'hash').valid, true);
    assert.equal(validatePaymentMemo('abcd', 'hash').valid, false);
    assert.equal(validatePaymentMemo('z'.repeat(64), 'hash').valid, false); // non-hex
  });
});