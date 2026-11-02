/**
 * stellarTx.ts
 *
 * Full on-chain transaction execution pipeline for Safeguard on Stellar Testnet.
 * Handles building Soroban contract call operations, simulating and preparing
 * Soroban footprints, signing via Freighter wallet extension, and submitting
 * to Soroban RPC with confirmation polling.
 */

import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  Networks,
  rpc,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import { signTransaction, isConnected } from '@stellar/freighter-api';
import { sorobanServer, CONTRACT_IDS } from './rpc';

export const XLM_SAC_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
export const NETWORK_PASSPHRASE = Networks.TESTNET;

export interface TxExecutionResult {
  success: boolean;
  txHash?: string;
  status: 'SUCCESS' | 'FAILED' | 'REJECTED';
  reason?: string;
  returnValue?: unknown;
}

/**
 * Execute a live policy-guarded payment on-chain via SafeguardPayments.pay().
 */
export async function executeLivePayment(params: {
  sender: string;
  recipient: string;
  tokenContractId: string;
  amountXlm: string;
}): Promise<TxExecutionResult> {
  const connected = await isConnected().catch(() => false);
  if (!connected) {
    return {
      success: false,
      status: 'REJECTED',
      reason: 'Freighter wallet is not connected or extension is missing.',
    };
  }

  try {
    const account = await sorobanServer.getAccount(params.sender);
    const contract = new Contract(CONTRACT_IDS.SAFEGUARD_PAYMENTS);

    // Convert amount in XLM to stroops (1 XLM = 10,000,000 stroops)
    const stroops = BigInt(Math.round(parseFloat(params.amountXlm) * 10_000_000));

    const op = contract.call(
      'pay',
      new Address(params.sender).toScVal(),
      new Address(params.recipient).toScVal(),
      new Address(params.tokenContractId).toScVal(),
      nativeToScVal(stroops, { type: 'i128' })
    );

    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(rawTx);

    const signResult = await signTransaction(preparedTx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: params.sender,
    });

    if (signResult.error || !signResult.signedTxXdr) {
      return {
        success: false,
        status: 'REJECTED',
        reason: typeof signResult.error === 'object' && signResult.error ? (signResult.error as any).message || 'User rejected signature in Freighter' : 'Freighter signing was cancelled',
      };
    }

    const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    const sendResponse = await sorobanServer.sendTransaction(signedTx);

    if (sendResponse.status === 'ERROR') {
      return {
        success: false,
        status: 'FAILED',
        reason: `RPC rejected transaction: ${sendResponse.errorResult?.toXDR('base64') || 'Unknown RPC error'}`,
      };
    }

    // Poll for ledger finalization
    const pollResponse = await sorobanServer.pollTransaction(sendResponse.hash);

    if (pollResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return {
        success: true,
        status: 'SUCCESS',
        txHash: sendResponse.hash,
        returnValue: pollResponse.returnValue,
      };
    } else {
      return {
        success: false,
        status: 'FAILED',
        txHash: sendResponse.hash,
        reason: `Transaction failed during execution: ${pollResponse.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      status: 'FAILED',
      reason: err?.message || 'Failed to assemble and submit payment transaction',
    };
  }
}

/**
 * Execute an Escrow action (Release or Refund) on-chain.
 */
export async function executeLiveEscrowAction(params: {
  callerAddress: string;
  escrowId: number;
  action: 'release' | 'refund';
}): Promise<TxExecutionResult> {
  const connected = await isConnected().catch(() => false);
  if (!connected) {
    return {
      success: false,
      status: 'REJECTED',
      reason: 'Freighter wallet is not connected.',
    };
  }

  try {
    const account = await sorobanServer.getAccount(params.callerAddress);
    const contract = new Contract(CONTRACT_IDS.SAFEGUARD_PAYMENTS);

    const methodName = params.action === 'release' ? 'release_escrow' : 'refund_escrow';
    const op = contract.call(
      methodName,
      nativeToScVal(BigInt(params.escrowId), { type: 'u64' })
    );

    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(rawTx);

    const signResult = await signTransaction(preparedTx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: params.callerAddress,
    });

    if (signResult.error || !signResult.signedTxXdr) {
      return {
        success: false,
        status: 'REJECTED',
        reason: 'Signing was rejected by user in Freighter',
      };
    }

    const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    const sendResponse = await sorobanServer.sendTransaction(signedTx);

    if (sendResponse.status === 'ERROR') {
      return {
        success: false,
        status: 'FAILED',
        reason: 'Soroban RPC transaction submission error',
      };
    }

    const pollResponse = await sorobanServer.pollTransaction(sendResponse.hash);

    if (pollResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return {
        success: true,
        status: 'SUCCESS',
        txHash: sendResponse.hash,
      };
    } else {
      return {
        success: false,
        status: 'FAILED',
        txHash: sendResponse.hash,
        reason: `Execution failed: ${pollResponse.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      status: 'FAILED',
      reason: err?.message || 'Failed to submit escrow action',
    };
  }
}

