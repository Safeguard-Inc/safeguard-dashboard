export type DashboardMemoType = 'none' | 'text' | 'id' | 'hash' | 'return';

export interface MemoValidationResult {
  isValid: boolean;
  error?: string;
  bytesUsed?: number;
  bytesLimit?: number;
}

export function validateDashboardMemo(
  type: DashboardMemoType,
  value: string
): MemoValidationResult {
  if (type === 'none' || !value) {
    return { isValid: true };
  }

  const trimmed = value.trim();

  if (type === 'text') {
    const bytes = new TextEncoder().encode(trimmed).length;
    if (bytes > 28) {
      return {
        isValid: false,
        bytesUsed: bytes,
        bytesLimit: 28,
        error: `MEMO_TEXT cannot exceed 28 UTF-8 bytes (current: ${bytes})`,
      };
    }
    return { isValid: true, bytesUsed: bytes, bytesLimit: 28 };
  }

  if (type === 'id') {
    if (!/^\d+$/.test(trimmed)) {
      return { isValid: false, error: 'MEMO_ID must contain digits only' };
    }
    try {
      const bn = BigInt(trimmed);
      const MAX_U64 = 18446744073709551615n;
      if (bn < 0n || bn > MAX_U64) {
        return { isValid: false, error: 'MEMO_ID out of 64-bit unsigned range (0 - 18446744073709551615)' };
      }
      return { isValid: true, bytesUsed: 8, bytesLimit: 8 };
    } catch {
      return { isValid: false, error: 'Invalid 64-bit integer format' };
    }
  }

  if (type === 'hash' || type === 'return') {
    const isHex = /^[0-9a-fA-F]{64}$/.test(trimmed);
    if (!isHex) {
      return {
        isValid: false,
        bytesUsed: trimmed.length,
        bytesLimit: 64,
        error: `${type.toUpperCase()} requires exactly 64 hexadecimal characters (32 bytes)`,
      };
    }
    return { isValid: true, bytesUsed: 32, bytesLimit: 32 };
  }

  return { isValid: true };
}
