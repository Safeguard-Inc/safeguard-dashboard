import React, { useState, useMemo } from 'react';
import {
  type AmmPoolDisplayInfo,
  calculateConstantProductEstimate,
  calculateMinimumReceived,
  classifyPriceImpact,
  formatReserveRatio,
} from '../lib/liquidityPoolCard';

interface LiquidityPoolRoutingCardProps {
  initialPool?: AmmPoolDisplayInfo;
  onExecuteSwap?: (amountIn: bigint, minReceived: bigint) => void;
}

const DEFAULT_POOL: AmmPoolDisplayInfo = {
  poolAddress: 'CBPQ...AMM7',
  tokenASymbol: 'USDC',
  tokenBSymbol: 'XLM',
  reserveA: 500000_0000000n, // 500k USDC (7 decimals)
  reserveB: 5000000_0000000n, // 5M XLM (7 decimals)
  decimalsA: 7,
  decimalsB: 7,
  feeBps: 30,
};

export const LiquidityPoolRoutingCard: React.FC<LiquidityPoolRoutingCardProps> = ({
  initialPool = DEFAULT_POOL,
  onExecuteSwap,
}) => {
  const [pool] = useState<AmmPoolDisplayInfo>(initialPool);
  const [inputAmountStr, setInputAmountStr] = useState<string>('1000');
  const [slippageBps, setSlippageBps] = useState<number>(50); // 0.5%

  const amountInBigInt = useMemo(() => {
    const num = parseFloat(inputAmountStr);
    if (isNaN(num) || num <= 0) return 0n;
    return BigInt(Math.floor(num * 10 ** pool.decimalsA));
  }, [inputAmountStr, pool.decimalsA]);

  const { amountOut, priceImpactBps } = useMemo(() => {
    return calculateConstantProductEstimate(
      amountInBigInt,
      pool.reserveA,
      pool.reserveB,
      BigInt(pool.feeBps)
    );
  }, [amountInBigInt, pool.reserveA, pool.reserveB, pool.feeBps]);

  const minReceived = useMemo(() => {
    return calculateMinimumReceived(amountOut, slippageBps);
  }, [amountOut, slippageBps]);

  const impactClassification = useMemo(() => {
    return classifyPriceImpact(priceImpactBps);
  }, [priceImpactBps]);

  const ratio = useMemo(() => {
    return formatReserveRatio(pool.reserveA, pool.decimalsA, pool.reserveB, pool.decimalsB);
  }, [pool]);

  const formatDecimals = (val: bigint, decimals: number) => {
    const divisor = 10 ** decimals;
    return (Number(val) / divisor).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌊</span>
          <h3 className="text-sm font-semibold text-white">Soroban AMM Routing</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Constant-Product x*y=k
        </span>
      </div>

      <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl mb-4 border border-slate-800 text-xs">
        <div>
          <span className="text-slate-400">Pool Pair: </span>
          <span className="font-semibold text-white">{pool.tokenASymbol} / {pool.tokenBSymbol}</span>
        </div>
        <div>
          <span className="text-slate-400">Spot Rate: </span>
          <span className="font-mono text-cyan-300">1 {pool.tokenASymbol} ≈ {ratio} {pool.tokenBSymbol}</span>
        </div>
      </div>

      {/* Input */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>You Pay ({pool.tokenASymbol})</span>
          <span>Reserve: {formatDecimals(pool.reserveA, pool.decimalsA)}</span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={inputAmountStr}
            onChange={(e) => setInputAmountStr(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Output */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 mb-4 text-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400">Estimated Output:</span>
          <span className="text-sm font-semibold font-mono text-white">
            {formatDecimals(amountOut, pool.decimalsB)} {pool.tokenBSymbol}
          </span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-400">Price Impact:</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${impactClassification.badgeClass}`}>
            {impactClassification.label}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Minimum Received ({slippageBps / 100}% slippage):</span>
          <span className="font-mono text-slate-300">
            {formatDecimals(minReceived, pool.decimalsB)} {pool.tokenBSymbol}
          </span>
        </div>
      </div>

      {/* Slippage Selector */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-slate-400">Slippage Tolerance:</span>
        <div className="flex gap-1">
          {[10, 50, 100].map((bps) => (
            <button
              key={bps}
              onClick={() => setSlippageBps(bps)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                slippageBps === bps
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {bps / 100}%
            </button>
          ))}
        </div>
      </div>

      {onExecuteSwap && (
        <button
          onClick={() => onExecuteSwap(amountInBigInt, minReceived)}
          disabled={amountOut <= 0n}
          className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition"
        >
          Execute AMM Swap
        </button>
      )}
    </div>
  );
};
