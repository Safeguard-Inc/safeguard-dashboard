'use client';

import React, { useState } from 'react';
import {
  buildCompliancePacketExportUrl,
  formatSealDigest,
  computeRiskSummary,
  type RiskDistribution,
} from '../lib/compliancePacketModal';

export interface CompliancePacketExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mockSeal?: string;
  mockRisk?: RiskDistribution;
}

export function CompliancePacketExportModal({
  isOpen,
  onClose,
  mockSeal = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  mockRisk = { sanctioned: 0, high: 1, med: 4, low: 45 },
}: CompliancePacketExportModalProps) {
  const [organization, setOrganization] = useState('Stellar Institutional Gateway');
  const [purpose, setPurpose] = useState('Regulatory Examination');
  const [includeAuditTrail, setIncludeAuditTrail] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const riskSummary = computeRiskSummary(mockRisk);
  const downloadUrl = buildCompliancePacketExportUrl({
    organization,
    purpose,
    includeAuditTrail,
  });

  const handleTriggerExport = () => {
    setIsExporting(true);
    window.open(downloadUrl, '_blank');
    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📜</span>
            <h3 className="text-lg font-bold text-slate-100">Export Compliance Archive Packet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-semibold px-2"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Packages verified AML screening audits, escrow collateral statements, and on-chain
          policy manifests into a tamper-evident cryptographic archive bundle.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Filing Organization
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Audit Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Regulatory Examination">Regulatory Examination (MiCA / FinCEN)</option>
              <option value="Annual Compliance Audit">Annual Institutional Compliance Audit</option>
              <option value="Counterparty Proof of Funds">Counterparty Proof of Collateral</option>
              <option value="Internal Risk Oversight">Internal Risk Oversight</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="auditTrail"
              type="checkbox"
              checked={includeAuditTrail}
              onChange={(e) => setIncludeAuditTrail(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="auditTrail" className="text-xs text-slate-300">
              Include granular immutable audit event logs in bundle
            </label>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Cryptographic Seal: </span>
              <span className="font-mono text-indigo-400">{formatSealDigest(mockSeal)}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                riskSummary.pass
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {riskSummary.badgeLabel}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleTriggerExport}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
          >
            {isExporting ? 'Generating Bundle...' : 'Download Packet (JSON)'}
          </button>
        </div>
      </div>
    </div>
  );
}
