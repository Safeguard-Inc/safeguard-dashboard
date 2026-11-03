'use client';

import React, { useState } from 'react';
import { abbreviateAddress } from '../lib/formatters';

export { abbreviateAddress };

export interface TokenBalanceCardProps {
  symbol: string;
  name: string;
  balance: string | number;
  contractId: string;
  network?: 'testnet' | 'mainnet';
  isSelected?: boolean;
  onSelect?: (symbol: string) => void;
}

export function TokenBalanceCard({
  symbol,
  name,
  balance,
  contractId,
  network = 'testnet',
  isSelected = false,
  onSelect,
}: TokenBalanceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(contractId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBadgeColor = (sym: string) => {
    switch (sym.toUpperCase()) {
      case 'XLM':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'USDC':
        return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
      case 'EURC':
        return 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30';
      case 'PYUSD':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  const explorerUrl = `https://stellar.expert/explorer/${network}/contract/${contractId}`;

  return (
    <div
      onClick={() => onSelect && onSelect(symbol)}
      className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-md border ${getBadgeColor(symbol)}`}
          >
            {symbol}
          </span>
          <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
            {name}
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-200">
          {typeof balance === 'number' ? balance.toLocaleString() : balance}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
        <span className="font-mono">{abbreviateAddress(contractId, 6)}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="hover:text-slate-300 transition-colors"
            title="Copy contract ID"
          >
            {copied ? '✓' : 'Copy'}
          </button>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="View on Stellar Expert"
          >
            ↗
          </a>
        </div>
      </div>
    </div>
  );
}
