export type RateLimitTier = 'public' | 'standard' | 'enterprise';

export interface TierUsageStats {
  tier: RateLimitTier;
  remaining: number;
  limit: number;
  percentUsed: number;
  status: 'nominal' | 'warning' | 'exhausted';
  barColorClass: string;
}

export function formatTierLabel(tier: RateLimitTier): {
  name: string;
  badgeClass: string;
  icon: string;
} {
  switch (tier) {
    case 'enterprise':
      return {
        name: 'Enterprise Tier',
        badgeClass: 'border-purple-600/70 bg-purple-950/50 text-purple-300',
        icon: '👑',
      };
    case 'standard':
      return {
        name: 'Standard Tier',
        badgeClass: 'border-blue-600/70 bg-blue-950/50 text-blue-300',
        icon: '⚡',
      };
    case 'public':
    default:
      return {
        name: 'Public Tier',
        badgeClass: 'border-slate-700 bg-slate-800 text-slate-300',
        icon: '🌐',
      };
  }
}

export function calculateTierUsage(remaining: number, limit: number): TierUsageStats {
  const safeLimit = Math.max(1, limit);
  const safeRemaining = Math.max(0, Math.min(safeLimit, remaining));
  const used = safeLimit - safeRemaining;
  const percentUsed = Number(((used / safeLimit) * 100).toFixed(1));

  let status: 'nominal' | 'warning' | 'exhausted' = 'nominal';
  let barColorClass = 'bg-blue-500';

  if (safeRemaining === 0) {
    status = 'exhausted';
    barColorClass = 'bg-rose-500';
  } else if (percentUsed >= 80) {
    status = 'warning';
    barColorClass = 'bg-amber-500';
  }

  return {
    tier: 'public', // overwritten by caller
    remaining: safeRemaining,
    limit: safeLimit,
    percentUsed,
    status,
    barColorClass,
  };
}
