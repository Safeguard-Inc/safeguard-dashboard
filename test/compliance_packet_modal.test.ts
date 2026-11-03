import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompliancePacketExportUrl,
  formatSealDigest,
  computeRiskSummary,
  type RiskDistribution,
} from '../src/lib/compliancePacketModal.ts';

test('buildCompliancePacketExportUrl formats query parameters properly', () => {
  const url1 = buildCompliancePacketExportUrl({
    organization: 'FinTech Corp',
    purpose: 'Regulatory Examination',
    includeAuditTrail: true,
  });
  assert.ok(url1.startsWith('/api/export/compliance-packet?'));
  assert.ok(url1.includes('organization=FinTech+Corp') || url1.includes('organization=FinTech%20Corp'));
  assert.ok(url1.includes('purpose=Regulatory+Examination') || url1.includes('purpose=Regulatory%20Examination'));
  assert.ok(url1.includes('includeAuditTrail=true'));

  const urlEmpty = buildCompliancePacketExportUrl({});
  assert.equal(urlEmpty, '/api/export/compliance-packet');
});

test('formatSealDigest truncates long sha256 digests accurately', () => {
  const empty = formatSealDigest('');
  assert.equal(empty, 'UNSEALED');

  const short = formatSealDigest('abcdef123456');
  assert.equal(short, 'abcdef123456');

  const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const formatted = formatSealDigest(hash);
  assert.equal(formatted, 'e3b0c44298...7852b855');
});

test('computeRiskSummary evaluates compliant and elevated risk configurations', () => {
  const emptyStats: RiskDistribution = { sanctioned: 0, high: 0, med: 0, low: 0 };
  const emptyRes = computeRiskSummary(emptyStats);
  assert.equal(emptyRes.pass, true);
  assert.equal(emptyRes.total, 0);

  const cleanStats: RiskDistribution = { sanctioned: 0, high: 1, med: 10, low: 100 };
  const cleanRes = computeRiskSummary(cleanStats);
  assert.equal(cleanRes.pass, true);
  assert.equal(cleanRes.total, 111);
  assert.ok(cleanRes.badgeLabel.includes('Pass'));

  const sanctionedStats: RiskDistribution = { sanctioned: 1, high: 0, med: 10, low: 100 };
  const sanctionedRes = computeRiskSummary(sanctionedStats);
  assert.equal(sanctionedRes.pass, false);
  assert.ok(sanctionedRes.badgeLabel.includes('Review Required'));

  const highRiskStats: RiskDistribution = { sanctioned: 0, high: 20, med: 10, low: 50 };
  const highRiskRes = computeRiskSummary(highRiskStats);
  assert.equal(highRiskRes.pass, false);
});
