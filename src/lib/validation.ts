/**
 * validation.ts
 *
 * Stellar address, contract ID, and payment input validation utilities
 * utilizing StrKey encoding rules from @stellar/stellar-sdk.
 */

import { StrKey } from '@stellar/stellar-sdk';

export type AddressType = 'account' | 'contract' | 'muxed' | 'invalid';

/**
 * Validates whether a string is a standard Stellar ed25519 public key (starts with 'G').
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (trimmed.length !== 56 || !trimmed.startsWith('G')) return false;
  return StrKey.isValidEd25519PublicKey(trimmed);
}

/**
 * Validates whether a string is a Soroban contract identifier (starts with 'C').
 */
export function isValidContractId(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (trimmed.length !== 56 || !trimmed.startsWith('C')) return false;
  return StrKey.isValidContract(trimmed);
}

/**
 * Validates whether a string is a multiplexed Stellar account (starts with 'M').
 */
export function isValidMuxedAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (trimmed.length !== 69 || !trimmed.startsWith('M')) return false;
  return StrKey.isValidMed25519PublicKey(trimmed);
}

/**
 * Validates whether an address is an acceptable payment recipient (ed25519 or muxed or contract).
 */
export function isValidStellarRecipient(address: string): boolean {
  return isValidStellarAddress(address) || isValidMuxedAddress(address) || isValidContractId(address);
}

/**
 * Classifies an address into its canonical Stellar type.
 */
export function classifyAddressType(address: string): AddressType {
  if (isValidStellarAddress(address)) return 'account';
  if (isValidContractId(address)) return 'contract';
  if (isValidMuxedAddress(address)) return 'muxed';
  return 'invalid';
}

export interface AmountValidationResult {
  valid: boolean;
  error?: string;
  amount?: number;
}

/**
 * Validates payment amount string for positive numeric value and at most 7 decimals.
 */
export function validatePaymentAmount(amountStr: string): AmountValidationResult {
  if (!amountStr || !amountStr.trim()) {
    return { valid: false, error: 'Amount is required' };
  }

  const trimmed = amountStr.trim();
  const num = Number(trimmed);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  const parts = trimmed.split('.');
  if (parts.length > 2) {
    return { valid: false, error: 'Invalid decimal format' };
  }

  if (parts.length === 2 && parts[1].length > 7) {
    return { valid: false, error: 'Stellar supports a maximum of 7 decimal places (stroops)' };
  }

  return { valid: true, amount: num };
}
