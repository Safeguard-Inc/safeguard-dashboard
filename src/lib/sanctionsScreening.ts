export type SanctionsMatchStatus = 'CLEAN' | 'FLAGGED' | 'CONFIRMED_MATCH' | 'RETIRED';

export interface SanctionsScreeningRecord {
  address: string;
  status: SanctionsMatchStatus;
  listId?: string;
  program?: string;
  countryCode?: string;
  matchedAt?: number;
  confidencePercent?: number;
  datasetVersion?: number;
}

export function formatSanctionsStatusBadge(status: SanctionsMatchStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (status) {
    case 'CONFIRMED_MATCH':
      return {
        label: 'Confirmed Sanction',
        bgClass: 'bg-rose-950/40',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-800',
      };
    case 'FLAGGED':
      return {
        label: 'Possible Match',
        bgClass: 'bg-amber-950/40',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-800',
      };
    case 'RETIRED':
      return {
        label: 'Sanction Retired',
        bgClass: 'bg-slate-800/60',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-700',
      };
    case 'CLEAN':
    default:
      return {
        label: 'Clean / Unlisted',
        bgClass: 'bg-emerald-950/40',
        textClass: 'text-emerald-400',
        borderClass: 'border-emerald-800',
      };
  }
}

export function isActionableSanction(record: SanctionsScreeningRecord): boolean {
  return record.status === 'CONFIRMED_MATCH' || record.status === 'FLAGGED';
}

export function getSanctionsRiskRating(record: SanctionsScreeningRecord): {
  rating: 'LOW' | 'MEDIUM' | 'CRITICAL';
  color: string;
} {
  if (record.status === 'CONFIRMED_MATCH') {
    return { rating: 'CRITICAL', color: 'text-red-500' };
  }
  if (record.status === 'FLAGGED') {
    return { rating: 'MEDIUM', color: 'text-amber-500' };
  }
  return { rating: 'LOW', color: 'text-emerald-500' };
}
