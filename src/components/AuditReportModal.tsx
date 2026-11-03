import React, { useState } from 'react';
import {
  AuditReportData,
  formatAuditChecksum,
  getAuditStatusBadge,
  buildClientAuditMarkdown,
} from '../lib/auditReportModal';

interface AuditReportModalProps {
  isOpen: boolean;
  data: AuditReportData;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const badge = getAuditStatusBadge(data.status);

  if (!isOpen) return null;

  const markdownContent = buildClientAuditMarkdown(data);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.reportId}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="text-lg font-semibold text-white">Compliance Audit Certificate</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 mb-5 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <p className="text-slate-400">Report Reference</p>
              <p className="font-mono text-white font-semibold mt-0.5">{data.reportId}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.badgeClass}`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Organization:</span>
              <span className="text-slate-200 font-medium">{data.organizationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Network:</span>
              <span className="font-mono text-slate-300">{data.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evaluations:</span>
              <span className="font-mono text-slate-200">{data.totalEvaluations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Approval Rate:</span>
              <span className="font-mono text-emerald-400 font-semibold">{data.approvalRatePercent.toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <p className="text-[11px] text-slate-400 mb-1">SHA-256 Provenance Checksum</p>
            <p className="font-mono text-[11px] text-blue-400 break-all select-all">
              {formatAuditChecksum(data.certificateHash, 14)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {copied ? '✓ Copied' : 'Copy Report'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs rounded-xl border border-blue-700 bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 transition"
            >
              Download .md
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
