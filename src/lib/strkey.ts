/**
 * strkey.ts
 *
 * Stellar StrKey CRC16 checksum validator and decoder.
 * Supports Ed25519 public keys (G...), Soroban contract IDs (C...), and Muxed accounts (M...).
 */

export const STRKEY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export type StrKeyVersion = 'ed25519PublicKey' | 'contract' | 'muxedAccount' | 'ed25519SecretSeed';

export const VERSION_BYTES = {
  ed25519PublicKey: 6 << 3, // 48 -> 'G'
  contract: 2 << 3, // 16 -> 'C'
  muxedAccount: 12 << 3, // 96 -> 'M'
  ed25519SecretSeed: 18 << 3, // 144 -> 'S'
};

/**
 * Calculates the standard Stellar CRC16-XMODEM checksum for arbitrary byte slices.
 */
export function calculateCrc16(data: Uint8Array): number {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    let code = (crc >>> 8) & 0xff;
    code ^= byte & 0xff;
    code ^= code >>> 4;
    crc = (crc << 8) & 0xffff;
    crc ^= code;
    code = (code << 5) & 0xffff;
    crc ^= code;
    code = (code << 7) & 0xffff;
    crc ^= code;
  }
  return crc & 0xffff;
}

/**
 * Decodes RFC 4648 Base32 encoded string into a Uint8Array.
 */
export function decodeBase32(input: string): Uint8Array | null {
  const cleaned = input.toUpperCase().trim();
  if (!cleaned) return null;

  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = STRKEY_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) return null;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Decodes and validates a Stellar StrKey string.
 */
export function decodeStrKey(strkey: string): { versionByte: number; payload: Uint8Array } | null {
  if (typeof strkey !== 'string' || strkey.length < 56) {
    return null;
  }

  const decoded = decodeBase32(strkey);
  if (!decoded || decoded.length < 3) {
    return null;
  }

  const payloadWithVersion = decoded.subarray(0, decoded.length - 2);
  const checksumBytes = decoded.subarray(decoded.length - 2);

  // Checksum is encoded little-endian in Stellar StrKey
  const expectedCrc = checksumBytes[0] | (checksumBytes[1] << 8);
  const actualCrc = calculateCrc16(payloadWithVersion);

  if (expectedCrc !== actualCrc) {
    return null;
  }

  return {
    versionByte: payloadWithVersion[0],
    payload: payloadWithVersion.subarray(1),
  };
}

/**
 * Validates whether a given string is a syntactically and cryptographically valid Stellar StrKey.
 */
export function isValidStrKey(strkey: string, expectedVersion?: StrKeyVersion): boolean {
  const res = decodeStrKey(strkey);
  if (!res) return false;

  if (expectedVersion) {
    const expectedByte = VERSION_BYTES[expectedVersion];
    return res.versionByte === expectedByte;
  }

  return true;
}

/**
 * Checks if address is a valid Stellar Ed25519 public key (G...).
 */
export function isValidStellarAccount(address: string): boolean {
  if (!address.startsWith('G') || address.length !== 56) return false;
  return isValidStrKey(address, 'ed25519PublicKey');
}

/**
 * Checks if address is a valid Soroban smart contract ID (C...).
 */
export function isValidSorobanContract(address: string): boolean {
  if (!address.startsWith('C') || address.length !== 56) return false;
  return isValidStrKey(address, 'contract');
}
