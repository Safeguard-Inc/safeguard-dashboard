import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePrometheusText,
  aggregateTelemetry,
} from '../src/lib/metricsParser.ts';

describe('Safeguard Dashboard Prometheus Metrics Parser Tests', () => {
  const samplePrometheusText = `
# HELP safeguard_http_requests_total Total HTTP requests handled
# TYPE safeguard_http_requests_total counter
safeguard_http_requests_total{method="GET",status="200"} 150
safeguard_http_requests_total{method="POST",status="200"} 50

# HELP safeguard_simulations_total Total pre-flight payment simulations by decision
# TYPE safeguard_simulations_total counter
safeguard_simulations_total{decision="APPROVE"} 85
safeguard_simulations_total{decision="FLAG"} 10
safeguard_simulations_total{decision="BLOCK"} 5

# HELP safeguard_escrows_active Current active pending escrow count
# TYPE safeguard_escrows_active gauge
safeguard_escrows_active 3

# HELP safeguard_compliance_approval_ratio Compliance approval percentage ratio
# TYPE safeguard_compliance_approval_ratio gauge
safeguard_compliance_approval_ratio 85

# HELP safeguard_process_uptime_seconds Process uptime in seconds
# TYPE safeguard_process_uptime_seconds gauge
safeguard_process_uptime_seconds 3600
`;

  it('parses Prometheus text lines into structured metric objects ignoring comments', () => {
    const metrics = parsePrometheusText(samplePrometheusText);
    assert.equal(metrics.length, 8);

    assert.equal(metrics[0].name, 'safeguard_http_requests_total');
    assert.equal(metrics[0].labels.method, 'GET');
    assert.equal(metrics[0].labels.status, '200');
    assert.equal(metrics[0].value, 150);

    const escrows = metrics.find((m) => m.name === 'safeguard_escrows_active');
    assert.ok(escrows);
    assert.equal(escrows.value, 3);
  });

  it('aggregates parsed metrics into a typed telemetry summary', () => {
    const metrics = parsePrometheusText(samplePrometheusText);
    const summary = aggregateTelemetry(metrics);

    assert.equal(summary.httpRequestsTotal, 200); // 150 + 50
    assert.equal(summary.approvedSimulations, 85);
    assert.equal(summary.escrowedSimulations, 10);
    assert.equal(summary.blockedSimulations, 5);
    assert.equal(summary.activeEscrows, 3);
    assert.equal(summary.complianceApprovalRatio, 85);
    assert.equal(summary.uptimeSeconds, 3600);
  });

  it('handles empty or blank text gracefully', () => {
    const metrics = parsePrometheusText('');
    assert.equal(metrics.length, 0);

    const summary = aggregateTelemetry(metrics);
    assert.equal(summary.httpRequestsTotal, 0);
    assert.equal(summary.approvedSimulations, 0);
  });
});
