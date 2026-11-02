/**
 * escrowExport.ts
 *
 * Exporters for Escrow telemetry and audit records in CSV and JSON formats.
 */

export interface EscrowExportItem {
  id: string;
  escrowIndex: number;
  amount: string;
  token: string;
  sender: string;
  recipient: string;
  expiresAt: number;
  status: string;
}

export function formatEscrowsAsCsv(items: EscrowExportItem[]): string {
  const headers = ['id', 'escrowIndex', 'amount', 'token', 'sender', 'recipient', 'expiresAt', 'status'];
  const rows = items.map((e) => [
    e.id,
    e.escrowIndex,
    e.amount,
    e.token,
    e.sender,
    e.recipient,
    e.expiresAt,
    e.status,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function formatEscrowsAsJson(items: EscrowExportItem[]): string {
  return JSON.stringify(items, null, 2);
}

