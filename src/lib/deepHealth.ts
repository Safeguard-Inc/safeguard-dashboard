/**
 * deepHealth.ts
 *
 * Latency grading, RPC health status determination, and indexer sync health helpers.
 */

export type HealthStatusLevel = 'optimal' | 'acceptable' | 'degraded' | 'offline';

export interface DeepHealthMetrics {
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  lastLedger: number;
  eventsProcessed: number;
  consecutiveErrors?: number;
}

export function gradeRpcLatency(latencyMs: number): {
  level: HealthStatusLevel;
  label: string;
  dotColor: string;
} {
  if (latencyMs < 0) {
    return { level: 'offline', label: 'Unreachable', dotColor: 'bg-rose-500' };
  }
  if (latencyMs <= 250) {
    return { level: 'optimal', label: `${latencyMs}ms (Optimal)`, dotColor: 'bg-emerald-400' };
  }
  if (latencyMs <= 800) {
    return { level: 'acceptable', label: `${latencyMs}ms (Normal)`, dotColor: 'bg-emerald-500' };
  }
  return { level: 'degraded', label: `${latencyMs}ms (High Latency)`, dotColor: 'bg-amber-400' };
}

export function formatHealthBadge(metrics: DeepHealthMetrics): {
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  statusText: string;
} {
  if (metrics.status === 'healthy' && (!metrics.consecutiveErrors || metrics.consecutiveErrors === 0)) {
    return {
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/20',
      badgeText: 'text-emerald-400',
      statusText: 'Soroban Synced',
    };
  }
  if (metrics.status === 'degraded' || (metrics.consecutiveErrors && metrics.consecutiveErrors > 0)) {
    return {
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/20',
      badgeText: 'text-amber-400',
      statusText: 'Sync Lag / Retrying',
    };
  }
  return {
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/20',
    badgeText: 'text-rose-400',
    statusText: 'RPC Unreachable',
  };
}
