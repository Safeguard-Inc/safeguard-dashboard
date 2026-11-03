/**
 * Domain logic for ProtocolStatusBanner: operational health evaluation,
 * severity classification, and countdown formatting.
 */

export interface ProtocolOperationalState {
  isCircuitBreakerPaused: boolean;
  pauseRemainingSeconds: number;
  ledgerLagSeconds: number;
  networkTipLedger: number;
  isHealthy: boolean;
}

export interface ProtocolAlertEvaluation {
  showAlert: boolean;
  severity: 'critical' | 'warning' | 'normal';
  title: string;
  message: string;
  badgeText: string;
}

/**
 * Formats seconds into human-readable duration string (e.g. "12m 30s").
 */
export function formatPauseRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Evaluates operational conditions to determine protocol alerts.
 */
export function evaluateProtocolStatusAlerts(
  state: ProtocolOperationalState
): ProtocolAlertEvaluation {
  if (state.isCircuitBreakerPaused) {
    const timeFormatted = formatPauseRemainingTime(state.pauseRemainingSeconds);
    return {
      showAlert: true,
      severity: 'critical',
      title: 'EMERGENCY CIRCUIT BREAKER ACTIVATED',
      message: `Protocol disbursements and escrows are temporarily halted by guardian authority. Timelock expires in ${timeFormatted}.`,
      badgeText: 'PAUSED',
    };
  }

  if (state.ledgerLagSeconds > 15 || !state.isHealthy) {
    return {
      showAlert: true,
      severity: 'warning',
      title: 'LEDGER SYNCHRONIZATION DELAY',
      message: `Local indexing node is ${state.ledgerLagSeconds}s behind Stellar network tip ledger #${state.networkTipLedger}. In-flight transactions are queued safely.`,
      badgeText: 'INDEXING LAG',
    };
  }

  return {
    showAlert: false,
    severity: 'normal',
    title: 'PROTOCOL FULLY OPERATIONAL',
    message: 'All Soroban contracts, indexing streams, and compliance gateways are fully synchronized.',
    badgeText: 'OPERATIONAL',
  };
}
