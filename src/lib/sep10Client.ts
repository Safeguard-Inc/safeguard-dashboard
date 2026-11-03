/**
 * sep10Client.ts
 *
 * Lightweight client-side SEP-0010 challenge parsing, validation,
 * and session state management helpers.
 */

export interface AuthSession {
  address: string;
  issuedAt: number;
  expiresAt: number;
  homeDomain: string;
}

export interface ParsedChallengeMetadata {
  validEnvelope: boolean;
  rawXdr: string;
  clientAddress?: string;
  homeDomain?: string;
  isExpired?: boolean;
}

/**
 * Validates whether a challenge string is a non-empty base64-encoded transaction envelope.
 */
export function isValidBase64Xdr(xdr: string): boolean {
  if (!xdr || typeof xdr !== 'string') return false;
  const trimmed = xdr.trim();
  if (trimmed.length < 32) return false;
  // Standard base64 regex with optional padding
  return /^[A-Za-z0-9+/=]+$/.test(trimmed);
}

/**
 * Creates an active authentication session representation.
 */
export function createAuthSession(
  address: string,
  homeDomain: string,
  ttlSeconds = 86400,
  issuedAt = Date.now()
): AuthSession {
  return {
    address,
    homeDomain,
    issuedAt,
    expiresAt: issuedAt + ttlSeconds * 1000,
  };
}

/**
 * Determines whether an authentication session is still valid.
 */
export function isSessionActive(session: AuthSession, now = Date.now()): boolean {
  return now < session.expiresAt;
}

/**
 * Calculates remaining session duration formatted as human-readable string.
 */
export function formatSessionRemaining(session: AuthSession, now = Date.now()): string {
  const diffMs = session.expiresAt - now;
  if (diffMs <= 0) return 'Expired';

  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}
