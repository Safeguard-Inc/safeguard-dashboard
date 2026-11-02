/**
 * Configured Soroban RPC client for Stellar Testnet.
 *
 * Exports a singleton rpc.Server instance pointed at the public
 * Soroban testnet RPC endpoint, plus the canonical contract IDs for the
 * Safeguard protocol deployment.
 */

import { rpc } from '@stellar/stellar-sdk';

// Public Soroban testnet RPC endpoint (Stellar Foundation)
const SOROBAN_TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';

/**
 * Singleton Soroban RPC server instance.
 * All contract simulation and state reads should use this client.
 */
export const sorobanServer = new rpc.Server(SOROBAN_TESTNET_RPC_URL, {
  allowHttp: false,
});

/**
 * Canonical contract IDs for the Safeguard protocol on Stellar Testnet.
 * These correspond to the verified deployments used in the dashboard.
 */
export const CONTRACT_IDS = {
  /** SafeguardPayments — main compliance + escrow contract */
  SAFEGUARD_PAYMENTS:
    'CDC6KVX7QT7CD3GOVGX44NQUNS7FMSZKIAXTV3TDGSXQKJRQMDZRSRCN',
} as const;

export type ContractId = (typeof CONTRACT_IDS)[keyof typeof CONTRACT_IDS];
