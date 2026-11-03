import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAuditLogExportUrl,
  FORMAT_METADATA,
  generateAuditLogPreview,
  type AuditLogExportFormat,
} from '../src/lib/auditLogExportModal.ts';

describe('Audit Log Export Modal Domain Tests', () => {
  test('buildAuditLogExportUrl constructs query URLs correctly', () => {
    const urlDefault = buildAuditLogExportUrl('/api/export/audit-logs');
    assert.equal(urlDefault, '/api/export/audit-logs?format=ndjson&limit=1000');

    const urlJson = buildAuditLogExportUrl('/api/export/audit-logs', 'json', 500, 'Approved');
    assert.equal(urlJson, '/api/export/audit-logs?format=json&limit=500&status=Approved');

    const urlSyslog = buildAuditLogExportUrl('/api/export/audit-logs', 'syslog', 5000);
    assert.equal(urlSyslog, '/api/export/audit-logs?format=syslog&limit=5000');
  });

  test('FORMAT_METADATA exposes valid configurations for all supported formats', () => {
    const formats: AuditLogExportFormat[] = ['ndjson', 'syslog', 'json'];
    for (const fmt of formats) {
      const meta = FORMAT_METADATA[fmt];
      assert.ok(meta);
      assert.equal(meta.format, fmt);
      assert.ok(meta.label.length > 0);
      assert.ok(meta.mimeType.length > 0);
      assert.ok(meta.extension.length > 0);
      assert.ok(meta.icon.length > 0);
    }
  });

  test('generateAuditLogPreview renders valid format-specific representations', () => {
    const ndjsonPreview = generateAuditLogPreview('ndjson');
    assert.ok(ndjsonPreview.includes('\n'));
    assert.ok(ndjsonPreview.includes('"@timestamp"'));
    assert.ok(ndjsonPreview.includes('"integrity_hash"'));

    const syslogPreview = generateAuditLogPreview('syslog');
    assert.ok(syslogPreview.startsWith('<14>1'));
    assert.ok(syslogPreview.includes('[safeguard@43210'));

    const jsonPreview = generateAuditLogPreview('json');
    assert.ok(jsonPreview.startsWith('[\n'));
    const parsed = JSON.parse(jsonPreview);
    assert.ok(Array.isArray(parsed));
    assert.equal(parsed[0].status, 'SUCCESS');
  });
});
