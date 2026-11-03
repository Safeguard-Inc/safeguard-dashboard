/**
 * metricsParser.ts
 *
 * Prometheus text format parser and telemetry aggregator for Safeguard dashboard.
 */

export interface ParsedMetricLine {
  name: string;
  labels: Record<string, string>;
  value: number;
}

export interface SafeguardTelemetrySummary {
  httpRequestsTotal: number;
  approvedSimulations: number;
  escrowedSimulations: number;
  blockedSimulations: number;
  activeEscrows: number;
  complianceApprovalRatio: number;
  uptimeSeconds: number;
}

export function parsePrometheusText(text: string): ParsedMetricLine[] {
  if (!text) return [];
  const lines = text.split('\n');
  const results: ParsedMetricLine[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Pattern: metric_name{label="val",...} 123 or metric_name 123
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\{([^}]+)\})?\s+([0-9.eE+-]+)$/);
    if (!match) continue;

    const [, name, rawLabels, rawVal] = match;
    const value = parseFloat(rawVal);
    if (isNaN(value)) continue;

    const labels: Record<string, string> = {};
    if (rawLabels) {
      const labelRegex = /([a-zA-Z_][a-zA-Z0-9_]*)="([^"]*)"/g;
      let labelMatch;
      while ((labelMatch = labelRegex.exec(rawLabels)) !== null) {
        labels[labelMatch[1]] = labelMatch[2];
      }
    }

    results.push({ name, labels, value });
  }

  return results;
}

export function aggregateTelemetry(metrics: ParsedMetricLine[]): SafeguardTelemetrySummary {
  let httpRequestsTotal = 0;
  let approvedSimulations = 0;
  let escrowedSimulations = 0;
  let blockedSimulations = 0;
  let activeEscrows = 0;
  let complianceApprovalRatio = 100;
  let uptimeSeconds = 0;

  for (const m of metrics) {
    if (m.name === 'safeguard_http_requests_total') {
      httpRequestsTotal += m.value;
    } else if (m.name === 'safeguard_simulations_total') {
      if (m.labels.decision === 'APPROVE') approvedSimulations = m.value;
      else if (m.labels.decision === 'FLAG') escrowedSimulations = m.value;
      else if (m.labels.decision === 'BLOCK') blockedSimulations = m.value;
    } else if (m.name === 'safeguard_escrows_active') {
      activeEscrows = m.value;
    } else if (m.name === 'safeguard_compliance_approval_ratio') {
      complianceApprovalRatio = m.value;
    } else if (m.name === 'safeguard_process_uptime_seconds') {
      uptimeSeconds = m.value;
    }
  }

  return {
    httpRequestsTotal,
    approvedSimulations,
    escrowedSimulations,
    blockedSimulations,
    activeEscrows,
    complianceApprovalRatio,
    uptimeSeconds,
  };
}
