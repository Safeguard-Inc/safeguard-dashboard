import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidStrKey,
  isValidStellarAccount,
  isValidSorobanContract,
  decodeStrKey,
  calculateCrc16,
} from '../src/lib/strkey.ts';

describe('Stellar StrKey CRC16 Checksum Validation Tests', () => {
  const VALID_ACCOUNT = 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4';
  const VALID_ACCOUNT_2 = 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT';
  const VALID_CONTRACT = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

  it('validates canonical Stellar Ed25519 public key addresses', () => {
    assert.equal(isValidStellarAccount(VALID_ACCOUNT), true);
    assert.equal(isValidStellarAccount(VALID_ACCOUNT_2), true);
    assert.equal(isValidStrKey(VALID_ACCOUNT, 'ed25519PublicKey'), true);

    const decoded = decodeStrKey(VALID_ACCOUNT);
    assert.ok(decoded);
    assert.equal(decoded.versionByte, 48); // 6 << 3
    assert.equal(decoded.payload.length, 32);
  });

  it('validates canonical Soroban smart contract IDs', () => {
    assert.equal(isValidSorobanContract(VALID_CONTRACT), true);
    assert.equal(isValidStrKey(VALID_CONTRACT, 'contract'), true);

    // Contract ID is not an account
    assert.equal(isValidStellarAccount(VALID_CONTRACT), false);

    const decoded = decodeStrKey(VALID_CONTRACT);
    assert.ok(decoded);
    assert.equal(decoded.versionByte, 16); // 2 << 3
    assert.equal(decoded.payload.length, 32);
  });

  it('rejects addresses with corrupted checksums or invalid characters', () => {
    // Tamper with the last checksum character
    const corruptedAccount = VALID_ACCOUNT.slice(0, -1) + 'A';
    assert.equal(isValidStellarAccount(corruptedAccount), false);
    assert.equal(decodeStrKey(corruptedAccount), null);

    // Non-base32 character (e.g. '8', '9', '0', '1' are not in standard RFC 4648 base32)
    const invalidChar = VALID_ACCOUNT.slice(0, 10) + '9' + VALID_ACCOUNT.slice(11);
    assert.equal(isValidStellarAccount(invalidChar), false);

    // Short address
    assert.equal(isValidStellarAccount('GC5MCMHH'), false);
    assert.equal(isValidStrKey(''), false);
  });

  it('computes CRC16-XMODEM checksum deterministically', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const crc = calculateCrc16(bytes);
    assert.equal(typeof crc, 'number');
    assert.ok(crc > 0);

    // Same input produces identical checksum
    assert.equal(calculateCrc16(bytes), crc);
  });
});
