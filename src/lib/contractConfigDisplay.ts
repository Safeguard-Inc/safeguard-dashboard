export interface DeployedContractTelemetry {
  network: string;
  paymentsContract: string;
  policyContract: string;
  admin: string;
  spendCapXlm: string;
  isPaused: boolean;
  schemaVersion: number;
}

/**
 * Formats network badge style and label.
 */
export function formatNetworkBadge(network: string): { label: string; badgeClass: string } {
  const norm = (network || 'testnet').toLowerCase();
  if (norm === 'mainnet' || norm === 'public') {
    return {
      label: 'Stellar Mainnet',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    };
  }
  return {
    label: 'Soroban Testnet',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  };
}

/**
 * Formats circuit breaker badge and operational status.
 */
export function formatCircuitBreakerStatus(isPaused: boolean): {
  status: string;
  label: string;
  badgeClass: string;
  icon: string;
} {
  if (isPaused) {
    return {
      status: 'PAUSED',
      label: 'Circuit Breaker Active (Paused)',
      badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      icon: '🛑',
    };
  }
  return {
    status: 'ACTIVE',
    label: 'Gateway Operational',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    icon: '⚡',
  };
}

/**
 * Shortens contract address for clean compact display.
 */
export function abbreviateContractId(id: string): string {
  if (!id || id.length <= 12) return id || '';
  return `${id.slice(0, 6)}...${id.slice(-6)}`;
}

