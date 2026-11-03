export type KycBadgeStatus = 'Permanent' | 'Active' | 'ExpiringSoon' | 'Expired' | 'Unverified';

export interface KycBadgeInfo {
  status: KycBadgeStatus;
  label: string;
  subtext: string;
  icon: string;
  daysRemaining: number | null;
  badgeClass: string;
  isCompliant: boolean;
}

export function formatKycExpiration(
  expiresAt: number | null | undefined,
  nowSeconds?: number,
  warningThresholdDays: number = 7
): KycBadgeInfo {
  if (expiresAt === undefined || expiresAt === null) {
    return {
      status: 'Unverified',
      label: 'Unverified',
      subtext: 'No attestation recorded',
      icon: '⚪',
      daysRemaining: null,
      badgeClass: 'border-slate-700 bg-slate-800 text-slate-400',
      isCompliant: false,
    };
  }

  if (expiresAt === 0) {
    return {
      status: 'Permanent',
      label: 'Permanent',
      subtext: 'Never expires',
      icon: '♾️',
      daysRemaining: null,
      badgeClass: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300',
      isCompliant: true,
    };
  }

  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const diffSec = expiresAt - now;

  if (diffSec <= 0) {
    const daysAgo = Math.floor(Math.abs(diffSec) / 86400);
    return {
      status: 'Expired',
      label: 'Expired',
      subtext: daysAgo === 0 ? 'Expired today' : `Expired ${daysAgo}d ago`,
      icon: '🚨',
      daysRemaining: -daysAgo,
      badgeClass: 'border-rose-600/70 bg-rose-950/50 text-rose-300',
      isCompliant: false,
    };
  }

  const daysRemaining = Math.max(0, Math.floor(diffSec / 86400));
  if (daysRemaining <= warningThresholdDays) {
    return {
      status: 'ExpiringSoon',
      label: `Expires in ${daysRemaining}d`,
      subtext: 'Renewal required soon',
      icon: '⚠️',
      daysRemaining,
      badgeClass: 'border-amber-600/70 bg-amber-950/50 text-amber-300',
      isCompliant: false,
    };
  }

  return {
    status: 'Active',
    label: `Valid (${daysRemaining}d)`,
    subtext: 'Fully verified',
    icon: '✅',
    daysRemaining,
    badgeClass: 'border-blue-600/60 bg-blue-950/40 text-blue-300',
    isCompliant: true,
  };
}
