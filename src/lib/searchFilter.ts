export interface FilterableTransaction {
  id: string;
  txHash?: string;
  sender: string;
  recipient: string;
  token: string;
  amount: number | string;
  status: string;
  timestamp?: number | string;
}

export interface TransactionFilterCriteria {
  query?: string;
  status?: string;
  token?: string;
  minAmount?: number;
  maxAmount?: number;
}

export function matchesTransaction(
  item: FilterableTransaction,
  criteria: TransactionFilterCriteria
): boolean {
  if (criteria.query && criteria.query.trim()) {
    const q = criteria.query.trim().toLowerCase();
    const hashMatch = item.txHash ? item.txHash.toLowerCase().includes(q) : false;
    const senderMatch = item.sender ? item.sender.toLowerCase().includes(q) : false;
    const recipientMatch = item.recipient ? item.recipient.toLowerCase().includes(q) : false;
    const idMatch = item.id ? item.id.toLowerCase().includes(q) : false;
    if (!hashMatch && !senderMatch && !recipientMatch && !idMatch) {
      return false;
    }
  }

  if (criteria.status && criteria.status !== 'all') {
    if (item.status.toLowerCase() !== criteria.status.toLowerCase()) {
      return false;
    }
  }

  if (criteria.token && criteria.token !== 'all') {
    if (item.token.toUpperCase() !== criteria.token.toUpperCase()) {
      return false;
    }
  }

  const numericAmount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
  if (!isNaN(numericAmount)) {
    if (criteria.minAmount !== undefined && numericAmount < criteria.minAmount) {
      return false;
    }
    if (criteria.maxAmount !== undefined && numericAmount > criteria.maxAmount) {
      return false;
    }
  }

  return true;
}

export function filterTransactions<T extends FilterableTransaction>(
  items: T[],
  criteria: TransactionFilterCriteria
): T[] {
  return items.filter((item) => matchesTransaction(item, criteria));
}
