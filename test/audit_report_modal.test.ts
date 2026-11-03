import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAuditChecksum,
  getAuditStatusBadge,
  buildClientAuditMarkdown,
  type AuditReportData,
} from '../src/lib/auditReportModal.ts';

describe('Audit Report Modal Domain Tests', () => {
  const mockData: AuditReportData = {
    reportId: 'REP-SAFEGUARD-2026',
    organizationName: 'Global Treasury Corp',
    network: 'stellar-mainnet',
    generatedAt: '2026-11-03T12:00:00Z',
    approvalRatePercent: 98.5,
    totalEvaluations: 4500,
    blockedCount: 5,
    certificateHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'COMPLIANT',
  };

  test('formats SHA-256 checksum with hex prefix and abbreviation', () => {
    const formatted = formatAuditChecksum(mockData.certificateHash, 6);
    assert.equal(formatted, '0xe3b0c4...52b855');
  });

  test('handles short or missing checksum strings gracefully', () => {
    assert.equal(formatAuditChecksum('', 6), 'N/A');
    assert.equal(formatAuditChecksum('short', 6), 'short');
  });

  test('resolves status badge classes and icons across compliance levels', () => {
    const comp = getAuditStatusBadge('COMPLIANT');
    assert.equal(comp.label, 'Fully Compliant');
    assert.match(comp.badgeClass, /emerald/);

    const flagged = getAuditStatusBadge('FLAGGED');
    assert.equal(flagged.label, 'Policy Warnings');
    assert.match(flagged.badgeClass, /amber/);

    const nonComp = getAuditStatusBadge('NON_COMPLIANT');
    assert.equal(nonComp.label, 'Non-Compliant');
    assert.match(nonComp.badgeClass, /rose/);
  });

  test('constructs client markdown report containing key compliance variables', () => {
    const md = buildClientAuditMarkdown(mockData);
    assert.match(md, /# Safeguard Stellar Compliance Certificate/);
    assert.match(md, /REP-SAFEGUARD-2026/);
    assert.match(md, /Global Treasury Corp/);
    assert.match(md, /stellar-mainnet/);
    assert.match(md, /98.50%/);
    assert.match(md, /e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/);
  });
});
