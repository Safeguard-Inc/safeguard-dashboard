export interface CircuitBreakerState {
  isPaused: boolean;
  adminAddress: string;
  guardianAddress?: string;
  activeAccount?: string;
}

export function canTriggerGuardianPause(state: CircuitBreakerState): boolean {
  if (!state.activeAccount) return false;
  const acc = state.activeAccount.trim().toUpperCase();
  const isAdmin = acc === state.adminAddress.trim().toUpperCase();
  const isGuardian = state.guardianAddress
    ? acc === state.guardianAddress.trim().toUpperCase()
    : false;
  return isAdmin || isGuardian;
}

export function canResumeGateway(state: CircuitBreakerState): boolean {
  if (!state.activeAccount) return false;
  return state.activeAccount.trim().toUpperCase() === state.adminAddress.trim().toUpperCase();
}

export function formatGatewayOperatingStatus(isPaused: boolean): {
  status: string;
  badge: string;
  colorClass: string;
} {
  if (isPaused) {
    return {
      status: 'EMERGENCY PAUSED',
      badge: 'Circuit Breaker Active',
      colorClass: 'text-rose-400 bg-rose-950/50 border-rose-800',
    };
  }
  return {
    status: 'OPERATIONAL',
    badge: 'Gateway Active',
    colorClass: 'text-emerald-400 bg-emerald-950/50 border-emerald-800',
  };
}

export function resolveUserRole(
  state: CircuitBreakerState
): 'ADMIN' | 'GUARDIAN' | 'OBSERVER' {
  if (!state.activeAccount) return 'OBSERVER';
  const acc = state.activeAccount.trim().toUpperCase();
  if (acc === state.adminAddress.trim().toUpperCase()) return 'ADMIN';
  if (state.guardianAddress && acc === state.guardianAddress.trim().toUpperCase()) {
    return 'GUARDIAN';
  }
  return 'OBSERVER';
}
