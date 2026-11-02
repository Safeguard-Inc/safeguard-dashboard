/**
 * contractConfig.ts
 *
 * Fetches live policy configuration from the SafeguardPayments Soroban contract
 * via a read-only simulation of the get_config() entry point.
 *
 * Falls back to default values (spend cap = 100 XLM) if the RPC call fails or
 * the network is unavailable.
 */

import { Contract, xdr, scValToNative } from '@stellar/stellar-sdk';
import { sorobanServer, CONTRACT_IDS } from './rpc';

/** Spend cap in XLM (1 XLM = 10_000_000 stroops). */
export interface PolicyConfig {
  spendCapXlm: number;
  /** Raw stroop value returned by the contract */
  spendCapStroops: bigint;
}

/** Default config used as a fallback when RPC is unreachable. */
const DEFAULT_CONFIG: PolicyConfig = {
  spendCapXlm: 100,
  spendCapStroops: BigInt(1_000_000_000),
};

const STROOPS_PER_XLM = BigInt(10_000_000);

/**
 * Fetches the live policy configuration from the SafeguardPayments contract.
 *
 * Performs a Soroban simulate-transaction (read-only) so no signing or fees
 * are required.  Returns DEFAULT_CONFIG on any network or parsing error.
 */
export async function fetchLiveConfig(): Promise<PolicyConfig> {
  try {
    const contract = new Contract(CONTRACT_IDS.SAFEGUARD_PAYMENTS);

    // Build a minimal "account" for simulation (admin placeholder)
    const DUMMY_ACCOUNT = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';

    const account = await sorobanServer.getAccount(DUMMY_ACCOUNT).catch(() => null);
    if (!account) {
      return DEFAULT_CONFIG;
    }

    const { Transaction, TransactionBuilder, Networks, BASE_FEE } = await import(
      '@stellar/stellar-sdk'
    );
    void Transaction; // used via TransactionBuilder

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call('get_config'))
      .setTimeout(30)
      .build();

    const simResult = await sorobanServer.simulateTransaction(tx);

    if (
      'error' in simResult ||
      !('result' in simResult) ||
      !simResult.result
    ) {
      return DEFAULT_CONFIG;
    }

    // The contract returns a map / struct — extract spend_cap field
    const returnVal: xdr.ScVal = simResult.result.retval;
    const native = scValToNative(returnVal) as Record<string, unknown>;

    // Field names may vary; try common patterns
    const rawCap =
      native['spend_cap'] ??
      native['spendCap'] ??
      native['cap'] ??
      null;

    if (rawCap == null) {
      return DEFAULT_CONFIG;
    }

    const stroops = BigInt(String(rawCap));
    return {
      spendCapStroops: stroops,
      spendCapXlm: Number(stroops / STROOPS_PER_XLM),
    };
  } catch {
    // Network error, contract not deployed on testnet yet, etc.
    return DEFAULT_CONFIG;
  }
}
