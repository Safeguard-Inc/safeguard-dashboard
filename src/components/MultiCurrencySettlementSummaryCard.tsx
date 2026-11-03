import React, { useMemo } from 'react';
import {
  type DisbursementSummaryLine,
  computeTotalUsdDisbursement,
  evaluateOverallFundingStatus,
  formatTokenIcon,
} from '../lib/multiCurrencyCard';

interface MultiCurrencySettlementSummaryCardProps {
  lines?: DisbursementSummaryLine[];
  onExecuteDisbursements?: () => void;
}

const DEFAULT_LINES: DisbursementSummaryLine[] = [
  {
    tokenSymbol: 'USDC',
    totalAmount: '12,500.00',
    recipientCount: 5,
    unitPriceUsd: 1.0,
    estimatedUsdCost: 12500,
    liquidityBuffer: '250.00',
    treasuryBalance: '15,000.00',
    isSufficient: true,
  },
  {
    tokenSymbol: 'EURC',
    totalAmount: '4,200.00',
    recipientCount: 2,
    unitPriceUsd: 1.08,
    estimatedUsdCost: 4536,
    liquidityBuffer: '84.00',
    treasuryBalance: '5,000.00',
    isSufficient: true,
  },
  {
    tokenSymbol: 'XLM',
    totalAmount: '35,000.00',
    recipientCount: 8,
    unitPriceUsd: 0.12,
    estimatedUsdCost: 4200,
    liquidityBuffer: '700.00',
    treasuryBalance: '40,000.00',
    isSufficient: true,
  },
];

export const MultiCurrencySettlementSummaryCard: React.FC<MultiCurrencySettlementSummaryCardProps> = ({
  lines = DEFAULT_LINES,
  onExecuteDisbursements,
}) => {
  const totalUsd = useMemo(() => computeTotalUsdDisbursement(lines), [lines]);
  const fundingStatus = useMemo(() => evaluateOverallFundingStatus(lines), [lines]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Multi-Currency Settlement Plan</h3>
            <p className="text-[11px] text-slate-400">Aggregate cross-asset payroll and vendor allocations</p>
          </div>
        </div>
        <span
          className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
            fundingStatus.isFullyFunded
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          {fundingStatus.isFullyFunded ? '✓ 100% Funded' : `⚠️ Deficit: ${fundingStatus.deficitTokens.join(', ')}`}
        </span>
      </div>

      {/* Asset Lines Table */}
      <div className="space-y-2 mb-4">
        {lines.map((line) => (
          <div
            key={line.tokenSymbol}
            className="flex items-center justify-between bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{formatTokenIcon(line.tokenSymbol)}</span>
              <div>
                <span className="font-semibold text-white">{line.tokenSymbol}</span>
                <span className="text-[11px] text-slate-400 ml-1.5">
                  ({line.recipientCount} recipient{line.recipientCount === 1 ? '' : 's'})
                </span>
                <div className="text-[10px] text-slate-400">
                  Buffer: +{line.liquidityBuffer} | Treasury: {line.treasuryBalance}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono font-medium text-white">
                {line.totalAmount} {line.tokenSymbol}
              </div>
              <div className="text-[10px] text-slate-400">≈ ${line.estimatedUsdCost.toLocaleString()} USD</div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Footer */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 mb-4 flex justify-between items-center text-xs">
        <span className="text-slate-400">Total Net Exposure (All Currencies):</span>
        <span className="text-base font-bold font-mono text-cyan-300">
          ${totalUsd.toLocaleString()} USD
        </span>
      </div>

      {onExecuteDisbursements && (
        <button
          onClick={onExecuteDisbursements}
          disabled={!fundingStatus.isFullyFunded}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition"
        >
          Execute Multi-Currency Payout
        </button>
      )}
    </div>
  );
};
