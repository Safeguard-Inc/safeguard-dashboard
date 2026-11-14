/**
 * errorBoundary.ts
 *
 * Domain logic for classifying runtime UI/RPC errors in the Next.js App Router
 * error boundary (src/app/error.tsx) and providing actionable recovery guidance.
 */

export interface ErrorBoundarySummary {
  title: string;
  category: 'NETWORK_RPC' | 'WALLET_SIGNING' | 'CONTRACT_POLICY' | 'RUNTIME_UI';
  message: string;
  digest?: string;
  recoveryActionLabel: string;
  recoveryHint: string;
}

/**
 * Classifies an unexpected runtime Error thrown within the React component tree
 * into a structured summary for the fallback boundary view.
 */
export function classifyRuntimeError(
  error: Error & { digest?: string } | null | undefined
): ErrorBoundarySummary {
  const rawMessage = error?.message?.trim() || 'An unexpected client error occurred.';
  const lower = rawMessage.toLowerCase();
  const digest = error?.digest;

  if (
    lower.includes('soroban') ||
    lower.includes('horizon') ||
    lower.includes('rpc') ||
    lower.includes('network') ||
    lower.includes('fetch')
  ) {
    return {
      title: 'Stellar RPC / Telemetry Connection Interrupted',
      category: 'NETWORK_RPC',
      message: rawMessage,
      digest,
      recoveryActionLabel: 'Retry RPC Sync',
      recoveryHint:
        'Verify your network connection or Soroban Testnet RPC endpoint availability and retry.',
    };
  }

  if (lower.includes('freighter') || lower.includes('wallet') || lower.includes('sign')) {
    return {
      title: 'Wallet Extension Interaction Error',
      category: 'WALLET_SIGNING',
      message: rawMessage,
      digest,
      recoveryActionLabel: 'Reconnect Wallet View',
      recoveryHint:
        'Ensure the Freighter browser extension is unlocked and set to Stellar Testnet before retrying.',
    };
  }

  if (lower.includes('escrow') || lower.includes('policy') || lower.includes('contract')) {
    return {
      title: 'Safeguard Contract State Error',
      category: 'CONTRACT_POLICY',
      message: rawMessage,
      digest,
      recoveryActionLabel: 'Reload Contract State',
      recoveryHint:
        'Re-synchronize the dashboard state with the deployed SafeguardPayments contract.',
    };
  }

  return {
    title: 'Safeguard Console Runtime Exception',
    category: 'RUNTIME_UI',
    message: rawMessage,
    digest,
    recoveryActionLabel: 'Reset Console View',
    recoveryHint:
      'Click reset below to re-render the operator console without losing on-chain state.',
  };
}
