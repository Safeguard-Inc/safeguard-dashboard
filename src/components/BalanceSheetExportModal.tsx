import React, { useState, useMemo } from 'react';
import {
  type BalanceSheetTokenSummary,
  calculateAggregatedUsdExposure,
  buildBalanceSheetExportUrl,
} from '../lib/balanceSheetModal';

interface BalanceSheetExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenSummaries?: BalanceSheetTokenSummary[];
}

const DEFAULT_SUMMARIES: BalanceSheetTokenSummary[] = [
  { tokenSymbol: 'USDC', lockedAmount: '250,000.00', settledAmount: '1,000,000.00', usdValue: 250000 },
  { tokenSymbol: 'XLM', lockedAmount: '500,000.00', settledAmount: '2,000,000.00', usdValue: 60000 },
  { tokenSymbol: 'EURC', lockedAmount: '80,000.00', settledAmount: '350,000.00', usdValue: 86400 },
];

export const BalanceSheetExportModal: React.FC<BalanceSheetExportModalProps> = ({
  isOpen,
  onClose,
  tokenSummaries = DEFAULT_SUMMARIES,
}) => {
  const [org, setOrg] = useState('Safeguard Institutional Treasury');
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  const exposure = useMemo(() => {
    return calculateAggregatedUsdExposure(tokenSummaries);
  }, [tokenSummaries]);

  if (!isOpen) return null;

  const exportUrl = buildBalanceSheetExportUrl({
    organization: org,
    format,
    download: true,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + exportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📑</span>
            <h3 className="text-base font-semibold text-white">Institutional Balance Sheet Statement</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded transition"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Export verified collateral holdings, settled disbursements, and active escrow reserves with SHA-256 seal.
        </p>

        {/* Form */}
        <div className="space-y-4 mb-5 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Organization / Entity Name</label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('markdown')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                  format === 'markdown'
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                📄 Audited Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                  format === 'json'
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                📊 Structured JSON (.json)
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 mb-5 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400">Total Collateral Under Management:</span>
            <span className="font-semibold text-white font-mono text-sm">
              ${exposure.totalUsd.toLocaleString()} USD
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Primary Collateral Asset:</span>
            <span className="font-mono text-cyan-300 font-medium">{exposure.topToken}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition"
          >
            {copied ? '✓ URL Copied' : 'Copy API URL'}
          </button>
          <a
            href={exportUrl}
            download
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow text-center transition flex items-center justify-center gap-1.5"
          >
            <span>📥 Download {format.toUpperCase()}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
