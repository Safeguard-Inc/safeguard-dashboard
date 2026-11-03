/**
 * formatters.ts
 *
 * Stellar address, hash, balance, and timestamp formatting utilities.
 */

export function abbreviateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatStroopsToXlm(stroops: string | number | bigint): string {
  const s = typeof stroops === 'bigint' ? stroops : BigInt(stroops);
  const whole = s / 10000000n;
  const rem = s % 10000000n;
  if (rem === 0n) return `${whole} XLM`;
  const fraction = rem.toString().padStart(7, '0').replace(/0+$/, '');
  return `${whole}.${fraction} XLM`;
}

export function formatLedgerTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

export function formatFeeDisplay(feeStroops: number | string): { stroops: string; xlm: string } {
  const stroopsNum = typeof feeStroops === 'number' ? feeStroops : parseInt(String(feeStroops), 10) || 0;
  const xlm = formatStroopsToXlm(stroopsNum);
  return {
    stroops: stroopsNum.toLocaleString(),
    xlm,
  };
}

export function getFeeBadgeStyle(isEscrow: boolean, tier: string = 'normal'): {
  border: string;
  bg: string;
  text: string;
  label: string;
} {
  if (isEscrow) {
    return {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      label: 'Escrow State Rent',
    };
  }
  if (tier === 'priority') {
    return {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      label: 'Priority Surge',
    };
  }
  return {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    label: 'Standard Transfer',
  };
}


export interface BatchSimulationItem {
  id?: string;
  sender: string;
  recipient: string;
  amountStroops: string | number | bigint;
  decision: 'APPROVE' | 'FLAG' | 'BLOCK';
  reason?: string;
}

export interface BatchSimulationSummary {
  total: number;
  approvedCount: number;
  escrowedCount: number;
  blockedCount: number;
  approvalRatioPercent: number;
  totalVolumeStroops: bigint;
}

export function calculateBatchSummary(items: BatchSimulationItem[]): BatchSimulationSummary {
  let approvedCount = 0;
  let escrowedCount = 0;
  let blockedCount = 0;
  let totalVolume = 0n;

  for (const item of items) {
    if (item.decision === 'APPROVE') approvedCount++;
    else if (item.decision === 'FLAG') escrowedCount++;
    else if (item.decision === 'BLOCK') blockedCount++;

    if (item.amountStroops !== undefined && item.amountStroops !== null) {
      totalVolume += typeof item.amountStroops === 'bigint' ? item.amountStroops : BigInt(item.amountStroops);
    }
  }

  const total = items.length;
  const approvalRatioPercent = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

  return {
    total,
    approvedCount,
    escrowedCount,
    blockedCount,
    approvalRatioPercent,
    totalVolumeStroops: totalVolume,
  };
}
