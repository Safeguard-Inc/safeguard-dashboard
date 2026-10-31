/**
 * denylistCheck.ts
 *
 * Performs a live on-chain denylist lookup by simulating the is_denylisted()
 * view function on the SafeguardPayments Soroban contract.
 *
 * No signing or fees required — this is a read-only simulation.
 * Falls back to `false` (not denylisted) if the RPC call fails so that
 * the UI never falsely blocks a transaction due to a network glitch.
 */

import {
  Contract,
  xdr,
  scValToNative,
  Address,
} from '@stellar/stellar-sdk';
import { sorobanServer, CONTRACT_IDS } from './rpc';

/** Dummy account used as the source for read-only simulations */
const SIM_ACCOUNT = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';

/**
 * Checks whether the given Stellar address is on the contract's live denylist.
 *
 * @param address - Stellar G-address to check (e.g. the payment recipient)
 * @returns `true` if on-chain denylist returns true, `false` otherwise (including
 *          on network errors, to avoid false positives from transient failures).
 */
export async function checkIsDenylisted(address: string): Promise<boolean> {
  try {
    const contract = new Contract(CONTRACT_IDS.SAFEGUARD_PAYMENTS);

    const account = await sorobanServer.getAccount(SIM_ACCOUNT).catch(() => null);
    if (!account) return false;

    const { TransactionBuilder, Networks, BASE_FEE } = await import(
      '@stellar/stellar-sdk'
    );

    // Build the address as an ScVal argument for is_denylisted(address: Address)
    const addrVal = new Address(address).toScVal();

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call('is_denylisted', addrVal))
      .setTimeout(30)
      .build();

    const simResult = await sorobanServer.simulateTransaction(tx);

    if (
      'error' in simResult ||
      !('result' in simResult) ||
      !simResult.result
    ) {
      return false;
    }

    const returnVal: xdr.ScVal = simResult.result.retval;
    const native = scValToNative(returnVal);

    // Contract returns Bool
    return Boolean(native);
  } catch {
    // RPC unavailable, invalid address, etc. — fail open
    return false;
  }
}
