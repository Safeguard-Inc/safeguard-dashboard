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
