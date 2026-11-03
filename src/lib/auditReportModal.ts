export interface AuditReportData {
  reportId: string;
  organizationName: string;
  network: string;
  generatedAt: string;
  approvalRatePercent: number;
  totalEvaluations: number;
  blockedCount: number;
  certificateHash: string;
  status: 'COMPLIANT' | 'FLAGGED' | 'NON_COMPLIANT';
}

/**
 * Shorten a 64-character SHA-256 hash for UI display.
 */
export function formatAuditChecksum(hash: string, chars: number = 8): string {
  if (!hash || hash.length <= chars * 2) return hash || 'N/A';
  return `0x${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Return badge styling and icon for compliance certificate verdict.
 */
export function getAuditStatusBadge(status: 'COMPLIANT' | 'FLAGGED' | 'NON_COMPLIANT'): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  switch (status) {
    case 'COMPLIANT':
      return {
        label: 'Fully Compliant',
        badgeClass: 'border-emerald-600/70 bg-emerald-950/50 text-emerald-300',
        icon: '🛡️',
      };
    case 'FLAGGED':
      return {
        label: 'Policy Warnings',
        badgeClass: 'border-amber-600/70 bg-amber-950/50 text-amber-300',
        icon: '⚠️',
      };
    case 'NON_COMPLIANT':
    default:
      return {
        label: 'Non-Compliant',
        badgeClass: 'border-rose-600/70 bg-rose-950/50 text-rose-300',
        icon: '🚨',
      };
  }
}

/**
 * Build markdown report content on the client side.
 */
export function buildClientAuditMarkdown(data: AuditReportData): string {
  return `# Safeguard Stellar Compliance Certificate

**Report ID:** \`${data.reportId}\`  
**Organization:** ${data.organizationName}  
**Network:** \`${data.network}\`  
**Status:** **${data.status}**  
**Audit Verification Hash:** \`${data.certificateHash}\`  
**Generated At:** ${data.generatedAt}  

### Telemetry Summary
- **Total Payments Screened:** ${data.totalEvaluations.toLocaleString()}
- **Compliance Approval Rate:** ${data.approvalRatePercent.toFixed(2)}%
- **Sanctions & Denylist Blocks:** ${data.blockedCount.toLocaleString()}

*Cryptographically certified by the Safeguard Stellar Protocol.*
`;
}
