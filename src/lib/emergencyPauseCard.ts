/**
 * Domain logic for EmergencyPauseStatusCard: circuit breaker evaluation,
 * timelock formatting, and authorization checking.
 */

export type CircuitBreakerStatus = 'ACTIVE_PAUSED' | 'TIMELOCKED_PAUSED' | 'NORMAL_OPERATIONAL';

export interface EmergencyPauseData {
  isPaused: boolean;
  pausedUntil: number; // Unix timestamp in seconds
  pausedBy: string | null;
  remainingSeconds: number;
  circuitBreakerState: CircuitBreakerStatus;
}

/**
 * Formats remaining duration into readable clock countdown string (e.g. "14m 32s" or "2h 15m").
 */
export function formatRemainingDuration(seconds: number): string {
  if (seconds <= 0) return 'Expired / Indefinite';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM > 0 ? `${remM}m` : ''}`.trim();
}

/**
 * Resolves status badge style, label, and icon for circuit breaker state.
 */
export function formatCircuitBreakerBadge(state: CircuitBreakerStatus): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  switch (state) {
    case 'ACTIVE_PAUSED':
      return {
        label: 'Emergency Paused (Manual)',
        badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
        icon: '🛑',
      };
    case 'TIMELOCKED_PAUSED':
      return {
        label: 'Timelocked Defense Active',
        badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
        icon: '⏳',
      };
    case 'NORMAL_OPERATIONAL':
    default:
      return {
        label: 'Operational (Normal)',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        icon: '🛡️',
      };
  }
}

/**
 * Verifies if the provided account is authorized to trigger emergency pause controls.
 */
export function isCallerGuardianOrAdmin(
  caller: string,
  admin: string,
  guardian: string | null
): boolean {
  if (!caller) return false;
  const c = caller.trim().toUpperCase();
  if (admin && c === admin.trim().toUpperCase()) return true;
  if (guardian && c === guardian.trim().toUpperCase()) return true;
  return false;
}

/**
 * Maps duration preset to seconds.
 */
export function calculateTimelockExpirySeconds(preset: '5m' | '1h' | '24h' | 'indefinite'): number {
  switch (preset) {
    case '5m':
      return 300;
    case '1h':
      return 3600;
    case '24h':
      return 86400;
    case 'indefinite':
    default:
      return 0;
  }
}
