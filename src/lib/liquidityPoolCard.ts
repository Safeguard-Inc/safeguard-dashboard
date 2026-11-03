/**
 * Domain logic for Soroban AMM liquidity pool routing, spot price calculation,
 * and slippage bounds.
 */

export interface AmmPoolDisplayInfo {
  poolAddress: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  reserveA: bigint;
  reserveB: bigint;
  decimalsA: number;
  decimalsB: number;
  feeBps: number;
}

/**
 * Calculates estimated output using standard Soroban constant product AMM formula (x * y = k).
 * feeBps default is 30 bps (0.3%).
 */
export function calculateConstantProductEstimate(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  feeBps: bigint = 30n
): { amountOut: bigint; priceImpactBps: number } {
  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) {
    return { amountOut: 0n, priceImpactBps: 0 };
  }

  // amountInWithFee = amountIn * (10000 - feeBps)
  const amountInWithFee = amountIn * (10000n - feeBps);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 10000n + amountInWithFee;
  const amountOut = numerator / denominator;

  // Price impact = 1 - (marginal_execution_rate / spot_price)
  // Spot price: reserveOut / reserveIn
  // Effective price: amountOut / amountIn
  // priceImpact = (1 - (amountOut * reserveIn) / (amountIn * reserveOut)) * 10000
  const idealOutput = (amountIn * reserveOut) / reserveIn;
  let priceImpactBps = 0;
  if (idealOutput > 0n && idealOutput >= amountOut) {
    const diff = idealOutput - amountOut;
    priceImpactBps = Number((diff * 10000n) / idealOutput);
  }

  return { amountOut, priceImpactBps };
}

/**
 * Calculates minimum tokens received after applying maximum acceptable slippage tolerance.
 */
export function calculateMinimumReceived(amountOut: bigint, slippageToleranceBps: number): bigint {
  if (amountOut <= 0n || slippageToleranceBps < 0) return 0n;
  const factor = 10000n - BigInt(slippageToleranceBps);
  if (factor < 0n) return 0n;
  return (amountOut * factor) / 10000n;
}

/**
 * Formats exchange ratio between token A and token B.
 */
export function formatReserveRatio(
  reserveA: bigint,
  decimalsA: number,
  reserveB: bigint,
  decimalsB: number
): string {
  if (reserveA <= 0n || reserveB <= 0n) return '0.00';
  const scale = 10n ** BigInt(Math.max(decimalsA, decimalsB));
  const normalizedA = (reserveA * scale) / (10n ** BigInt(decimalsA));
  const normalizedB = (reserveB * scale) / (10n ** BigInt(decimalsB));

  if (normalizedA === 0n) return '0.00';
  const ratioX1000 = (normalizedB * 1000n) / normalizedA;
  const integerPart = ratioX1000 / 1000n;
  const fracPart = ratioX1000 % 1000n;
  return `${integerPart}.${fracPart.toString().padStart(3, '0')}`;
}

/**
 * Classifies price impact risk for UI display.
 */
export function classifyPriceImpact(priceImpactBps: number): {
  label: string;
  badgeClass: string;
  warning: boolean;
} {
  if (priceImpactBps < 100) {
    return {
      label: `< 1% Low Impact`,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      warning: false,
    };
  }
  if (priceImpactBps < 300) {
    return {
      label: `${(priceImpactBps / 100).toFixed(2)}% Moderate Impact`,
      badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      warning: false,
    };
  }
  return {
    label: `${(priceImpactBps / 100).toFixed(2)}% High Slippage Risk`,
    badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    warning: true,
  };
}
