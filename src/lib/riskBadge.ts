export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskBadgeConfig {
  score: number;
  band: RiskBand;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  label: string;
}

export function getRiskBadgeConfig(score: number): RiskBadgeConfig {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));

  if (normalized >= 70) {
    return {
      score: normalized,
      band: 'HIGH',
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-950/50',
      borderClass: 'border-rose-800',
      label: 'High Risk',
    };
  }

  if (normalized >= 30) {
    return {
      score: normalized,
      band: 'MEDIUM',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-950/50',
      borderClass: 'border-amber-800',
      label: 'Moderate Risk',
    };
  }

  return {
    score: normalized,
    band: 'LOW',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-950/50',
    borderClass: 'border-emerald-800',
    label: 'Low Risk',
  };
}
