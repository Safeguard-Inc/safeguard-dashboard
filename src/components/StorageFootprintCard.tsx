import React from 'react';
import {
  formatStorageBytes,
  formatLedgerTtlStatus,
  calculateRentProjectionDisplay,
} from '../lib/storageFootprint';

interface StorageFootprintCardProps {
  contractId: string;
  contractName: string;
  instanceBytes: number;
  persistentBytes: number;
  temporaryBytes?: number;
  currentLedger: number;
  liveUntilLedger: number;
  onExtendTtl?: () => Promise<void> | void;
  isExtending?: boolean;
}

export const StorageFootprintCard: React.FC<StorageFootprintCardProps> = ({
  contractId,
  contractName,
  instanceBytes,
  persistentBytes,
  temporaryBytes = 0,
  currentLedger,
  liveUntilLedger,
  onExtendTtl,
  isExtending = false,
}) => {
  const totalBytes = instanceBytes + persistentBytes + temporaryBytes;
  const ttlStatus = formatLedgerTtlStatus(currentLedger, liveUntilLedger);
  const projection = calculateRentProjectionDisplay(totalBytes);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💾</span>
            <h4 className="font-semibold text-white text-sm">{contractName}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-400 font-mono">
              {contractId.slice(0, 4)}...{contractId.slice(-4)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Soroban Ledger Footprint & Rent TTL Telemetry
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${ttlStatus.badgeClass}`}
        >
          {ttlStatus.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Instance Storage</p>
          <p className="text-sm font-semibold font-mono text-slate-200 mt-0.5">
            {formatStorageBytes(instanceBytes)}
          </p>
        </div>
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Persistent Storage</p>
          <p className="text-sm font-semibold font-mono text-slate-200 mt-0.5">
            {formatStorageBytes(persistentBytes)}
          </p>
        </div>
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Total Footprint</p>
          <p className="text-sm font-semibold font-mono text-blue-400 mt-0.5">
            {formatStorageBytes(totalBytes)}
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 mb-4 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400">Projected 30-Day Rent Extension:</span>
          <span className="font-semibold text-emerald-400 font-mono ml-2">
            {projection.estimatedXlm}
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[11px]">
          ({ttlStatus.ledgersRemaining.toLocaleString()} ledgers until archival)
        </span>
      </div>

      {onExtendTtl && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onExtendTtl}
            disabled={isExtending}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
          >
            {isExtending ? 'Extending TTL...' : 'Extend TTL (+30 Days)'}
          </button>
        </div>
      )}
    </div>
  );
};
