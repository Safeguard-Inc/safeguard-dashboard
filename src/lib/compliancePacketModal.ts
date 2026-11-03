/**
 * Domain logic for CompliancePacketExportModal: URL builder,
 * seal formatting, and risk summary calculations.
 */

export interface CompliancePacketParams {
  organization?: string;
  purpose?: string;
  includeAuditTrail?: boolean;
}

export interface RiskDistribution {
  sanctioned: number;
  high: number;
  med: number;
  low: number;
}

/**
 * Builds the API endpoint URL for compliance packet export.
 */
export function buildCompliancePacketExportUrl(params: CompliancePacketParams): string {
  const query = new URLSearchParams();
  if (params.organization && params.organization.trim()) {
    query.set('organization', params.organization.trim());
  }
  if (params.purpose && params.purpose.trim()) {
    query.set('purpose', params.purpose.trim());
  }
  if (params.includeAuditTrail) {
    query.set('includeAuditTrail', 'true');
  }

  const qs = query.toString();
  return qs ? `/api/export/compliance-packet?${qs}` : '/api/export/compliance-packet';
}

/**
 * Formats cryptographic SHA-256 seal digest for concise display.
 */
export function formatSealDigest(digest: string): string {
  if (!digest || digest.trim().length === 0) return 'UNSEALED';
  const clean = digest.trim();
  if (clean.length <= 16) return clean;
  return `${clean.slice(0, 10)}...${clean.slice(-8)}`;
}

/**
 * Computes whether the compliance risk distribution passes automated threshold audits.
 */
export function computeRiskSummary(stats: RiskDistribution): {
  pass: boolean;
  total: number;
  highRiskRatio: number;
  badgeLabel: string;
} {
  const total = stats.sanctioned + stats.high + stats.med + stats.low;
  if (total === 0) {
    return {
      pass: true,
      total: 0,
      highRiskRatio: 0,
      badgeLabel: 'Clean / Empty Ledger',
    };
  }

  const elevated = stats.sanctioned + stats.high;
  const highRiskRatio = elevated / total;
  const pass = stats.sanctioned === 0 && highRiskRatio < 0.05;

  return {
    pass,
    total,
    highRiskRatio: Math.round(highRiskRatio * 1000) / 1000,
    badgeLabel: pass ? 'Regulatory Compliant (Pass)' : 'Elevated Risk Profile (Review Required)',
  };
}
