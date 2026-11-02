/**
 * sep7.ts
 *
 * Implements SEP-0007 compliant URI generator for Stellar payments and mobile wallet deep-linking.
 * Standard: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
 */

export interface Sep7PaymentUriParams {
  destination: string;
  amount?: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH';
}

/**
 * Generates a valid SEP-0007 URI string:
 * `web+stellar:pay?destination=...&amount=...`
 */
export function generateSep7PaymentUri(params: Sep7PaymentUriParams): string {
  if (!params.destination || !params.destination.trim()) {
    throw new Error('Destination account is required for SEP-0007 URI');
  }

  const queryParams = new URLSearchParams();
  queryParams.set('destination', params.destination.trim());

  if (params.amount && params.amount.trim()) {
    queryParams.set('amount', params.amount.trim());
  }

  if (params.assetCode && params.assetCode.toUpperCase() !== 'XLM') {
    queryParams.set('asset_code', params.assetCode.trim());
    if (params.assetIssuer) {
      queryParams.set('asset_issuer', params.assetIssuer.trim());
    }
  }

  if (params.memo && params.memo.trim()) {
    queryParams.set('memo', params.memo.trim());
    if (params.memoType) {
      queryParams.set('memo_type', params.memoType);
    }
  }

  return `web+stellar:pay?${queryParams.toString()}`;
}
