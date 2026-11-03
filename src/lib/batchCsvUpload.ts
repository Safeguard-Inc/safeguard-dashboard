/**
 * batchCsvUpload.ts
 *
 * Client-side parser and volume aggregator for batch payment CSV files.
 */

export interface BatchCsvRow {
  index: number;
  recipient: string;
  amount: string;
  token: string;
  memo?: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface BatchCsvSummary {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  totalVolume: number;
  tokens: string[];
}

export function validateBatchPaymentRow(recipient: string, amount: string, token: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  const rec = (recipient || '').trim();
  if (!rec.startsWith('G') && !rec.startsWith('C')) {
    return { isValid: false, errorMessage: 'Recipient must be a valid Stellar public key (G...) or contract (C...)' };
  }
  if (rec.length !== 56) {
    return { isValid: false, errorMessage: 'Recipient length must be exactly 56 characters' };
  }

  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, errorMessage: 'Amount must be a positive number' };
  }

  if (!token || token.trim().length === 0) {
    return { isValid: false, errorMessage: 'Token symbol or contract ID is required' };
  }

  return { isValid: true };
}

export function parseBatchCsvText(csvText: string): { rows: BatchCsvRow[]; summary: BatchCsvSummary } {
  if (!csvText || !csvText.trim()) {
    return {
      rows: [],
      summary: { totalRows: 0, validCount: 0, invalidCount: 0, totalVolume: 0, tokens: [] },
    };
  }

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return {
      rows: [],
      summary: { totalRows: 0, validCount: 0, invalidCount: 0, totalVolume: 0, tokens: [] },
    };
  }

  // Parse header
  const headerParts = lines[0].toLowerCase().split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
  const recipientIdx = headerParts.indexOf('recipient');
  const amountIdx = headerParts.indexOf('amount');
  const tokenIdx = headerParts.indexOf('token');
  const memoIdx = headerParts.indexOf('memo');

  const hasHeader = recipientIdx !== -1 && amountIdx !== -1;
  const startIdx = hasHeader ? 1 : 0;

  const rows: BatchCsvRow[] = [];
  const tokenSet = new Set<string>();
  let validCount = 0;
  let invalidCount = 0;
  let totalVolume = 0;

  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    let recipient = '';
    let amount = '';
    let token = 'XLM';
    let memo: string | undefined = undefined;

    if (hasHeader) {
      recipient = parts[recipientIdx] || '';
      amount = parts[amountIdx] || '';
      token = tokenIdx !== -1 && parts[tokenIdx] ? parts[tokenIdx] : 'XLM';
      memo = memoIdx !== -1 ? parts[memoIdx] : undefined;
    } else {
      // Fallback: [recipient, amount, token, memo]
      recipient = parts[0] || '';
      amount = parts[1] || '';
      token = parts[2] || 'XLM';
      memo = parts[3];
    }

    const val = validateBatchPaymentRow(recipient, amount, token);
    const rowObj: BatchCsvRow = {
      index: i + 1,
      recipient,
      amount,
      token,
      memo,
      isValid: val.isValid,
      errorMessage: val.errorMessage,
    };

    if (val.isValid) {
      validCount++;
      totalVolume += Number(amount);
      tokenSet.add(token.toUpperCase());
    } else {
      invalidCount++;
    }

    rows.push(rowObj);
  }

  return {
    rows,
    summary: {
      totalRows: rows.length,
      validCount,
      invalidCount,
      totalVolume: Number(totalVolume.toFixed(7)),
      tokens: Array.from(tokenSet),
    },
  };
}
