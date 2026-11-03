export interface ConversionPair {
  sellSymbol: string;
  buySymbol: string;
  rate: number;
}

export interface ConversionCalculationResult {
  sellAmount: string;
  buyAmount: string;
  rateDisplay: string;
  isValid: boolean;
}

export const DEFAULT_CONVERSION_RATES: Record<string, number> = {
  'XLM:USDC': 0.125,
  'USDC:XLM': 8.0,
  'XLM:EURC': 0.115,
  'EURC:XLM': 8.695,
  'USDC:EURC': 0.92,
  'EURC:USDC': 1.087,
};

/**
 * Returns available currency pairs for SEP-38 conversion.
 */
export function getAvailableCurrencies(): string[] {
  return ['XLM', 'USDC', 'EURC'];
}

/**
 * Computes cross-asset conversion amounts using SEP-38 RFQ exchange rates.
 */
export function computeConversion(
  sellAmount: string,
  sellSymbol: string,
  buySymbol: string,
  overrideRate?: number
): ConversionCalculationResult {
  const sellNum = parseFloat(sellAmount);
  if (isNaN(sellNum) || sellNum <= 0) {
    return {
      sellAmount: sellAmount || '0',
      buyAmount: '0.00',
      rateDisplay: '1 ' + sellSymbol + ' = -- ' + buySymbol,
      isValid: false,
    };
  }

  if (sellSymbol === buySymbol) {
    return {
      sellAmount,
      buyAmount: sellNum.toFixed(2),
      rateDisplay: `1 ${sellSymbol} = 1.00 ${buySymbol}`,
      isValid: true,
    };
  }

  const key = `${sellSymbol}:${buySymbol}`;
  const rate = overrideRate ?? DEFAULT_CONVERSION_RATES[key] ?? 1.0;
  const buyNum = sellNum * rate;

  return {
    sellAmount,
    buyAmount: buyNum.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }),
    rateDisplay: `1 ${sellSymbol} = ${rate.toFixed(4)} ${buySymbol}`,
    isValid: true,
  };
}

