export type AuditLogExportFormat = 'ndjson' | 'json' | 'syslog';

export interface FormatMetadata {
  format: AuditLogExportFormat;
  label: string;
  description: string;
  mimeType: string;
  icon: string;
  extension: string;
}

export const FORMAT_METADATA: Record<AuditLogExportFormat, FormatMetadata> = {
  ndjson: {
    format: 'ndjson',
    label: 'Newline Delimited JSON (NDJSON)',
    description: 'Streaming newline-separated JSON objects optimized for Splunk, Datadog, Elastic, and AWS OpenSearch ingestion.',
    mimeType: 'application/x-ndjson',
    icon: '⚡',
    extension: 'ndjson',
  },
  syslog: {
    format: 'syslog',
    label: 'Syslog RFC 5424',
    description: 'Standardized syslog stream format with structured enterprise data elements and cryptographic verification hashes.',
    mimeType: 'text/plain',
    icon: '📜',
    extension: 'log',
  },
  json: {
    format: 'json',
    label: 'Formatted JSON Array',
    description: 'Human-readable pretty-printed JSON array for reporting, auditing, and spreadsheet ingestion.',
    mimeType: 'application/json',
    icon: '📊',
    extension: 'json',
  },
};

/**
 * Builds the export query URL for downloading or streaming audit logs from backend.
 */
export function buildAuditLogExportUrl(
  baseUrl = '/api/export/audit-logs',
  format: AuditLogExportFormat = 'ndjson',
  limit = 1000,
  status?: string
): string {
  const params = new URLSearchParams();
  params.set('format', format);
  if (limit > 0) params.set('limit', String(limit));
  if (status && status !== 'all') params.set('status', status);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates a realistic mock preview of the export stream for UI visualization.
 */
export function generateAuditLogPreview(format: AuditLogExportFormat): string {
  const sampleEvent = {
    '@timestamp': '2026-03-31T12:00:00.000Z',
    event_id: 'evt-audit-001',
    category: 'payment',
    action: 'transfer_settle',
    actor: 'GC5MCM...ODW4',
    resource: 'GA6LW7...CVLT',
    status: 'SUCCESS',
    details: { token: 'XLM', amount: '100000000', ledger: 5214092 },
    integrity_hash: '9f83c12c4f128e93703352b2ae5600753004418ecdb',
  };

  if (format === 'ndjson') {
    return `${JSON.stringify(sampleEvent)}\n{"@timestamp":"2026-03-31T12:01:15.000Z","event_id":"evt-audit-002","category":"compliance","action":"sanctions_check","status":"SUCCESS","integrity_hash":"4b92c..."}\n...`;
  }
  if (format === 'syslog') {
    return `<14>1 2026-03-31T12:00:00.000Z stellar-node safeguard 1 evt-audit-001 [safeguard@43210 category="payment" action="transfer_settle" status="SUCCESS"] ${JSON.stringify(sampleEvent.details)}\n...`;
  }
  return JSON.stringify([sampleEvent], null, 2);
}

