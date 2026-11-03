import React, { useState } from 'react';
import {
  DeployedContractTelemetry,
  formatNetworkBadge,
  formatCircuitBreakerStatus,
  abbreviateContractId,
} from '../lib/contractConfigDisplay';

interface ContractConfigCardProps {
  telemetry: DeployedContractTelemetry;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ContractConfigCard: React.FC<ContractConfigCardProps> = ({
  telemetry,
  onRefresh,
  isLoading = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const networkInfo = formatNetworkBadge(telemetry.network);
  const breakerInfo = formatCircuitBreakerStatus(telemetry.isPaused);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <h3 className="text-sm font-semibold text-white">Smart Contract Infrastructure</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${networkInfo.badgeClass}`}>
            {networkInfo.label}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${breakerInfo.badgeClass}`}>
            <span>{breakerInfo.icon}</span>
            <span>{breakerInfo.label}</span>
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-white transition disabled:opacity-50"
              title="Refresh Contract Telemetry"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Payments Contract */}
        <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 font-medium">Safeguard Payments Contract</span>
            <button
              onClick={() => copyToClipboard(telemetry.paymentsContract, 'payments')}
              className="text-[10px] text-blue-400 hover:underline"
            >
              {copiedKey === 'payments' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="font-mono text-xs text-slate-200 select-all">
            {abbreviateContractId(telemetry.paymentsContract)}
          </div>
        </div>

        {/* Policy Contract */}
        <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 font-medium">Compliance Policy Registry</span>
            <button
              onClick={() => copyToClipboard(telemetry.policyContract, 'policy')}
              className="text-[10px] text-blue-400 hover:underline"
            >
              {copiedKey === 'policy' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="font-mono text-xs text-slate-200 select-all">
            {abbreviateContractId(telemetry.policyContract)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-800/20 p-2.5 rounded-xl border border-slate-800/60">
        <div>
          <span className="text-[10px] text-slate-500 block">Default Spend Cap</span>
          <span className="font-semibold text-white font-mono">{telemetry.spendCapXlm} XLM</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Schema Version</span>
          <span className="font-semibold text-white font-mono">v{telemetry.schemaVersion}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Admin Controller</span>
          <span className="font-mono text-[10px] text-slate-300">
            {abbreviateContractId(telemetry.admin)}
          </span>
        </div>
      </div>
    </div>
  );
};

