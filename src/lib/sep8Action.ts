export type Sep8ActionStatus = 'pending' | 'action_required' | 'approved' | 'rejected' | 'not_required';

export interface Sep8ActionResult {
  status: Sep8ActionStatus;
  assetCode: string;
  assetIssuer: string;
  actionUrl?: string;
  message?: string;
  txHash?: string;
  requiredFields?: string[];
}

export function parseSep8Response(raw: Record<string, any>): Sep8ActionResult {
  const statusStr = String(raw.status || '').toLowerCase();
  let status: Sep8ActionStatus = 'not_required';
  if (statusStr === 'action_required' || raw.action_url || raw.actionUrl) {
    status = 'action_required';
  } else if (statusStr === 'pending') {
    status = 'pending';
  } else if (statusStr === 'approved' || statusStr === 'success') {
    status = 'approved';
  } else if (statusStr === 'rejected' || statusStr === 'denied') {
    status = 'rejected';
  }

  return {
    status,
    assetCode: String(raw.asset_code || raw.assetCode || 'UNKNOWN'),
    assetIssuer: String(raw.asset_issuer || raw.assetIssuer || ''),
    actionUrl: raw.action_url || raw.actionUrl || undefined,
    message: raw.message || raw.description || undefined,
    txHash: raw.tx_hash || raw.txHash || undefined,
    requiredFields: Array.isArray(raw.fields) ? raw.fields : undefined,
  };
}

export function formatSep8StatusBadge(status: Sep8ActionStatus): { label: string; colorClass: string } {
  switch (status) {
    case 'action_required':
      return { label: 'Action Required', colorClass: 'bg-amber-900/30 text-amber-300 border-amber-700' };
    case 'pending':
      return { label: 'Approval Pending', colorClass: 'bg-blue-900/30 text-blue-300 border-blue-700' };
    case 'approved':
      return { label: 'Approved', colorClass: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' };
    case 'rejected':
      return { label: 'Approval Rejected', colorClass: 'bg-rose-900/30 text-rose-300 border-rose-700' };
    default:
      return { label: 'Standard Asset', colorClass: 'bg-slate-800 text-slate-300 border-slate-700' };
  }
}

export function shouldPromptUserAction(action: Sep8ActionResult): boolean {
  return action.status === 'action_required' && Boolean(action.actionUrl);
}
