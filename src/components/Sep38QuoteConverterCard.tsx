import React, { useState, useMemo } from 'react';
import {
  getAvailableCurrencies,
  computeConversion,
} from '../lib/sep38Converter';

interface Sep38QuoteConverterCardProps {
  onQuoteAccepted?: (sellSymbol: string, buySymbol: string, sellAmount: string, buyAmount: string) => void;
}

export const Sep38QuoteConverterCard: React.FC<Sep38QuoteConverterCardProps> = ({
  onQuoteAccepted,
}) => {
  const currencies = useMemo(() => getAvailableCurrencies(), []);
  const [sellSymbol, setSellSymbol] = useState<string>('XLM');
  const [buySymbol, setBuySymbol] = useState<string>('USDC');
  const [sellAmount, setSellAmount] = useState<string>('100');

  const conversion = useMemo(() => {
    return computeConversion(sellAmount, sellSymbol, buySymbol);
  }, [sellAmount, sellSymbol, buySymbol]);

  const handleSwap = () => {
    setSellSymbol(buySymbol);
    setBuySymbol(sellSymbol);
  };

  const handleApply = () => {
    if (!conversion.isValid || !onQuoteAccepted) return;
    onQuoteAccepted(sellSymbol, buySymbol, conversion.sellAmount, conversion.buyAmount);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💱</span>
          <h3 className="text-sm font-semibold text-white">SEP-0038 Cross-Asset Converter</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
          Stellar Anchor RFQ
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Estimate exchange rates and convert cross-asset treasury transfers or escrow releases in real time.
      </p>

      {/* Sell Input */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 mb-2">
        <span className="text-[10px] text-slate-400 block mb-1">You Pay (Sell Asset)</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="any"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            className="flex-1 bg-transparent text-base font-bold text-white font-mono focus:outline-none"
            placeholder="0.00"
          />
          <select
            value={sellSymbol}
            onChange={(e) => setSellSymbol(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-1 relative z-10">
        <button
          type="button"
          onClick={handleSwap}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-1.5 rounded-full text-xs text-slate-300 shadow-md transition"
          title="Swap Direction"
        >
          ⇅
        </button>
      </div>

      {/* Buy Output */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 mb-3">
        <span className="text-[10px] text-slate-400 block mb-1">Estimated Settlement (Buy Asset)</span>
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-emerald-400 font-mono">
            {conversion.buyAmount}
          </div>
          <select
            value={buySymbol}
            onChange={(e) => setBuySymbol(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate & Apply */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/20 px-3 py-2 rounded-lg border border-slate-800/60 mb-3">
        <span>Indicative RFQ Rate:</span>
        <span className="font-mono text-slate-200 font-medium">{conversion.rateDisplay}</span>
      </div>

      {onQuoteAccepted && (
        <button
          type="button"
          onClick={handleApply}
          disabled={!conversion.isValid}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-semibold text-white transition shadow-lg shadow-purple-900/30"
        >
          Apply Quote to Transfer
        </button>
      )}
    </div>
  );
};

