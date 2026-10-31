/** Shared transaction record type used across the dashboard */
export interface TxItem {
  id: string;
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  status: 'Approved' | 'Escrowed' | 'Blocked';
  reason: string;
  timestamp: string;
  txHash: string;
}
