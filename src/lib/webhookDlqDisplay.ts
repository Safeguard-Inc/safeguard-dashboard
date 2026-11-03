export interface DeadLetterItem {
  subscriptionId: string;
  url: string;
  error: string;
  failedAt: number;
  retryCount: number;
  eventType: string;
}

/**
 * Formats a failure timestamp into relative elapsed time notation.
 */
export function formatRelativeFailureTime(failedAt: number, nowMs: number = Date.now()): string {
  const diffSec = Math.max(0, Math.floor((nowMs - failedAt) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

/**
 * Classifies webhook delivery failure error severity.
 */
export function classifyErrorSeverity(error: string): { label: string; badgeClass: string } {
  const clean = (error || '').toLowerCase();
  if (clean.includes('timeout') || clean.includes('econnrefused') || clean.includes('network')) {
    return {
      label: 'Network Lag / Timeout',
      badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    };
  }
  if (clean.includes('500') || clean.includes('502') || clean.includes('503') || clean.includes('error')) {
    return {
      label: 'Server Fault (5xx)',
      badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    };
  }
  return {
    label: 'Delivery Failure',
    badgeClass: 'bg-slate-700 text-slate-300 border border-slate-600',
  };
}

/**
 * Filter DLQ items by keyword in URL, error, or subscription ID.
 */
export function filterDlqItems(items: DeadLetterItem[], search: string): DeadLetterItem[] {
  if (!search) return items;
  const clean = search.toLowerCase();
  return items.filter(
    (item) =>
      item.url.toLowerCase().includes(clean) ||
      item.error.toLowerCase().includes(clean) ||
      item.subscriptionId.toLowerCase().includes(clean) ||
      item.eventType.toLowerCase().includes(clean)
  );
}
